"""
Collect realtime tasks from Feishu and QQBot
This script is designed to be called by the scheduler
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models import Task
from collectors.feishu_chat_collector import FeishuChatTaskCollector


def collect_feishu_tasks(hours: int = 2) -> int:
    """Collect tasks from Feishu chat
    
    Args:
        hours: Collect messages from last N hours
        
    Returns:
        Number of tasks collected
    """
    db = SessionLocal()
    collector = FeishuChatTaskCollector()
    
    try:
        # 这里需要通过 OpenClaw 的 feishu_im_user_get_messages API 获取消息
        # 但在 Mission Panel 后端，我们没有直接访问 OpenClaw API 的能力
        # 所以这个函数目前返回 0，实际采集需要在前端或者通过其他方式
        
        # 实际使用时，可以通过以下方式：
        # 1. 前端定期发送飞书消息到后端
        # 2. 后端提供一个 webhook 接收飞书消息
        # 3. 使用飞书的 webhook 主动推送消息
        
        return 0
    finally:
        db.close()


if __name__ == '__main__':
    count = collect_feishu_tasks()
    print(f"Collected {count} Feishu tasks")
