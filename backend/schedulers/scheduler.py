"""
APScheduler Configuration for Mission Panel
"""
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from collectors.task_collector import TaskCollector
from collectors.skill_collector import SkillCollector
from collectors.file_indexer import FileIndexer

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = None


def start_scheduler():
    """Start the APScheduler with configured jobs"""
    global scheduler
    
    if scheduler is not None:
        logger.warning("Scheduler already running")
        return
    
    # Create scheduler
    scheduler = AsyncIOScheduler()
    
    # Initialize collectors
    task_collector = TaskCollector()
    skill_collector = SkillCollector()
    file_indexer = FileIndexer()
    
    # Job 1: Collect tasks every 5 minutes
    scheduler.add_job(
        task_collector.collect_incremental,
        trigger=IntervalTrigger(minutes=5),
        id="collect_tasks",
        name="Collect Tasks from OpenClaw",
        max_instances=1,
        replace_existing=True,
    )
    logger.info("Scheduled job: collect_tasks (every 5 minutes)")
    
    # Job 2: Update skill stats every 15 minutes
    scheduler.add_job(
        skill_collector.update_stats,
        trigger=IntervalTrigger(minutes=15),
        id="update_skill_stats",
        name="Update Skill Statistics",
        max_instances=1,
        replace_existing=True,
    )
    logger.info("Scheduled job: update_skill_stats (every 15 minutes)")
    
    # Job 3: Index files every hour
    scheduler.add_job(
        file_indexer.index_directory,
        trigger=IntervalTrigger(hours=1),
        id="index_files",
        name="Index Files in Coding Directory",
        max_instances=1,
        replace_existing=True,
    )
    logger.info("Scheduled job: index_files (every hour)")
    
    # Job 4: Daily cleanup at 3 AM
    scheduler.add_job(
        cleanup_old_records,
        trigger=CronTrigger(hour=3, minute=0),
        id="daily_cleanup",
        name="Daily Database Cleanup",
        max_instances=1,
        replace_existing=True,
    )
    logger.info("Scheduled job: daily_cleanup (daily at 3 AM)")
    
    # Start scheduler
    scheduler.start()
    logger.info("✅ Scheduler started successfully")
    
    # Run initial collection on startup
    logger.info("Running initial data collection...")
    try:
        task_count = task_collector.collect_all()
        logger.info(f"✅ Initial collection: {task_count} tasks")
        
        skill_count = skill_collector.collect_all()
        logger.info(f"✅ Initial collection: {skill_count} skill records")
        
        file_count = file_indexer.index_directory()
        logger.info(f"✅ Initial file indexing: {file_count} files")
    except Exception as e:
        logger.error(f"❌ Initial collection error: {e}")


def shutdown_scheduler():
    """Shutdown the scheduler gracefully"""
    global scheduler
    
    if scheduler is not None:
        scheduler.shutdown(wait=True)
        scheduler = None
        logger.info("Scheduler shutdown complete")


def cleanup_old_records():
    """Clean up old records from database"""
    from datetime import datetime, timedelta
    from app.database import SessionLocal
    from app.models import Task, SkillUsage
    
    db = SessionLocal()
    try:
        # Delete tasks older than 30 days
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        deleted_tasks = db.query(Task).filter(
            Task.start_time < cutoff_date
        ).delete()
        
        deleted_skills = db.query(SkillUsage).filter(
            SkillUsage.timestamp < cutoff_date
        ).delete()
        
        db.commit()
        
        logger.info(f"Cleanup completed: {deleted_tasks} tasks, {deleted_skills} skill records deleted")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Cleanup error: {e}")
    finally:
        db.close()


def get_scheduler_status():
    """Get scheduler status and job information"""
    global scheduler
    
    if scheduler is None:
        return {
            "status": "stopped",
            "jobs": []
        }
    
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": str(job.next_run_time) if job.next_run_time else None,
            "trigger": str(job.trigger),
        })
    
    return {
        "status": "running" if scheduler.running else "paused",
        "jobs": jobs
    }


if __name__ == "__main__":
    # Test scheduler
    logging.basicConfig(level=logging.INFO)
    start_scheduler()
    
    import asyncio
    try:
        asyncio.get_event_loop().run_forever()
    except KeyboardInterrupt:
        shutdown_scheduler()
