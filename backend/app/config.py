from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./dev.db"
    redis_url: str = "redis://localhost:6379/0"
    output_dir: str = "./output"
    temp_dir: str = "./temp"
    cors_origins: str = "http://localhost:5173,http://localhost:8456"
    api_key: str | None = None
    rate_limit_enabled: bool = True
    translation_base_url: str = "http://localhost:11437/v1"
    translation_controller_url: str = "http://localhost:11436"
    translation_controller_token: str = Field(
        default="voice-rmv-local-controller",
        validation_alias="TRANSLATION_CONTROLLER_TOKEN",
    )
    translation_api_key: str = "sk-not-needed"
    translation_model: str = "translategemma-4b-cpu"
    translation_idle_ttl: int = 600
    translation_context_length: int = 4096

    model_config = {"env_file": ".env"}


settings = Settings()
