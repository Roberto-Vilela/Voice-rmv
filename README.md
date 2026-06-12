# Voice-rmv

Multi-modal narration platform. Convert text, video URLs, audio files, or video files into narrated audio using AI-powered transcription and Text-to-Speech.

---

## Architecture

```
[Text] ──────────────────────────► edge-tts ────► Audio

[Video URL] ─► yt-dlp ─► ffmpeg ─► whisper ─► edge-tts
               (download)  (extract)  (transcribe)  (narrate)

[Audio File] ───────────────────► whisper ─► edge-tts

[Video File] ─► ffmpeg ─► whisper ─► edge-tts
                (extract)  (transcribe)  (narrate)
```

**Flow (example: video URL):**

1. Frontend → `POST /api/narrate/video-url` with `{ url, voice }`
2. FastAPI creates `Task` record → enqueues Celery task
3. Celery worker: download → extract audio → transcribe (whisper) → narrate (edge-tts)
4. Frontend polls `GET /api/tasks/{id}` via TanStack Query
5. Result: transcription + narrated audio player with editable transcript editor

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.14+, FastAPI, SQLAlchemy 2.0 (async) |
| Task Queue | Celery + Redis |
| Database | PostgreSQL |
| TTS | edge-tts (Azure Cognitive Services, CPU, free) |
| Transcription | faster-whisper (CPU, int8) |
| Video download | yt-dlp |
| Audio processing | ffmpeg |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| State / Data | TanStack Query, Axios |
| Tests | pytest (backend) |

---

## Quick Start

### Prerequisites

- Docker + Docker Compose (or Podman + Podman Compose)

### Run

```bash
docker compose up -d
```

Services:

| Service | Port |
|---------|------|
| API | `8456` |
| Frontend | `5173` |
| PostgreSQL | `5432` |
| Redis | `6379` |

Frontend at `http://localhost:5173`. API proxied from `/api` to `localhost:8456`.

### Health check

```bash
curl -fsS http://localhost:8456/api/health
```

---

## Development

### Backend (local)

```bash
pip install -r backend/requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8456 --reload
```

### Frontend (local)

```bash
cd frontend && npm install && npm run dev
```

### Tests

```bash
pytest backend/tests -v --cov=app          # mocked services, no infra needed
cd frontend && npm run build               # type-check + bundle
cd frontend && npm run lint                # ESLint
```

### Docker (rebuild after changes)

```bash
docker compose up -d --build
```

For Celery worker changes (no bind mount):

```bash
docker compose stop celery_worker
docker compose rm celery_worker
docker compose build celery_worker
docker compose up -d celery_worker
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/narrate/text` | Text → narrated audio (sync) |
| POST | `/api/narrate/video-url` | YouTube/video URL → narrated audio (async) |
| POST | `/api/narrate/upload` | Audio/video file → narrated audio (async) |
| GET | `/api/tasks` | Task history (paginated) |
| GET | `/api/tasks/{id}` | Task status + progress |
| PATCH | `/api/tasks/{id}` | Update task (transcription, display name) |
| POST | `/api/tasks/{id}/duplicate` | Duplicate a task |
| GET | `/api/output/{filename}` | Serve generated audio |
| GET | `/api/voices` | List available edge-tts voices |

---

## Project Structure

```
├── backend/
│   ├── src/                          # Domain pipeline modules
│   │   ├── transcription/            #   faster-whisper (speech-to-text)
│   │   ├── voice_generation/         #   edge-tts (text-to-speech)
│   │   ├── sync/                     #   Celery tasks + worker config
│   │   └── utils/                    #   audio processing, download, translation
│   ├── app/                          # FastAPI web layer
│   │   ├── main.py, config.py, database.py
│   │   ├── routers/, models/, middleware/
│   │   └── services/ + tasks/        # re-exports from src/
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/                          # React SPA
│   │   ├── App.tsx, api/, pages/, components/, hooks/
│   └── package.json
├── docs/                             # Portfolio documentation
├── examples/                         # Usage examples
├── assets/                           # Diagrams and media
├── docker-compose.yml
├── .env.example
└── output/                           # Generated audio files
```

---

## Key Features

- **Multi-modal input**: text, YouTube URLs, audio files, video files
- **Async processing**: Celery queue with real-time progress updates
- **Transcription editor**: edit transcript with bold/italic/underline, auto-save, segment highlighting synced to audio
- **Waveform player**: visual audio playback with progress tracking
- **Portuguese voice support**: 15+ native PT-BR neural voices via edge-tts
- **Language detection**: auto-detects input language for transcription
- **Duplicate tasks**: re-process a video URL with different voice settings
- **SRT export**: download transcript as SubRip subtitle format

---

## Configuration

| Env var | Default | Notes |
|---------|---------|-------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./dev.db` | Prod: `postgresql+asyncpg://...` |
| `REDIS_URL` | `redis://localhost:6379/0` | Required for Celery |
| `OUTPUT_DIR` | `./output` | Generated narration + transcription files |
| `TEMP_DIR` | `./temp` | Temporary working files (cleared after tasks) |

---

This repository uses environment variables for all sensitive configuration
(database credentials, API keys, tokens) and does **not** include production
secrets. Placeholder defaults shown in `docker-compose.yml` and `.env.example`
are safe for local development only.

---

## Tests

```bash
# Backend (mocked, no services needed)
pytest backend/tests -v --cov=app

# Frontend (type-check + build)
cd frontend && npm run build

# Lint
cd frontend && npm run lint
```

CI runs with Python 3.14 + real PostgreSQL/Redis (pytest + httpx + pytest-asyncio) and Node 22 for frontend build.

---

## License

MIT
