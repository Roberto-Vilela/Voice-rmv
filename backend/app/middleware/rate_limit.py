import time
from collections import defaultdict

import redis.asyncio as redis_async

from app.config import settings


class RateLimiter:
    def __init__(self):
        self._redis: redis_async.Redis | None = None
        self._memory: dict[str, list[float]] = defaultdict(list)

    async def _get_redis(self) -> redis_async.Redis | None:
        if self._redis is None:
            try:
                self._redis = await redis_async.from_url(settings.redis_url, socket_connect_timeout=1)
                await self._redis.ping()
            except Exception:
                self._redis = None
                self._memory.clear()
        return self._redis

    async def check(self, key: str, max_requests: int, window_seconds: int = 60) -> tuple[bool, int]:
        now = time.time()
        redis_client = await self._get_redis()

        if redis_client:
            current = await redis_client.get(key)
            if current is None:
                await redis_client.set(key, 1, ex=window_seconds)
                return True, max_requests - 1
            count = int(current)
            if count >= max_requests:
                ttl = await redis_client.ttl(key)
                return False, max(1, ttl)
            await redis_client.incr(key)
            return True, max_requests - count - 1

        timestamps = self._memory[key]
        cutoff = now - window_seconds
        while timestamps and timestamps[0] < cutoff:
            timestamps.pop(0)
        if len(timestamps) >= max_requests:
            retry_after = int(timestamps[0] + window_seconds - now)
            return False, max(1, retry_after)
        timestamps.append(now)
        return True, max_requests - len(timestamps)


rate_limiter = RateLimiter()
