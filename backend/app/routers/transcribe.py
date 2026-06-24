import asyncio
import logging
import os
import subprocess
import tempfile

from fastapi import APIRouter, File, Form, UploadFile

from src.transcription.transcriber import transcribe
from src.transcription.vocabulary import get_vocabulary, prepare_vocabulary as prepare_theme_vocabulary

logger = logging.getLogger(__name__)

try:
    from imageio_ffmpeg import get_ffmpeg_exe as _get_ffmpeg_exe
    _FFMPEG_PATH = _get_ffmpeg_exe()
except Exception:
    _FFMPEG_PATH = "ffmpeg"

router = APIRouter(prefix="/api/transcribe", tags=["transcribe"])

SUPPORTED_DICTATION_LANGUAGES = {"pt-br": "pt", "en-us": "en", "pt": "pt", "en": "en"}

THEMES = [
    {"name": "saude", "label": "Health", "icon": "local_hospital"},
    {"name": "lei", "label": "Law", "icon": "gavel"},
    {"name": "tecnologia", "label": "Technology", "icon": "computer"},
    {"name": "economia", "label": "Economy", "icon": "account_balance"},
    {"name": "marketing", "label": "Marketing", "icon": "campaign"},
    {"name": "politica", "label": "Politics", "icon": "how_to_vote"},
    {"name": "idioma", "label": "Language", "icon": "translate"},
    {"name": "relacionamento", "label": "Relationships", "icon": "favorite"},
    {"name": "financeiro", "label": "Finance", "icon": "payments"},
]

try:
    import torch as _torch
    _GPU_AVAILABLE = _torch.cuda.is_available()
    _GPU_NAME = _torch.cuda.get_device_name(0) if _GPU_AVAILABLE else None
    _GPU_DEVICE = f"cuda:{_torch.cuda.current_device()}" if _GPU_AVAILABLE else "cpu"
except Exception:
    _GPU_AVAILABLE = False
    _GPU_NAME = None
    _GPU_DEVICE = "cpu"


@router.get("/themes")
async def list_themes():
    return THEMES


@router.get("/gpu-check")
async def gpu_check():
    return {
        "available": _GPU_AVAILABLE,
        "device": _GPU_DEVICE,
        "name": _GPU_NAME,
    }


@router.post("/prepare")
def prepare_vocabulary_endpoint(theme: str = Form("outros")):
    logger.info("transcribe.prepare requested theme=%s", theme)
    result = prepare_theme_vocabulary(theme)
    logger.info("transcribe.prepare completed theme=%s result=%s", theme, result)
    return {"status": "ok", **result}


@router.post("")
async def transcribe_audio(
    file: UploadFile = File(...),
    theme: str = Form("outros"),
    use_gpu: bool = Form(False),
    language: str = Form("auto"),
):
    normalized_language = (language or "auto").strip().lower()
    whisper_lang = None if normalized_language == "auto" else SUPPORTED_DICTATION_LANGUAGES.get(
        normalized_language,
        normalized_language.split("-")[0],
    )
    logger.info(
        "transcribe.audio requested theme=%s language=%s whisper_lang=%s use_gpu=%s",
        theme,
        language,
        whisper_lang,
        use_gpu,
    )

    if use_gpu and _GPU_AVAILABLE:
        device, model_size, compute_type = "cuda", "large-v3", "float16"
    else:
        device, model_size, compute_type = "cpu", "base", "int8"

    prompt = await asyncio.to_thread(get_vocabulary, theme)

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        tmp.write(await file.read())
        webm_path = tmp.name

    wav_path = webm_path + ".wav"
    try:
        subprocess.run(
            [
                _FFMPEG_PATH, "-i", webm_path,
                "-acodec", "pcm_s16le",
                "-ar", "16000", "-ac", "1",
                "-y", wav_path,
            ],
            check=True, capture_output=True,
        )
    finally:
        os.unlink(webm_path)

    try:
        result = transcribe(
            wav_path,
            language=whisper_lang,
            model_size=model_size,
            device=device,
            compute_type=compute_type,
            initial_prompt=prompt or None,
        )
        return result
    finally:
        os.unlink(wav_path)
