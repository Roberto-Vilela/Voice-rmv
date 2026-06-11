# Relatório de Análise do Backend - Voice-RMV

**Data:** 6 de junho de 2026  
**Projeto:** Voice-RMV (Plataforma de Narração Multimodal)  
**Análise:** Arquivos do backend (`backend/`)  
**Status:** VALIDADO contra o código-fonte

---

## 📋 Resumo Executivo

O backend é uma API RESTful construída com **FastAPI** que implementa uma plataforma completa de narração de áudio e vídeo com transcrição automática e síntese de voz neural. O sistema utiliza arquitetura assíncrona, Celery para tarefas assíncronas, e integra múltiplos serviços de IA (Edge TTS, Whisper).

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica

| Camada | Tecnologias | Status |
|--------|-------------|--------|
| **Framework Web** | FastAPI 0.115.0+ | ✅ Validado |
| **Banco de Dados** | PostgreSQL (asyncpg) + SQLite (fallback async) | ✅ Validado |
| **Cache/Queue** | Redis 7.0+ | ✅ Validado |
| **Tasks Assíncronas** | Celery 5.4.0 | ✅ Validado |
| **TTS (Síntese de Voz)** | Edge TTS 6.1.3 | ✅ Validado |
| **STT (Transcrição)** | Faster-Whisper 1.1.0 | ✅ Validado |
| **Download de Vídeo** | yt-dlp 2024.12.0+ | ✅ Validado |
| **Processamento de Áudio** | FFmpeg (via subprocess) | ✅ Validado |
| **Language** | Python 3.12+ (pyproject.toml) | ✅ Validado |

