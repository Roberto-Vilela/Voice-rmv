from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./dev.db"
    # For production you can set DATABASE_URL env var to a Postgres URL
    redis_url: str = "redis://localhost:6379/0"
    output_dir: str = "./output"
    temp_dir: str = "./temp"

    model_config = {"env_file": ".env"}


settings = Settings()
