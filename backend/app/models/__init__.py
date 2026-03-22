"""
SQLAlchemy models for Mission Panel
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from ..database import Base


class Task(Base):
    """Task execution records"""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_id = Column(String, nullable=False, index=True)
    session_id = Column(String, index=True)
    task_name = Column(String)
    status = Column(String)  # 'ok', 'error', 'running', 'pending'
    start_time = Column(DateTime, index=True)
    end_time = Column(DateTime)
    duration_ms = Column(Integer)
    error_message = Column(Text)
    summary = Column(Text)
    model = Column(String)
    provider = Column(String)
    input_tokens = Column(Integer)
    output_tokens = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    source = Column(String, default="cron")  # cron, feishu, qqbot


class SkillUsage(Base):
    """Skill usage records"""
    __tablename__ = "skill_usage"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    skill_name = Column(String, nullable=False, index=True)
    session_id = Column(String, index=True)
    timestamp = Column(DateTime, index=True)
    success = Column(Boolean, default=True)
    duration_ms = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


class FileIndex(Base):
    """File index for coding directory"""
    __tablename__ = "file_index"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    file_path = Column(String, nullable=False, unique=True, index=True)
    file_name = Column(String)
    file_type = Column(String)
    size_bytes = Column(Integer)
    modified_time = Column(DateTime)
    is_directory = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
