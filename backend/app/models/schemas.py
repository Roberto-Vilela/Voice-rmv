from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class NarrateTextRequest(BaseModel):
    text: str = Field(..., max_length=5000)
    voice: str = "en-US-AriaNeural"
    speed: float = 1.0
    pitch: int = 0
    volume: float = 1.0


class NarrateVideoUrlRequest(BaseModel):
    url: str
    voice: str = "en-US-AriaNeural"
    language: str | None = None


class TaskResponse(BaseModel):
    id: UUID
    type: str
    status: str
    progress: int
    voice: str
    input_text: str | None = None
    input_url: str | None = None
    input_file: str | None = None
    transcription: str | None = None
    audio_url: str | None = None
    duration_seconds: float | None = None
    error: str | None = None
    extra_data: dict | None = None
    created_at: datetime
    updated_at: datetime


class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int


class TranslationSegment(BaseModel):
    id: str = Field(..., min_length=1, max_length=128)
    text: str = Field(..., min_length=1, max_length=100000)


class TranslateRequest(BaseModel):
    segments: list[TranslationSegment] = Field(..., min_length=1, max_length=5000)
    source_lang: str = Field(default="auto", max_length=32)
    target_lang: str = "pt-BR"


class TranslateResponse(BaseModel):
    segments: list[TranslationSegment]
    translated_text: str


class VoiceResponse(BaseModel):
    name: str
    locale: str
    gender: str
