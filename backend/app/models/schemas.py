from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class NarrateTextRequest(BaseModel):
    text: str
    voice: str = "pt-BR-FranciscaNeural"


class NarrateVideoUrlRequest(BaseModel):
    url: str
    voice: str = "pt-BR-FranciscaNeural"


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
    created_at: datetime
    updated_at: datetime


class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int


class VoiceResponse(BaseModel):
    name: str
    locale: str
    gender: str
