from fastapi import Depends, HTTPException, Request
from fastapi.security import APIKeyHeader

from app.config import settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def verify_api_key(request: Request, api_key: str | None = Depends(api_key_header)):
    if not settings.api_key:
        return True
    if not api_key or api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return True
