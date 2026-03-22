"""
Scheduler configuration for Mission Panel
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = AsyncIOScheduler()


def collect_tasks():
    """Collect tasks from OpenClaw cron runs"""
    try:
        from collectors.task_collector import TaskCollector
        from database import SessionLocal
        
        db = SessionLocal()
        try:
            collector = TaskCollector()
            count = collector.collect_incremental()
            logger.info(f"Collected {count} new tasks from cron runs")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error collecting tasks: {e}")


def collect_skill_usage():
    """Collect skill usage records"""
    # TODO: Implement skill usage collection
    logger.info("Collected 0 skill usage records")


def collect_realtime_tasks():
    """Collect realtime tasks from Feishu/QQBot"""
    # TODO: Implement realtime task collection
    logger.info("Collected 0 realtime tasks")


def index_files():
    """Index files in coding directory"""
    try:
        from collectors.file_collector import FileCollector
        from database import SessionLocal
        
        db = SessionLocal()
        try:
            collector = FileCollector()
            collector.index_directory(db)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error indexing files: {e}")


def setup_schedulers():
    """Setup all scheduled jobs"""
    logger.info("Setting up schedulers...")
    
    # Collect tasks every 5 minutes
    scheduler.add_job(
        collect_tasks,
        trigger=IntervalTrigger(minutes=5),
        id='collect_tasks',
        name='Collect Tasks from OpenClaw',
        replace_existing=True,
    )
    logger.info("✅ Scheduled job: collect_tasks (every 5 minutes)")
    
    # Update skill stats every 15 minutes
    scheduler.add_job(
        collect_skill_usage,
        trigger=IntervalTrigger(minutes=15),
        id='update_skill_stats',
        name='Update Skill Usage Stats',
        replace_existing=True,
    )
    logger.info("✅ Scheduled job: update_skill_stats (every 15 minutes)")
    
    # Index files every 1 hour
    scheduler.add_job(
        index_files,
        trigger=IntervalTrigger(minutes=60),
        id='index_files',
        name='Index Files in Coding Directory',
        replace_existing=True,
    )
    logger.info("✅ Scheduled job: index_files (every 1 hour)")
    
    # Start scheduler
    scheduler.start()
    logger.info("✅ Scheduler started successfully")


def get_scheduler_status():
    """Get scheduler status and job information"""
    jobs = scheduler.get_jobs()
    
    return {
        "status": "running" if scheduler.running else "stopped",
        "jobs": [
            {
                "id": job.id,
                "name": job.name,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
            }
            for job in jobs
        ]
    }
