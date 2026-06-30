import re
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import attributes

from app.config import settings
from app.database import get_db
from app.models.schemas import TaskListResponse, TaskResponse
from app.models.task import Task
from src.utils.task_response import task_to_response
from src.sync.narration_tasks import narrate_video_url_task


class TaskPatchRequest(BaseModel):
    display_name: str | None = None
    transcription: str | None = None
    input_text: str | None = None
    extra_data: dict | None = None
    input_file: str | None = None
    input_url: str | None = None
    audio_path: str | None = None

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/tasks", response_model=TaskListResponse)
async def list_tasks(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).order_by(Task.created_at.desc()).offset(skip).limit(limit))
    tasks = result.scalars().all()
    count_result = await db.execute(select(func.count(Task.id)))
    total = count_result.scalar()
    return TaskListResponse(
        tasks=[task_to_response(t) for t in tasks],
        total=total,
    )


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_to_response(task)


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(task)
    await db.commit()
    return {"status": "deleted"}


@router.post("/tasks/{task_id}/duplicate", response_model=TaskResponse)
async def duplicate_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    original = result.scalar_one_or_none()
    if original is None:
        raise HTTPException(status_code=404, detail="Task not found")

    new_task = Task(
        type=original.type,
        voice=original.voice,
        input_text=original.input_text,
        input_url=original.input_url,
        input_file=original.input_file,
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)

    # Re-dispatch celery for video_url tasks; upload tasks can't be re-processed (file deleted)
    if original.type == "video_url" and original.input_url:
        narrate_video_url_task.delay(original.input_url, original.voice, str(new_task.id))
    elif original.type in ("audio_upload", "video_upload"):
        new_task.status = "error"
        new_task.error = "Duplicate not supported for upload tasks. Original file no longer available."
        await db.commit()
        await db.refresh(new_task)

    return task_to_response(new_task)


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def patch_task(task_id: UUID, body: TaskPatchRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    payload = body.model_dump(exclude_unset=True)
    extra = dict(task.extra_data or {})

    if "display_name" in payload:
        extra["display_name"] = payload["display_name"]
    if "extra_data" in payload and payload["extra_data"]:
        extra.update(payload["extra_data"])
    if "transcription" in payload:
        task.transcription = payload["transcription"]
    if "input_text" in payload:
        task.input_text = payload["input_text"]
    if "input_file" in payload:
        task.input_file = payload["input_file"]
    if "input_url" in payload:
        task.input_url = payload["input_url"]
    if "audio_path" in payload:
        task.audio_path = payload["audio_path"]

    task.extra_data = extra
    attributes.flag_modified(task, "extra_data")
    await db.commit()
    await db.refresh(task)
    return task_to_response(task)


@router.get("/tasks/{task_id}/download")
async def download_task_audio(task_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    filename_base = f"{task_id}.mp3"
    possible_paths = [
        Path(settings.output_dir) / "narrations" / filename_base,
        Path(task.audio_path) if task.audio_path else None,
        Path("/app/output") / "narrations" / filename_base,
        Path("output") / "narrations" / filename_base,
    ]
    audio: Path | None = None
    for p in possible_paths:
        if p and p.exists() and p.is_file():
            audio = p
            break
    if audio is None:
        raise HTTPException(status_code=404, detail="Audio file not found on disk")
    display = (task.extra_data or {}).get("display_name") or task.input_text or task.id
    filename = str(display).strip()[:80]
    filename = filename.encode("ascii", errors="replace").decode("ascii")
    filename = re.sub(r'[^\w\-. ]+', "_", filename).strip() or f"audio-{task_id}"
    return FileResponse(
        str(audio),
        media_type="audio/mpeg",
        headers={"Content-Disposition": f'attachment; filename="{filename}.mp3"'},
    )
