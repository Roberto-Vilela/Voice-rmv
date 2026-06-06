from pathlib import Path

from app.models.schemas import TaskResponse
from app.models.task import Task


def task_to_response(task: Task) -> TaskResponse:
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
        extra_data=task.extra_data,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )
