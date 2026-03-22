"""
FastAPI application for Mission Panel
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.api import tasks, files, stats
from app.api.realtime import router as realtime_router
from app.api.qqbot import router as qqbot_router
from app.websocket import router as websocket_router
from app.database import engine, Base
from schedulers.scheduler import setup_schedulers

# Create database tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    setup_schedulers()
    yield
    # Shutdown (if needed)


app = FastAPI(
    title="Mission Panel API",
    description="Home Automation Central Control Panel API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(realtime_router, prefix="/api/realtime", tags=["realtime"])
app.include_router(qqbot_router, prefix="/api/qqbot", tags=["qqbot"])
app.include_router(websocket_router, prefix="/ws", tags=["websocket"])


@app.get("/")
async def root():
    return {"message": "Mission Panel API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    from datetime import datetime
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
