"""CosmicWatch Backend Application Configuration."""
import os
from typing import List


class Settings:
    PROJECT_NAME: str = "COSMICWATCH"
    VERSION: str = "1.0.0"
    API_PREFIX: str = ""
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    DATA_DIR: str = os.getenv("DATA_DIR", "data")
    CONFIG_FILE: str = os.getenv("CONFIG_FILE", "ml/config/scoring_weights.yaml")


settings = Settings()
