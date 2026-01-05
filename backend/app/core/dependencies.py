"""
Core Dependencies - Dependencias de FastAPI para inyección
- get_current_user: Obtiene usuario autenticado del token
- require_admin: Requiere rol de administrador
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

from app.core.security import verify_token
from app.models.user import User, UserRole

# OAuth2 scheme - extrae token del header Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False  # No lanzar error automáticamente si no hay token
)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Dependency que obtiene el usuario actual desde el token JWT
    
    Uso:
        @router.get("/profile")
        async def profile(user: User = Depends(get_current_user)):
            return user
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if token is None:
        raise credentials_exception
    
    # Verificar y decodificar token
    payload = verify_token(token, token_type="access")
    if payload is None:
        raise credentials_exception
    
    # Extraer user_id del token
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # Buscar usuario en la base de datos
    user = await User.get(user_id)
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_user_optional(token: str = Depends(oauth2_scheme)) -> Optional[User]:
    """
    Dependency que obtiene el usuario actual si está autenticado,
    pero no falla si no hay token (para endpoints públicos con funcionalidad extra para users)
    """
    if token is None:
        return None
    
    payload = verify_token(token, token_type="access")
    if payload is None:
        return None
    
    user_id: str = payload.get("sub")
    if user_id is None:
        return None
    
    return await User.get(user_id)


async def require_admin(user: User = Depends(get_current_user)) -> User:
    """
    Dependency que requiere que el usuario sea administrador
    
    Uso:
        @router.post("/events")
        async def create_event(admin: User = Depends(require_admin)):
            # Solo admins pueden ejecutar esto
            ...
    """
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador",
        )
    return user


def require_role(allowed_roles: list[UserRole]):
    """
    Factory para crear dependency que requiere roles específicos
    
    Uso:
        @router.get("/special")
        async def special(user: User = Depends(require_role([UserRole.ADMIN, UserRole.MODERATOR]))):
            ...
    """
    async def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de los siguientes roles: {[r.value for r in allowed_roles]}",
            )
        return user
    return role_checker
