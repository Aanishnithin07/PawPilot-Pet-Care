# API Testing Examples

This document provides sample curl commands and testing procedures to validate the Firebase Authentication + NeonDB implementation.

## Prerequisites

1. **Start the Backend Server**
   ```bash
   cd backend
   uvicorn main:app --reload
   # Server runs on http://127.0.0.1:8000
   ```

2. **Start the Frontend (Optional)**
   ```bash
   cd frontend
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

## Health Check

### Basic API Health Check
```bash
curl http://127.0.0.1:8000/
```

**Expected Response:**
```json
{
  "Project": "Welcome to the PawPilot API",
  "status": "healthy"
}
```

### API Documentation
Visit: http://127.0.0.1:8000/docs

## Authentication Testing

### 1. Test Unauthorized Access
```bash
curl -X GET http://127.0.0.1:8000/me
```

**Expected Response:**
```json
{
  "detail": "Authorization header missing"
}
```

### 2. Test Invalid Token Format
```bash
curl -X GET http://127.0.0.1:8000/me \
  -H "Authorization: InvalidFormat token123"
```

**Expected Response:**
```json
{
  "detail": "Invalid authorization header format"
}
```

### 3. Test with Mock Firebase Token (for development)

**Note:** In production, you'll get real Firebase ID tokens from the frontend. For testing, you can mock the Firebase verification.

```bash
# This will fail without proper Firebase token
curl -X GET http://127.0.0.1:8000/me \
  -H "Authorization: Bearer mock-firebase-token"
```

## Frontend Authentication Flow

### 1. Register New User
1. Visit http://localhost:5173/register
2. Enter email and password
3. Click "Sign Up" or "Sign up with Google"
4. Should redirect to dashboard on success

### 2. Login Existing User
1. Visit http://localhost:5173/login
2. Enter credentials
3. Click "Sign In" or "Sign in with Google"
4. Should redirect to dashboard on success

### 3. Test Protected Routes
1. After login, try accessing dashboard features
2. Create a pet
3. Add vaccinations
4. Logout and verify redirect to login

## Database Testing

### 1. Check Database Connection
```bash
# For SQLite (development)
sqlite3 backend/pawpilot.db ".tables"

# For NeonDB (production)
psql $DATABASE_URL -c "\dt"
```

**Expected Output:**
```
users
pets
vaccinations
alembic_version
```

### 2. Verify User Creation
```bash
# SQLite
sqlite3 backend/pawpilot.db "SELECT firebase_uid, email, name FROM users LIMIT 5;"

# NeonDB
psql $DATABASE_URL -c "SELECT firebase_uid, email, name FROM users LIMIT 5;"
```

### 3. Check Pet Data
```bash
# SQLite
sqlite3 backend/pawpilot.db "SELECT name, breed, owner_id FROM pets LIMIT 5;"

# NeonDB
psql $DATABASE_URL -c "SELECT name, breed, owner_id FROM pets LIMIT 5;"
```

## Integration Testing with Real Firebase Token

### 1. Get Firebase ID Token (Browser Console)

After logging in through the frontend, run this in browser console:

```javascript
// Get current Firebase user's ID token
firebase.auth().currentUser.getIdToken().then(token => {
  console.log('ID Token:', token);
  // Copy this token for API testing
});
```

### 2. Test API with Real Token
```bash
# Replace YOUR_FIREBASE_ID_TOKEN with actual token from step 1
export FIREBASE_TOKEN="YOUR_FIREBASE_ID_TOKEN"

# Test user info endpoint
curl -X GET http://127.0.0.1:8000/me \
  -H "Authorization: Bearer $FIREBASE_TOKEN"
