"""
Scheduler for periodic data collection jobs
"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import job functions
from jobs.collect_tasks import collect_recent_tasks
from jobs.update_skill_stats import update_skill_statistics
from jobs.index_files import update_file_index


def create_scheduler():
    """Create and configure the scheduler"""
    scheduler = BackgroundScheduler()

    # Task collection - every 5 minutes
    scheduler.add_job(
        collect_recent_tasks,
        trigger=IntervalTrigger(minutes=5),
        id='collect_tasks',
        name='Collect recent tasks',
        replace_existing=True
    )

    # Skill statistics update - every 15 minutes
    scheduler.add_job(
        update_skill_statistics,
        trigger=IntervalTrigger(minutes=15),
        id='update_skill_stats',
        name='Update skill statistics',
        replace_existing=True
    )

    # File index update - every hour
    scheduler.add_job(
        update_file_index,
        trigger=IntervalTrigger(hours=1),
        id='update_file_index',
        name='Update file index',
        replace_existing=True
    )

    return scheduler


def main():
    """Start the scheduler"""
    logger.info("Starting Mission Panel scheduler...")

    scheduler = create_scheduler()
    scheduler.start()

    logger.info("Scheduler started. Press Ctrl+C to exit.")

    # Run initial collection
    logger.info("Running initial data collection...")
    collect_recent_tasks()
    update_skill_statistics()
    update_file_index()

    try:
        # Keep the scheduler running
        while True:
            import time
            time.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down scheduler...")
        scheduler.shutdown()
        logger.info("Scheduler stopped.")


if __name__ == "__main__":
    main()
