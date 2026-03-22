"""
FastAPI application for Mission Panel
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .api import tasks, files, stats
from .api.realtime import router as realtime_router
from .websocket import websocket_router
from .database import engine, Base
from .schedulers.scheduler import setup_schedulers

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
    description="Backend API for Mission Panel",
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
app.include_router(websocket_router, prefix="/ws", tags=["websocket"])


@app.get("/")
async def root():
    return {"message": "Mission Panel API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    from datetime import datetime
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
