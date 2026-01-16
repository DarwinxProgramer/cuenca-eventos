"""
Core Broadcast - Sistema de broadcasting en memoria para SSE
Reemplaza Redis Pub/Sub con un sistema simple basado en asyncio.Queue
"""
import asyncio
import json
from typing import AsyncGenerator, Set
from contextlib import asynccontextmanager


class EventBroadcaster:
    """
    Sistema de broadcasting para Server-Sent Events (SSE)
    
    Gestiona múltiples clientes conectados y distribuye eventos
    a todos ellos en tiempo real sin necesidad de Redis.
    """
    
    def __init__(self):
        self.clients: Set[asyncio.Queue] = set()
        self._lock = asyncio.Lock()
    
    async def subscribe(self) -> AsyncGenerator[str, None]:
        """
        Suscribir un cliente para recibir eventos SSE
        
        Yields:
            str: Mensajes en formato SSE (data: {json}\n\n)
        """
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        
        async with self._lock:
            self.clients.add(queue)
        
        try:
            # Enviar mensaje de conexión
            yield f"data: {json.dumps({'type': 'connected'})}\n\n"
            
            # Escuchar eventos
            while True:
                message = await queue.get()
                if message is None:  # Señal de desconexión
                    break
                yield f"data: {message}\n\n"
                
        except asyncio.CancelledError:
            # Cliente desconectado
            pass
        finally:
            async with self._lock:
                self.clients.discard(queue)
    
    async def broadcast(self, event_type: str, data: dict):
        """
        Enviar evento a todos los clientes conectados
        
        Args:
            event_type: Tipo de evento (create, update, delete)
            data: Datos del evento
        """
        if not self.clients:
            return
        
        message = json.dumps({
            "type": event_type,
            "data": data
        })
        
        # Enviar mensaje a todos los clientes
        disconnected_clients = []
        
        async with self._lock:
            for queue in self.clients:
                try:
                    # Usar put_nowait para evitar bloqueos
                    queue.put_nowait(message)
                except asyncio.QueueFull:
                    # Cliente con cola llena - marcar para desconexión
                    disconnected_clients.append(queue)
        
        # Limpiar clientes desconectados
        if disconnected_clients:
            async with self._lock:
                for queue in disconnected_clients:
                    self.clients.discard(queue)
    
    async def disconnect_all(self):
        """Desconectar todos los clientes (útil para shutdown)"""
        async with self._lock:
            for queue in self.clients:
                await queue.put(None)
            self.clients.clear()
    
    def get_active_connections(self) -> int:
        """Obtener número de clientes activos"""
        return len(self.clients)


# Instancia global del broadcaster
alerts_broadcaster = EventBroadcaster()