> **Nota:** `pydub` está no `requirements.txt` mas não é importado em nenhum arquivo `.py` do backend.

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (Vue/React)                       │
│                   :5173 → API Proxy                          │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   BACKEND API (FastAPI :8456)                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │  /api/narrate   │  │  /api/tasks     │  │  /api/voices  │ │
│  │  (Narração)     │  │  (Histórico)    │  │  (Vozes)      │ │
│  └─────────────────┘  └─────────────────┘  └───────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Database Layer (SQLAlchemy 2.0 async)       │ │
│  │  ┌───────────────────────────────────────────────────┐  │ │
│  │  │              Task Model (SQLite/PostgreSQL)        │  │ │
│  │  └───────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐ ┌────────▼────────┐ ┌────────▼──────────┐
│ TTS Engine     │ │ Transcriber     │ │ Video Downloader  │
│ (Edge TTS)     │ │ (Whisper)       │ │ (yt-dlp)          │
└────────────────┘ └─────────────────┘ └───────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Audio Output    │ │ Transcript      │ │ Downloaded      │
│ /output/narrations │ /output/transcriptions │ /temp/       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                            │
┌──────────────────────────▼─────────────────────────────┐
│              Celery Worker (Tasks Assíncronas)          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ narrate_video_url_task()                          │ │
│  │ narrate_audio_file_task()                          │ │
│  │ narrate_video_file_task()                          │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Diretórios

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py              # Settings via Pydantic BaseSettings
│   ├── database.py            # Engine async + sync híbrido
│   ├── main.py                # FastAPI app + routers + static mount
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── schemas.py         # Pydantic request/response models
│   │   └── task.py            # SQLAlchemy Task ORM model
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── history.py         # GET/DELETE/PATCH/POST /api/tasks
│   │   └── narrate.py         # POST /api/narrate/{text,video-url,upload}
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── audio_processor.py # FFmpeg: extract_audio(), convert_to_wav()
│   │   ├── task_response.py   # Task ORM → TaskResponse converter
│   │   ├── transcriber.py     # Faster-Whisper: transcribe()
│   │   ├── tts_engine.py      # Edge TTS: synthesize(), list_voices()
│   │   └── video_downloader.py# yt-dlp: download_video()
│   │
│   └── tasks/
│       ├── __init__.py
│       ├── celery_app.py      # Celery broker/backend config
│       └── narration_tasks.py # 3 Celery tasks de narração
│
├── tests/
│   ├── conftest.py            # Fixtures: client, mocks, db override
│   ├── test_narrate_api.py    # Tests: narrate + history endpoints
│   ├── test_transcriber.py    # Unit: transcribe()
│   ├── test_tts.py            # Unit: synthesize(), list_voices()
│   ├── test_video_downloader.py # Unit: download_video()
│   └── test_audio_processor.py  # Unit: extract_audio(), convert_to_wav()
│
├── pyproject.toml             # Project config + pytest
├── requirements.txt           # Dependencies
├── Dockerfile                 # Container build
└── dev.db                     # SQLite dev database
```

> **Nota:** O relatório anterior listava `test_history_api.py` como arquivo separado. Na realidade, os testes de history estão em `test_narrate_api.py` (classes `TestGetTask`, `TestListTasks`).

---

## 🗄️ Modelo de Dados

### Tabela: `tasks`

| Coluna | Tipo SQLAlchemy | Descrição |
|--------|----------------|-----------|
| `id` | UUID (PK, default uuid4) | Identificador único |
| `type` | VARCHAR(50), NOT NULL | `text`, `video_url`, `video_upload`, `audio_upload` |
| `status` | VARCHAR(20), default `pending` | `pending`, `processing`, `completed`, `error` |
| `progress` | INTEGER, default 0 | 0-100 (porcentagem) |
| `voice` | VARCHAR(100), default `en-US-AriaNeural` | ID da voz Edge TTS |
| `input_text` | TEXT, nullable | Texto para narração |
| `input_url` | TEXT, nullable | URL do vídeo |
| `input_file` | VARCHAR(255), nullable | Nome do arquivo upload |
| `transcription` | TEXT, nullable | Texto transcrito (resultado) |
| `audio_path` | VARCHAR(255), nullable | Caminho do áudio gerado |
| `duration_seconds` | FLOAT, nullable | Duração do áudio |
| `error` | TEXT, nullable | Mensagem de erro |
| `extra_data` | JSON (SQLiteJSON), nullable | Segments, language, etc. |
| `created_at` | TIMESTAMP, server_default=now() | Data de criação |
| `updated_at` | TIMESTAMP, server_default=now(), onupdate=now() | Data de atualização |

> **Nota:** O campo `extra_data` usa `SQLiteJSON` para SQLite e `JSONB` para PostgreSQL (importado mas não utilizado diretamente).

---

## 🚀 Endpoints da API

### Rota: `/api/health` (GET)
Verifica saúde do serviço.

```json
// Response
{ "status": "ok" }
```

---

### Rota: `/api/voices` (GET)
Lista vozes disponíveis via Edge TTS.

```json
// Response
[
  { "name": "en-US-AriaNeural", "locale": "en-US", "gender": "Female" },
  { "name": "pt-BR-FranciscaNeural", "locale": "pt-BR", "gender": "Female" }
]
```

> **Nota:** Retorna `list[dict]`, não usa o schema `VoiceResponse` definido em `schemas.py`.

---

### Rota: `/api/narrate/text` (POST)
Narração a partir de texto puro. **Execução síncrona** (sem Celery).

```json
// Request
{ "text": "Olá mundo", "voice": "en-US-AriaNeural" }

// Response
{
  "id": "uuid-...",
  "type": "text",
  "status": "completed",
  "progress": 100,
  "voice": "en-US-AriaNeural",
  "input_text": "Olá mundo",
  "audio_url": "/api/output/{id}.mp3"
}
```

**Fluxo (`narrate.py:27-52`):**
1. Cria `Task` com status `processing`
2. Chama `await synthesize()` diretamente (sem Celery)
3. Salva MP3 em `output/narrations/{id}.mp3`
4. Atualiza status para `completed`

> **Atenção:** Bloqueia o event loop do FastAPI durante toda a síntese TTS.

---

### Rota: `/api/narrate/video-url` (POST)
Narração de vídeo via URL. **Execução assíncrona** (Celery).

```json
// Request
{ "url": "https://youtube.com/watch?v=abc123", "voice": "en-US-AriaNeural" }

