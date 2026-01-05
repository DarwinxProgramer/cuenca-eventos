"""
Router de eventos - /events
CRUD completo para gestión de eventos culturales
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date
from beanie import PydanticObjectId

from app.core.dependencies import get_current_user, get_current_user_optional, require_admin
from app.core.cache import invalidate_events_cache
from app.models.user import User
from app.models.event import Event, EventCategory, GeoJSONPoint
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventSummary

router = APIRouter(prefix="/events")


# ============================================
# ENDPOINTS PÚBLICOS
# ============================================

@router.get("/", response_model=List[EventSummary])
async def get_events(
    skip: int = Query(0, ge=0, description="Número de eventos a saltar"),
    limit: int = Query(20, ge=1, le=100, description="Límite de eventos"),
    category: Optional[EventCategory] = Query(None, description="Filtrar por categoría"),
    upcoming: bool = Query(False, description="Solo eventos futuros"),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Listar eventos con filtros opcionales
    
    - **skip**: Paginación - número de eventos a saltar
    - **limit**: Máximo de eventos a retornar
    - **category**: Filtrar por categoría
    - **upcoming**: Si true, solo retorna eventos futuros
    """
    query = {}
    
    # Filtro por categoría
    if category:
        query["category"] = category
    
    # Filtro por fecha futura
    if upcoming:
        query["date"] = {"$gte": datetime.utcnow()}
    
    # Ejecutar consulta
    if query:
        events = await Event.find(query).skip(skip).limit(limit).sort("-date").to_list()
    else:
        events = await Event.find_all().skip(skip).limit(limit).sort("-date").to_list()
    
    # Transformar a respuesta
    return [
        EventSummary(
            _id=str(event.id),
            title=event.title,
            description=event.description,
            date=event.date,
            time=event.time,
            location=event.location,
            coordinates={"lat": event.coordinates.lat, "lng": event.coordinates.lng},
            category=event.category,
            image_url=f"/api/v1/images/{event.image_id}" if event.image_id else None
        )
        for event in events
    ]


@router.get("/upcoming", response_model=List[EventSummary])
async def get_upcoming_events(
    limit: int = Query(10, ge=1, le=50, description="Límite de eventos")
):
    """
    Obtener próximos eventos ordenados por fecha
    """
    events = await Event.find(
        Event.date >= datetime.utcnow()
    ).sort("+date").limit(limit).to_list()
    
    return [
        EventSummary(
            _id=str(event.id),
            title=event.title,
            description=event.description,
            date=event.date,
            time=event.time,
            location=event.location,
            coordinates={"lat": event.coordinates.lat, "lng": event.coordinates.lng},
            category=event.category,
            image_url=f"/api/v1/images/{event.image_id}" if event.image_id else None
        )
        for event in events
    ]


@router.get("/date/{event_date}", response_model=List[EventSummary])
async def get_events_by_date(event_date: date):
    """
    Obtener eventos de una fecha específica
    """
    # Crear rango de fechas para ese día
    start_of_day = datetime.combine(event_date, datetime.min.time())
    end_of_day = datetime.combine(event_date, datetime.max.time())
    
    events = await Event.find(
        Event.date >= start_of_day,
        Event.date <= end_of_day
    ).sort("+time").to_list()
    
    return [
        EventSummary(
            _id=str(event.id),
            title=event.title,
            description=event.description,
            date=event.date,
            time=event.time,
            location=event.location,
            coordinates={"lat": event.coordinates.lat, "lng": event.coordinates.lng},
            category=event.category,
            image_url=f"/api/v1/images/{event.image_id}" if event.image_id else None
        )
        for event in events
    ]


