from typing import Dict, Set, Optional
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for conversations."""

    def __init__(self):
        # conversation_id -> set of connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # connection -> conversation_id mapping
        self.connection_conversation: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, conversation_id: str):
        """Connect a WebSocket to a conversation."""
        await websocket.accept()

        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = set()

        self.active_connections[conversation_id].add(websocket)
        self.connection_conversation[websocket] = conversation_id

        logger.info(f"WebSocket connected to conversation: {conversation_id}")

    def disconnect(self, websocket: WebSocket):
        """Disconnect a WebSocket."""
        conversation_id = self.connection_conversation.get(websocket)

        if conversation_id and conversation_id in self.active_connections:
            self.active_connections[conversation_id].discard(websocket)

            # Clean up empty conversations
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]

        self.connection_conversation.pop(websocket, None)
        logger.info(f"WebSocket disconnected from conversation: {conversation_id}")

    async def send_personal(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Failed to send message: {e}")

    async def broadcast(self, conversation_id: str, message: dict, exclude: Optional[WebSocket] = None):
        """Broadcast a message to all connections in a conversation."""
        if conversation_id not in self.active_connections:
            return

        disconnected = set()
        for connection in self.active_connections[conversation_id]:
            if connection == exclude:
                continue

            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Failed to broadcast to connection: {e}")
                disconnected.add(connection)

        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

    def get_connection_count(self, conversation_id: str) -> int:
        """Get the number of active connections for a conversation."""
        return len(self.active_connections.get(conversation_id, set()))


# Singleton instance
manager = ConnectionManager()
