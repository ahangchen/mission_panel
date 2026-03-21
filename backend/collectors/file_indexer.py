"""
File Indexer - Indexes files in the coding directory
"""
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, List

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import FileIndex
from app.config import settings


class FileIndexer:
    """Indexes files in the coding directory"""

    IGNORE_DIRS = {".git", "__pycache__", "node_modules", ".venv", "venv", ".idea", ".vscode"}
    IGNORE_EXTENSIONS = {".pyc", ".pyo", ".so", ".dll", ".exe", ".bin", ".db", ".sqlite"}

    def __init__(self, coding_dir: Optional[str] = None):
        self.coding_dir = Path(coding_dir or settings.CODING_DIR)

    def is_sensitive_file(self, file_path: str) -> bool:
        """Check if file contains sensitive information"""
        file_lower = file_path.lower()
        for pattern in settings.SENSITIVE_PATTERNS:
            if pattern.lower() in file_lower:
                return True
        return False

    def should_index(self, path: Path) -> bool:
        """Check if path should be indexed"""
        # Skip ignored directories
        for part in path.parts:
            if part in self.IGNORE_DIRS:
                return False

        # Skip sensitive files
        if self.is_sensitive_file(str(path)):
            return False

        # Skip ignored extensions for files
        if path.is_file() and path.suffix.lower() in self.IGNORE_EXTENSIONS:
            return False

        return True

    def index_directory(self, directory: Optional[str] = None) -> int:
        """Index all files in the directory"""
        target_dir = Path(directory) if directory else self.coding_dir
        db = SessionLocal()
        count = 0

        try:
            if not target_dir.exists():
                print(f"Directory not found: {target_dir}")
                return 0

            for path in target_dir.rglob("*"):
                if not self.should_index(path):
                    continue

                try:
                    rel_path = str(path.relative_to(self.coding_dir))
                    stat = path.stat()

                    # Check if already indexed
                    existing = db.query(FileIndex).filter(
                        FileIndex.file_path == rel_path
                    ).first()

                    file_data = {
                        "file_path": rel_path,
                        "file_name": path.name,
                        "file_type": path.suffix.lower() if path.suffix else "directory",
                        "size_bytes": stat.st_size if path.is_file() else 0,
                        "modified_time": datetime.fromtimestamp(stat.st_mtime),
                        "is_directory": path.is_dir(),
                    }

                    if existing:
                        # Update existing record
                        for key, value in file_data.items():
                            setattr(existing, key, value)
                    else:
                        # Create new record
                        file_index = FileIndex(**file_data)
                        db.add(file_index)

                    count += 1

                except (PermissionError, OSError):
                    continue

            db.commit()
            print(f"Indexed {count} files/directories")

        except Exception as e:
            db.rollback()
            print(f"Error indexing files: {e}")
        finally:
            db.close()

        return count

    def reindex_directory(self, directory: Optional[str] = None) -> int:
        """Clear existing index and reindex directory"""
        db = SessionLocal()
        try:
            db.query(FileIndex).delete()
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Error clearing index: {e}")
        finally:
            db.close()

        return self.index_directory(directory)


if __name__ == "__main__":
    indexer = FileIndexer()
    indexer.index_directory()
