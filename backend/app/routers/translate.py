from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.schemas import TranslateRequest, TranslateResponse
from app.models.task import Task
from app.services.translator import TranslationError, translate_segments

router = APIRouter(prefix="/api", tags=["translate"])


def _response(segments) -> TranslateResponse:
    return TranslateResponse(
        segments=segments,
        translated_text="\n\n".join(segment.text for segment in segments),
    )


@router.post("/translate", response_model=TranslateResponse)
async def translate(body: TranslateRequest):
    try:
        segments = await translate_segments(
            body.segments,
            body.source_lang,
            body.target_lang,
        )
    except TranslationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return _response(segments)


@router.post("/translate-task/{task_id}", response_model=TranslateResponse)
async def translate_task(
    task_id: UUID,
    body: TranslateRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        segments = await translate_segments(
            body.segments,
            body.source_lang,
            body.target_lang,
        )
    except TranslationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    response = _response(segments)
    extra = dict(task.extra_data or {})
    extra["translation_segments"] = [
        {"id": segment.id, "text": segment.text} for segment in segments
    ]
    extra["translated_text"] = response.translated_text
    extra["translation_source"] = body.source_lang
    extra["translation_target"] = body.target_lang
    task.extra_data = extra
    await db.commit()

    return response
