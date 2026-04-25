from __future__ import annotations

import hashlib
import os
import re
from collections import Counter
from datetime import datetime, timezone
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
    from sklearn.feature_extraction.text import TfidfVectorizer
except Exception:  # pragma: no cover - optional dependency fallback
    TfidfVectorizer = None

from db import (
    youtube_compare_cache_collection,
    youtube_compare_history_collection,
)
from models import YouTubeCompareRequest, YouTubeCompareResponse
from security import get_current_user

router = APIRouter(prefix="/youtube", tags=["youtube-compare"])

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "").strip()
YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"
MAX_RESULTS_PER_PAGE = 100
DEFAULT_COMMENT_LIMIT = 300
TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9']+")
URL_SAFE_COMMENT_LIMIT = 500

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
    "pretty",
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

_sentiment_analyzer: SentimentIntensityAnalyzer | None = None


class _FallbackSentimentAnalyzer:
    def polarity_scores(self, text: str) -> Dict[str, float]:
        tokens = TOKEN_PATTERN.findall(text.lower())
        positive_hits = sum(1 for token in tokens if token in POSITIVE_WORDS)
        negative_hits = sum(1 for token in tokens if token in NEGATIVE_WORDS)
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


def _normalize_comments(texts: List[str]) -> List[str]:
    cleaned: List[str] = []
    for text in texts:
        lowered = text.lower()
        lowered = re.sub(r"https?://\S+", " ", lowered)
        lowered = re.sub(r"[^a-z0-9\s']", " ", lowered)
        lowered = re.sub(r"\s+", " ", lowered).strip()
        if lowered:
            cleaned.append(lowered)
    return cleaned


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
        if "shorts" in segments and segments[-1]:
            candidate = segments[-1]
            if re.fullmatch(r"[a-zA-Z0-9_-]{11}", candidate):
                return candidate

        if "embed" in segments:
            candidate = segments[-1]
            if re.fullmatch(r"[a-zA-Z0-9_-]{11}", candidate):
                return candidate

        candidate = segments[-1]
        if re.fullmatch(r"[a-zA-Z0-9_-]{11}", candidate):
            return candidate

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
        "video_id": video_id,
        "title": snippet.get("title") or video_id,
        "channel_title": snippet.get("channelTitle"),
        "published_at": snippet.get("publishedAt"),
        "comment_count": int(statistics.get("commentCount") or 0),
    }


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
        for item in payload.get("items", []):
            snippet = item.get("snippet", {})
            top_level = snippet.get("topLevelComment", {}).get("snippet", {})
            text = (top_level.get("textOriginal") or top_level.get("textDisplay") or "").strip()
            if not text:
                continue

            comments.append(
                {
                    "text": text,
                    "likeCount": int(top_level.get("likeCount") or 0),
                    "author": top_level.get("authorDisplayName"),
                    "publishedAt": top_level.get("publishedAt"),
                }
            )

            if len(comments) >= limit:
                break

        page_token = payload.get("nextPageToken")
        if not page_token:
            break

    return comments


def _classify_sentiment(score: float) -> str:
    if score >= 0.05:
        return "Positive"
    if score <= -0.05:
        return "Negative"
    return "Neutral"


def _top_keywords(texts: List[str], limit: int = 8) -> List[str]:
    normalized = _normalize_comments(texts)
    if not normalized:
        return []

    if TfidfVectorizer is None:
        tokens = [token for text in normalized for token in TOKEN_PATTERN.findall(text) if len(token) > 2]
        common = Counter(tokens).most_common(limit)
        return [term for term, _ in common]

    try:
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=min(50, max(limit * 3, 20)),
        )
        matrix = vectorizer.fit_transform(normalized)
        scores = np.asarray(matrix.sum(axis=0)).ravel()
        terms = vectorizer.get_feature_names_out()
        ranked = sorted(zip(terms, scores), key=lambda item: item[1], reverse=True)
        return [term for term, _ in ranked[:limit]]
    except ValueError:
        tokens = [token for text in normalized for token in TOKEN_PATTERN.findall(text) if len(token) > 2]
        common = Counter(tokens).most_common(limit)
        return [term for term, _ in common]


def _choose_most_liked_comment(comments: List[Dict[str, Any]]) -> Tuple[str, int]:
    if not comments:
        return ("No comments found", 0)
    top = max(comments, key=lambda item: item.get("likeCount", 0))
    return (str(top.get("text", "")).strip() or "No comments found", int(top.get("likeCount") or 0))


