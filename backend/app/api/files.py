"""
File browsing API endpoints
"""
import os
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse

from ..config import settings

router = APIRouter()


def is_safe_path(base_dir: str, target_path: str) -> bool:
    """Check if target path is within base directory (prevent path traversal)"""
    base = Path(base_dir).resolve()
    target = Path(target_path).resolve()
    return str(target).startswith(str(base))


def is_sensitive_file(file_path: str) -> bool:
    """Check if file contains sensitive information"""
    file_lower = file_path.lower()
    for pattern in settings.SENSITIVE_PATTERNS:
        if pattern.lower() in file_lower:
            return True
    return False


@router.get("/list")
async def list_directory(
    path: str = Query("", description="Relative path from coding directory"),
):
    """List contents of a directory"""
    full_path = os.path.join(settings.CODING_DIR, path)

    if not is_safe_path(settings.CODING_DIR, full_path):
        raise HTTPException(status_code=403, detail="Access denied")

    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Directory not found")

    if not os.path.isdir(full_path):
        raise HTTPException(status_code=400, detail="Not a directory")

    items = []
    try:
        for item in sorted(os.listdir(full_path)):
            item_path = os.path.join(full_path, item)
            rel_path = os.path.join(path, item)

            if is_sensitive_file(item_path):
                continue

            stat = os.stat(item_path)
            items.append({
                "name": item,
                "path": rel_path,
                "is_directory": os.path.isdir(item_path),
                "size": stat.st_size if os.path.isfile(item_path) else 0,
                "modified_time": stat.st_mtime,
            })
    except PermissionError:
        raise HTTPException(status_code=403, detail="Permission denied")

    return {
        "path": path,
        "items": items
    }


@router.get("/read")
async def read_file(
    path: str = Query(..., description="Relative path to file"),
):
    """Read file contents"""
    full_path = os.path.join(settings.CODING_DIR, path)

    if not is_safe_path(settings.CODING_DIR, full_path):
        raise HTTPException(status_code=403, detail="Access denied")

    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")

    if not os.path.isfile(full_path):
        raise HTTPException(status_code=400, detail="Not a file")

    if is_sensitive_file(full_path):
        raise HTTPException(status_code=403, detail="Access to sensitive file denied")

    # Check file size
    stat = os.stat(full_path)
    if stat.st_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE} bytes"
        )

    # Detect file type
    ext = os.path.splitext(full_path)[1].lower()
    file_type = "text"
    if ext in [".py"]:
        file_type = "python"
    elif ext in [".js", ".jsx"]:
        file_type = "javascript"
    elif ext in [".ts", ".tsx"]:
        file_type = "typescript"
    elif ext in [".md"]:
        file_type = "markdown"
    elif ext in [".json"]:
        file_type = "json"
    elif ext in [".yaml", ".yml"]:
        file_type = "yaml"
    elif ext in [".html"]:
        file_type = "html"
    elif ext in [".css", ".scss"]:
        file_type = "css"
    elif ext in [".sh", ".bash"]:
        file_type = "bash"

    try:
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()
    except UnicodeDecodeError:
        raise HTTPException(status_code=415, detail="Binary file not supported")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Permission denied")

    return {
        "path": path,
        "content": content,
        "file_type": file_type,
        "size": stat.st_size,
    }


@router.get("/search")
async def search_files(
    q: str = Query(..., min_length=1),
    limit: int = Query(50, ge=1, le=200),
):
    """Search for files by name"""
    results = []
    coding_path = Path(settings.CODING_DIR)

    for file_path in coding_path.rglob("*"):
        if len(results) >= limit:
            break

        if q.lower() in file_path.name.lower():
            rel_path = str(file_path.relative_to(coding_path))

            if is_sensitive_file(str(file_path)):
                continue

            try:
                stat = file_path.stat()
                results.append({
                    "name": file_path.name,
                    "path": rel_path,
                    "is_directory": file_path.is_dir(),
                    "size": stat.st_size if file_path.is_file() else 0,
                })
            except (PermissionError, OSError):
                continue

    return {
        "query": q,
        "count": len(results),
        "results": results
    }
