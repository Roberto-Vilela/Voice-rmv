import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.schemas import (
    NarrateTextRequest,
    NarrateVideoUrlRequest,
    TaskResponse,
)
from app.models.task import Task
from app.services.tts_engine import synthesize
from app.tasks.narration_tasks import (
    narrate_audio_file_task,
    narrate_video_file_task,
    narrate_video_url_task,
)

router = APIRouter(prefix="/api/narrate", tags=["narrate"])


def _task_to_response(task: Task, request=None) -> TaskResponse:
    audio_url = f"/api/output/{Path(task.audio_path).name}" if task.audio_path else None
    return TaskResponse(
        id=task.id,
        type=task.type,
        status=task.status,
        progress=task.progress,
        voice=task.voice,
        input_text=task.input_text,
        input_url=task.input_url,
        input_file=task.input_file,
        transcription=task.transcription,
        audio_url=audio_url,
        duration_seconds=task.duration_seconds,
        error=task.error,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.post("/text", response_model=TaskResponse)
async def narrate_text(body: NarrateTextRequest, db: AsyncSession = Depends(get_db)):
    task = Task(type="text", voice=body.voice, input_text=body.text, status="processing")
    db.add(task)
    await db.commit()
    await db.refresh(task)

    try:
        audio_bytes = await synthesize(body.text, body.voice)
        filename = f"{task.id}.mp3"
        audio_dir = Path(settings.output_dir) / "narrations"
        audio_dir.mkdir(parents=True, exist_ok=True)
        audio_path = audio_dir / filename
        audio_path.write_bytes(audio_bytes)

        task.status = "completed"
        task.progress = 100
        task.audio_path = str(audio_path)
        await db.commit()
        await db.refresh(task)
    except Exception as e:
        task.status = "error"
        task.error = str(e)
        await db.commit()
        await db.refresh(task)

    return _task_to_response(task)


@router.post("/video-url", response_model=TaskResponse)
async def narrate_video_url(body: NarrateVideoUrlRequest, db: AsyncSession = Depends(get_db)):
    task = Task(type="video_url", voice=body.voice, input_url=body.url)
    db.add(task)
    await db.commit()
    await db.refresh(task)

    narrate_video_url_task.delay(body.url, body.voice, str(task.id))

    return _task_to_response(task)


@router.post("/upload", response_model=TaskResponse)
async def narrate_upload(file: UploadFile, voice: str = "pt-BR-FranciscaNeural", db: AsyncSession = Depends(get_db)):
    temp_dir = Path(settings.temp_dir)
    temp_dir.mkdir(parents=True, exist_ok=True)
    file_path = temp_dir / f"{uuid.uuid4()}_{file.filename}"
    content = await file.read()
    file_path.write_bytes(content)

    is_video = file.filename and file.filename.lower().endswith((".mp4", ".mkv", ".avi", ".mov", ".webm"))
    task_type = "video_upload" if is_video else "audio_upload"

    task = Task(type=task_type, voice=voice, input_file=file.filename)
    db.add(task)
    await db.commit()
    await db.refresh(task)

    if is_video:
        narrate_video_file_task.delay(str(file_path), voice, str(task.id))
    else:
        narrate_audio_file_task.delay(str(file_path), voice, str(task.id))

    return _task_to_response(task)
