from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User, RoleEnum
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class SyncRequest(BaseModel):
    role: RoleEnum = RoleEnum.FAMILY_CONTRIBUTOR
    full_name: str = None

@router.post("/sync")
def sync_user(
    request: SyncRequest,
    db: Session = Depends(get_db),
    firebase_user: dict = Depends(get_current_user)
):
    """
    Called by the frontend after a successful Firebase login/signup.
    Ensures the user exists in our local PostgreSQL database.
    """
    uid = firebase_user.get("uid")
    email = firebase_user.get("email")
    
    if not email:
        raise HTTPException(status_code=400, detail="Firebase token must contain an email.")
    
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        # Create new user
        user = User(
            firebase_uid=uid,
            email=email,
            full_name=request.full_name,
            role=request.role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return {"message": "User registered successfully in local database", "user_id": user.id, "role": user.role}
    
    return {"message": "User already synced", "user_id": user.id, "role": user.role}
