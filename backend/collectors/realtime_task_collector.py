"""
Collect realtime tasks from OpenClaw session history
This runs periodically to extract tasks from recent conversations
"""
import logging
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Task
from collectors.feishu_chat_collector import FeishuChatTaskCollector

logger = logging.getLogger(__name__)


def collect_from_feishu_history(hours: int = 2) -> int:
    """Collect tasks from Feishu chat history
    
    This function simulates collecting from Feishu by reading recent
    conversation history. In production, this would call OpenClaw's
    feishu_im_user_get_messages API.
    
    Args:
        hours: How many hours back to look
        
    Returns:
        Number of tasks collected
    """
    db = SessionLocal()
    collector = FeishuChatTaskCollector()
    
    try:
        # In production, this would be:
        # messages = feishu_im_user_get_messages(
        #     chat_id='oc_124902a6ab5b6b1139781ff6739bbe5b',
        #     relative_time=f'last_{hours}_hours'
        # )
        
        # For now, return 0 as we need OpenClaw integration
        logger.info(f"Would collect Feishu tasks from last {hours} hours")
        return 0
        
    finally:
        db.close()


def collect_from_session_logs(hours: int = 2) -> int:
    """Collect tasks from OpenClaw session logs
    
    This extracts tasks from the current session's conversation history.
    
    Args:
        hours: How many hours back to look
        
    Returns:
        Number of tasks collected
    """
    db = SessionLocal()
    
    try:
        # This would need access to OpenClaw's session history
        # For now, return 0
        logger.info(f"Would collect tasks from session logs (last {hours} hours)")
        return 0
        
    finally:
        db.close()


def collect_realtime_tasks() -> int:
    """Main function to collect all realtime tasks
    
    This is called by the scheduler every 10 minutes.
    
    Returns:
        Total number of tasks collected
    """
    total = 0
    
    # Collect from Feishu
    feishu_count = collect_from_feishu_history(hours=2)
    total += feishu_count
    logger.info(f"Collected {feishu_count} tasks from Feishu")
    
    # Collect from session logs
    session_count = collect_from_session_logs(hours=2)
    total += session_count
    logger.info(f"Collected {session_count} tasks from session logs")
    
    return total
