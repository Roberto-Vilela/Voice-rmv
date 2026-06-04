from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.schemas import TaskListResponse, TaskResponse
from app.models.task import Task

router = APIRouter(prefix="/api", tags=["history"])


def _task_to_response(task: Task) -> TaskResponse:
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


@router.get("/tasks", response_model=TaskListResponse)
async def list_tasks(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).order_by(Task.created_at.desc()).offset(skip).limit(limit))
    tasks = result.scalars().all()
    return TaskListResponse(
        tasks=[_task_to_response(t) for t in tasks],
        total=len(tasks),
    )


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_response(task)
