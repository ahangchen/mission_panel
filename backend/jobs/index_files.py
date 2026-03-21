"""
Job: Update file index
Runs every hour
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from collectors.file_indexer import FileIndexer


def update_file_index():
    """Update file index for coding directory"""
    indexer = FileIndexer()
    return indexer.index_directory()


if __name__ == "__main__":
    update_file_index()
