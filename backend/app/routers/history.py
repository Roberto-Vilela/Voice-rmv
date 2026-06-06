from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.schemas import TaskListResponse, TaskResponse
from app.models.task import Task
from app.services.task_response import task_to_response


class TaskPatchRequest(BaseModel):
    display_name: str | None = None
    transcription: str | None = None
    extra_data: dict | None = None

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/tasks", response_model=TaskListResponse)
async def list_tasks(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).order_by(Task.created_at.desc()).offset(skip).limit(limit))
    tasks = result.scalars().all()
    return TaskListResponse(
        tasks=[task_to_response(t) for t in tasks],
        total=len(tasks),
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
    return task_to_response(new_task)


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def patch_task(task_id: UUID, body: TaskPatchRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    extra = task.extra_data or {}
    if body.display_name is not None:
        extra["display_name"] = body.display_name
    if body.extra_data:
        extra.update(body.extra_data)
    if body.transcription is not None:
        task.transcription = body.transcription
    task.extra_data = extra
    await db.commit()
    await db.refresh(task)
    return task_to_response(task)