```

**Expected Response:**
```json
{
  "id": 1,
  "firebase_uid": "firebase-user-uid-123",
  "email": "user@example.com",
  "name": "User Name",
  "pets": []
}
```

### 3. Test Pet Creation
```bash
curl -X POST http://127.0.0.1:8000/pets/ \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buddy",
    "breed": "Golden Retriever",
    "age": 3,
    "weight": 25.5
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "Buddy",
  "breed": "Golden Retriever",
  "age": 3,
  "weight": 25.5,
  "owner_id": 1,
  "vaccinations": []
}
```

### 4. Test Get User's Pets
```bash
curl -X GET http://127.0.0.1:8000/pets/ \
  -H "Authorization: Bearer $FIREBASE_TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Buddy",
    "breed": "Golden Retriever",
    "age": 3,
    "weight": 25.5,
    "owner_id": 1,
    "vaccinations": []
  }
]
```

## Load Testing (Optional)

### Simple Load Test with curl
```bash
# Test multiple concurrent requests
for i in {1..10}; do
  curl -X GET http://127.0.0.1:8000/ &
done
wait
```

### Using Apache Bench (if installed)
```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 http://127.0.0.1:8000/
```

## Error Scenarios Testing

### 1. Test Database Connection Failure
```bash
# Stop database or use invalid connection string
# API should return 500 errors for database operations
```

### 2. Test Firebase Service Unavailable
```bash
# Use invalid Firebase service account
# Should return 401 for protected endpoints
```

### 3. Test Invalid Pet Data
```bash
curl -X POST http://127.0.0.1:8000/pets/ \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "breed": "Invalid",
    "age": -1,
    "weight": "not_a_number"
  }'
```

## Performance Benchmarks

### Expected Response Times
- Health check: < 50ms
- User authentication: < 200ms
- Pet CRUD operations: < 300ms
- Database queries: < 100ms

### Memory Usage
- Backend process: < 100MB
- Database connections: < 10 concurrent

## Troubleshooting Commands

### 1. Check Server Logs
```bash
# Backend logs
cd backend
uvicorn main:app --reload --log-level debug
```

### 2. Verify Environment Variables
```bash
# Check if required env vars are set
echo $DATABASE_URL
echo $FIREBASE_SERVICE_ACCOUNT_JSON
```

### 3. Test Database Connectivity
```bash
# Test NeonDB connection
psql $DATABASE_URL -c "SELECT version();"

# Test SQLite
sqlite3 backend/pawpilot.db ".schema users"
```

### 4. Firebase Configuration Check
```bash
# Verify Firebase service account JSON
echo $FIREBASE_SERVICE_ACCOUNT_JSON | base64 -d | jq .project_id
```

## Automated Testing

### Run Test Suite
```bash
cd backend
pytest tests/ -v
```

### Test Coverage
```bash
cd backend
pytest tests/ --cov=. --cov-report=html
# Open htmlcov/index.html in browser
```

### Continuous Integration
```bash
# Example GitHub Actions workflow test
cd backend
export DATABASE_URL="sqlite:///./test.db"
export TESTING="true"
pytest tests/
```

## Production Validation

### 1. Staging Environment Test
```bash
# Replace with your staging URLs
export STAGING_API="https://your-staging-api.com"
export STAGING_TOKEN="staging-firebase-token"

curl -X GET $STAGING_API/me \
  -H "Authorization: Bearer $STAGING_TOKEN"
```

### 2. Production Smoke Test
```bash
# Basic health check on production
curl https://your-production-api.com/

# Test with production Firebase token
curl -X GET https://your-production-api.com/me \
  -H "Authorization: Bearer $PRODUCTION_TOKEN"
```

### 3. Database Migration Verification
```bash
# Check production database schema
psql $PRODUCTION_DATABASE_URL -c "\d users"
psql $PRODUCTION_DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

## Success Criteria Checklist

- [ ] Health check returns 200 OK
- [ ] Unauthorized requests return 401
- [ ] Valid Firebase tokens authenticate successfully
- [ ] User creation works on first login
- [ ] Pet CRUD operations work correctly
- [ ] Database queries execute without errors
- [ ] Frontend login/logout flow works
- [ ] All tests pass (14/14)
- [ ] No memory leaks or performance issues
- [ ] Production deployment successful