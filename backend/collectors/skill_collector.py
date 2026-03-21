"""
Skill Collector - Reads session logs and extracts skill usage records
"""
import os
import json
from datetime import datetime
from pathlib import Path
from typing import Optional

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import SkillUsage
from app.config import settings


class SkillCollector:
    """Collects skill usage records from session logs"""

    def __init__(self, data_dir: Optional[str] = None):
        self.data_dir = Path(data_dir or settings.OPENCLAW_DATA_DIR)
        self.memory_dir = self.data_dir / "memory"

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

    def extract_skill_data(self, record: dict) -> Optional[dict]:
        """Extract skill usage data from a record"""
        # Adapt this based on actual OpenClaw data format
        try:
            # Look for skill-related fields
            skill_name = record.get("skill") or record.get("skill_name") or record.get("tool")
            if not skill_name:
                return None

            return {
                "skill_name": skill_name,
                "session_id": record.get("session_id"),
                "timestamp": self.parse_timestamp(
                    record.get("timestamp") or record.get("time")
                ),
                "success": record.get("success", True),
                "duration_ms": record.get("duration_ms") or record.get("duration"),
            }
        except Exception:
            return None

    def parse_timestamp(self, ts) -> Optional[datetime]:
        """Parse timestamp from various formats"""
        if not ts:
            return datetime.utcnow()
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
        return datetime.utcnow()

    def collect_all(self) -> int:
        """Collect all skill usage records"""
        db = SessionLocal()
        count = 0

        try:
            # Check memory directory for session logs
            if self.memory_dir.exists():
                for jsonl_file in self.memory_dir.glob("*.jsonl"):
                    records = self.parse_jsonl_file(jsonl_file)

                    for record in records:
                        skill_data = self.extract_skill_data(record)
                        if not skill_data:
                            continue

                        skill = SkillUsage(**skill_data)
                        db.add(skill)
                        count += 1

            db.commit()
            print(f"Collected {count} skill usage records")

        except Exception as e:
            db.rollback()
            print(f"Error collecting skill usage: {e}")
        finally:
            db.close()

        return count

    def update_stats(self) -> dict:
        """Update skill statistics cache"""
        # This can be extended to cache statistics in a JSON file
        return self.collect_all()


if __name__ == "__main__":
    collector = SkillCollector()
    collector.collect_all()
