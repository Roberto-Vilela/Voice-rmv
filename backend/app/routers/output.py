from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.config import settings
from app.middleware.auth import verify_api_key

router = APIRouter(prefix="/api/output", tags=["output"])


@router.get("/{filename:path}")
async def get_output_file(filename: str, _=Depends(verify_api_key)):
    possible_paths = [
        Path(settings.output_dir) / "narrations" / filename,
        Path("/app/output") / "narrations" / filename,
        Path("output") / "narrations" / filename,
    ]

    for file_path in possible_paths:
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))

    raise HTTPException(status_code=404, detail="File not found")
