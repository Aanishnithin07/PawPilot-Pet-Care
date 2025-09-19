# PawPilot Codebase Analysis Report

## Tech Stack Overview

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (local file: `pawpilot.db`)
- **ORM**: SQLAlchemy with declarative base
- **Authentication**: JWT tokens with python-jose
- **Password Hashing**: bcrypt via passlib
- **API Documentation**: FastAPI auto-generated docs

### Frontend  
- **Framework**: React 19.1.1 with Vite
- **UI Library**: Material-UI (MUI) v7
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **State Management**: React hooks (useState, useEffect)
- **Maps Integration**: @react-google-maps/api

### Current Database Schema
```sql
-- Users table (authentication)
users: id (PK), email (unique), hashed_password

-- Pets table  
pets: id (PK), name, breed, age, weight, owner_id (FK to users.id)

-- Vaccinations table
vaccinations: id (PK), vaccine_name, date_given, due_date, pet_id (FK to pets.id)
```

## Current Authentication Implementation

### Backend Auth Files
- `backend/auth.py` - JWT token creation and verification
- `backend/routers/authentication.py` - Login/register endpoints
- `backend/crud.py` - User CRUD operations with password hashing

### Frontend Auth Files
- `frontend/src/pages/LoginPage.jsx` - Login form with email/password
- `frontend/src/pages/RegisterPage.jsx` - User registration
- `frontend/src/api/axiosConfig.js` - Axios interceptor for Bearer tokens

### Protected Endpoints
All endpoints in the following routers require authentication:
- `/pets/*` - Pet management (create, read, vaccinations)
- `/diagnosis/*` - AI symptom checking
- `/vaccinations/*` - Vaccination management  
- `/places/*` - Vet location services

### Auth Flow
1. User submits email/password to `/login`
2. Backend verifies credentials against SQLite users table
3. JWT token returned with user ID in `sub` claim
4. Frontend stores token in localStorage
5. Axios interceptor adds `Authorization: Bearer <token>` to requests
6. Backend middleware `get_current_user()` verifies JWT and loads user

## Database Access Patterns

### Files with DB Access
- `backend/database.py` - SQLAlchemy engine and session management
- `backend/models.py` - SQLAlchemy ORM models
- `backend/crud.py` - Database operations (users, pets, vaccinations)
- All router files - Use `Depends(get_db)` for session injection

### Migration Strategy Required
- No existing migration system detected
- Current schema created via `models.Base.metadata.create_all(bind=engine)`
- Will need to implement Alembic for proper migrations

## Testing Status
- **No tests found** - Need to create comprehensive test suite
- No CI/CD configuration detected
- No Docker configuration found

## Key Dependencies to Add

### Backend
```
firebase-admin>=6.0.0
psycopg2-binary>=2.9.0  # Postgres driver
alembic>=1.8.0          # Database migrations
pytest>=7.0.0           # Testing framework
pytest-asyncio>=0.21.0  # Async testing
```

### Frontend  
```
firebase>=9.0.0         # Firebase client SDK
```

## Migration Complexity Assessment

### Low Risk
- User authentication (replace JWT with Firebase ID tokens)
- Database schema migration (straightforward SQLite -> Postgres)
- Frontend auth UI (minimal changes needed)

### Medium Risk  
- Data migration (need to map existing user IDs to Firebase UIDs)
- Environment configuration (multiple new env vars)
- Testing setup (need comprehensive test suite)

### Considerations
- Existing users will need to re-register with Firebase
- Or implement a migration strategy to link existing emails to Firebase accounts
- Pet ownership relationships need to be preserved during migration

## Recommended Implementation Order

1. **Setup Infrastructure** - Add Firebase project, NeonDB instance
2. **Backend Auth Migration** - Replace JWT with Firebase Admin SDK
3. **Database Migration** - SQLite schema -> NeonDB with Alembic
4. **Frontend Auth Migration** - Integrate Firebase client SDK  
5. **Data Migration** - Export/import user and pet data
6. **Testing** - Comprehensive test suite for new auth and DB
7. **Documentation** - Update README with new setup instructions

## Files Requiring Modification

### Backend Core
- `backend/auth.py` - Replace JWT with Firebase token verification
- `backend/database.py` - Update connection string for NeonDB
- `backend/models.py` - Add firebase_uid field to User model
- `backend/requirements.txt` - Add Firebase Admin SDK and Postgres driver

### Backend Routers
- `backend/routers/authentication.py` - Remove login/register, add Firebase verification
- All other routers - Update to use Firebase user context

### Frontend Core  
- `frontend/src/api/axiosConfig.js` - Update to use Firebase ID tokens
- `frontend/src/pages/LoginPage.jsx` - Replace with Firebase auth
- `frontend/src/pages/RegisterPage.jsx` - Replace with Firebase auth
- `frontend/package.json` - Add Firebase client SDK

### New Files Needed
- `backend/alembic/` - Database migration scripts
- `backend/firebase_config.py` - Firebase Admin initialization
- `frontend/src/firebase/` - Firebase client configuration
- `tests/` - Comprehensive test suite
- `.env.example` - Environment variable templates