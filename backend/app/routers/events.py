"""
Router de eventos - /events
CRUD completo para gestión de eventos culturales
Refactorizado para usar Clean Architecture (EventService)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date

from app.core.dependencies import get_current_user_optional, require_admin
# from app.core.cache import invalidate_events_cache # Ya no es necesario aquí, lo maneja el servicio si quisiera, o lo dejamos aquí pero llamando al servicio
# Nota: La invalidación de caché la hacía el router antes. De momento la dejamos fuera o la agregamos al servicio.
# En la implementación anterior del Router, se llamaba a invalidate_events_cache() después de create/update/delete.
# Idealmente el servicio debería encargarse de esto o tener un decorador.
# Por simplicidad y para no romper nada, agregaremos la invalidación aquí o en el servicio.
# En mi implementación de EventService NO incluí caché invalidation. Debería agregarlo.
from app.core.cache import invalidate_events_cache 

from app.models.user import User
from app.models.event import Event, EventCategory
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventSummary
from app.services.event_service import event_service

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
    """Listar eventos con filtros opcionales"""
    events = await event_service.get_multi(
        skip=skip,
        limit=limit,
        category=category,
        upcoming=upcoming
    )
    
    # Transformar a respuesta (Manual mapping por diferencia de estructuras GeoJSON vs LatLng)
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
    """Obtener próximos eventos ordenados por fecha"""
    events = await event_service.get_upcoming(limit=limit)
    
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
    """Obtener eventos de una fecha específica"""
    events = await event_service.get_by_date(event_date)
    
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
    """Obtener eventos cercanos a una ubicación"""
    events = await event_service.get_nearby(lat=lat, lng=lng, max_distance=max_distance, limit=limit)
    
    # Nota: get_nearby devuelve objetos Event completos, no agregaciones crudas
    # (Beanie maneja el mapeo)
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


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    """Obtener detalle de un evento por ID"""
    event = await event_service.get(event_id)
    
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
    """Crear nuevo evento (solo administradores)"""
    event = await event_service.create(event_data)
    
    # Invalidar caché
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
    """Actualizar evento existente (solo administradores)"""
    event = await event_service.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    event = await event_service.update(event, event_data)
    
    # Invalidar caché
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
        testimonials=event.testimonials,
        created_at=event.created_at,
        updated_at=event.updated_at
    )


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str,
    admin: User = Depends(require_admin)
):
    """Eliminar evento (solo administradores)"""
    event = await event_service.delete(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    # Invalidar caché
    await invalidate_events_cache()
    
    return None
