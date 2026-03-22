"""
Collect tasks from Feishu chat messages
"""
import json
import re
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import Task


class FeishuChatTaskCollector:
    """飞书群聊任务采集器"""
    
    # 任务识别关键词
    TASK_KEYWORDS = [
        r'✅', r'❌', r'⚠️', r'🔧', r'📊', r'🎉',  # 状态标记
        r'完成', r'实现', r'修复', r'添加', r'更新', r'配置',  # 动作词
        r'feat:', r'fix:', r'docs:', r'refactor:',  # Git commit 前缀
        r'成功', r'失败', r'错误',  # 结果词
        r'问题已解决', r'已修复', r'已实现',
    ]
    
    # 排除的系统消息关键词
    EXCLUDE_KEYWORDS = [
        r'HEARTBEAT_OK',
        r'^\s*$',  # 空消息
        r'^System:',  # 系统消息前缀
    ]
    
    def __init__(self, chat_id: str = 'oc_124902a6ab5b6b1139781ff6739bbe5b'):
        self.chat_id = chat_id
        self.source = 'feishu'
    
    def is_task_message(self, content: str) -> bool:
        """判断消息是否为任务相关"""
        if not content or len(content.strip()) == 0:
            return False
        
        # 排除系统消息
        for pattern in self.EXCLUDE_KEYWORDS:
            if re.search(pattern, content):
                return False
        
        # 检查任务关键词
        for pattern in self.TASK_KEYWORDS:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        
        # 如果消息很长（>100字）且包含代码块或链接，也可能是任务
        if len(content) > 100:
            if re.search(r'```|http|git|commit|push', content, re.IGNORECASE):
                return True
        
        return False
    
    def extract_status(self, content: str) -> str:
        """提取任务状态"""
        if re.search(r'✅|成功|完成|问题已解决|已修复|已实现', content):
            return 'ok'
        elif re.search(r'❌|失败|错误|Error', content):
            return 'error'
        else:
            return 'running'
    
    def extract_task_name(self, content: str) -> Optional[str]:
        """提取任务名称"""
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        
        if not lines:
            return None
        
        # 优先查找包含 ## 标题的行
        for line in lines:
            if line.startswith('##'):
                # 移除 ## 和状态标记
                name = re.sub(r'^#+\s*', '', line)
                name = re.sub(r'[✅❌⚠️🔧📊🎉]', '', name).strip()
                if name:
                    return name[:100]
        
        # 否则使用第一行
        first_line = lines[0]
        # 移除状态标记
        name = re.sub(r'[✅❌⚠️🔧📊🎉]', '', first_line).strip()
        return name[:100] if name else None
    
    def process_feishu_messages(
        self, 
        messages: List[dict], 
        db: Session,
        force_update: bool = False
    ) -> int:
        """处理飞书消息并保存到数据库
        
        Args:
            messages: 飞书消息列表
            db: 数据库会话
            force_update: 是否强制更新已存在的任务
            
        Returns:
            新增/更新的任务数量
        """
        count = 0
        
        for msg in messages:
            try:
                content = msg.get('content', '')
                msg_time_str = msg.get('create_time')
                sender_id = msg.get('sender', {}).get('id')
                message_id = msg.get('message_id')
                
                if not self.is_task_message(content):
                    continue
                
                # 解析时间
                if msg_time_str:
                    # ISO 8601 格式
                    msg_time = datetime.fromisoformat(msg_time_str.replace('Z', '+00:00'))
                else:
                    continue
                
                # 生成唯一 ID
                job_id = f"feishu_{message_id}"
                
                # 检查是否已存在
                existing = db.query(Task).filter(Task.job_id == job_id).first()
                if existing and not force_update:
                    continue
                
                # 提取任务信息
                task_data = {
                    'job_id': job_id,
                    'task_name': self.extract_task_name(content),
                    'status': self.extract_status(content),
                    'start_time': msg_time,
                    'summary': content[:500],
                    'source': self.source,
                }
                
                if existing:
                    # 更新
                    for key, value in task_data.items():
                        setattr(existing, key, value)
                else:
                    # 新增
                    task = Task(**task_data)
                    db.add(task)
                
                count += 1
                
            except Exception as e:
                print(f"Error processing message: {e}")
                continue
        
        if count > 0:
            db.commit()
        
        return count