// Response
{
  "id": "uuid-...",
  "type": "video_url",
  "status": "pending",
  "progress": 0,
  "input_url": "https://youtube.com/watch?v=abc123"
}
```

**Fluxo (`narration_tasks.py:29-68`):**
1. Cria `Task` com status `pending`
2. Dispara `narrate_video_url_task.delay()`
3. Worker executa:
   - Download vídeo (yt-dlp) → 5%
   - Extração áudio (FFmpeg) → 30%
   - Transcrição (Whisper) → 50%
   - Síntese voz (Edge TTS) → 75%
   - Salva resultado → 100%

---

### Rota: `/api/narrate/upload` (POST)
Upload de arquivo de áudio/vídeo. **Execução assíncrona** (Celery).

```json
// Request (multipart/form-data)
file: <video.mp4>
voice: en-US-AriaNeural

// Response
{
  "id": "uuid-...",
  "type": "video_upload",
  "status": "pending",
  "progress": 0,
  "input_file": "video.mp4"
}
```

**Detecção automática (`narrate.py:75`):**
- `.mp4`, `.mkv`, `.avi`, `.mov`, `.webm` → `video_upload`
- Outros → `audio_upload`

---

### Rota: `/api/tasks` (GET)
Lista tarefas com paginação.

```json
// Request
GET /api/tasks?skip=0&limit=50

// Response
{
  "tasks": [{ "id": "uuid-...", "status": "completed", ... }],
  "total": 1
}
```

> **Bug:** `total` retorna `len(tasks)` (tamanho da página) em vez do total real no banco.

---

### Rota: `/api/tasks/{task_id}` (GET)
Busca tarefa específica.

---

### Rota: `/api/tasks/{task_id}` (DELETE)
Deleta tarefa do banco.

```json
// Response
{ "status": "deleted" }
```

---

### Rota: `/api/tasks/{task_id}/duplicate` (POST)
Duplica tarefa (mesmos inputs, novo ID, status `pending`).

---

### Rota: `/api/tasks/{task_id}` (PATCH)
Atualiza campos opcionais: `display_name`, `transcription`, `extra_data`.

---

## ⚙️ Serviços do Backend

### 1. `tts_engine.py` - Edge TTS Wrapper

| Função | Async | Descrição |
|--------|-------|-----------|
| `synthesize(text, voice)` | Sim | Gera áudio em bytes via streaming |
| `list_voices()` | Sim | Lista vozes disponíveis |

**Implementação (`tts_engine.py:5-14`):**
```python
async def synthesize(text: str, voice: str = "en-US-AriaNeural") -> bytes:
    communicate = edge_tts.Communicate(text, voice)
    audio = b""
    stream = communicate.stream()
    if inspect.isawaitable(stream):
        stream = await stream
    async for chunk in stream:
        if chunk["type"] == "audio":
            audio += chunk["data"]
    return audio
