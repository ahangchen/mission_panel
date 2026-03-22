"""
QQBot message collector - similar to Feishu collector
"""
import json
import re
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import Task


class QQBotTaskCollector:
    """QQBot message collector"""
    
    # Task identification keywords
    TASK_KEYWORDS = [
        r'✅', r'❌', r'⚠️', r'🔧', r'📊', r'🎉',  # Status markers
        r'完成', r'实现', r'修复', r'添加', r'更新', r'配置',  # Action verbs
        r'feat:', r'fix:', r'docs:', r'refactor:',  # Git commit prefixes
        r'成功', r'失败', r'错误',  # Result words
    ]
    
    # System message keywords to exclude
    EXCLUDE_KEYWORDS = [
        r'HEARTBEAT_OK',
        r'^\s*$',  # Empty messages
    ]
    
    def __init__(self):
        self.source = 'qqbot'
    
    def is_task_message(self, content: str) -> bool:
        """Determine if a message is task-related"""
        if not content or len(content.strip()) == 0:
            return False
        
        # Exclude system messages
        for pattern in self.EXCLUDE_KEYWORDS:
            if re.search(pattern, content):
                return False
        
        # Check task keywords
        for pattern in self.TASK_KEYWORDS:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        
        return False
    
    def extract_status(self, content: str) -> str:
        """Extract task status"""
        if re.search(r'✅|成功|完成', content):
            return 'ok'
        elif re.search(r'❌|失败|错误', content):
            return 'error'
        else:
            return 'running'
    
    def extract_task_name(self, content: str) -> Optional[str]:
        """Extract task name"""
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        
        if not lines:
            return None
        
        # Use first line
        first_line = lines[0]
        # Remove status markers
        name = re.sub(r'[✅❌⚠️🔧📊🎉]', '', first_line).strip()
        return name[:100] if name else None
    
    def process_qqbot_messages(
        self, 
        messages: List[dict], 
        db: Session,
        force_update: bool = False
    ) -> int:
        """Process QQBot messages and save to database
        
        Args:
            messages: QQBot message list
            db: Database session
            force_update: Whether to force update existing tasks
            
        Returns:
            Number of tasks added/updated
        """
        count = 0
        
        for msg in messages:
            try:
                content = msg.get('content', '')
                msg_time_str = msg.get('timestamp')
                message_id = msg.get('message_id')
                
                if not self.is_task_message(content):
                    continue
                
                # Parse time
                if msg_time_str:
                    # Try multiple formats
                    for fmt in ['%Y-%m-%d %H:%M:%S', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%S.%f']:
                        try:
                            msg_time = datetime.strptime(msg_time_str.replace('+08:00', '').replace('Z', ''), fmt)
                            break
                        except:
                            continue
                    else:
                        continue
                else:
                    continue
                
                # Generate unique ID
                job_id = f"qqbot_{message_id}"
                
                # Check if already exists
                existing = db.query(Task).filter(Task.job_id == job_id).first()
                if existing and not force_update:
                    continue
                
                # Extract task info
                task_data = {
                    'job_id': job_id,
                    'task_name': self.extract_task_name(content),
                    'status': self.extract_status(content),
                    'start_time': msg_time,
                    'summary': content[:500],
                    'source': self.source,
                }
                
                if existing:
                    # Update
                    for key, value in task_data.items():
                        setattr(existing, key, value)
                else:
                    # Add
                    task = Task(**task_data)
                    db.add(task)
                
                count += 1
                
            except Exception as e:
                print(f"Error processing message: {e}")
                continue
        
        if count > 0:
            db.commit()
        
        return count
