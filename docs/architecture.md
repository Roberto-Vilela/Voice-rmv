# Architecture

- **Backend:** FastAPI (async), SQLAlchemy 2.0, Celery + Redis
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query
- **TTS:** edge-tts (Azure Cognitive Services, CPU, free)
- **Transcription:** faster-whisper (CPU, int8 quantized)
- **Storage:** PostgreSQL (tasks), filesystem (audio outputs)

## Directory Layout

```
backend/
├── src/                  # Domain modules
│   ├── transcription/    # Speech-to-text
│   ├── voice_generation/ # Text-to-speech + timing
│   ├── sync/             # Celery tasks + worker config
│   └── utils/            # Audio processing, video download, translation
├── app/                  # FastAPI web layer
│   ├── main.py, config.py, database.py
│   ├── routers/, models/, middleware/
│   └── services/ + tasks/  → re-exports from src/
└── tests/
```
