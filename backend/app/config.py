"""Application configuration loaded from environment variables."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Database (Supabase Postgres connection string) ---
    # e.g. postgresql+psycopg://postgres:[pw]@db.<ref>.supabase.co:5432/postgres
    database_url: str = "sqlite:///./eventrenthub.db"

    # --- Supabase ---
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    # JWT secret used by Supabase Auth to sign access tokens (Project Settings > API).
    supabase_jwt_secret: str = ""
    supabase_storage_bucket: str = "item-images"

    # --- CORS ---
    cors_origins: str = "http://localhost:5173"

    # --- Email (SMTP) ---
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = "Party Loft <no-reply@partyloft.com>"
    emails_enabled: bool = False

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
