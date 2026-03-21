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
        # Adapt this based on actual OpenClaw data format
        try:
            return {
                "job_id": record.get("job_id") or record.get("id"),
                "session_id": record.get("session_id"),
                "task_name": record.get("task_name") or record.get("name"),
                "status": record.get("status", "unknown"),
                "start_time": self.parse_timestamp(record.get("start_time")),
                "end_time": self.parse_timestamp(record.get("end_time")),
                "duration_ms": record.get("duration_ms") or record.get("duration"),
                "error_message": record.get("error") or record.get("error_message"),
                "summary": record.get("summary"),
                "model": record.get("model"),
                "provider": record.get("provider"),
                "input_tokens": record.get("input_tokens"),
                "output_tokens": record.get("output_tokens"),
            }
        except Exception:
            return None

    def parse_timestamp(self, ts) -> Optional[datetime]:
        """Parse timestamp from various formats"""
        if not ts:
            return None
        if isinstance(ts, datetime):
            return ts
        if isinstance(ts, (int, float)):
            return datetime.fromtimestamp(ts)
        if isinstance(ts, str):
            for fmt in ["%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"]:
                try:
                    return datetime.strptime(ts, fmt)
                except ValueError:
                    continue
        return None

    def collect_all(self) -> int:
        """Collect all task records from runs directory"""
        db = SessionLocal()
        count = 0

        try:
            if not self.runs_dir.exists():
                print(f"Runs directory not found: {self.runs_dir}")
                return 0

            for jsonl_file in self.runs_dir.glob("*.jsonl"):
                records = self.parse_jsonl_file(jsonl_file)

                for record in records:
                    task_data = self.extract_task_data(record)
                    if not task_data or not task_data.get("job_id"):
                        continue

                    # Check if task already exists
                    existing = db.query(Task).filter(
                        Task.job_id == task_data["job_id"]
                    ).first()

                    if existing:
                        continue

                    task = Task(**task_data)
                    db.add(task)
                    count += 1

            db.commit()
            print(f"Collected {count} new tasks")

        except Exception as e:
            db.rollback()
            print(f"Error collecting tasks: {e}")
        finally:
            db.close()

        return count

    def collect_incremental(self) -> int:
        """Collect only new records (based on file modification time)"""
        # For now, same as collect_all but can be optimized
        return self.collect_all()


if __name__ == "__main__":
    collector = TaskCollector()
    collector.collect_all()
