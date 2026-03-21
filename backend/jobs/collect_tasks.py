"""
Job: Collect recent task execution records
Runs every 5 minutes
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from collectors.task_collector import TaskCollector


def collect_recent_tasks():
    """Collect recent task execution records from OpenClaw data"""
    collector = TaskCollector()
    return collector.collect_incremental()


if __name__ == "__main__":
    collect_recent_tasks()
