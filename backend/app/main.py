from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import history, narrate
from app.services.tts_engine import list_voices

from app.models.schemas import VoiceResponse

Path(settings.output_dir).mkdir(parents=True, exist_ok=True)
Path(f"{settings.output_dir}/narrations").mkdir(parents=True, exist_ok=True)
Path(f"{settings.output_dir}/transcriptions").mkdir(parents=True, exist_ok=True)
Path(settings.temp_dir).mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Voice-rmv API",
    description="Multi-modal narration platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(narrate.router)
app.include_router(history.router)

app.mount("/api/output", StaticFiles(directory=f"{settings.output_dir}/narrations"), name="output")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/voices")
async def voices():
    return await list_voices()