```

---

### 2. `transcriber.py` - Whisper Transcription

| Função | Async | Descrição |
|--------|-------|-----------|
| `get_model()` | Não | Lazy-load do modelo Whisper |
| `transcribe(audio_path)` | Não | Transcreve áudio → texto + segments |

**Configuração (`transcriber.py:9`):**
- Modelo: `base` (229MB)
- Device: `cpu`
- Compute type: `int8`

---

### 3. `video_downloader.py` - yt-dlp Wrapper

| Função | Async | Descrição |
|--------|-------|-----------|
| `download_video(url, output_dir, on_progress)` | Não | Baixa vídeo com progress hook |

**Formato (`video_downloader.py:13`):**
```
bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best
```

**Retorno:** `{ file_path, title, duration }`

---

### 4. `audio_processor.py` - FFmpeg Wrapper

| Função | Async | Descrição |
|--------|-------|-----------|
| `extract_audio(video_path, output_path)` | Não | Extrai áudio de vídeo (WAV 16kHz mono) |
| `convert_to_wav(input_path, output_path)` | Não | Converte qualquer áudio para WAV 16kHz mono |

**Parâmetros FFmpeg:**
- `-vn` — sem vídeo
- `-acodec pcm_s16le` — PCM 16-bit
- `-ar 16000` — 16kHz (otimizado para Whisper)
- `-ac 1` — mono

---

### 5. `database.py` - SQLAlchemy Configuration

**Engine híbrido (`database.py:8-12`):**
```python
# Async (principal - FastAPI)
engine = create_async_engine(settings.database_url, echo=False)

