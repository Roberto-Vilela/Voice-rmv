# Relatório de Análise do Backend - Voice-RMV

**Data:** 6 de junho de 2026 (VALIDADO)
**Projeto:** Voice-RMV (Plataforma de Narração Multimodal)

## Visão Geral

O backend do Voice-RMV é uma API FastAPI que implementa uma plataforma de narração multimodal. Ele permite transformar texto em fala (TTS), transcrever áudio (STT) e criar narrações para vídeos.

---

## Arquitetura

### Tecnologias Principais

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Web Framework | FastAPI | ≥0.115.0 |
| Banco de Dados | SQLite (dev) / PostgreSQL (prod) | asyncpg |
| Job Queue | Celery | ≥5.4.0 |
| Message Broker | Redis | ≥5.2.0 |
| TTS Engine | edge-tts | ≥6.1.3 |
| STT Engine | faster-whisper | ≥1.1.0 |
| Video Download | yt-dlp | ≥2024.12.0 |
| Audio Processing | ffmpeg | system |

> **Nota:** `pydub` está no requirements.txt mas não é importado em nenhum `.py`.
> **Nota:** `psycopg2-binary` está no requirements.txt mas não é utilizado (asyncpg é o driver ativo).

### Padrão Arquitetural

```
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (FastAPI)                     │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ /api/narrate│  │  /api/tasks     │  │  /api/voices    │  │
│  └─────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ TTS Engine   │  │ Transcriber  │  │ Video Downloader │   │
│  │ (edge-tts)   │  │ (whisper)    │  │ (yt-dlp)         │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Audio Processor (ffmpeg)                 │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Task Layer (Celery)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  narrate_video_url_task                             │    │
│  │  narrate_audio_file_task                            │    │
│  │  narrate_video_file_task                            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (SQLAlchemy)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Task Model (ORM)                       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Mapeamento de Arquivos

### `/backend/app/`

#### `config.py`
Classe `Settings` herda de `BaseSettings` (pydantic-settings):
- `database_url`: URL do banco (padrão: `sqlite+aiosqlite:///./dev.db`)
- `redis_url`: URL do Redis para Celery
- `output_dir`: Diretório de saída (`./output`)
- `temp_dir`: Diretório temporário (`./temp`)

#### `database.py`
- `engine`: Async SQLAlchemy engine (principal)
- `async_session`: Factory de sessões assíncronas
- `sync_engine`: Engine síncrono (fallback para Celery)
- `sync_session`: Sessão síncrona
- `Base`: Declaração ORM padrão
- `get_db()`: Dependency injection para sessões
- `init_db()`: Inicializa tabelas do banco
- `run_async()`: Wrapper para executar coroutines assíncronas
- `update_task()`: Atualiza tarefa (detecta se loop está rodando → sync ou async)

#### `main.py`
App FastAPI com:
- `lifespan`: Inicializa banco de dados no startup
- CORS middleware (allow_origins=["*"])
- Rotas:
  - `GET /api/health` - Health check
  - `GET /api/voices` - Lista de vozes do edge-tts
  - `GET /api/output/*` - Serve arquivos de narração (StaticFiles)

### `/backend/app/models/`

#### `schemas.py`
Pydantic schemas para validação de requisições/respostas:

**Requisições:**
- `NarrateTextRequest`: Texto para narração (voice default: `en-US-AriaNeural`)
- `NarrateVideoUrlRequest`: URL do vídeo para narrar

**Respostas:**
- `TaskResponse`: Status completo de uma tarefa
- `TaskListResponse`: Lista paginada de tarefas
- `VoiceResponse`: Informação de voz (name, locale, gender) — **definido mas não usado em nenhum endpoint**

#### `task.py`
Modelo SQLAlchemy ORM da tabela `tasks`:

| Coluna | Tipo SQLAlchemy | Descrição |
|--------|----------------|-----------|
| `id` | UUID (PK, default uuid4) | Primary key auto-generada |
| `type` | String(50), NOT NULL | text, video_url, audio_upload, video_upload |
| `status` | String(20), default "pending" | pending, processing, completed, error |
| `progress` | Integer, default 0 | 0-100 |
| `voice` | String(100), default "en-US-AriaNeural" | Nome da voz |
| `input_text` | Text, nullable | Texto de entrada |
| `input_url` | Text, nullable | URL do vídeo |
| `input_file` | String(255), nullable | Arquivo upload |
| `transcription` | Text, nullable | Transcrição gerada |
| `audio_path` | String(255), nullable | Caminho do áudio final |
| `duration_seconds` | Float, nullable | Duração em segundos |
| `error` | Text, nullable | Mensagem de erro |
| `extra_data` | SQLiteJSON, nullable | JSONB com metadados extras |
| `created_at` | DateTime, server_default=now() | Timestamp de criação |
| `updated_at` | DateTime, server_default=now(), onupdate=now() | Timestamp de atualização |

> **Nota:** `JSONB` é importado mas não utilizado (usa `SQLiteJSON` para SQLite).

### `/backend/app/routers/`

#### `history.py`
Rotas para gerenciamento de histórico de tarefas:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/tasks` | Lista tarefas paginadas (skip, limit=50) |
| GET | `/api/tasks/{task_id}` | Detalha uma tarefa específica |
| DELETE | `/api/tasks/{task_id}` | Remove uma tarefa |
| POST | `/api/tasks/{task_id}/duplicate` | Duplica uma tarefa |
| PATCH | `/api/tasks/{task_id}` | Atualiza tarefa (display_name, transcription, extra_data) |

> **Bug:** `total=len(tasks)` retorna tamanho da página, não total real do banco.

#### `narrate.py`
Rotas para criação de novas tarefas de narração:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/narrate/text` | Narra texto puro (síncrono, TTS direto) |
| POST | `/api/narrate/video-url` | Narra vídeo por URL (assíncrono via Celery) |
| POST | `/api/narrate/upload` | Narra arquivo upload (async Celery para vídeo/áudio) |

**Detecção automática (upload):**
- `.mp4`, `.mkv`, `.avi`, `.mov`, `.webm` → `video_upload`
- Outros → `audio_upload`

> **Atenção:** `/text` é síncrono — bloqueia event loop durante TTS.

### `/backend/app/services/`

#### `audio_processor.py`
Funções de processamento de áudio usando ffmpeg:

**`extract_audio(video_path, output_path=None)`**
- Extrai áudio de vídeo
- Formato: pcm_s16le, 16kHz, mono
- Retorna caminho do WAV gerado

**`convert_to_wav(input_path, output_path=None)`**
- Converte qualquer formato para WAV
- Mesmos parâmetros de áudio acima

#### `task_response.py`
Função utilitária:

**`task_to_response(task: Task)`**
- Converte modelo ORM para schema Pydantic
- Gera `/api/output/<filename>` para audio_url

#### `transcriber.py`
Engenharia de transcrição de áudio:

```python
def get_model() -> WhisperModel
```
- Singleton lazy-load do modelo whisper
- Configuração: `base` model, `cpu` device, `int8` compute_type

```python
def transcribe(audio_path: str) -> dict
```
- Retorna: `{text, segments[], duration, language}`
- Segments: lista com start/end/text por segmento

#### `tts_engine.py`
Engenharia de síntese de fala:

```python
async def synthesize(text: str, voice: str = "en-US-AriaNeural") -> bytes
```
- Usa `edge_tts.Communicate()`
- Stream processing com `inspect.isawaitable()` para compatibilidade
- Retorna bytes de áudio MP3

```python
async def list_voices() -> list[dict]
```
- Chama `edge_tts.list_voices()`
- Formata: `{name, locale, gender}`

#### `video_downloader.py`
Download de vídeos via yt-dlp:

```python
def download_video(url: str, output_dir: str, on_progress=None) -> dict
```
- Formato: `bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best`
- Retorna: `{file_path, title, duration}`
- Progress hook opcional
- Fallback para extensão .mp4

### `/backend/app/tasks/`

#### `celery_app.py`
Configuração do Celery:
- Broker: Redis
- Backend: Redis
- Serializer: JSON
- Timezone: UTC

#### `narration_tasks.py`
Tasks Celery para processamento assíncrono:

