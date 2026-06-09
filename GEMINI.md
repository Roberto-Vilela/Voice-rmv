# Voice-rmv

Voice-rmv is a multi-modal narration platform that allows users to generate voiceovers for text, uploaded audio/video files, or video URLs. It uses AI services for speech synthesis (edge-tts) and transcription (faster-whisper).

## Architecture & Technology Stack

- **Backend:**
  - **Framework:** FastAPI (Asynchronous)
  - **Task Queue:** Celery with Redis as the broker/backend.
  - **Database:** PostgreSQL (production) or SQLite (development) with SQLAlchemy 2.0 (Async + Sync engines).
  - **AI Services:** `edge-tts` (Synthesis), `faster-whisper` (Transcription), `yt-dlp` (Video downloader), `ffmpeg` (Audio/Video processing).
- **Frontend:**
  - **Framework:** React 19 + Vite.
  - **Language:** TypeScript (Strict mode).
  - **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`).
  - **State Management:** TanStack Query (React Query).
  - **Routing:** React Router.

## Project Structure

- `backend/`: Python source code, tests, and configuration.
  - `app/main.py`: API entry point.
  - `app/tasks/`: Celery task definitions (`narration_tasks.py`).
  - `app/services/`: Core logic for audio, video, and AI processing.
- `frontend/`: React application source code.
  - `src/App.tsx`: Routing and main layout.
  - `src/api/`: API client and hooks.
- `.qwen/memory-bank/`: Comprehensive project knowledge base, including design rules, tech context, and progress tracking.
- `docs/`: Additional project documentation.

## Getting Started

### Prerequisites

- Docker and Docker Compose (recommended)
- Python 3.12+
- Node.js 22+

### Development Commands

#### Using Docker (Recommended)
```bash
# Start all services (API, Worker, Postgres, Redis, Frontend)
docker compose up -d

# Rebuild and start
docker compose up -d --build
```

#### Local Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8456 --reload
```

#### Local Frontend
```bash
cd frontend
npm install
npm run dev
```

### Testing

```bash
# Backend tests
pytest backend/tests -v --cov=app

# Frontend build (includes type-check)
cd frontend
npm run build

# Frontend lint
npm run lint
```

## Development Workflow & Mandates

This project follows a strict **Research -> Strategy -> Execution -> Validation** lifecycle.

### Core Workflow (from AGENTS.md)
1.  **Analysis:** Understand input, analyze code, and check feasibility.
2.  **Memory Bank:** Consult `.qwen/memory-bank/MEMORY.md` before starting any work.
3.  **Planning:** Create a detailed task list and wait for user approval.
4.  **Execution:** Implement step-by-step, communicating milestones.
5.  **Human Validation (Step 8 - CRITICAL):** **DO NOT** run automated tests automatically. List manual tests and commands for the user to verify. **STOP** and wait for explicit user confirmation before proceeding.
6.  **Wrap-up:** Detail what was done, update the memory bank (`progress.md`), and polish the code.

### Technical Guidelines
- **Sync/Async DB:** `backend/app/database.py` handles both sync (for Celery) and async (for FastAPI) database operations. Use `run_async()` when calling async services from Celery tasks.
- **Celery Tasks:** New tasks must be included in `backend/app/tasks/celery_app.py`. Rebuild containers after changing task definitions.
- **Tailwind v4:** The frontend uses Tailwind v4 with the Vite plugin. Avoid Tailwind v3 patterns if they conflict.
- **Memory Bank Updates:** Always document learnings and progress in `.qwen/memory-bank/` after completing a task.
