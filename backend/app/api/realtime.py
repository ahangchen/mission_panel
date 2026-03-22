"""
API endpoint for realtime task collection
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from ..database import get_db
from ..models import Task
from ..collectors.feishu_chat_collector import FeishuChatTaskCollector

router = APIRouter()


class FeishuMessage(BaseModel):
    """Feishu message schema"""
    content: str
    create_time: str
    message_id: str
    sender_id: Optional[str] = None


class FeishuMessagesRequest(BaseModel):
    """Request body for collecting Feishu messages"""
    messages: List[FeishuMessage]
    force_update: bool = False


@router.post("/collect/feishu")
async def collect_feishu_messages(
    request: FeishuMessagesRequest,
    db: Session = Depends(get_db)
):
    """Collect tasks from Feishu messages
    
    This endpoint receives Feishu messages and extracts tasks from them.
    
    Example request:
    ```json
    {
      "messages": [
        {
          "content": "## ✅ PM2 统一管理配置完成！",
          "create_time": "2026-03-22T17:30:00+08:00",
          "message_id": "om_xxx",
          "sender_id": "ou_xxx"
        }
      ],
      "force_update": false
    }
    ```
    """
    collector = FeishuChatTaskCollector()
    
    # Convert to dict format
    messages = [msg.dict() for msg in request.messages]
    
    # Process messages
    count = collector.process_feishu_messages(
        messages, 
        db, 
        force_update=request.force_update
    )
    
    return {
        "status": "ok",
        "collected": count,
        "total_messages": len(messages)
    }


@router.get("/sources")
async def get_task_sources(db: Session = Depends(get_db)):
    """Get task statistics by source"""
    from sqlalchemy import func
    
    sources = db.query(
        Task.source,
        func.count(Task.id).label('count')
    ).group_by(Task.source).all()
    
    return {
        "sources": [
            {"source": source or "cron", "count": count}
            for source, count in sources
        ]
    }
