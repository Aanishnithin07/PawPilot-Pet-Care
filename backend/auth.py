from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
import schemas, database, models
from firebase_config import verify_firebase_token, initialize_firebase

# Initialize Firebase on module import
initialize_firebase()

async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
) -> models.User:
    """
    Extract Firebase ID token from Authorization header and verify it.
    Create or update user record based on Firebase user info.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    id_token = authorization.split(" ")[1]
    
    # Verify Firebase token
    firebase_user = await verify_firebase_token(id_token)
    
    # Get or create user in our database
    user = db.query(models.User).filter(
        models.User.firebase_uid == firebase_user['uid']
    ).first()
    
    if not user:
        # Create new user from Firebase info
        user = models.User(
            firebase_uid=firebase_user['uid'],
            email=firebase_user['email'],
            name=firebase_user.get('name')
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update user info if changed
        updated = False
        if user.email != firebase_user['email']:
            user.email = firebase_user['email']
            updated = True
        if user.name != firebase_user.get('name'):
            user.name = firebase_user.get('name')
            updated = True
        
        if updated:
            db.commit()
            db.refresh(user)
    
    return user