"""
Task Collector - Reads OpenClaw cron/runs data and writes to database
"""
import os
import json
from datetime import datetime
from pathlib import Path
from typing import Optional

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Task
from app.config import settings


class TaskCollector:
    """Collects task execution records from OpenClaw data"""

    def __init__(self, data_dir: Optional[str] = None):
        self.data_dir = Path(data_dir or settings.OPENCLAW_DATA_DIR)
        self.runs_dir = self.data_dir / "cron" / "runs"

    def parse_jsonl_file(self, file_path: Path) -> list:
        """Parse a JSONL file and return list of records"""
        records = []
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            records.append(json.loads(line))
                        except json.JSONDecodeError:
                            continue
        except (FileNotFoundError, PermissionError):
            pass
        return records

    def extract_task_data(self, record: dict) -> Optional[dict]:
        """Extract task data from a record"""
        try:
            # Handle OpenClaw cron/runs format
            # Fields: jobId, sessionId, status, ts, runAtMs, durationMs, model, provider, usage
            
            # Get timestamps
            start_time = None
            if record.get("runAtMs"):
                start_time = datetime.fromtimestamp(record["runAtMs"] / 1000)
            
            # Extract usage
            usage = record.get("usage", {})
            input_tokens = usage.get("input_tokens", 0)
            output_tokens = usage.get("output_tokens", 0)
            
            # Extract status
            status = record.get("status", "running")
            if record.get("action") == "finished":
                status = record.get("status", "ok")
            
            return {
                "job_id": record.get("jobId"),
                "session_id": record.get("sessionId"),
                "status": status,
                "start_time": start_time,
                "duration_ms": record.get("durationMs"),
                "model": record.get("model"),
                "provider": record.get("provider"),
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "summary": record.get("summary"),
                "error_message": record.get("error"),
                "source": "cron",  # 标记来源
            }
        except Exception as e:
            print(f"Error extracting task data: {e}")
            return None

    def collect_incremental(self) -> int:
        """Collect new tasks from recent files"""
        db = SessionLocal()
        count = 0
        
        try:
            if not self.runs_dir.exists():
                return 0
            
            # Get all JSONL files, sorted by modification time (newest first)
            jsonl_files = sorted(
                self.runs_dir.glob("*.jsonl"),
                key=lambda f: f.stat().st_mtime,
                reverse=True
            )
            
            # Process last 20 files
            for file_path in jsonl_files[:20]:
                records = self.parse_jsonl_file(file_path)
                
                for record in records:
                    task_data = self.extract_task_data(record)
                    if not task_data:
                        continue
                    
                    # Check if task already exists
                    existing = db.query(Task).filter(
                        Task.job_id == task_data["job_id"]
                    ).first()
                    
                    if existing:
                        # Update existing task
                        for key, value in task_data.items():
                            if value is not None:
                                setattr(existing, key, value)
                    else:
                        # Create new task
                        task = Task(**task_data)
                        db.add(task)
                        count += 1
            
            db.commit()
            return count
            
        except Exception as e:
            print(f"Error collecting tasks: {e}")
            db.rollback()
            return 0
        finally:
            db.close()

    def collect_all(self) -> int:
        """Collect all tasks"""
        return self.collect_incremental()


if __name__ == "__main__":
    collector = TaskCollector()
    count = collector.collect_incremental()
    print(f"Collected {count} new tasks")
