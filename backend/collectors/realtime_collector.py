"""
Realtime task collectors for Feishu and QQBot
"""
import re
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session

from ..models import Task


class RealtimeTaskCollector:
    """Base class for realtime task collectors"""
    
    # 任务识别关键词
    TASK_KEYWORDS = [
        r'✅', r'❌', r'⚠️', r'🔧', r'📊', r'🎉',  # 状态标记
        r'完成', r'实现', r'修复', r'添加', r'更新',  # 动作词
        r'feat:', r'fix:', r'docs:', r'refactor:',  # Git commit 前缀
        r'成功', r'失败', r'错误',  # 结果词
    ]
    
    # 排除的系统消息关键词
    EXCLUDE_KEYWORDS = [
        r'HEARTBEAT_OK',
        r'session_status',
        r'系统消息',
    ]
    
    def is_task_message(self, content: str) -> bool:
        """判断消息是否为任务相关"""
        if not content:
            return False
        
        # 排除系统消息
        for pattern in self.EXCLUDE_KEYWORDS:
            if re.search(pattern, content):
                return False
        
        # 检查任务关键词
        for pattern in self.TASK_KEYWORDS:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        
        return False
    
    def extract_task_info(self, content: str, msg_time: datetime, source: str) -> Optional[dict]:
        """从消息内容提取任务信息"""
        if not self.is_task_message(content):
            return None
        
        # 生成唯一 ID
        job_id = f"{source}_{int(msg_time.timestamp() * 1000)}"
        
        # 提取状态
        if re.search(r'✅|成功|完成', content):
            status = 'ok'
        elif re.search(r'❌|失败|错误', content):
            status = 'error'
        else:
            status = 'running'
        
        # 提取任务名称（第一行非空内容）
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        task_name = lines[0] if lines else None
        
        # 截取前 200 字符作为摘要
        summary = content[:500] if len(content) > 500 else content
        
        return {
            'job_id': job_id,
            'task_name': task_name[:100] if task_name else None,
            'status': status,
            'start_time': msg_time,
            'summary': summary,
            'source': source,
        }


class FeishuChatCollector(RealtimeTaskCollector):
    """飞书群聊任务采集器"""
    
    def __init__(self, chat_id: str):
        self.chat_id = chat_id
        self.source = 'feishu'
    
    def collect_recent_tasks(
        self, 
        db: Session, 
        hours: int = 2,
        force_update: bool = False
    ) -> int:
        """采集最近 N 小时的任务
        
        Args:
            db: 数据库会话
            hours: 采集最近几小时的消息
            force_update: 是否强制更新已存在的任务
            
        Returns:
            新增/更新的任务数量
        """
        try:
            # 使用 feishu_im_user_get_messages API
            # 这里需要通过 OpenClaw 的工具调用
            # 暂时返回 0，实际实现需要集成 OpenClaw API
            return 0
        except Exception as e:
            print(f"Error collecting Feishu tasks: {e}")
            return 0


class QQBotCollector(RealtimeTaskCollector):
    """QQBot 任务采集器"""
    
    def __init__(self):
        self.source = 'qqbot'
    
    def collect_recent_tasks(
        self, 
        db: Session, 
        hours: int = 2,
        force_update: bool = False
    ) -> int:
        """采集最近 N 小时的任务
        
        Args:
            db: 数据库会话
            hours: 采集最近几小时的消息
            force_update: 是否强制更新已存在的任务
            
        Returns:
            新增/更新的任务数量
        """
        try:
            # QQBot 消息采集逻辑
            # 暂时返回 0，实际实现需要集成 QQBot API
            return 0
        except Exception as e:
            print(f"Error collecting QQBot tasks: {e}")
            return 0
