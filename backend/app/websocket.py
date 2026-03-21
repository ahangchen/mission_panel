"""
WebSocket handler for real-time task updates
"""
import json
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()


@router.websocket("/tasks")
async def websocket_tasks(websocket: WebSocket):
    """WebSocket endpoint for real-time task updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and wait for client messages
            data = await websocket.receive_text()

            # Handle ping/pong for connection keep-alive
            if data == "ping":
                await websocket.send_text("pong")
            else:
                # Echo back for now - can be extended for specific commands
                await websocket.send_json({
                    "type": "echo",
                    "message": data
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def broadcast_task_update(task_data: dict):
    """Broadcast task update to all connected clients"""
    await manager.broadcast({
        "type": "task_update",
        "data": task_data
    })
