# Voice-RMV

**AI-assisted audio workflow platform for transcription, voice generation, and sync editing.**

Voice-RMV is not just an AI audio tool. It is a documented, human-reviewed workflow system for turning fragmented audio production steps into a repeatable operational process.

---

## Problem

Audio and content workflows often become fragmented across disconnected tools: transcription in one place, voice generation in another, manual review handled separately, and synchronization managed ad hoc. There is no single source of truth, no repeatable process, and no governance layer between AI output and final delivery.

## Solution

Voice-RMV organizes the audio production process into a structured, traceable, and human-reviewed pipeline. Every AI-generated output — transcription, voice synthesis, timing alignment — passes through a manual validation checkpoint before it is considered final.

The platform accepts **text, YouTube URLs, audio files, and video files** as input and produces **time-aligned narrated audio** with an editable transcript that can be corrected, translated, and re-synthesized.

## Core Workflow

```
Audio / Video Input
        │
        ▼
  Audio Extraction (ffmpeg)
        │
        ▼
  Transcription (faster-whisper)
        │
        ▼
  Human Transcript Review ◄── Editor with rich text + waveform sync
        │
        ▼
  Voice Generation (edge-tts)
        │
        ▼
  Sync Editing & Timing Alignment
        │
        ▼
  Human Quality Check
        │
        ▼
  Final Audio Asset
        │
        ▼
  Export (SRT, MP3) / Re-use
```

## What This Project Demonstrates

- **AI-assisted workflow design** — structured pipeline with defined stages
- **Transcription workflow** — speech-to-text with language detection and word-level timestamps
- **Voice generation workflow** — configurable TTS with speed, pitch, and volume control
- **Audio synchronization logic** — segment alignment between original and narrated audio
- **Human-in-the-loop validation** — mandatory review checkpoints at transcript and output stages
- **Process documentation** — workflow, architecture, and human review guides in `docs/`
- **Reusable operational structure** — domain-organized backend modules under `backend/src/`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.14+, FastAPI, SQLAlchemy 2.0 (async) |
| Task Queue | Celery + Redis |
| Database | PostgreSQL |
| TTS | edge-tts (Azure Cognitive Services, CPU, free) |
| Transcription | faster-whisper (CPU, int8 quantized) |
| Video download | yt-dlp |
| Audio processing | ffmpeg |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| State / Data | TanStack Query, Axios |
| Tests | pytest (backend, mocked) |

## Human Review & Governance

Voice-RMV follows a **human-in-the-loop** model. AI-generated outputs are treated as **draft assets**, not final deliverables. The workflow includes manual validation checkpoints for:

- **Transcription accuracy** — every transcript can be edited, formatted, and corrected before synthesis
- **Voice output quality** — audio preview before accepting the generated narration
- **Timing alignment** — segment boundaries are reviewed and adjustable
- **Translation validation** — translated text is editable side-by-side with the original

This design prevents uncontrolled automation and keeps operational responsibility with the human operator.

---

## Quick Start

### Prerequisites

- Docker + Docker Compose (or Podman + Podman Compose)

### Run

```bash
docker compose up -d
```

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
# Backend (mocked, no services needed)
pytest backend/tests -v --cov=app

# Frontend (type-check + bundle)
cd frontend && npm run build

# Lint
cd frontend && npm run lint
```

### Docker (rebuild after changes)

```bash
docker compose up -d --build
```

---

## Project Structure

```
voice-rmv/
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
│   ├── workflow.md
│   ├── architecture.md
│   └── human_review.md
├── examples/                         # Usage examples
│   └── sample_input.md
├── assets/                           # Diagrams and media
│   └── workflow-diagram.png
├── docker-compose.yml
├── .env.example
└── output/                           # Generated audio files
```

---

## Configuration

| Env var | Default | Notes |
|---------|---------|-------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./dev.db` | Prod: `postgresql+asyncpg://...` |
| `REDIS_URL` | `redis://localhost:6379/0` | Required for Celery |
| `OUTPUT_DIR` | `./output` | Generated narration + transcription files |
| `TEMP_DIR` | `./temp` | Temporary working files (cleared after tasks) |

This repository uses environment variables for all sensitive configuration and does **not** include production secrets. Placeholder defaults shown in `docker-compose.yml` and `.env.example` are safe for local development only.

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
| POST | `/api/translate` | Translate text segments |
| POST | `/api/translate-task/{id}` | Translate and persist to task |

---

## Limitations

This project is a **portfolio workflow prototype**. It is not a production SaaS, not a fully automated publishing system, and not intended to replace human audio review.

Current known limitations:

- CPU-only inference — transcription and translation models run on CPU, which is slower than GPU
- Single-worker Celery — no horizontal scaling configured
- No authentication UI — API key must be passed via header
- Translation requires a local LLM server (TranslateGemma) — not included in `docker compose up`
- File-based storage — audio outputs are stored on disk, not in object storage

## Roadmap

- Improve sync validation and timing alignment
- Add batch processing for multiple files
- Add structured logging and monitoring
- Add UI layer for all workflow stages
- Add export presets (SRT, transcript, audio formats)
- Refactor internal imports from `app.*` to domain-based `src.*` modules
- GPU acceleration for transcription and TTS

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
