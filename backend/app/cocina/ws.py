import asyncio
import json

from fastapi import WebSocket, WebSocketDisconnect

from app.core.security import decode_access_token


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    def add(self, ws: WebSocket) -> None:
        self.active_connections.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self.active_connections:
            self.active_connections.remove(ws)

    async def broadcast(self, data: dict) -> None:
        message = json.dumps(data, default=str)
        dead = []
        for ws in self.active_connections:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


async def cocina_ws_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        # Primer mensaje: JWT para autenticación
        token = await asyncio.wait_for(websocket.receive_text(), timeout=10.0)
        try:
            payload = decode_access_token(token)
            roles = payload.get("roles", [])
            if "COCINA" not in roles:
                await websocket.close(code=4001)
                return
        except ValueError:
            await websocket.close(code=4001)
            return

        # Agregar a las conexiones activas (ya fue accepted)
        manager.add(websocket)
        try:
            while True:
                try:
                    await asyncio.wait_for(websocket.receive_text(), timeout=60.0)
                except asyncio.TimeoutError:
                    # ping para mantener vivo
                    await websocket.send_text('{"type":"ping"}')
        finally:
            manager.disconnect(websocket)
    except WebSocketDisconnect:
        pass
    except Exception:
        manager.disconnect(websocket)
