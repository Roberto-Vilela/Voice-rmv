from pathlib import Path
import uuid

from app.config import settings
from app.database import update_task
from src.utils.audio_processor import convert_to_wav, extract_audio, get_media_duration
from src.transcription.transcriber import transcribe
from src.voice_generation.tts_engine import build_narration_segments, synthesize, synthesize_with_timing
from src.utils.video_downloader import download_video
from src.sync.celery_app import celery_app
from app.database import run_async
from app.models.task import Task
from sqlalchemy.orm import Session
from app.database import sync_engine


def _get_task_by_id(task_id: str) -> dict:
    with Session(sync_engine) as session:
        task = session.query(Task).filter(Task.id == uuid.UUID(task_id)).first()
        return task.extra_data or {}

def _update_task_extra(task_id: str, new_data: dict):
    current = _get_task_by_id(task_id)
    current.update(new_data)
    update_task(task_id, extra_data=current)

def _save_narration_audio(task_id: str, audio_bytes: bytes) -> str:
    audio_dir = Path(settings.output_dir) / "narrations"
    audio_dir.mkdir(parents=True, exist_ok=True)
    path = audio_dir / f"{task_id}.mp3"
    path.write_bytes(audio_bytes)
    return str(path)


def _save_transcription(task_id: str, text: str) -> str:
    txt_dir = Path(settings.output_dir) / "transcriptions"
    txt_dir.mkdir(parents=True, exist_ok=True)
    path = txt_dir / f"{task_id}.txt"
    path.write_text(text, encoding="utf-8")
    return str(path)


@celery_app.task(bind=True)
def narrate_text_task(self, text: str, voice: str, task_id: str, speed: float = 1.0, pitch: int = 0, volume: float = 1.0):
    try:
        update_task(task_id, status="processing", progress=10)

        audio_bytes = run_async(synthesize(text, voice, speed=speed, pitch=pitch, volume=volume))
        narration_path = _save_narration_audio(task_id, audio_bytes)

        _update_task_extra(task_id, {"input_text": text})

        update_task(
            task_id,
            status="completed",
            progress=100,
            audio_path=narration_path,
            transcription=text,
        )
    except Exception as e:
        update_task(task_id, status="error", error=str(e))


@celery_app.task(bind=True)
def narrate_video_url_task(self, url: str, voice: str, task_id: str, language: str | None = None):
    try:
        update_task(task_id, status="processing", progress=5)

        temp_dir = Path(settings.temp_dir) / task_id
        temp_dir.mkdir(parents=True, exist_ok=True)
        video_dir = temp_dir / "video"
        video_dir.mkdir(exist_ok=True)

        result = download_video(url, str(video_dir))
        video_path = result["file_path"]

        _update_task_extra(
            task_id,
            {
                "video_title": result["title"],
                "source_url": url,
                "language": language or "auto",
            },
        )

        update_task(task_id, progress=30)

        audio_path = extract_audio(video_path, str(temp_dir / "audio.wav"))

        update_task(task_id, progress=50)

        transcription = transcribe(audio_path, language=language)
        text = transcription["text"]
        _save_transcription(task_id, text)

        update_task(task_id, progress=75, transcription=text)

        synthesis = run_async(synthesize_with_timing(text, voice))
        narration_path = _save_narration_audio(task_id, synthesis["audio"])
        narration_duration = get_media_duration(narration_path)
        narration_segments = build_narration_segments(
            transcription["segments"],
            synthesis["word_boundaries"],
            narration_duration,
        )

        _update_task_extra(
            task_id,
            {
                "video_title": result["title"],
                "source_url": url,
                "display_name": result["title"],
                "transcription_segments": transcription["segments"],
                "narration_segments": narration_segments,
                "original_duration_seconds": transcription["duration"],
                "language": transcription["language"],
            },
        )
        update_task(
            task_id,
            status="completed",
            progress=100,
            audio_path=narration_path,
            duration_seconds=narration_duration,
            transcription=text,
        )

    except Exception as e:
        update_task(task_id, status="error", error=str(e))


@celery_app.task(bind=True)
def narrate_audio_file_task(self, file_path: str, voice: str, task_id: str, language: str | None = None, input_file: str | None = None):
    try:
        update_task(task_id, status="processing", progress=10)

        early_display = Path(input_file).stem if input_file else None
        if early_display:
            _update_task_extra(task_id, {"display_name": early_display})

        wav_path = convert_to_wav(file_path)

        update_task(task_id, progress=40)

        transcription = transcribe(wav_path, language=language)
        text = transcription["text"]
        _save_transcription(task_id, text)

        update_task(task_id, progress=70, transcription=text)

        synthesis = run_async(synthesize_with_timing(text, voice))
        narration_path = _save_narration_audio(task_id, synthesis["audio"])
        narration_duration = get_media_duration(narration_path)
        narration_segments = build_narration_segments(
            transcription["segments"],
            synthesis["word_boundaries"],
            narration_duration,
        )

        extra_data = {
            "transcription_segments": transcription["segments"],
            "narration_segments": narration_segments,
            "original_duration_seconds": transcription["duration"],
            "language": transcription["language"],
        }
        if early_display:
            extra_data["display_name"] = early_display

        _update_task_extra(task_id, extra_data)

        update_task(
            task_id,
            status="completed",
            progress=100,
            audio_path=narration_path,
            duration_seconds=narration_duration,
            transcription=text,
        )

    except Exception as e:
        update_task(task_id, status="error", error=str(e))
    finally:
        Path(file_path).unlink(missing_ok=True)


@celery_app.task(bind=True)
def narrate_video_file_task(self, file_path: str, voice: str, task_id: str, language: str | None = None, input_file: str | None = None):
    try:
        update_task(task_id, status="processing", progress=10)

        early_display = Path(input_file).stem if input_file else None
        if early_display:
            _update_task_extra(task_id, {"display_name": early_display})

        audio_path = extract_audio(file_path, f"{settings.temp_dir}/{Path(file_path).stem}.wav")

        update_task(task_id, progress=40)

        transcription = transcribe(audio_path, language=language)
        text = transcription["text"]
        _save_transcription(task_id, text)

        update_task(task_id, progress=70, transcription=text)

        synthesis = run_async(synthesize_with_timing(text, voice))
        narration_path = _save_narration_audio(task_id, synthesis["audio"])
        narration_duration = get_media_duration(narration_path)
        narration_segments = build_narration_segments(
            transcription["segments"],
            synthesis["word_boundaries"],
            narration_duration,
        )

        extra_data = {
            "transcription_segments": transcription["segments"],
            "narration_segments": narration_segments,
            "original_duration_seconds": transcription["duration"],
            "language": transcription["language"],
        }
        if early_display:
            extra_data["display_name"] = early_display

        _update_task_extra(task_id, extra_data)

        update_task(
            task_id,
            status="completed",
            progress=100,
            audio_path=narration_path,
            duration_seconds=narration_duration,
            transcription=text,
        )

    except Exception as e:
        update_task(task_id, status="error", error=str(e))
    finally:
        Path(file_path).unlink(missing_ok=True)
