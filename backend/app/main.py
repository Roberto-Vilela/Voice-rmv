from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.middleware.auth import verify_api_key
from app.middleware.rate_limit_middleware import RateLimitMiddleware
from app.routers import history, narrate, output, translate
from src.voice_generation.tts_engine import list_voices

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

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware)

app.include_router(narrate.router, dependencies=[Depends(verify_api_key)])
app.include_router(history.router, dependencies=[Depends(verify_api_key)])
app.include_router(translate.router, dependencies=[Depends(verify_api_key)])
app.include_router(output.router)


@app.get("/api/health")
async def health(_=Depends(verify_api_key)):
    return {"status": "ok"}


@app.get("/api/voices")
async def voices(_=Depends(verify_api_key)):
    return await list_voices()