# Sync (fallback - Celery workers)
sync_engine = create_engine(settings.database_url.replace("+aiosqlite", ""))
```

| Função | Async | Descrição |
|--------|-------|-----------|
| `get_db()` | Sim | Session factory (Depends) |
| `init_db()` | Sim | Cria tabelas via `Base.metadata.create_all` |
| `update_task(task_id, **kwargs)` | Híbrido | Atualiza task (detecta loop rodando) |
| `run_async(coro)` | Não | Executa coroutine com `asyncio.run()` |

---

### 6. `task_response.py` - Model Converter

Converte `Task` (SQLAlchemy ORM) → `TaskResponse` (Pydantic).

Gera `audio_url` relativo: `/api/output/{filename}.mp3`

---

## 🤖 Celery Tasks

### `celery_app.py`

- **App name:** `voice_rmv`
- **Broker:** Redis (`settings.redis_url`)
- **Backend:** Redis (`settings.redis_url`)
- **Serializer:** JSON
- **Timezone:** UTC

### `narration_tasks.py` - 3 Tasks

#### 1. `narrate_video_url_task(url, voice, task_id)`

**Progresso:** 5% → 30% → 50% → 75% → 100%

1. Download vídeo (yt-dlp) → 5%
2. Extrai áudio (FFmpeg) → 30%
3. Transcreve (Whisper) → 50%
4. Sintetiza voz (Edge TTS) → 75%
5. Salva resultado → 100%

#### 2. `narrate_audio_file_task(file_path, voice, task_id)`

**Progresso:** 10% → 40% → 70% → 100%

1. Converte para WAV → 10%
2. Transcreve → 40%
3. Sintetiza voz → 70%
4. Salva resultado → 100%
5. **Limpa arquivo temporário** (`unlink`)

#### 3. `narrate_video_file_task(file_path, voice, task_id)`

**Progresso:** 10% → 40% → 70% → 100%

1. Extrai áudio do vídeo local → 10%
2. Transcreve → 40%
3. Sintetiza voz → 70%
4. Salva resultado → 100%
5. **Limpa arquivo temporário** (`unlink`)

---

## 🧪 Testes

### Estrutura

| Arquivo | Testa |
|---------|-------|
| `test_narrate_api.py` | Health, Voices, Narrate (text/video-url/upload), Tasks (get/list) |
| `test_transcriber.py` | `transcribe()` — estrutura, chamada, áudio vazio |
| `test_tts.py` | `synthesize()` bytes, texto vazio, `list_voices()` formatação |
| `test_video_downloader.py` | Estrutura retorno, extract_info, fallback ext, progress hook |
| `test_audio_processor.py` | `extract_audio()`, `convert_to_wav()` — args e default output |

### Fixtures (`conftest.py`)

- `client` — AsyncClient ASGI para testes HTTP
- `mock_synthesize` — Mock do `synthesize()` (retorna `b"fake_audio_bytes"`)
- `mock_celery_delay` — Mock do `.delay()` do Celery
- `mock_db_session` — Session mock com task fixture
- `override_get_db` — `autouse=True`, substitui dependência de DB
- `mock_voice_listing` — `autouse=True`, mock de `list_voices()`
- `mock_transcriber` — Mock do `transcribe()`

---

## 🐳 Dockerização

### `docker-compose.yml`

| Serviço | Imagem | Portas | Healthcheck |
|---------|--------|--------|-------------|
| `postgres` | `postgres:16-alpine` | 5432:5432 | `pg_isready` |
| `redis` | `redis:7-alpine` | 6379:6379 | `redis-cli ping` |
| `api` | Build `./backend` | 8456:8456 | — |
| `celery_worker` | Build `./backend` | — | — |
| `frontend` | Build `./frontend` | 5173:5173 | — |

**Comandos:**
- API: `uvicorn app.main:app --host 0.0.0.0 --port 8456 --reload`
- Celery: `celery -A app.tasks.celery_app worker --loglevel=info --concurrency=1`
- Frontend: `npm run dev -- --host 0.0.0.0`

**Volumes compartilhados:**
- `shared_output:/output` → narrations + transcriptions
- `shared_temp:/temp` → arquivos temporários

---

## 🔐 Configuração

### `.env.example`
```bash
DATABASE_URL=postgresql+asyncpg://voice_rmv:voice_rmv_dev@localhost:5432/voice_rmv
REDIS_URL=redis://localhost:6379/0
OUTPUT_DIR=./output
TEMP_DIR=./temp
```

### `config.py` (defaults)
```python
database_url = "sqlite+aiosqlite:///./dev.db"  # fallback local
redis_url = "redis://localhost:6379/0"
output_dir = "./output"
temp_dir = "./temp"
```

### Dependências (`requirements.txt`)
```
fastapi>=0.115.0
psycopg2-binary>=2.9.0        # ⚠️ Não utilizado (asyncpg é o driver ativo)
uvicorn[standard]>=0.32.0
sqlalchemy[asyncio]>=2.0.36
asyncpg>=0.30.0
celery>=5.4.0
redis>=5.2.0
edge-tts>=6.1.3
faster-whisper>=1.1.0
yt-dlp>=2024.12.0
pydub>=0.25.1                  # ⚠️ Não importado em nenhum .py
pydantic-settings>=2.6.0
python-multipart>=0.0.18
aiofiles>=24.1.0
```

### `pyproject.toml`
- Python: `>=3.12`
- Dev deps: `pytest`, `pytest-asyncio`, `httpx`, `pytest-cov`
- Pytest: `asyncio_mode = "auto"`

---

## ⚠️ Issues e Observações

### Bugs / Melhorias Necessárias

| # | Severidade | Arquivo | Descrição |
|---|------------|---------|-----------|
| 1 | 🔴 Alta | `routers/narrate.py:34` | `narrate_text` é síncrono — bloqueia event loop durante TTS |
| 2 | 🟡 Média | `routers/history.py:28` | `total=len(tasks)` retorna tamanho da página, não total real do banco |
| 3 | 🟡 Média | `database.py:33-34` | `run_async()` usa `asyncio.run()` dentro do Celery — cria novo event loop a cada chamada |
| 4 | 🟢 Baixa | `requirements.txt` | `psycopg2-binary` e `pydub` são dependências não utilizadas |
| 5 | 🟢 Baixa | `models/schemas.py:40-43` | `VoiceResponse` definido mas nunca usado (endpoint retorna `list[dict]`) |
| 6 | 🟢 Baixa | `models/task.py:6` | `JSONB` importado mas não utilizado (usa `SQLiteJSON`) |

### Dependências Não Utilizadas

- `psycopg2-binary` — driver síncrono PostgreSQL, desnecessário com asyncpg
- `pydub` — não importado em nenhum arquivo do backend
