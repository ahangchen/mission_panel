"""
Task-related API endpoints
"""
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Task

router = APIRouter()


@router.get("/week")
async def get_week_tasks(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Get tasks from the past week"""
    week_ago = datetime.utcnow() - timedelta(days=7)
    query = db.query(Task).filter(Task.start_time >= week_ago)

    if status:
        query = query.filter(Task.status == status)

    total = query.count()
    tasks = query.order_by(Task.start_time.desc()) \
        .offset((page - 1) * page_size) \
        .limit(page_size) \
        .all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "tasks": [
            {
                "id": t.id,
                "job_id": t.job_id,
                "task_name": t.task_name,
                "status": t.status,
                "start_time": t.start_time.isoformat() if t.start_time else None,
                "end_time": t.end_time.isoformat() if t.end_time else None,
                "duration_ms": t.duration_ms,
                "model": t.model,
                "summary": t.summary,
            }
            for t in tasks
        ]
    }


@router.get("/stats")
async def get_task_stats(db: Session = Depends(get_db)):
    """Get task statistics for the past week"""
    week_ago = datetime.utcnow() - timedelta(days=7)

    total = db.query(Task).filter(Task.start_time >= week_ago).count()
    completed = db.query(Task).filter(
        Task.start_time >= week_ago,
        Task.status == "ok"
    ).count()
    failed = db.query(Task).filter(
        Task.start_time >= week_ago,
        Task.status == "error"
    ).count()
    running = db.query(Task).filter(
        Task.start_time >= week_ago,
        Task.status == "running"
    ).count()

    return {
        "total": total,
        "completed": completed,
        "failed": failed,
        "running": running,
        "pending": total - completed - failed - running
    }


@router.get("/{task_id}")
async def get_task_detail(task_id: int, db: Session = Depends(get_db)):
    """Get single task details"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return {"error": "Task not found"}

    return {
        "id": task.id,
        "job_id": task.job_id,
        "session_id": task.session_id,
        "task_name": task.task_name,
        "status": task.status,
        "start_time": task.start_time.isoformat() if task.start_time else None,
        "end_time": task.end_time.isoformat() if task.end_time else None,
        "duration_ms": task.duration_ms,
        "error_message": task.error_message,
        "summary": task.summary,
        "model": task.model,
        "provider": task.provider,
        "input_tokens": task.input_tokens,
        "output_tokens": task.output_tokens,
    }


@router.get("/search")
async def search_tasks(
    q: str = Query(..., min_length=1),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Search tasks by name or job_id"""
    query = db.query(Task).filter(
        (Task.task_name.contains(q)) | (Task.job_id.contains(q))
    )

    if status:
        query = query.filter(Task.status == status)

    tasks = query.order_by(Task.start_time.desc()).limit(50).all()

    return {
        "query": q,
        "count": len(tasks),
        "tasks": [
            {
                "id": t.id,
                "job_id": t.job_id,
                "task_name": t.task_name,
                "status": t.status,
                "start_time": t.start_time.isoformat() if t.start_time else None,
            }
            for t in tasks
        ]
    }
