"""
API endpoint for QQBot task collection
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from ..database import get_db
from ..models import Task
from collectors.qqbot_collector import QQBotTaskCollector

router = APIRouter()


class QQBotMessage(BaseModel):
    """QQBot message schema"""
    content: str
    timestamp: str
    message_id: str
    sender_id: Optional[str] = None
    group_id: Optional[str] = None


class QQBotMessagesRequest(BaseModel):
    """Request body for collecting QQBot messages"""
    messages: List[QQBotMessage]
    force_update: bool = False


@router.post("/collect/qqbot")
async def collect_qqbot_messages(
    request: QQBotMessagesRequest,
    db: Session = Depends(get_db)
):
    """Collect tasks from QQBot messages
    
    This endpoint receives QQBot messages and extracts tasks from them.
    
    Example request:
    ```json
    {
      "messages": [
        {
          "content": "## ✅ 任务完成",
          "timestamp": "2026-03-22T20:00:00+08:00",
          "message_id": "msg_xxx",
          "sender_id": "123456789",
          "group_id": "987654321"
        }
      ],
      "force_update": false
    }
    ```
    """
    collector = QQBotTaskCollector()
    
    # Convert to dict format
    messages = [msg.dict() for msg in request.messages]
    
    # Process messages
    count = collector.process_qqbot_messages(
        messages, 
        db, 
        force_update=request.force_update
    )
    
    return {
        "status": "ok",
        "collected": count,
        "total_messages": len(messages)
    }
