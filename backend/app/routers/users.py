"""
Router de usuarios - /users
Perfil y gestión de usuarios (Admin)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime
from typing import List, Optional
from beanie import PydanticObjectId

from app.core.dependencies import get_current_user, require_admin
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/users")

# ==========================================
# ENDPOINTS PÚBLICOS / USUARIO ACTUAL
# ==========================================

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(user: User = Depends(get_current_user)):
    """
    Obtener perfil del usuario autenticado
    """
    return UserResponse(
        _id=str(user.id),
        name=user.name,
        email=user.email,
        phone=user.phone,
        age=user.age,
        gender=user.gender,
        city=user.city,
        member_since=user.member_since,
        preferences=user.preferences,
        role=user.role,
        avatar_url=f"/api/v1/images/{user.avatar_id}" if user.avatar_id else None
    )


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    user: User = Depends(get_current_user)
):
    """
    Actualizar perfil del usuario autenticado
    """
    update_data = user_data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await user.update({"$set": update_data})
    user = await User.get(user.id)
    
    return UserResponse(
        _id=str(user.id),
        name=user.name,
        email=user.email,
        phone=user.phone,
        age=user.age,
        gender=user.gender,
        city=user.city,
        member_since=user.member_since,
        preferences=user.preferences,
        role=user.role,
        avatar_url=f"/api/v1/images/{user.avatar_id}" if user.avatar_id else None
    )


@router.get("/me/preferences", response_model=list[str])
async def get_user_preferences(user: User = Depends(get_current_user)):
    """
    Obtener preferencias del usuario
    """
    return user.preferences


@router.put("/me/preferences", response_model=list[str])
async def update_user_preferences(
    preferences: list[str],
    user: User = Depends(get_current_user)
):
    """
    Actualizar preferencias del usuario
    """
    user.preferences = preferences
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return user.preferences

# ==========================================
# ENDPOINTS ADMINISTRADOR (CRUD)
# ==========================================

@router.get("/", response_model=List[UserResponse], dependencies=[Depends(require_admin)])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None
):
    """
    [ADMIN] Listar usuarios registrados
    """
    query = User.find_all()
    
    if search:
        # Búsqueda simple por nombre o email (case insensitive regex)
        query = User.find({
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]
        })
    
    users = await query.skip(skip).limit(limit).to_list()
    
    return [
        UserResponse(
            _id=str(u.id),
            name=u.name,
            email=u.email,
            phone=u.phone,
            age=u.age,
            gender=u.gender,
            city=u.city,
            member_since=u.member_since,
            preferences=u.preferences,
            role=u.role,
            avatar_url=f"/api/v1/images/{u.avatar_id}" if u.avatar_id else None
        ) for u in users
    ]


@router.get("/{user_id}", response_model=UserResponse, dependencies=[Depends(require_admin)])
async def get_user_admin(user_id: PydanticObjectId):
    """
    [ADMIN] Obtener usuario por ID
    """
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    return UserResponse(
        _id=str(user.id),
        name=user.name,
        email=user.email,
        phone=user.phone,
        age=user.age,
        gender=user.gender,
        city=user.city,
        member_since=user.member_since,
        preferences=user.preferences,
        role=user.role,
        avatar_url=f"/api/v1/images/{user.avatar_id}" if user.avatar_id else None
    )


@router.put("/{user_id}", response_model=UserResponse, dependencies=[Depends(require_admin)])
async def update_user_admin(user_id: PydanticObjectId, user_data: UserUpdate):
    """
    [ADMIN] Actualizar usuario (incluyendo rol)
    """
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    update_data = user_data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await user.update({"$set": update_data})
    
    # Recargar para asegurar nuevos datos
    user = await User.get(user_id)
    
    return UserResponse(
        _id=str(user.id),
        name=user.name,
        email=user.email,
        phone=user.phone,
        age=user.age,
        gender=user.gender,
        city=user.city,
        member_since=user.member_since,
        preferences=user.preferences,
        role=user.role,
        avatar_url=f"/api/v1/images/{user.avatar_id}" if user.avatar_id else None
    )


@router.delete("/{user_id}", dependencies=[Depends(require_admin)])
async def delete_user_admin(user_id: PydanticObjectId, current_user: User = Depends(require_admin)):
    """
    [ADMIN] Eliminar usuario
    """
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta de administrador")
        
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    await user.delete()
    return {"message": "Usuario eliminado correctamente"}
