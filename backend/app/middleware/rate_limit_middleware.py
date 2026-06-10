from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import settings
from app.middleware.rate_limit import rate_limiter


LIMITS = {
    "global": (60, 60),
    "/api/narrate/": (10, 60),
    "/api/tasks": (120, 60),
    "/api/output": (120, 60),
}


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if not settings.rate_limit_enabled:
            return await call_next(request)

        path = request.url.path
        client_host = request.client.host if request.client else "test"

        for prefix, (max_req, window) in LIMITS.items():
            if prefix == "global":
                continue
            if path.startswith(prefix):
                key = f"rl:{prefix}:{client_host}"
                ok, retry_after = await rate_limiter.check(key, max_req, window)
                if not ok:
                    return JSONResponse(
                        status_code=429,
                        content={"detail": f"Rate limit exceeded. Retry after {retry_after}s."},
                        headers={"Retry-After": str(retry_after)},
                    )
                break

        key = f"rl:global:{client_host}"
        ok, retry_after = await rate_limiter.check(key, *LIMITS["global"])
        if not ok:
            return JSONResponse(
                status_code=429,
                content={"detail": f"Global rate limit exceeded. Retry after {retry_after}s."},
                headers={"Retry-After": str(retry_after)},
            )

        return await call_next(request)
