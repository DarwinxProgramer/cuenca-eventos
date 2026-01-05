"""
Router de autenticación - /auth
Endpoints para registro, login, refresh token y logout
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime

from app.core.security import (
    hash_password, 
    verify_password, 
    create_access_token, 
    create_refresh_token,
    verify_token
)
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.auth import Token, LoginRequest, RefreshTokenRequest
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth")


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Registrar nuevo usuario
    
    - Verifica que el email no exista
    - Hashea la contraseña
    - Crea el usuario en la base de datos
    """
    # Verificar si el email ya existe
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear usuario con contraseña hasheada
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        phone=user_data.phone,
        gender=user_data.gender,
        city=user_data.city,
        preferences=user_data.preferences,
        role=UserRole.USER,
        member_since=datetime.utcnow()
    )
    
    await user.insert()
    
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
        role=user.role
    )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Iniciar sesión con email y contraseña
    
    - OAuth2PasswordRequestForm usa 'username' para el email
    - Retorna access_token y refresh_token
    """
    # Buscar usuario por email
    user = await User.find_one(User.email == form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar contraseña
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear tokens
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Guardar refresh token en el usuario
    user.refresh_token = refresh_token
    await user.save()
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/login/json", response_model=Token)
async def login_json(credentials: LoginRequest):
    """
    Login alternativo con JSON body (para clientes que no usan OAuth2 form)
    """
    user = await User.find_one(User.email == credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    user.refresh_token = refresh_token
    await user.save()
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest):
    """
    Obtener nuevo access token usando el refresh token
    """
    # Verificar refresh token
    payload = verify_token(request.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido o expirado"
        )
    
    user_id = payload.get("sub")
    user = await User.get(user_id)
    
    if not user or user.refresh_token != request.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token no válido"
        )
    
    # Crear nuevos tokens
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value
    }
    
    new_access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)
    
    # Actualizar refresh token
    user.refresh_token = new_refresh_token
    await user.save()
    
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )


@router.post("/logout")
async def logout(user: User = Depends(get_current_user)):
    """
    Cerrar sesión - invalida el refresh token
    """
    user.refresh_token = None
    await user.save()
    
    return {"message": "Sesión cerrada exitosamente"}