def _build_summary(
    title: str,
    positive_share: float,
    negative_share: float,
    positive_keywords: List[str],
    negative_keywords: List[str],
    average_sentiment: float,
    most_liked_comment_likes: int,
) -> str:
    positive_phrase = ", ".join(positive_keywords[:3]) if positive_keywords else "overall presentation"
    negative_phrase = ", ".join(negative_keywords[:3]) if negative_keywords else "fewer recurring complaints"

    if positive_share >= negative_share + 12:
        tone = "is strongly resonating with viewers"
    elif positive_share >= negative_share + 5:
        tone = "is more positively received than criticized"
    elif negative_share >= positive_share + 12:
        tone = "is drawing notable criticism"
    elif negative_share >= positive_share + 5:
        tone = "has a mildly critical response"
    else:
        tone = "has a mixed but balanced response"

    sentiment_note = (
        "strongly positive"
        if average_sentiment >= 0.2
        else "slightly positive"
        if average_sentiment >= 0.05
        else "neutral"
        if abs(average_sentiment) < 0.05
        else "slightly negative"
    )

    engagement_note = (
        f"The most liked comment reached {most_liked_comment_likes} likes, which suggests strong engagement."
        if most_liked_comment_likes >= 15
        else "The engagement signal is present, but not especially viral."
    )

    return (
        f"{title} {tone}. Viewers repeatedly mention {positive_phrase} in praise, "
        f"while feedback around {negative_phrase} remains the main friction point. "
        f"The average sentiment lands in a {sentiment_note} range. {engagement_note}"
    )


def _build_stats(video_meta: Dict[str, Any], comments: List[Dict[str, Any]]) -> Dict[str, Any]:
    analyzer = _ensure_sentiment_analyzer()
    sentiments: List[float] = []
    sentiment_labels: List[str] = []
    all_texts = [comment["text"] for comment in comments]

    for text in all_texts:
        score = analyzer.polarity_scores(text)["compound"]
        sentiments.append(score)
        sentiment_labels.append(_classify_sentiment(score))

    total_comments = len(all_texts)
    positive_count = sentiment_labels.count("Positive")
    negative_count = sentiment_labels.count("Negative")
    neutral_count = sentiment_labels.count("Neutral")
    positive_percentage = round((positive_count / total_comments) * 100, 2) if total_comments else 0.0
    negative_percentage = round((negative_count / total_comments) * 100, 2) if total_comments else 0.0
    neutral_percentage = round((neutral_count / total_comments) * 100, 2) if total_comments else 0.0
    average_sentiment_score = round(float(np.mean(sentiments)) if sentiments else 0.0, 3)
    csat_score = int(round(positive_percentage))
    most_liked_comment, most_liked_comment_likes = _choose_most_liked_comment(comments)

    return {
        "title": video_meta["title"],
        "video_id": video_meta["video_id"],
        "url": f"https://www.youtube.com/watch?v={video_meta['video_id']}",
        "total_comments": total_comments,
        "positive_count": positive_count,
        "negative_count": negative_count,
        "neutral_count": neutral_count,
        "positive_percentage": positive_percentage,
        "negative_percentage": negative_percentage,
        "neutral_percentage": neutral_percentage,
        "average_sentiment_score": average_sentiment_score,
        "csat_score": csat_score,
        "most_liked_comment": most_liked_comment,
        "most_liked_comment_likes": most_liked_comment_likes,
        "comments": comments,
        "sentiment_labels": sentiment_labels,
        "sentiment_scores": sentiments,
    }


def _compose_overall_insights(
    video1_meta: Dict[str, Any],
    video1_stats: Dict[str, Any],
    video2_meta: Dict[str, Any],
    video2_stats: Dict[str, Any],
    video1_keywords: List[str],
    video2_keywords: List[str],
) -> List[str]:
    positivity_gap = abs(video1_stats["positive_percentage"] - video2_stats["positive_percentage"])
    winner = video1_meta["title"] if video1_stats["positive_percentage"] >= video2_stats["positive_percentage"] else video2_meta["title"]
    stronger_complaints = video1_meta["title"] if video1_stats["negative_percentage"] >= video2_stats["negative_percentage"] else video2_meta["title"]
    stronger_engagement = video1_meta["title"] if video1_stats["most_liked_comment_likes"] >= video2_stats["most_liked_comment_likes"] else video2_meta["title"]
    shared_keywords = [keyword for keyword in video1_keywords if keyword in video2_keywords]

    insights = [
        f"{winner} leads by {positivity_gap:.1f}% in positive sentiment.",
        f"{stronger_complaints} attracts more negative feedback from viewers.",
        f"{stronger_engagement} has the most engaging top comment with {max(video1_stats['most_liked_comment_likes'], video2_stats['most_liked_comment_likes'])} likes.",
    ]

    if shared_keywords:
        insights.append(
            f"Both videos share conversation around {', '.join(shared_keywords[:3])}, suggesting overlapping audience expectations."
        )

    if video1_stats["average_sentiment_score"] != video2_stats["average_sentiment_score"]:
        better_average = video1_meta["title"] if video1_stats["average_sentiment_score"] > video2_stats["average_sentiment_score"] else video2_meta["title"]
        insights.append(
            f"{better_average} shows the healthier average sentiment curve across the sampled comments."
        )

    return insights[:5]


