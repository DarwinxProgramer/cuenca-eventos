"""
Router de rutas turísticas - /routes
CRUD para gestión de rutas
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId

from app.core.dependencies import require_admin
from app.models.user import User
from app.models.route import Route, RouteCategory, RouteDifficulty, RouteStop
from app.models.event import GeoJSONPoint
from app.schemas.route import RouteCreate, RouteUpdate, RouteResponse

router = APIRouter(prefix="/routes")


# ============================================
# ENDPOINTS PÚBLICOS
# ============================================

@router.get("/", response_model=List[RouteResponse])
async def get_routes(
    category: Optional[RouteCategory] = Query(None, description="Filtrar por categoría"),
    difficulty: Optional[RouteDifficulty] = Query(None, description="Filtrar por dificultad")
):
    """
    Listar rutas turísticas con filtros
    """
    query = {}
    
    if category:
        query["category"] = category
    
    if difficulty:
        query["difficulty"] = difficulty
    
    if query:
        routes = await Route.find(query).sort("-created_at").to_list()
    else:
        routes = await Route.find_all().sort("-created_at").to_list()
    
    return [
        RouteResponse(
            _id=str(route.id),
            name=route.name,
            description=route.description,
            category=route.category,
            duration=route.duration,
            distance=route.distance,
            difficulty=route.difficulty,
            image_url=f"/api/v1/images/{route.image_id}" if route.image_id else None,
            events=[str(e) for e in route.events],
            stops=[
                {"name": stop.name, "coordinates": {"lat": stop.coordinates.lat, "lng": stop.coordinates.lng}}
                for stop in route.stops
            ],
            created_at=route.created_at
        )
        for route in routes
    ]


@router.get("/{route_id}", response_model=RouteResponse)
async def get_route(route_id: str):
    """
    Obtener detalle de una ruta
    """
    try:
        route = await Route.get(route_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    
    if not route:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    
    return RouteResponse(
        _id=str(route.id),
        name=route.name,
        description=route.description,
        category=route.category,
        duration=route.duration,
        distance=route.distance,
        difficulty=route.difficulty,
        image_url=f"/api/v1/images/{route.image_id}" if route.image_id else None,
        events=[str(e) for e in route.events],
        stops=[
            {"name": stop.name, "coordinates": {"lat": stop.coordinates.lat, "lng": stop.coordinates.lng}}
            for stop in route.stops
        ],
        created_at=route.created_at
    )


# ============================================
# ENDPOINTS ADMIN
# ============================================

@router.post("/", response_model=RouteResponse, status_code=status.HTTP_201_CREATED)
async def create_route(
    route_data: RouteCreate,
    admin: User = Depends(require_admin)
):
    """
    Crear nueva ruta (solo admin)
    """
    stops = [
        RouteStop(
            name=stop.name,
            coordinates=GeoJSONPoint.from_lat_lng(
                lat=stop.coordinates.lat,
                lng=stop.coordinates.lng
            )
        )
        for stop in route_data.stops
    ]
    
    route = Route(
        name=route_data.name,
        description=route_data.description,
        category=route_data.category,
        duration=route_data.duration,
        distance=route_data.distance,
        difficulty=route_data.difficulty,
        image_id=PydanticObjectId(route_data.image_id) if route_data.image_id else None,
        events=[PydanticObjectId(e) for e in route_data.events],
        stops=stops
    )
    
    await route.insert()
    
    return RouteResponse(
        _id=str(route.id),
        name=route.name,
        description=route.description,
        category=route.category,
        duration=route.duration,
        distance=route.distance,
        difficulty=route.difficulty,
        image_url=f"/api/v1/images/{route.image_id}" if route.image_id else None,
        events=[str(e) for e in route.events],
        stops=[
            {"name": stop.name, "coordinates": {"lat": stop.coordinates.lat, "lng": stop.coordinates.lng}}
            for stop in route.stops
        ],
        created_at=route.created_at
    )


@router.put("/{route_id}", response_model=RouteResponse)
async def update_route(
    route_id: str,
    route_data: RouteUpdate,
    admin: User = Depends(require_admin)
):
    """
    Actualizar ruta (solo admin)
    """
    try:
        route = await Route.get(route_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    
    if not route:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    
    update_data = route_data.model_dump(exclude_unset=True)
    
    if "stops" in update_data and update_data["stops"]:
        update_data["stops"] = [
            RouteStop(
                name=stop["name"],
                coordinates=GeoJSONPoint.from_lat_lng(
                    lat=stop["coordinates"]["lat"],
                    lng=stop["coordinates"]["lng"]
                )
            )
            for stop in update_data["stops"]
        ]
    
    if "events" in update_data and update_data["events"]:
        update_data["events"] = [PydanticObjectId(e) for e in update_data["events"]]
    
    if "image_id" in update_data and update_data["image_id"]:
        update_data["image_id"] = PydanticObjectId(update_data["image_id"])
    
    await route.update({"$set": update_data})
    route = await Route.get(route_id)
    
    return RouteResponse(
        _id=str(route.id),
        name=route.name,
        description=route.description,
        category=route.category,
        duration=route.duration,
        distance=route.distance,
        difficulty=route.difficulty,
        image_url=f"/api/v1/images/{route.image_id}" if route.image_id else None,
        events=[str(e) for e in route.events],
        stops=[
            {"name": stop.name, "coordinates": {"lat": stop.coordinates.lat, "lng": stop.coordinates.lng}}
            for stop in route.stops
        ],
        created_at=route.created_at
    )


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_route(
    route_id: str,
    admin: User = Depends(require_admin)
):
    """
    Eliminar ruta (solo admin)
    """
    try:
        route = await Route.get(route_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    
    if not route:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    
    await route.delete()
    return None
