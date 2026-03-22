"""
Statistics API endpoints
"""
from datetime import datetime, timedelta
from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Task, SkillUsage

router = APIRouter()


@router.get("/skills")
async def get_skill_stats(
    days: int = 7,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get skill usage ranking"""
    start_date = datetime.utcnow() - timedelta(days=days)

    results = db.query(
        SkillUsage.skill_name,
        func.count(SkillUsage.id).label("count"),
        func.avg(SkillUsage.duration_ms).label("avg_duration")
    ).filter(
        SkillUsage.timestamp >= start_date
    ).group_by(
        SkillUsage.skill_name
    ).order_by(
        func.count(SkillUsage.id).desc()
    ).limit(limit).all()

    return {
        "period_days": days,
        "ranking": [
            {
                "rank": i + 1,
                "skill_name": r.skill_name,
                "count": r.count,
                "avg_duration_ms": int(r.avg_duration) if r.avg_duration else 0
            }
            for i, r in enumerate(results)
        ]
    }


@router.get("/models")
async def get_model_stats(
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get model usage statistics"""
    start_date = datetime.utcnow() - timedelta(days=days)

    results = db.query(
        Task.model,
        func.count(Task.id).label("count"),
        func.sum(Task.input_tokens).label("total_input_tokens"),
        func.sum(Task.output_tokens).label("total_output_tokens")
    ).filter(
        Task.start_time >= start_date,
        Task.model.isnot(None)
    ).group_by(
        Task.model
    ).order_by(
        func.count(Task.id).desc()
    ).all()

    total_count = sum(r.count for r in results)

    return {
        "period_days": days,
        "total_tasks": total_count,
        "models": [
            {
                "model": r.model,
                "count": r.count,
                "percentage": round(r.count / total_count * 100, 1) if total_count > 0 else 0,
                "total_input_tokens": r.total_input_tokens or 0,
                "total_output_tokens": r.total_output_tokens or 0,
            }
            for r in results
        ]
    }


@router.get("/overview")
async def get_overview(
    days: int = Query(7, ge=1, le=90, description="统计天数（1-90天）"),
    db: Session = Depends(get_db)
):
    """Get overview statistics"""
    start_date = datetime.utcnow() - timedelta(days=days)

    # Task counts
    total_tasks = db.query(Task).filter(Task.start_time >= start_date).count()
    completed_tasks = db.query(Task).filter(
        Task.start_time >= start_date,
        Task.status == "ok"
    ).count()

    # Token usage
    total_input_tokens = db.query(func.sum(Task.input_tokens)).filter(
        Task.start_time >= start_date
    ).scalar() or 0

    total_output_tokens = db.query(func.sum(Task.output_tokens)).filter(
        Task.start_time >= start_date
    ).scalar() or 0

    # Skill usage
    skill_count = db.query(func.count(func.distinct(SkillUsage.skill_name))).filter(
        SkillUsage.timestamp >= start_date
    ).scalar() or 0

    total_skill_calls = db.query(SkillUsage).filter(
        SkillUsage.timestamp >= start_date
    ).count()

    return {
        "period": f"{days} days",
        "period_days": days,
        "tasks": {
            "total": total_tasks,
            "completed": completed_tasks,
            "success_rate": round(completed_tasks / total_tasks * 100, 1) if total_tasks > 0 else 0
        },
        "tokens": {
            "input": total_input_tokens,
            "output": total_output_tokens,
            "total": total_input_tokens + total_output_tokens
        },
        "skills": {
            "unique_count": skill_count,
            "total_calls": total_skill_calls
        }
    }
