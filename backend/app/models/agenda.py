"""
Modelo Agenda - Agenda personal del usuario
"""
from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import List


class Agenda(Document):
    """Modelo de agenda personal para MongoDB"""
    
    user_id: PydanticObjectId
    attending: List[PydanticObjectId] = []      # Eventos que asistirá
    interested: List[PydanticObjectId] = []     # Eventos de interés
    not_going: List[PydanticObjectId] = []      # Eventos que no asistirá
    created_routes: List[PydanticObjectId] = [] # Rutas creadas
    completed_routes: List[PydanticObjectId] = [] # Rutas completadas
    
    class Settings:
        name = "agendas"
        indexes = [
            "user_id",
        ]
