from celery import Celery

from app.config import settings

celery_app = Celery(
    "voice_rmv",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.narration_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
