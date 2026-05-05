from __future__ import annotations

import hashlib
import os
import re
from collections import Counter
from datetime import datetime, timezone
from statistics import mean
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import parse_qs, urlparse

import numpy as np
import requests
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse
from pymongo.errors import PyMongoError
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

try:
    from nltk import download as nltk_download
    from nltk.sentiment import SentimentIntensityAnalyzer
except Exception:  # pragma: no cover - optional dependency fallback
    nltk_download = None
    SentimentIntensityAnalyzer = None

try:
    from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
except Exception:  # pragma: no cover - optional dependency fallback
    ENGLISH_STOP_WORDS = set()
    TfidfVectorizer = None

from db import youtube_compare_cache_collection, youtube_compare_history_collection
from models import (
    CategorizedComments,
    CommentItem,
    CompareInsight,
    MostCommentedItem,
    SentimentBreakdown,
    VideoComparePayload,
    VideoMetadata,
    YouTubeCompareRequest,
    YouTubeCompareResponse,
)
from security import get_current_user

router = APIRouter(prefix="/youtube", tags=["youtube-compare"])

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "").strip()
YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"
MAX_RESULTS_PER_PAGE = 100
DEFAULT_BATCH_SIZE = min(max(int(os.getenv("YOUTUBE_SENTIMENT_BATCH_SIZE", "48")), 32), 64)
DEFAULT_COMMENT_LIMIT = 300
MAX_COMMENT_LIMIT = 500
COMMENT_TRIM_LENGTH = 300

REQUEST_KEYWORDS = ("please", "make", "improve", "add", "need", "want")
CUSTOM_STOPWORDS = {"sir", "khan", "video", "please", "channel"}
TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9']+")

_sentiment_analyzer: SentimentIntensityAnalyzer | None = None


class _FallbackSentimentAnalyzer:
    POSITIVE_WORDS = {
        "amazing",
        "awesome",
        "beautiful",
        "best",
        "clean",
        "cool",
        "excellent",
        "fantastic",
        "good",
        "great",
        "love",
        "loved",
        "nice",
        "perfect",
        "solid",
        "strong",
        "superb",
        "wonderful",
        "well",
    }

    NEGATIVE_WORDS = {
        "annoying",
        "bad",
        "boring",
        "clunky",
        "confusing",
        "dull",
        "fail",
        "hate",
        "hated",
        "messy",
        "noisy",
        "poor",
        "slow",
        "terrible",
        "ugly",
        "weak",
        "worse",
        "worst",
        "awkward",
    }

    def polarity_scores(self, text: str) -> Dict[str, float]:
        tokens = TOKEN_PATTERN.findall(text.lower())
        positive_hits = sum(1 for token in tokens if token in self.POSITIVE_WORDS)
        negative_hits = sum(1 for token in tokens if token in self.NEGATIVE_WORDS)
        net = positive_hits - negative_hits
        compound = 0.0
        if tokens:
            compound = max(-1.0, min(1.0, net / max(len(tokens) / 2, 1)))
        return {"compound": compound}


def _ensure_sentiment_analyzer():
    global _sentiment_analyzer
    if _sentiment_analyzer is not None:
        return _sentiment_analyzer

    if SentimentIntensityAnalyzer is None:
        _sentiment_analyzer = _FallbackSentimentAnalyzer()
        return _sentiment_analyzer

    try:
        _sentiment_analyzer = SentimentIntensityAnalyzer()
    except LookupError:
        if nltk_download is not None:
            nltk_download("vader_lexicon", quiet=True)
        _sentiment_analyzer = SentimentIntensityAnalyzer()

    return _sentiment_analyzer


def _resolve_video_id(value: str) -> str:
    raw = value.strip()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty YouTube URL")

    if re.fullmatch(r"[a-zA-Z0-9_-]{11}", raw):
        return raw

    parsed = urlparse(raw)
    query_id = parse_qs(parsed.query).get("v", [None])[0]
    if query_id and re.fullmatch(r"[a-zA-Z0-9_-]{11}", query_id):
        return query_id

    segments = [segment for segment in parsed.path.split("/") if segment]
    if segments:
        if "shorts" in segments and segments[-1] and re.fullmatch(r"[a-zA-Z0-9_-]{11}", segments[-1]):
            return segments[-1]
        if "embed" in segments and segments[-1] and re.fullmatch(r"[a-zA-Z0-9_-]{11}", segments[-1]):
            return segments[-1]
        if re.fullmatch(r"[a-zA-Z0-9_-]{11}", segments[-1]):
            return segments[-1]

    raise HTTPException(status_code=400, detail=f"Could not extract a YouTube video ID from: {value}")


def _youtube_get(endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
    if not YOUTUBE_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="YOUTUBE_API_KEY is not configured. Add it to backend/.env or copy backend/.env.example.",
        )

    response = requests.get(
        f"{YOUTUBE_API_BASE}/{endpoint}",
        params={**params, "key": YOUTUBE_API_KEY},
        timeout=30,
    )

    if response.status_code >= 400:
        if endpoint == "commentThreads" and response.status_code in {403, 404}:
            return {"items": []}
        raise HTTPException(
            status_code=502,
            detail=f"YouTube API error ({response.status_code}): {response.text[:500]}",
        )

    return response.json()


def _fetch_video_metadata(video_id: str) -> Dict[str, Any]:
    payload = _youtube_get(
        "videos",
        {
            "part": "snippet,statistics",
            "id": video_id,
        },
    )
    items = payload.get("items", [])
    if not items:
        raise HTTPException(status_code=404, detail=f"Video not found: {video_id}")

    item = items[0]
    snippet = item.get("snippet", {})
    statistics = item.get("statistics", {})
    return {
        "title": snippet.get("title") or video_id,
        "video_id": video_id,
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "channel_title": snippet.get("channelTitle"),
        "published_at": snippet.get("publishedAt"),
        "comment_count": int(statistics.get("commentCount") or 0),
    }


def _trim_comment_text(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text.strip())
    if len(cleaned) <= COMMENT_TRIM_LENGTH:
        return cleaned
    return cleaned[:COMMENT_TRIM_LENGTH].rstrip()


def _fetch_comments(video_id: str, limit: int) -> List[Dict[str, Any]]:
    comments: List[Dict[str, Any]] = []
    page_token: Optional[str] = None

    while len(comments) < limit:
        page_size = min(MAX_RESULTS_PER_PAGE, limit - len(comments))
        params: Dict[str, Any] = {
            "part": "snippet",
            "videoId": video_id,
            "maxResults": page_size,
            "textFormat": "plainText",
            "order": "relevance",
        }
        if page_token:
            params["pageToken"] = page_token

        payload = _youtube_get("commentThreads", params)
        items = payload.get("items", [])
        if not items:
            break

        for item in items:
            snippet = item.get("snippet", {})
            top_level = snippet.get("topLevelComment", {}).get("snippet", {})
            text = (top_level.get("textOriginal") or top_level.get("textDisplay") or "").strip()
            if not text:
                continue

            comments.append(
                {
                    "text": _trim_comment_text(text),
                    "likeCount": int(top_level.get("likeCount") or 0),
                    "publishedAt": top_level.get("publishedAt"),
                }
            )

            if len(comments) >= limit:
                break

        page_token = payload.get("nextPageToken")
        if not page_token:
            break

    return comments


def _chunks(items: List[Dict[str, Any]], size: int) -> List[List[Dict[str, Any]]]:
    if size <= 0:
        return [items]
    return [items[index : index + size] for index in range(0, len(items), size)]


def _classify_sentiment(score: float) -> str:
    if score >= 0.01:
        return "positive"
    if score <= -0.01:
        return "negative"
    return "neutral"


