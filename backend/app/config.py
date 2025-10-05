import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self):
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
        self.MS_CLIENT_ID: str = os.getenv("MS_CLIENT_ID")
        self.MS_CLIENT_SECRET: str = os.getenv("MS_CLIENT_SECRET")
        self.DISCORD_CLIENT_ID: str = os.getenv("DISCORD_CLIENT_ID")
        self.DISCORD_CLIENT_SECRET: str = os.getenv("DISCORD_CLIENT_SECRET")
        self.FACEIT_CLIENT_ID: str = os.getenv("FACEIT_CLIENT_ID")
        self.FACEIT_CLIENT_SECRET: str = os.getenv("FACEIT_CLIENT_SECRET")
        self.STEAM_WEB_API_KEY: str = os.getenv("STEAM_WEB_API_KEY")
        self.TOKEN_BOT: str = os.getenv("TOKEN_BOT")

    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()