@router.get("/nearby", response_model=List[EventSummary])
async def get_nearby_events(
    lat: float = Query(..., ge=-90, le=90, description="Latitud"),
    lng: float = Query(..., ge=-180, le=180, description="Longitud"),
    max_distance: int = Query(5000, ge=100, le=50000, description="Distancia máxima en metros"),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Obtener eventos cercanos a una ubicación usando índice geoespacial
    
    - **lat**: Latitud del punto de referencia
    - **lng**: Longitud del punto de referencia
    - **max_distance**: Radio de búsqueda en metros (default: 5km)
    """
    # Consulta geoespacial con $nearSphere
    pipeline = [
        {
            "$geoNear": {
                "near": {"type": "Point", "coordinates": [lng, lat]},
                "distanceField": "distance",
                "maxDistance": max_distance,
                "spherical": True
            }
        },
        {"$match": {"date": {"$gte": datetime.utcnow()}}},
        {"$limit": limit}
    ]
    
    events = await Event.aggregate(pipeline).to_list()
    
    return [
        EventSummary(
            _id=str(event["_id"]),
            title=event["title"],
            description=event["description"],
            date=event["date"],
            time=event["time"],
            location=event["location"],
            coordinates={"lat": event["coordinates"]["coordinates"][1], "lng": event["coordinates"]["coordinates"][0]},
            category=event["category"],
            image_url=f"/api/v1/images/{event['image_id']}" if event.get("image_id") else None
        )
        for event in events
    ]


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    """
    Obtener detalle de un evento por ID
    """
    try:
        event = await Event.get(event_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    return EventResponse(
        _id=str(event.id),
        title=event.title,
        description=event.description,
        long_description=event.long_description,
        date=event.date,
        time=event.time,
        end_time=event.end_time,
        location=event.location,
        address=event.address,
        coordinates={"lat": event.coordinates.lat, "lng": event.coordinates.lng},
        category=event.category,
        image_url=f"/api/v1/images/{event.image_id}" if event.image_id else None,
        gallery=[f"/api/v1/images/{img_id}" for img_id in event.gallery],
        itinerary=event.itinerary,
        closed_streets=event.closed_streets,
        testimonials=event.testimonials,
        created_at=event.created_at,
        updated_at=event.updated_at
    )


# ============================================
# ENDPOINTS ADMIN (requieren autenticación)
# ============================================

@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    admin: User = Depends(require_admin)
):
    """
    Crear nuevo evento (solo administradores)
    """
    # Crear GeoJSONPoint desde coordenadas
    coordinates = GeoJSONPoint.from_lat_lng(
        lat=event_data.coordinates.lat,
        lng=event_data.coordinates.lng
    )
    
    # Crear evento
    event = Event(
        title=event_data.title,
        description=event_data.description,
        long_description=event_data.long_description,
        date=event_data.date,
        time=event_data.time,
        end_time=event_data.end_time,
        location=event_data.location,
        address=event_data.address,
        coordinates=coordinates,
        category=event_data.category,
        image_id=PydanticObjectId(event_data.image_id) if event_data.image_id else None,
        gallery=[PydanticObjectId(img_id) for img_id in event_data.gallery],
        itinerary=event_data.itinerary,
        closed_streets=event_data.closed_streets
    )
    
    await event.insert()
    
    # Invalidar caché de eventos
    await invalidate_events_cache()
    
    return EventResponse(
        _id=str(event.id),
        title=event.title,
        description=event.description,
        long_description=event.long_description,
        date=event.date,
        time=event.time,
        end_time=event.end_time,
        location=event.location,
        address=event.address,
        coordinates={"lat": event.coordinates.lat, "lng": event.coordinates.lng},
        category=event.category,
        image_url=f"/api/v1/images/{event.image_id}" if event.image_id else None,
        gallery=[f"/api/v1/images/{img_id}" for img_id in event.gallery],
        itinerary=event.itinerary,
        closed_streets=event.closed_streets,
        testimonials=[],
        created_at=event.created_at,
        updated_at=event.updated_at
    )


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_data: EventUpdate,
    admin: User = Depends(require_admin)
):
    """
    Actualizar evento existente (solo administradores)
    """
    try:
        event = await Event.get(event_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    # Actualizar campos proporcionados
    update_data = event_data.model_dump(exclude_unset=True)
    
    # Manejar coordenadas especialmente
    if "coordinates" in update_data and update_data["coordinates"]:
        update_data["coordinates"] = GeoJSONPoint.from_lat_lng(
            lat=update_data["coordinates"]["lat"],
            lng=update_data["coordinates"]["lng"]
        )
    
    # Manejar image_id
    if "image_id" in update_data and update_data["image_id"]:
        update_data["image_id"] = PydanticObjectId(update_data["image_id"])
    
    # Manejar gallery
    if "gallery" in update_data and update_data["gallery"]:
        update_data["gallery"] = [PydanticObjectId(img_id) for img_id in update_data["gallery"]]
    
    # Actualizar timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # Aplicar actualizaciones
    await event.update({"$set": update_data})
    
    # Invalidar caché de eventos
    await invalidate_events_cache()
    
    # Recargar evento actualizado
    event = await Event.get(event_id)
    
    return EventResponse(
        _id=str(event.id),
        title=event.title,
        description=event.description,
        long_description=event.long_description,
        date=event.date,
        time=event.time,
        end_time=event.end_time,
        location=event.location,
        address=event.address,
        coordinates={"lat": event.coordinates.lat, "lng": event.coordinates.lng},
        category=event.category,
        image_url=f"/api/v1/images/{event.image_id}" if event.image_id else None,
        gallery=[f"/api/v1/images/{img_id}" for img_id in event.gallery],
        itinerary=event.itinerary,
        closed_streets=event.closed_streets,
        testimonials=event.testimonials,
        created_at=event.created_at,
        updated_at=event.updated_at
    )


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str,
    admin: User = Depends(require_admin)
):
    """
    Eliminar evento (solo administradores)
    """
    try:
        event = await Event.get(event_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    await event.delete()
    
    # Invalidar caché de eventos
    await invalidate_events_cache()
    
    return None