def _analyze_comments(comments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    analyzer = _ensure_sentiment_analyzer()
    scored_comments: List[Dict[str, Any]] = []

    for batch in _chunks(comments, DEFAULT_BATCH_SIZE):
        for comment in batch:
            score = float(analyzer.polarity_scores(comment["text"])["compound"])
            scored_comments.append(
                {
                    **comment,
                    "sentiment_score": score,
                    "sentiment_label": _classify_sentiment(score),
                }
            )

    return scored_comments


def _comment_item(comment: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "text": comment["text"],
        "likeCount": int(comment.get("likeCount") or 0),
        "publishedAt": comment.get("publishedAt"),
    }


def _sentiment_breakdown(scored_comments: List[Dict[str, Any]]) -> Dict[str, Any]:
    total_comments = len(scored_comments)
    positive_count = sum(1 for item in scored_comments if item["sentiment_label"] == "positive")
    negative_count = sum(1 for item in scored_comments if item["sentiment_label"] == "negative")
    neutral_count = sum(1 for item in scored_comments if item["sentiment_label"] == "neutral")
    positive_percentage = round((positive_count / total_comments) * 100, 2) if total_comments else 0.0
    negative_percentage = round((negative_count / total_comments) * 100, 2) if total_comments else 0.0
    neutral_percentage = round((neutral_count / total_comments) * 100, 2) if total_comments else 0.0
    average_sentiment = round(float(mean(item["sentiment_score"] for item in scored_comments)), 3) if scored_comments else 0.0
    csat_score = round((positive_count / (positive_count + negative_count)) * 100, 2) if (positive_count + negative_count) else 0.0

    return {
        "total_comments": total_comments,
        "positive_count": positive_count,
        "negative_count": negative_count,
        "neutral_count": neutral_count,
        "positive_percentage": positive_percentage,
        "negative_percentage": negative_percentage,
        "neutral_percentage": neutral_percentage,
        "average_sentiment_score": average_sentiment,
        "csat_score": csat_score,
    }


def _most_liked_comment(comments: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not comments:
        return {"text": "No comments found", "likeCount": 0, "publishedAt": None}
    top = max(comments, key=lambda item: int(item.get("likeCount") or 0))
    return _comment_item(top)


def _most_criticized_comment(scored_comments: List[Dict[str, Any]]) -> Dict[str, Any]:
    negative_comments = [item for item in scored_comments if item["sentiment_label"] == "negative"]
    if not negative_comments:
        return {"text": "No strongly negative comments found", "likeCount": 0, "publishedAt": None}
    top = max(negative_comments, key=lambda item: int(item.get("likeCount") or 0))
    return _comment_item(top)


def _is_request_comment(text: str) -> bool:
    lowered = text.lower()
    return any(keyword in lowered for keyword in REQUEST_KEYWORDS)


def _extract_user_requests(scored_comments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen: set[str] = set()
    requests: List[Dict[str, Any]] = []

    for comment in scored_comments:
        text = comment["text"]
        if not _is_request_comment(text):
            continue

        normalized = text.lower()
        if normalized in seen:
            continue

        seen.add(normalized)
        requests.append(_comment_item(comment))

    requests.sort(key=lambda item: (int(item.get("likeCount") or 0), item.get("publishedAt") or ""), reverse=True)
    return requests[:5]


def _clean_keyword_list(keywords: List[str]) -> List[str]:
    cleaned: List[str] = []
    banned = CUSTOM_STOPWORDS | {word.lower() for word in ENGLISH_STOP_WORDS}

    for keyword in keywords:
        candidate = re.sub(r"\s+", " ", keyword.lower()).strip()
        candidate = re.sub(r"[^a-z0-9\s']", " ", candidate)
        candidate = re.sub(r"\s+", " ", candidate).strip()
        if not candidate or candidate in banned:
            continue
        if any(token in banned for token in candidate.split()):
            continue
        if candidate not in cleaned:
            cleaned.append(candidate)

    return cleaned


def _extract_keywords(texts: List[str], limit: int = 8) -> List[str]:
    cleaned_texts = [re.sub(r"\s+", " ", text.lower()).strip() for text in texts if text.strip()]
    if not cleaned_texts:
        return []

    if TfidfVectorizer is None:
        tokens = [
            token
            for text in cleaned_texts
            for token in TOKEN_PATTERN.findall(text)
            if len(token) > 2 and token not in CUSTOM_STOPWORDS
        ]
        return _clean_keyword_list([term for term, _ in Counter(tokens).most_common(limit)])

    try:
        stop_words = set(ENGLISH_STOP_WORDS) | CUSTOM_STOPWORDS
        vectorizer = TfidfVectorizer(
            stop_words=list(stop_words),
            ngram_range=(1, 2),
            max_features=min(80, max(limit * 4, 20)),
        )
        matrix = vectorizer.fit_transform(cleaned_texts)
        scores = np.asarray(matrix.sum(axis=0)).ravel()
        terms = vectorizer.get_feature_names_out()
        ranked = sorted(zip(terms, scores), key=lambda item: item[1], reverse=True)
        return _clean_keyword_list([term for term, _ in ranked[: limit * 2]])[:limit]
    except ValueError:
        tokens = [
            token
            for text in cleaned_texts
            for token in TOKEN_PATTERN.findall(text)
            if len(token) > 2 and token not in CUSTOM_STOPWORDS
        ]
        return _clean_keyword_list([term for term, _ in Counter(tokens).most_common(limit)])


def _keyword_comparison(v1_keywords: List[str], v2_keywords: List[str]) -> Dict[str, Any]:
    shared_keywords = [keyword for keyword in v1_keywords if keyword in v2_keywords]
    distinct_v1 = [keyword for keyword in v1_keywords if keyword not in shared_keywords]
    distinct_v2 = [keyword for keyword in v2_keywords if keyword not in shared_keywords]
    return {
        "top_keywords_video1": v1_keywords,
        "top_keywords_video2": v2_keywords,
        "shared_keywords": shared_keywords,
        "distinct_keywords": {
            "video1": distinct_v1,
            "video2": distinct_v2,
        },
    }


def _build_summary_prompt(
    video1: Dict[str, Any],
    video2: Dict[str, Any],
    keywords1: List[str],
    keywords2: List[str],
) -> str:
    return (
        "Compare two YouTube videos based on audience feedback.\n\n"
        f"Video A:\nPositive: {video1['sentiment_breakdown']['positive_percentage']}%\n"
        f"Negative: {video1['sentiment_breakdown']['negative_percentage']}%\n"
        f"Keywords: {', '.join(keywords1[:6]) or 'none'}\n\n"
        f"Video B:\nPositive: {video2['sentiment_breakdown']['positive_percentage']}%\n"
        f"Negative: {video2['sentiment_breakdown']['negative_percentage']}%\n"
        f"Keywords: {', '.join(keywords2[:6]) or 'none'}\n\n"
        "Write a concise insight:\n\n"
        "* Explain WHY one video performs better\n"
        "* Mention meaningful differences only\n"
        "* Avoid repeating words\n"
        "* Be natural and human-like"
    )


def _generate_ai_summary(
    video1: Dict[str, Any],
    video2: Dict[str, Any],
    winner: str,
    gap: float,
    keyword_bundle: Dict[str, Any],
    requests1: List[Dict[str, Any]],
    requests2: List[Dict[str, Any]],
) -> str:
    if winner == "Tie" or gap <= 5:
        opening = "Both videos are landing in a similar range with only small sentiment separation."
    else:
        opening = f"{winner} is ahead because it converts audience feedback into stronger positive reaction."

    shared = keyword_bundle["shared_keywords"][:3]
    distinct_v1 = keyword_bundle["distinct_keywords"]["video1"][:3]
    distinct_v2 = keyword_bundle["distinct_keywords"]["video2"][:3]

    if shared:
        theme_line = f"Both videos share discussion around {', '.join(shared)}, which shows overlapping audience expectations."
    else:
        theme_line = "The audience is talking about noticeably different themes in each upload."

    request_terms: List[str] = []
    for request in (requests1[:2] + requests2[:2]):
        tokens = [token for token in TOKEN_PATTERN.findall(request["text"].lower()) if token not in CUSTOM_STOPWORDS]
        request_terms.extend(tokens[:3])

    request_terms = _clean_keyword_list(request_terms)
    request_line = ""
    if request_terms:
        request_line = f"Common requests point toward {', '.join(request_terms[:4])}, so the next improvement opportunity is clear."

    distinct_focus = []
    if distinct_v1:
        distinct_focus.append(f"Video A leans on {', '.join(distinct_v1[:3])}")
    if distinct_v2:
        distinct_focus.append(f"Video B leans on {', '.join(distinct_v2[:3])}")

    detail_line = " ".join(distinct_focus)
    summary_parts = [opening, theme_line]
    if detail_line:
        summary_parts.append(detail_line + ".")
    if request_line:
        summary_parts.append(request_line)
    return " ".join(summary_parts).strip()


def _compare_sentiment(video1: Dict[str, Any], video2: Dict[str, Any]) -> Tuple[str, float]:
    gap = round(abs(video1["sentiment_breakdown"]["positive_percentage"] - video2["sentiment_breakdown"]["positive_percentage"]), 2)
    if gap <= 5:
        return "Tie", gap
    if video1["sentiment_breakdown"]["positive_percentage"] > video2["sentiment_breakdown"]["positive_percentage"]:
        return video1["stats"]["title"], gap
    return video2["stats"]["title"], gap


def _compose_insights(
    video1: Dict[str, Any],
    video2: Dict[str, Any],
    winner: str,
    gap: float,
    keyword_bundle: Dict[str, Any],
) -> List[str]:
    insights: List[str] = []

    if winner == "Tie" or gap <= 5:
        insights.append("Audience sentiment is closely matched, so neither video is clearly dominating the conversation.")
    else:
        insights.append(f"{winner} leads by {gap:.1f}% in positive sentiment.")

    negative_gap = abs(video1["sentiment_breakdown"]["negative_percentage"] - video2["sentiment_breakdown"]["negative_percentage"])
    if negative_gap > 5:
        more_negative = video1 if video1["sentiment_breakdown"]["negative_percentage"] > video2["sentiment_breakdown"]["negative_percentage"] else video2
        insights.append(f"{more_negative['stats']['title']} receives more criticism from viewers.")

    request_counts_1 = len(video1["user_requests"])
    request_counts_2 = len(video2["user_requests"])
    if abs(request_counts_1 - request_counts_2) > 1:
        request_lead = video1 if request_counts_1 > request_counts_2 else video2
        insights.append(f"{request_lead['stats']['title']} triggers more improvement requests from the audience.")

    shared = keyword_bundle["shared_keywords"][:3]
    if shared:
        insights.append(f"Both videos share conversation around {', '.join(shared)}, which suggests a similar viewer base.")

    engagement_gap = abs(video1["most_liked_comment"]["likeCount"] - video2["most_liked_comment"]["likeCount"])
    if engagement_gap > 5:
        stronger = video1 if video1["most_liked_comment"]["likeCount"] > video2["most_liked_comment"]["likeCount"] else video2
        insights.append(
            f"{stronger['stats']['title']} has the most engaging top comment with {stronger['most_liked_comment']['likeCount']} likes."
        )

    return insights[:5]


def _build_video_payload(video_meta: Dict[str, Any], scored_comments: List[Dict[str, Any]]) -> Dict[str, Any]:
    breakdown = _sentiment_breakdown(scored_comments)
    positive_comments = [_comment_item(comment) for comment in scored_comments if comment["sentiment_label"] == "positive"]
    negative_comments = [_comment_item(comment) for comment in scored_comments if comment["sentiment_label"] == "negative"]
    neutral_comments = [_comment_item(comment) for comment in scored_comments if comment["sentiment_label"] == "neutral"]
    top_keywords = _extract_keywords([comment["text"] for comment in scored_comments], limit=8)
    user_requests = _extract_user_requests(scored_comments)

    return {
        "stats": {
            **video_meta,
        },
        "sentiment_breakdown": breakdown,
        "keywords": {
            "top_keywords": top_keywords,
            "cleaned_keywords": top_keywords,
        },
        "most_liked_comment": _most_liked_comment(scored_comments),
        "most_criticized_comment": _most_criticized_comment(scored_comments),
        "user_requests": user_requests,
        "categorized_comments": {
            "positive_comments": positive_comments,
            "negative_comments": negative_comments,
            "neutral_comments": neutral_comments,
        },
    }


def _assemble_payload(video1_meta: Dict[str, Any], video1_comments: List[Dict[str, Any]], video2_meta: Dict[str, Any], video2_comments: List[Dict[str, Any]]) -> Dict[str, Any]:
    video1 = _build_video_payload(video1_meta, _analyze_comments(video1_comments))
    video2 = _build_video_payload(video2_meta, _analyze_comments(video2_comments))

    keyword_bundle = _keyword_comparison(video1["keywords"]["cleaned_keywords"], video2["keywords"]["cleaned_keywords"])
    winner, positivity_gap = _compare_sentiment(video1, video2)
    insights = _compose_insights(video1, video2, winner, positivity_gap, keyword_bundle)
    ai_summary = _generate_ai_summary(
        video1,
        video2,
        winner,
        positivity_gap,
        keyword_bundle,
        video1["user_requests"],
        video2["user_requests"],
    )

    comparison = {
        "winner": winner,
        "positivity_gap": positivity_gap,
        "insights": insights,
        "ai_summary": ai_summary,
        "keyword_prompt": _build_summary_prompt(video1, video2, keyword_bundle["top_keywords_video1"], keyword_bundle["top_keywords_video2"]),
        **keyword_bundle,
    }

    return {
        "video1": video1,
        "video2": video2,
        "comparison": comparison,
    }


def _create_pdf_report(payload: Dict[str, Any]) -> bytes:
    from io import BytesIO

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    content: List[Any] = []

    content.append(Paragraph("YouTube Video Comparison Report", styles["Title"]))
    content.append(Spacer(1, 10))
    content.append(
        Paragraph(
            f"Winner: {payload['comparison']['winner']}<br/>"
            f"Positivity gap: {payload['comparison']['positivity_gap']}%<br/>"
            f"Generated on: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
            styles["Normal"],
        )
    )
    content.append(Spacer(1, 18))

    for label in ("video1", "video2"):
        video = payload[label]
        stats = video["stats"]
        breakdown = video["sentiment_breakdown"]
        content.append(Paragraph(stats["title"], styles["Heading2"]))
        content.append(
            Paragraph(
                f"Total comments: {breakdown['total_comments']}<br/>"
                f"Positive: {breakdown['positive_percentage']}% | "
                f"Negative: {breakdown['negative_percentage']}% | "
                f"Neutral: {breakdown['neutral_percentage']}%<br/>"
                f"CSAT: {breakdown['csat_score']}%<br/>"
                f"Most liked comment: {video['most_liked_comment']['text']}<br/>"
                f"Most criticized comment: {video['most_criticized_comment']['text']}<br/>"
                f"Top keywords: {'; '.join(video['keywords']['cleaned_keywords'])}",
                styles["Normal"],
            )
        )
        content.append(Spacer(1, 12))

    content.append(Paragraph("Key Insights", styles["Heading2"]))
    for insight in payload["comparison"]["insights"]:
        content.append(Paragraph(f"- {insight}", styles["Normal"]))

    content.append(Spacer(1, 10))
    content.append(Paragraph("AI Summary", styles["Heading2"]))
    content.append(Paragraph(payload["comparison"]["ai_summary"], styles["Normal"]))

    doc.build(content)
    buffer.seek(0)
    return buffer.read()


def _cache_key(video1_id: str, video2_id: str, limit: int) -> str:
    base = "::".join(sorted([video1_id, video2_id]) + [str(limit)])
    return hashlib.sha256(base.encode("utf-8")).hexdigest()


@router.post("/compare", response_model=YouTubeCompareResponse)
@router.post("/compare-videos", response_model=YouTubeCompareResponse)
@router.post("/youtube-compare", response_model=YouTubeCompareResponse)
def compare_youtube_videos(
    payload: YouTubeCompareRequest,
    current_user: dict = Depends(get_current_user),
):
    video1_id = _resolve_video_id(payload.video1_url)
    video2_id = _resolve_video_id(payload.video2_url)
    if video1_id == video2_id:
        raise HTTPException(status_code=400, detail="Please compare two different videos.")

    limit = min(max(payload.max_comments, DEFAULT_COMMENT_LIMIT), MAX_COMMENT_LIMIT)
    cache_key = _cache_key(video1_id, video2_id, limit)
    now = datetime.now(timezone.utc)

    try:
        cached_entry = youtube_compare_cache_collection.find_one({"cache_key": cache_key})
        if cached_entry and cached_entry.get("response"):
            response_data = dict(cached_entry["response"])
            response_data["cached"] = True
        else:
            video1_meta = _fetch_video_metadata(video1_id)
            video2_meta = _fetch_video_metadata(video2_id)
            video1_comments = _fetch_comments(video1_id, limit)
            video2_comments = _fetch_comments(video2_id, limit)

            response_data = _assemble_payload(video1_meta, video1_comments, video2_meta, video2_comments)
            response_data["cached"] = False

            youtube_compare_cache_collection.update_one(
                {"cache_key": cache_key},
                {
                    "$set": {
                        "cache_key": cache_key,
                        "video_ids": sorted([video1_id, video2_id]),
                        "video_urls": [payload.video1_url, payload.video2_url],
                        "response": jsonable_encoder(response_data),
                        "updated_at": now,
                    },
                    "$setOnInsert": {"created_at": now},
                },
                upsert=True,
            )

        history_document = {
            "user_id": str(current_user.get("_id")) if current_user.get("_id") else None,
            "video_ids": sorted([video1_id, video2_id]),
            "video_urls": [payload.video1_url, payload.video2_url],
            "response": response_data,
            "created_at": now,
        }
        youtube_compare_history_collection.insert_one(history_document)
        response_data["history_saved"] = True
        return response_data
    except HTTPException:
        raise
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=f"Database connection issue: {exc}") from exc
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"Failed to contact YouTube API: {exc}") from exc


@router.get("/compare-history")
@router.get("/history")
def get_compare_history(current_user: dict = Depends(get_current_user)):
    try:
        history = list(
            youtube_compare_history_collection.find(
                {"user_id": str(current_user.get("_id"))},
                {"_id": 0},
            )
            .sort("created_at", -1)
            .limit(20)
        )
        return {"history": jsonable_encoder(history)}
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=f"Database connection issue: {exc}") from exc


@router.post("/compare-report-pdf")
@router.post("/compare-report")
def generate_compare_report_pdf(payload: Dict[str, Any], _current_user: dict = Depends(get_current_user)):
    try:
        pdf_bytes = _create_pdf_report(payload)
        filename = f"youtube-comparison-report-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}.pdf"
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {exc}") from exc