**`narrate_video_url_task(self, url, voice, task_id)`**
```
Flow:
  5%  → Download vídeo (yt-dlp)
 30%  → Extrai áudio (ffmpeg)
 50%  → Transcreve (whisper) + salva transcrição
 75%  → Sintetiza fala (edge-tts)
100%  → Salva narração, atualiza extra_data
```

**`narrate_audio_file_task(self, file_path, voice, task_id)`**
```
Flow:
 10%  → Converte para WAV
 40%  → Transcreve + salva
 70%  → Sintetiza
100%  → Salva, remove original (unlink)
```

**`narrate_video_file_task(self, file_path, voice, task_id)`**
```
Flow:
 10%  → Extrai áudio
 40%  → Transcreve + salva
 70%  → Sintetiza
100%  → Salva, remove original (unlink)
```

---

## Configuração de Ambiente

### `.env.example`
```
DATABASE_URL=postgresql+asyncpg://voice_rmv:voice_rmv_dev@localhost:5432/voice_rmv
REDIS_URL=redis://localhost:6379/0
OUTPUT_DIR=./output
TEMP_DIR=./temp
```

### `pyproject.toml`
- `requires-python = ">=3.12"`
- Dev deps: pytest, pytest-asyncio, httpx, pytest-cov

### `requirements.txt`
```
fastapi>=0.115.0
psycopg2-binary>=2.9.0        # ⚠️ Não utilizado
uvicorn[standard]>=0.32.0
sqlalchemy[asyncio]>=2.0.36
asyncpg>=0.30.0
celery>=5.4.0
redis>=5.2.0
edge-tts>=6.1.3
faster-whisper>=1.1.0
yt-dlp>=2024.12.0
pydub>=0.25.1                  # ⚠️ Não importado
pydantic-settings>=2.6.0
python-multipart>=0.0.18
aiofiles>=24.1.0
```

---

## Docker Compose

### Serviços

| Serviço | Imagem | Portas | Healthcheck |
|---------|--------|--------|-------------|
| `postgres` | postgres:16-alpine | 5432:5432 | `pg_isready` |
| `redis` | redis:7-alpine | 6379:6379 | `redis-cli ping` |
| `api` | Build ./backend | 8456:8456 | — |
| `celery_worker` | Build ./backend | — | — |
| `frontend` | Build ./frontend | 5173:5173 | — |

### Comandos
```
api: uvicorn app.main:app --host 0.0.0.0 --port 8456 --reload
celery_worker: celery -A app.tasks.celery_app worker --loglevel=info --concurrency=1
frontend: npm run dev -- --host 0.0.0.0
```

### Volumes
- `postgres_data`: Persistência PostgreSQL
- `shared_output`: Narrations + transcriptions (compartilhado api/celery)
- `shared_temp`: Arquivos temporários (compartilhado api/celery)

---

## Testes

| Arquivo | Testes |
|---------|--------|
| `test_narrate_api.py` | Health, Voices, Narrate (text/video-url/upload), Tasks (get/list) |
| `test_transcriber.py` | `transcribe()` — estrutura, chamada, áudio vazio |
| `test_tts.py` | `synthesize()` bytes, texto vazio, `list_voices()` |
| `test_video_downloader.py` | Estrutura retorno, extract_info, fallback ext, progress hook |
| `test_audio_processor.py` | `extract_audio()`, `convert_to_wav()` |

> **Nota:** Não existe `test_history_api.py` — os testes de history estão em `test_narrate_api.py`.

---

## Issues e Melhorias

### Bugs
| # | Severidade | Descrição |
|---|------------|-----------|
| 1 | 🔴 Alta | `narrate_text` síncrono bloqueia event loop |
| 2 | 🟡 Média | `total` em list_tasks retorna len(tasks) não total real |
| 3 | 🟡 Média | `run_async()` cria novo event loop a cada chamada no Celery |

### Dependências Não Utilizadas
- `psycopg2-binary` — driver síncrono desnecessário
- `pydub` — não importado

### Melhorias Sugeridas
1. Retry mechanism para tasks falhos
2. Health checks detalhados (DB, Redis)
3. Logging centralizado
4. Rate limiting para endpoints públicos
5. Total real na paginação de tasks

---

*Gerado em: 2026-06-06 (VALIDADO contra código-fonte)*