def _assemble_payload(
    video1_meta: Dict[str, Any],
    video1_stats: Dict[str, Any],
    video2_meta: Dict[str, Any],
    video2_stats: Dict[str, Any],
) -> Dict[str, Any]:
    v1_texts = [comment["text"] for comment in video1_stats["comments"]]
    v2_texts = [comment["text"] for comment in video2_stats["comments"]]

    v1_keywords = _top_keywords(v1_texts)
    v2_keywords = _top_keywords(v2_texts)

    v1_positive_keywords = _top_keywords(
        [text for text, label in zip(v1_texts, video1_stats["sentiment_labels"]) if label == "Positive"] or v1_texts
    )
    v1_negative_keywords = _top_keywords(
        [text for text, label in zip(v1_texts, video1_stats["sentiment_labels"]) if label == "Negative"] or v1_texts
    )
    v2_positive_keywords = _top_keywords(
        [text for text, label in zip(v2_texts, video2_stats["sentiment_labels"]) if label == "Positive"] or v2_texts
    )
    v2_negative_keywords = _top_keywords(
        [text for text, label in zip(v2_texts, video2_stats["sentiment_labels"]) if label == "Negative"] or v2_texts
    )

    video1_summary = _build_summary(
        video1_meta["title"],
        video1_stats["positive_percentage"],
        video1_stats["negative_percentage"],
        v1_positive_keywords,
        v1_negative_keywords,
        video1_stats["average_sentiment_score"],
        video1_stats["most_liked_comment_likes"],
    )
    video2_summary = _build_summary(
        video2_meta["title"],
        video2_stats["positive_percentage"],
        video2_stats["negative_percentage"],
        v2_positive_keywords,
        v2_negative_keywords,
        video2_stats["average_sentiment_score"],
        video2_stats["most_liked_comment_likes"],
    )

    positivity_difference = round(
        abs(video1_stats["positive_percentage"] - video2_stats["positive_percentage"]),
        2,
    )

    if video1_stats["positive_percentage"] > video2_stats["positive_percentage"]:
        winner = video1_meta["title"]
    elif video2_stats["positive_percentage"] > video1_stats["positive_percentage"]:
        winner = video2_meta["title"]
    else:
        winner = "Tie"

    comparison = {
        "winner": winner,
        "positivity_difference": positivity_difference,
        "key_insights": _compose_overall_insights(
            video1_meta,
            video1_stats,
            video2_meta,
            video2_stats,
            v1_keywords,
            v2_keywords,
        ),
    }

    return {
        "video1": {
            "stats": {
                k: video1_stats[k]
                for k in [
                    "title",
                    "video_id",
                    "url",
                    "total_comments",
                    "positive_count",
                    "negative_count",
                    "neutral_count",
                    "positive_percentage",
                    "negative_percentage",
                    "neutral_percentage",
                    "average_sentiment_score",
                    "csat_score",
                    "most_liked_comment",
                    "most_liked_comment_likes",
                ]
            },
            "keywords": v1_keywords[:5],
            "summary": video1_summary,
        },
        "video2": {
            "stats": {
                k: video2_stats[k]
                for k in [
                    "title",
                    "video_id",
                    "url",
                    "total_comments",
                    "positive_count",
                    "negative_count",
                    "neutral_count",
                    "positive_percentage",
                    "negative_percentage",
                    "neutral_percentage",
                    "average_sentiment_score",
                    "csat_score",
                    "most_liked_comment",
                    "most_liked_comment_likes",
                ]
            },
            "keywords": v2_keywords[:5],
            "summary": video2_summary,
        },
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
            f"Positivity gap: {payload['comparison']['positivity_difference']}%<br/>"
            f"Generated on: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
            styles["Normal"],
        )
    )
    content.append(Spacer(1, 18))

    for label in ("video1", "video2"):
        video = payload[label]
        stats = video["stats"]
        content.append(Paragraph(stats["title"], styles["Heading2"]))
        content.append(
            Paragraph(
                f"Total comments: {stats['total_comments']}<br/>"
                f"Positive: {stats['positive_percentage']}% | "
                f"Negative: {stats['negative_percentage']}% | "
                f"Neutral: {stats['neutral_percentage']}%<br/>"
                f"CSAT: {stats['csat_score']}%<br/>"
                f"Most liked comment: {stats['most_liked_comment']}",
                styles["Normal"],
            )
        )
        content.append(Paragraph(f"Summary: {video['summary']}", styles["Normal"]))
        content.append(Paragraph(f"Keywords: {', '.join(video['keywords'])}", styles["Normal"]))
        content.append(Spacer(1, 14))

    content.append(Paragraph("Key Insights", styles["Heading2"]))
    for insight in payload["comparison"]["key_insights"]:
        content.append(Paragraph(f"• {insight}", styles["Normal"]))

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

    limit = min(max(payload.max_comments, 200), URL_SAFE_COMMENT_LIMIT)
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

            video1_stats = _build_stats(video1_meta, video1_comments)
            video2_stats = _build_stats(video2_meta, video2_comments)
            response_data = _assemble_payload(video1_meta, video1_stats, video2_meta, video2_stats)
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
