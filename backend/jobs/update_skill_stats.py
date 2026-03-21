"""
Job: Update skill usage statistics
Runs every 15 minutes
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from collectors.skill_collector import SkillCollector


def update_skill_statistics():
    """Update skill usage statistics"""
    collector = SkillCollector()
    return collector.update_stats()


if __name__ == "__main__":
    update_skill_statistics()
