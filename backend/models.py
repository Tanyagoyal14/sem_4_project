from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
import re

from pydantic import BaseModel, EmailStr, Field, field_validator

PASSWORD_REQUIREMENTS_MESSAGE = (
    "Password must be at least 8 characters long and include letters, numbers, "
    "and a special character."
)


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Literal["free", "premium"] = "free"

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError(PASSWORD_REQUIREMENTS_MESSAGE)
        if not re.search(r"[A-Za-z]", value):
            raise ValueError(PASSWORD_REQUIREMENTS_MESSAGE)
        if not re.search(r"\d", value):
            raise ValueError(PASSWORD_REQUIREMENTS_MESSAGE)
        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError(PASSWORD_REQUIREMENTS_MESSAGE)
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    role: Literal["free", "premium"]
    credits: int = 200
    created_at: datetime


class AuthResponse(BaseModel):
    message: str
    user: UserPublic
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"


class DeductCreditsRequest(BaseModel):
    amount: int = Field(gt=0)


class ProfileModel(BaseModel):
    name: str
    email: EmailStr
    company: str
    role: str
    avatar: str


class FeedbackInput(BaseModel):
    user_id: Optional[str] = None
    feedback: str = Field(min_length=1, max_length=5000)


class FeedbackBatchInput(BaseModel):
    user_id: Optional[str] = None
    feedback: Optional[str] = None
    feedbacks: Optional[List[str]] = None


class FeedbackAnalysisItem(BaseModel):
    id: str
    user_id: Optional[str] = None
    batch_id: Optional[str] = None
    batch_name: Optional[str] = None
    source_type: Optional[str] = "manual"
    feedback: str
    translated_feedback: Optional[str] = None
    sentiment: str
    feedback_type: str
    top_industries: List[Dict[str, Any]]
    csat_score: int
    created_at: datetime
    credits_remaining: Optional[int] = None


class FeedbackAnalysisResponse(BaseModel):
    results: List[FeedbackAnalysisItem]
    total: int
    credits_remaining: Optional[int] = None


class YouTubeCompareRequest(BaseModel):
    video1_url: str = Field(min_length=5, max_length=2000)
    video2_url: str = Field(min_length=5, max_length=2000)
    max_comments: int = Field(default=300, ge=200, le=500)


class VideoMetadata(BaseModel):
    title: str
    video_id: str
    url: str
    channel_title: Optional[str] = None
    published_at: Optional[str] = None
    comment_count: int = 0


class SentimentBreakdown(BaseModel):
    total_comments: int
    positive_count: int
    negative_count: int
    neutral_count: int
    positive_percentage: float
    negative_percentage: float
    neutral_percentage: float
    average_sentiment_score: float
    csat_score: float


class CommentItem(BaseModel):
    text: str
    likeCount: int
    publishedAt: Optional[str] = None


class CategorizedComments(BaseModel):
    positive_comments: List[CommentItem] = Field(default_factory=list)
    negative_comments: List[CommentItem] = Field(default_factory=list)
    neutral_comments: List[CommentItem] = Field(default_factory=list)


class MostCommentedItem(BaseModel):
    text: str
    likeCount: int
    publishedAt: Optional[str] = None


class VideoComparePayload(BaseModel):
    stats: VideoMetadata
    sentiment_breakdown: SentimentBreakdown
    keywords: Dict[str, Any]
    most_liked_comment: MostCommentedItem
    most_criticized_comment: MostCommentedItem
    user_requests: List[CommentItem] = Field(default_factory=list)
    categorized_comments: CategorizedComments


class KeywordComparison(BaseModel):
    top_keywords_video1: List[str] = Field(default_factory=list)
    top_keywords_video2: List[str] = Field(default_factory=list)
    shared_keywords: List[str] = Field(default_factory=list)
    distinct_keywords: Dict[str, List[str]] = Field(default_factory=dict)


class CompareInsight(KeywordComparison):
    winner: str
    positivity_gap: float
    insights: List[str]
    ai_summary: str
    keyword_prompt: Optional[str] = None


class YouTubeCompareResponse(BaseModel):
    video1: VideoComparePayload
    video2: VideoComparePayload
    comparison: CompareInsight
    cached: bool = False
    history_saved: bool = False
