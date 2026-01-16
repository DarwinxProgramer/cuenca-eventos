"""
Router de autenticación - /auth
Endpoints para registro, login, refresh token y logout
Refactorizado para usar AuthService
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from app.core.ratelimit import limiter

from app.core.security import verify_token, create_access_token, create_refresh_token
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import Token, LoginRequest, RefreshTokenRequest
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth")


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserCreate):
    """
    Registrar nuevo usuario
    """
    user = await auth_service.register_user(user_data)
    
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
@limiter.limit("5/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Iniciar sesión con email y contraseña
    """
    return await auth_service.authenticate_user(form_data.username, form_data.password)


@router.post("/login/json", response_model=Token)
@limiter.limit("5/minute")
async def login_json(request: Request, credentials: LoginRequest):
    """
    Login alternativo con JSON body
    """
    return await auth_service.authenticate_user(credentials.email, credentials.password)


@router.post("/refresh", response_model=Token)
@limiter.limit("20/minute")
async def refresh_token(request: Request, refresh_token_req: RefreshTokenRequest):
    """
    Obtener nuevo access token usando el refresh token
    """
    # Nota: Mantenemos la lógica de verificación aquí por ahora o la movemos al servicio
    # Como comentamos en AuthService, mover verify_token requiere refactor mayor de deps.
    # Por consistencia con la petición de "centralizar validaciones",
    # mantenemos validación de JWT aquí (es seguridad/infra) y lógica de usuario abajo.
    
    payload = verify_token(refresh_token_req.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido o expirado"
        )
    
    user_id = payload.get("sub")
    user = await User.get(user_id)
    
    if not user or user.refresh_token != refresh_token_req.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token no válido"
        )
    
    # Generar nuevos tokens
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value
    }
    
    access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)
    
    user.refresh_token = new_refresh_token
    await user.save()
    
    return Token(
        access_token=access_token,
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
