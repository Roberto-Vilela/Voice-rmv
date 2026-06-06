from pathlib import Path

from app.config import settings
from app.database import update_task
from app.services.audio_processor import convert_to_wav, extract_audio
from app.services.transcriber import transcribe
from app.services.tts_engine import synthesize
from app.services.video_downloader import download_video
from app.tasks.celery_app import celery_app
from app.database import run_async


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
def narrate_video_url_task(self, url: str, voice: str, task_id: str, language: str | None = None):
    try:
        update_task(task_id, status="processing", progress=5)

        temp_dir = Path(settings.temp_dir) / task_id
        temp_dir.mkdir(parents=True, exist_ok=True)
        video_dir = temp_dir / "video"
        video_dir.mkdir(exist_ok=True)

        result = download_video(url, str(video_dir))
        video_path = result["file_path"]

        update_task(task_id, progress=30)

        audio_path = extract_audio(video_path, str(temp_dir / "audio.wav"))

        update_task(task_id, progress=50)

        transcription = transcribe(audio_path, language=language)
        text = transcription["text"]
        _save_transcription(task_id, text)

        update_task(task_id, progress=75, transcription=text)

        audio_bytes = run_async(synthesize(text, voice))
        narration_path = _save_narration_audio(task_id, audio_bytes)

        update_task(
            task_id,
            status="completed",
            progress=100,
            audio_path=narration_path,
            duration_seconds=transcription["duration"],
            transcription=text,
            extra_data={"transcription_segments": transcription["segments"], "language": transcription["language"]},
        )

    except Exception as e:
        update_task(task_id, status="error", error=str(e))


@celery_app.task(bind=True)
def narrate_audio_file_task(self, file_path: str, voice: str, task_id: str, language: str | None = None):
    try:
        update_task(task_id, status="processing", progress=10)

        wav_path = convert_to_wav(file_path)

        update_task(task_id, progress=40)

        transcription = transcribe(wav_path, language=language)
        text = transcription["text"]
        _save_transcription(task_id, text)

        update_task(task_id, progress=70, transcription=text)

        audio_bytes = run_async(synthesize(text, voice))
        narration_path = _save_narration_audio(task_id, audio_bytes)

        update_task(
            task_id,
            status="completed",
            progress=100,
            audio_path=narration_path,
            duration_seconds=transcription["duration"],
            transcription=text,
            extra_data={"transcription_segments": transcription["segments"], "language": transcription["language"]},
        )

    except Exception as e:
        update_task(task_id, status="error", error=str(e))
    finally:
        Path(file_path).unlink(missing_ok=True)


@celery_app.task(bind=True)
def narrate_video_file_task(self, file_path: str, voice: str, task_id: str, language: str | None = None):
    try:
        update_task(task_id, status="processing", progress=10)

        audio_path = extract_audio(file_path, f"{settings.temp_dir}/{Path(file_path).stem}.wav")

        update_task(task_id, progress=40)

        transcription = transcribe(audio_path, language=language)
        text = transcription["text"]
        _save_transcription(task_id, text)

        update_task(task_id, progress=70, transcription=text)

        audio_bytes = run_async(synthesize(text, voice))
        narration_path = _save_narration_audio(task_id, audio_bytes)

        update_task(
            task_id,
            status="completed",
            progress=100,
            audio_path=narration_path,
            duration_seconds=transcription["duration"],
            transcription=text,
            extra_data={"transcription_segments": transcription["segments"], "language": transcription["language"]},
        )

    except Exception as e:
        update_task(task_id, status="error", error=str(e))
    finally:
        Path(file_path).unlink(missing_ok=True)
