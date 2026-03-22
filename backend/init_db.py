#!/usr/bin/env python
"""
Initialize database and run initial data collection
"""
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, init_db
from app.models import Task, SkillUsage, FileIndex
from collectors.task_collector import TaskCollector
from collectors.skill_collector import SkillCollector
from collectors.file_indexer import FileIndexer


def main():
    print("🚀 Initializing Mission Panel database...")
    
    # Create tables
    print("📊 Creating database tables...")
    init_db()
    print("✅ Tables created successfully")
    
    # Collect tasks
    print("\n📝 Collecting task records...")
    try:
        collector = TaskCollector("/home/cwh/.openclaw")
        count = collector.collect_all()
        print(f"✅ Collected {count} task records")
    except Exception as e:
        print(f"⚠️  Task collection error: {e}")
    
    # Collect skill usage
    print("\n📈 Collecting skill usage...")
    try:
        skill_collector = SkillCollector("/home/cwh/.openclaw")
        count = skill_collector.collect_all()
        print(f"✅ Collected {count} skill usage records")
    except Exception as e:
        print(f"⚠️  Skill collection error: {e}")
    
    # Index files
    print("\n📁 Indexing coding directory...")
    try:
        indexer = FileIndexer("/home/cwh/coding")
        count = indexer.reindex_directory()
        print(f"✅ Indexed {count} files")
    except Exception as e:
        print(f"⚠️  File indexing error: {e}")
    
    print("\n🎉 Database initialization complete!")
    print(f"📍 Database location: {engine.url}")


if __name__ == "__main__":
    main()
