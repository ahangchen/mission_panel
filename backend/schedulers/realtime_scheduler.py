"""
Scheduler integration for realtime task collection
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import logging

from ..database import SessionLocal
from ..models import Task
from .feishu_chat_collector import FeishuChatTaskCollector
from .qqbot_collector import QQBotTaskCollector

logger = logging.getLogger(__name__)

# 全局采集器实例
feishu_collector = FeishuChatTaskCollector()
qqbot_collector = QQBotTaskCollector()


def collect_realtime_tasks():
    """Collect tasks from Feishu and QQBot
    
    This function is called by the scheduler every 10 minutes
    """
    db = SessionLocal()
    try:
        # 这里需要通过 OpenClaw API 获取飞书消息
        # 暂时返回 0，实际实现需要集成 OpenClaw API
        
        logger.info("Collected realtime tasks (placeholder)")
        return 0
    finally:
        db.close()


def setup_realtime_collection(scheduler: AsyncIOScheduler):
    """Setup realtime task collection jobs
    
    Args:
        scheduler: APScheduler instance
    """
    # 每 10 分钟采集一次飞书/QQBot 消息
    scheduler.add_job(
        collect_realtime_tasks,
        trigger=IntervalTrigger(minutes=10),
        id='collect_realtime_tasks',
        name='Collect Realtime Tasks from Feishu/QQBot',
        replace_existing=True,
    )
    
    logger.info("✅ Scheduled realtime task collection (every 10 minutes)")
