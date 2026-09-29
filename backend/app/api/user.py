from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession
from datetime import datetime, timezone

from app.db.database import get_db
from app.models import User, Session as UserSession
from app.services.password_hashing import hash_password
from app.services.password_hashing import verify_password

import secrets

router = APIRouter(
    prefix="/api/v1/user",
    tags=["User"]
)

@router.post("/register")
def register_user(
    username: str,
    email: str,
    password: str,
    db: DBSession = Depends(get_db)
):
    existing_user = db.scalar(
        select(User).where(
            (User.username == username) |
            (User.email == email)
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User or email already exists"
        )

    user = User(
        username=username,
        email=email,
        password=hash_password(password),
        active_workspace_id="default"
    )

    db.add(user)
    db.flush()

    token = secrets.token_urlsafe(32)
    
    session = UserSession(
        token=token,
        user_id=user.id
    )

    db.add(session)
    db.commit()

    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "active_workspace_id": user.active_workspace_id
        }
    }

@router.post("/login")
def login_user(
    email: str,
    password: str,
    db: DBSession = Depends(get_db)
):
    user = db.scalar(
        select(User).where(
            (User.email == email)
        )
    )

    if user is None or not verify_password(password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = secrets.token_urlsafe(32)

    session = UserSession(
        token=token,
        user_id=user.id
    )

    db.add(session)
    db.commit()

    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "active_workspace_id": user.active_workspace_id
        }
    }


@router.post("/logout")
def logout_user(
        authorization: str | None = Header(default=None),
        db: DBSession = Depends(get_db)
    ):

    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    token = authorization.removeprefix("Bearer ")

    session = db.scalar(
        select(UserSession).where(UserSession.token == token)
    )

    if session is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    if session.logout_at is not None:
        raise HTTPException(
            status_code=401,
            detail="Session has already been logged out"
        )

    session.logout_at = datetime.now(timezone.utc)

    db.commit()

    return {
        "message": "Logged out successfully"
    }

def get_current_user(
    authorization: str | None = Header(default=None),
    db: DBSession = Depends(get_db)
) -> User:
    if authorization is None:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication format"
        )

    token =  authorization.removeprefix("Bearer ").strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Authentication token missing"
        )

    session = db.scalar(
        select(UserSession).where(UserSession.token == token)
    )

    if session is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    if session.logout_at is not None:
        raise HTTPException(
            status_code=401,
            detail="Session has been logged out"
        )

    user = db.get(User, session.user_id)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User no longer exists"
        )

    session.last_seen_at = datetime.now(timezone.utc)

    db.commit()

    return user

@router.post("/heartbeat")
def heartbeat(
    user: User = Depends(get_current_user)
):
    return {
        "message": "Heartbeat received"
    }