"""
CosmicWatch - FastAPI Backend Entrypoint.

Astronomical radio anomaly detection and candidate prioritization system.
Flagship use case: Radio SETI / Breakthrough Listen candidate analysis.
"""

import sys
import os

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.api.routes import router

app = FastAPI(
    title="COSMICWATCH API",
    description=(
        "Open-source AI astronomical anomaly detection and candidate-prioritization system. "
        "Analyzes radio telescope observations, detects unusual spectral events, "
        "ranks candidates, and generates scientific explanations for human investigation."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
