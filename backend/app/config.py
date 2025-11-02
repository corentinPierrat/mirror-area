import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self):
        base_dir = Path(__file__).resolve().parent.parent
        self.DB_HOST: str = os.getenv("DB_HOST")
        self.DB_PORT: str = os.getenv("DB_PORT")
        self.DB_NAME: str = os.getenv("DB_NAME")
        self.DB_USER: str = os.getenv("DB_USER")
        self.DB_PASSWORD: str = os.getenv("DB_PASSWORD")
        self.SPOTIFY_CLIENT_ID: str = os.getenv("SPOTIFY_CLIENT_ID")
        self.SPOTIFY_CLIENT_SECRET: str = os.getenv("SPOTIFY_CLIENT_SECRET")
        self.TWITTER_CLIENT_ID: str = os.getenv("TWITTER_CLIENT_ID")
        self.TWITTER_CLIENT_SECRET: str = os.getenv("TWITTER_CLIENT_SECRET")
        self.SECRET_KEY: str = os.getenv("SECRET_KEY")
        self.JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
        self.JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))
        self.USER_SMTP_EMAIL: str = os.getenv("USER_SMTP_EMAIL")
        self.USER_SMTP_PASSWORD: str = os.getenv("USER_SMTP_PASSWORD")
        self.DISCORD_CLIENT_ID: str = os.getenv("DISCORD_CLIENT_ID")
        self.DISCORD_CLIENT_SECRET: str = os.getenv("DISCORD_CLIENT_SECRET")
        self.FACEIT_CLIENT_ID: str = os.getenv("FACEIT_CLIENT_ID")
        self.FACEIT_CLIENT_SECRET: str = os.getenv("FACEIT_CLIENT_SECRET")
        self.FACEIT_API_KEY: str = os.getenv("FACEIT_API_KEY")
        self.GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID")
        self.GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET")
        self.TWITCH_CLIENT_ID: str = os.getenv("TWITCH_CLIENT_ID")
        self.TWITCH_CLIENT_SECRET: str = os.getenv("TWITCH_CLIENT_SECRET")
        self.TOKEN_BOT_DISCORD: str = os.getenv("TOKEN_BOT_DISCORD")
        self.BOT_SECRET: str = os.getenv("BOT_SECRET")
        self.TWITCH_WEBHOOK_SECRET: str = os.getenv("TWITCH_WEBHOOK_SECRET")
        self.MEDIA_ROOT: str = os.getenv("MEDIA_ROOT", str(base_dir / "uploads"))
        media_url_default = os.getenv("MEDIA_URL", "/uploads")
        self.MEDIA_URL: str = media_url_default if media_url_default.startswith("/") else f"/{media_url_default}"
        os.makedirs(self.MEDIA_ROOT, exist_ok=True)

    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()
