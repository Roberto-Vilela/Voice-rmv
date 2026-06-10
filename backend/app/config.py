from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./dev.db"
    redis_url: str = "redis://localhost:6379/0"
    output_dir: str = "./output"
    temp_dir: str = "./temp"
    cors_origins: str = "http://localhost:5173,http://localhost:8456"
    api_key: str | None = None
    rate_limit_enabled: bool = True

    model_config = {"env_file": ".env"}


settings = Settings()
