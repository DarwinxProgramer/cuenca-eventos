from typing import List, Optional, Union, Any
from datetime import datetime, date
from beanie import PydanticObjectId
from beanie.operators import GTE
from beanie.odm.operators.find.evaluation import RegEx

from app.models.event import Event, EventCategory, GeoJSONPoint
from app.schemas.event import EventCreate, EventUpdate
from app.services.base import BaseService


class EventService(BaseService[Event, EventCreate, EventUpdate]):
    """Servicio para lógica de negocio de Eventos"""
    
    def __init__(self):
        super().__init__(Event)

    async def create(self, schema_in: EventCreate) -> Event:
        """
        Crear evento manejando conversiones de tipos (GeoJSON, ObjectIds)
        """
        obj_in_data = schema_in.model_dump(exclude_unset=True)
        
        # Convertir coordenadas a GeoJSONPoint
        if "coordinates" in obj_in_data:
            coords = obj_in_data["coordinates"]
            # coords es un dict porque model_dump lo serializa
            obj_in_data["coordinates"] = GeoJSONPoint.from_lat_lng(
                lat=coords["lat"], lng=coords["lng"]
            )
            
        # Convertir image_id a PydanticObjectId
        if "image_id" in obj_in_data and obj_in_data["image_id"]:
            obj_in_data["image_id"] = PydanticObjectId(obj_in_data["image_id"])
            
        # Convertir gallery a lista de PydanticObjectId
        if "gallery" in obj_in_data and obj_in_data["gallery"]:
            obj_in_data["gallery"] = [PydanticObjectId(img_id) for img_id in obj_in_data["gallery"]]
            
        db_obj = self.model(**obj_in_data)
        await db_obj.insert()
        return db_obj

    async def update(
        self, 
        db_obj: Event, 
        schema_in: Union[EventUpdate, dict[str, Any]]
    ) -> Event:
        """
        Actualizar evento manejando conversiones
        """
        if isinstance(schema_in, dict):
            update_data = schema_in
        else:
            update_data = schema_in.model_dump(exclude_unset=True)
            
        # Convertir coordenadas
        if "coordinates" in update_data and update_data["coordinates"]:
            coords = update_data["coordinates"]
            update_data["coordinates"] = GeoJSONPoint.from_lat_lng(
                lat=coords["lat"], lng=coords["lng"]
            )
            
        # Convertir image_id
        if "image_id" in update_data and update_data["image_id"]:
            update_data["image_id"] = PydanticObjectId(update_data["image_id"])
            
        # Convertir gallery
        if "gallery" in update_data and update_data["gallery"]:
            update_data["gallery"] = [PydanticObjectId(img_id) for img_id in update_data["gallery"]]
            
        # Actualizar timestamp
        update_data["updated_at"] = datetime.utcnow()
        
        await db_obj.set(update_data)
        return db_obj

    async def get_multi(
        self, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        category: Optional[EventCategory] = None,
        upcoming: bool = False,
        search: Optional[str] = None
    ) -> List[Event]:
        """
        Obtener lista de eventos con filtros.
        """
        query = self.model.find_all()
        
        # Filtro por categoría
        if category:
            query = query.find(self.model.category == category)
            
        # Filtro de próximos eventos (desde ahora en adelante)
        if upcoming:
            query = query.find(self.model.date >= datetime.utcnow())
            # Ordenar por fecha ascendente (el más próximo primero)
            query = query.sort("date")
        else:
            # Ordenar por fecha descendente (lo más nuevo primero) por defecto
            query = query.sort("-date")
            
        if search:
            query = query.find(
                RegEx(self.model.title, search, "i") 
            )

        return await query.skip(skip).limit(limit).to_list()

    async def get_upcoming(self, limit: int = 10) -> List[Event]:
        """Obtener próximos eventos ordenados por fecha"""
        return await self.model.find(
            self.model.date >= datetime.utcnow()
        ).sort("date").limit(limit).to_list()

    async def get_by_date(self, event_date: date) -> List[Event]:
        """Obtener eventos para una fecha específica (todo el día)"""
        start_dt = datetime.combine(event_date, datetime.min.time())
        end_dt = datetime.combine(event_date, datetime.max.time())
        
        return await self.model.find(
            self.model.date >= start_dt,
            self.model.date <= end_dt
        ).sort("time").to_list()

    async def get_nearby(
        self,
        lat: float, 
        lng: float, 
        max_distance: int = 5000, 
        limit: int = 10
    ) -> List[Event]:
        """
        Obtener eventos cercanos usando índice geoespacial ($nearSphere).
        """
        return await self.model.find({
            "coordinates": {
                "$nearSphere": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    },
                    "$maxDistance": max_distance
                }
            }
        }).limit(limit).to_list()


# Instancia global del servicio
event_service = EventService()
