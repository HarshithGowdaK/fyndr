from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Fyndr"
    FIREBASE_CREDENTIALS_PATH: str = "serviceAccountKey.json"

    class Config:
        env_file = ".env"

settings = Settings()
