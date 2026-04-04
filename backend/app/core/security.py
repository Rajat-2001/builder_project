import os
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db

load_dotenv()

# ─────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────

JWT_SECRET    = os.getenv("JWT_SECRET")
ALGORITHM     = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))


# ─────────────────────────────────────────
# PASSWORD HASHING
# ─────────────────────────────────────────

# CryptContext manages the hashing scheme
# bcrypt is the industry standard — slow by design to resist brute force
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """
    Takes a plain text password, returns a bcrypt hash.
    Called once at registration — the hash is what gets stored in DB.
    """
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Compares a plain password against a stored hash.
    Returns True if they match, False otherwise.
    Called on every login attempt.
    Never compares plain-to-plain — always plain-to-hash.
    """
    return pwd_context.verify(plain, hashed)


# ─────────────────────────────────────────
# JWT TOKENS
# ─────────────────────────────────────────

def create_access_token(data: dict) -> str:
    """
    Creates a signed JWT token.
    data should contain: {"sub": user_id, "role": user_role}
    Adds expiry, then signs with JWT_SECRET.
    Returns the token string that goes to the frontend.
    """
    payload = data.copy()
    expire  = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINUTES)
    payload.update({"exp": expire})

    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decodes and verifies a JWT token.
    Raises JWTError if token is tampered with, expired, or malformed.
    Returns the original payload dict if valid.
    """
    return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])


# ─────────────────────────────────────────
# FASTAPI AUTH DEPENDENCY
# ─────────────────────────────────────────

# Tells FastAPI where clients send their token
# Looks for: Authorization: Bearer <token> in request headers
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    FastAPI dependency — injected into any protected route.
    1. Extracts JWT from Authorization header
    2. Decodes and verifies it
    3. Looks up the user in DB
    4. Returns the live User object

    If anything fails → 401 Unauthorized
    """
    from app.models.user import User  # local import avoids circular imports

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user


def require_role(*roles):
    """
    Role-based access control dependency factory.
    Usage in routes:

        @router.get("/admin-only")
        def admin_only(current_user = Depends(require_role("admin"))):

    Raises 403 if the logged-in user's role isn't in the allowed list.
    """
    def role_checker(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {list(roles)}"
            )
        return current_user
    return role_checker