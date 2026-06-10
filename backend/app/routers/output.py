from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.config import settings
from app.middleware.auth import verify_api_key

router = APIRouter(prefix="/api/output", tags=["output"])


@router.get("/{filename:path}")
async def get_output_file(filename: str, _=Depends(verify_api_key)):
    file_path = Path(settings.output_dir) / "narrations" / filename

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(str(file_path))
