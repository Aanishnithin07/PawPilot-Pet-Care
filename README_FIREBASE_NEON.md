# PawPilot - Firebase Authentication + NeonDB Migration

This document describes the Firebase Authentication and NeonDB migration implementation for PawPilot.

## 🔥 What Changed

### Authentication
- **Before:** Local JWT tokens with email/password stored in SQLite
- **After:** Firebase Authentication with Google OAuth + email/password
- **Benefits:** 
  - Enterprise-grade security
  - Social login options
  - Password reset functionality
  - Multi-factor authentication support

### Database
- **Before:** Local SQLite database (`pawpilot.db`)
- **After:** NeonDB (PostgreSQL) with proper migrations
- **Benefits:**
  - Scalable cloud database
  - Better performance
  - ACID compliance
  - Backup and recovery

## 🚀 Quick Start

### Prerequisites
1. **Firebase Project**
   - Create project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password + Google)
   - Generate service account key

2. **NeonDB Database**
   - Create project at [Neon.tech](https://neon.tech/)
   - Get connection string

### Environment Setup

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Firebase (base64 encoded service account JSON)
FIREBASE_SERVICE_ACCOUNT_JSON=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6InlvdXItcHJvamVjdC1pZCIsLi4ufQ==
```

#### Frontend (.env)
```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Installation & Setup

1. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

2. **Run Database Migrations**
   ```bash
   cd backend
   python -m alembic upgrade head
   ```

3. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   uvicorn main:app --reload
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

## 📊 Data Migration

### From Existing SQLite

If you have existing SQLite data, use our migration script:

```bash
cd kiro/migrations
python sqlite_to_neon_migration.py \
  --sqlite-path ../../backend/pawpilot.db \
  --neon-url "postgresql://username:password@host:port/database" \
  --method csv \
  --verify
```

### Manual Migration (Alternative)

```bash
# Export from SQLite
sqlite3 backend/pawpilot.db -header -csv "SELECT * FROM users;" > users.csv
sqlite3 backend/pawpilot.db -header -csv "SELECT * FROM pets;" > pets.csv
sqlite3 backend/pawpilot.db -header -csv "SELECT * FROM vaccinations;" > vaccinations.csv

# Import to NeonDB
psql $DATABASE_URL -c "\copy users(id,firebase_uid,email,name,hashed_password) FROM 'users.csv' CSV HEADER"
psql $DATABASE_URL -c "\copy pets(id,name,breed,age,weight,owner_id) FROM 'pets.csv' CSV HEADER"
psql $DATABASE_URL -c "\copy vaccinations(id,vaccine_name,date_given,due_date,pet_id) FROM 'vaccinations.csv' CSV HEADER"
```

**Note:** Existing users will need to re-register with Firebase. Their pet data will be preserved but linked to new Firebase UIDs.

## 🔧 API Changes

### Authentication Endpoints

#### Before (JWT)
```bash
POST /login
POST /register
```

#### After (Firebase)
```bash
GET /me          # Get current user info
POST /verify     # Verify Firebase token
```

### Request Headers

#### Before
```bash
Authorization: Bearer <jwt-token>
```

#### After
```bash
Authorization: Bearer <firebase-id-token>
```

### Frontend Auth Flow

#### Before
```javascript
// Login
const response = await axios.post('/login', { username, password });
localStorage.setItem('token', response.data.access_token);
```

#### After
```javascript
// Login
import { signInWithEmail } from './firebase/config';
await signInWithEmail(email, password);
// Token automatically handled by Firebase SDK
```

## 🧪 Testing

### Run Tests
```bash
cd backend
pytest
```

### Test Coverage
- ✅ Firebase token verification
- ✅ User creation from Firebase auth
- ✅ Protected endpoint access
- ✅ Database operations (CRUD)
- ✅ Pet and vaccination management

### Manual Testing Checklist
- [ ] Register new user with email/password
- [ ] Login with Google OAuth
- [ ] Create and manage pets
- [ ] Add vaccinations
- [ ] Logout and re-login
- [ ] Token refresh on expiration

## 🚀 Deployment

### Production Environment Variables

#### Backend (Railway/Heroku/Vercel)
```bash
DATABASE_URL=postgresql://prod-user:prod-pass@prod-host:5432/prod-db
FIREBASE_SERVICE_ACCOUNT_JSON=<base64-encoded-service-account>
```

#### Frontend (Vercel/Netlify)
```bash
VITE_FIREBASE_API_KEY=<production-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<production-auth-domain>
VITE_FIREBASE_PROJECT_ID=<production-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<production-storage-bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<production-sender-id>
VITE_FIREBASE_APP_ID=<production-app-id>
```

### Deployment Steps

1. **Deploy Backend**
   ```bash
   # Update CORS origins for production domain
   # Deploy to your platform (Railway, Heroku, etc.)
   ```

2. **Run Production Migrations**
   ```bash
   # Set production DATABASE_URL
   python -m alembic upgrade head
   ```

3. **Deploy Frontend**
   ```bash
   npm run build
   # Deploy dist/ folder to Vercel/Netlify
   ```

## 🔒 Security Considerations

### Firebase Security Rules
```javascript
// Firestore rules (if using Firestore in future)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Environment Variables
- ❌ Never commit service account JSON to git
- ✅ Use base64 encoding for service account in CI/CD
- ✅ Use different Firebase projects for dev/staging/prod
- ✅ Rotate service account keys regularly

### Database Security
- ✅ NeonDB uses SSL by default
- ✅ Connection strings include credentials
- ✅ Use connection pooling for production
- ✅ Regular backups enabled

## 📈 Monitoring & Maintenance

### Firebase Monitoring
- Authentication usage in Firebase Console
- Token refresh rates
- Failed authentication attempts

### Database Monitoring
- NeonDB dashboard for performance metrics
- Connection pool usage
- Query performance

### Application Monitoring
```bash
# Health check endpoint
curl https://your-api.com/
# Should return: {"Project": "Welcome to the PawPilot API", "status": "healthy"}
```

## 🐛 Troubleshooting

### Common Issues

#### Firebase Token Errors
```bash
# Check service account JSON format
echo $FIREBASE_SERVICE_ACCOUNT_JSON | base64 -d | jq .

# Verify Firebase project ID
# Check Firebase console for correct project ID
```

#### Database Connection Issues
```bash
# Test NeonDB connection
psql $DATABASE_URL -c "SELECT version();"

# Check SSL requirements
# NeonDB requires SSL connections
```

#### CORS Issues
```python
# Update backend/main.py
origins = [
    "http://localhost:5173",
    "https://your-frontend-domain.vercel.app"  # Add production domain
]
```

### Support Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [NeonDB Documentation](https://neon.tech/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

## 📋 Migration Checklist

### Pre-Migration
- [ ] Firebase project created and configured
- [ ] NeonDB database created
- [ ] Environment variables set
- [ ] Backup existing SQLite database
- [ ] Test migration script on copy of data

### Migration
- [ ] Run database migrations
- [ ] Migrate existing data (if applicable)
- [ ] Update frontend authentication
- [ ] Test all functionality
- [ ] Deploy to staging environment

### Post-Migration
- [ ] Verify all tests pass
- [ ] Manual testing of user flows
- [ ] Performance testing
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Update documentation

## 🤝 Contributing

When contributing to the Firebase/NeonDB implementation:

1. **Test Changes**
   ```bash
   # Run full test suite
   cd backend && pytest
   
   # Test Firebase auth flows
   # Test database operations
   ```

2. **Environment Setup**
   - Use separate Firebase projects for development
   - Use separate NeonDB databases for testing
   - Never commit real credentials

3. **Code Style**
   - Follow existing patterns for Firebase integration
   - Use proper error handling for auth failures
   - Add tests for new functionality

## 📚 Additional Resources

- [Firebase Auth Best Practices](https://firebase.google.com/docs/auth/web/manage-users)
- [NeonDB Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [React Context API](https://reactjs.org/docs/context.html)