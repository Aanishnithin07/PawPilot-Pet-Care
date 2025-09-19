# Firebase + NeonDB Deployment Instructions

## Prerequisites

1. **Firebase Project Setup**
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication with Email/Password and Google providers
   - Generate a service account key (Project Settings > Service Accounts > Generate new private key)

2. **NeonDB Setup**
   - Create a NeonDB project at https://neon.tech/
   - Create a database and get the connection string
   - Note down the connection details

## Environment Variables Setup

### Backend Environment Variables

Set these in your hosting provider (Vercel, Railway, Heroku, etc.):

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database
# OR
NEON_DATABASE_URL=postgresql://username:password@host:port/database

# Firebase (Base64 encode the service account JSON)
FIREBASE_SERVICE_ACCOUNT_JSON=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6InlvdXItcHJvamVjdC1pZCIsLi4ufQ==
```

**To base64 encode your service account JSON:**
```bash
# Linux/Mac
base64 -i service-account-key.json

# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content service-account-key.json -Raw)))
```

### Frontend Environment Variables

Set these in your frontend hosting provider:

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Database Migration

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Migrations

```bash
# Set your DATABASE_URL environment variable
export DATABASE_URL="postgresql://username:password@host:port/database"

# Run the migration
cd backend
python -m alembic upgrade head
```

### 3. Data Migration from SQLite (if applicable)

If you have existing SQLite data to migrate:

#### Option A: Using pgloader (Recommended)
```bash
# Install pgloader
# Ubuntu/Debian: sudo apt-get install pgloader
# Mac: brew install pgloader
# Windows: Download from https://pgloader.io/

# Run migration
pgloader sqlite:///path/to/pawpilot.db postgresql://username:password@host:port/database
```

#### Option B: CSV Export/Import
```bash
# Export from SQLite
sqlite3 pawpilot.db -header -csv "SELECT * FROM users;" > users.csv
sqlite3 pawpilot.db -header -csv "SELECT * FROM pets;" > pets.csv
sqlite3 pawpilot.db -header -csv "SELECT * FROM vaccinations;" > vaccinations.csv

# Import to NeonDB
psql $DATABASE_URL -c "\copy users(id,firebase_uid,email,name,hashed_password) FROM 'users.csv' CSV HEADER"
psql $DATABASE_URL -c "\copy pets(id,name,breed,age,weight,owner_id) FROM 'pets.csv' CSV HEADER"
psql $DATABASE_URL -c "\copy vaccinations(id,vaccine_name,date_given,due_date,pet_id) FROM 'vaccinations.csv' CSV HEADER"
```

**Note:** You'll need to manually map existing user IDs to Firebase UIDs after users re-register with Firebase.

## Deployment Steps

### Backend Deployment

1. **Railway/Heroku/Similar**
   ```bash
   # Add environment variables in dashboard
   # Deploy from Git repository
   # Ensure requirements.txt is in backend/ directory
   ```

2. **Vercel (Serverless)**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   cd backend
   vercel --prod
   ```

### Frontend Deployment

1. **Vercel/Netlify**
   ```bash
   # Build the project
   cd frontend
   npm install
   npm run build
   
   # Deploy
   vercel --prod
   # OR upload dist/ folder to Netlify
   ```

2. **Update CORS Settings**
   Update the backend CORS origins to include your frontend domain:
   ```python
   # In backend/main.py
   origins = [
       "http://localhost:5173",
       "https://your-frontend-domain.vercel.app"
   ]
   ```

## Testing Deployment

### 1. Backend Health Check
```bash
curl https://your-backend-domain.com/
# Should return: {"Project": "Welcome to the PawPilot API", "status": "healthy"}
```

### 2. Authentication Test
```bash
# Test token verification endpoint
curl -X POST https://your-backend-domain.com/verify \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

### 3. Database Connection Test
```bash
# Check if migrations ran successfully
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
# Should show: users, pets, vaccinations, alembic_version
```

### 4. Frontend Test
1. Visit your frontend URL
2. Register/login with Firebase
3. Create a pet
4. Verify data appears in NeonDB

## CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        env:
          DATABASE_URL: sqlite:///./test.db
          FIREBASE_SERVICE_ACCOUNT_JSON: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_JSON }}
        run: |
          cd backend
          pytest

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        # Add your deployment steps here
        run: echo "Deploy backend"

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        # Add your deployment steps here
        run: echo "Deploy frontend"
```

## Monitoring and Maintenance

1. **Database Monitoring**
   - Monitor NeonDB usage in the Neon dashboard
   - Set up connection pooling if needed
   - Monitor query performance

2. **Firebase Monitoring**
   - Monitor authentication usage in Firebase console
   - Set up billing alerts
   - Monitor token refresh rates

3. **Application Monitoring**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor API response times
   - Set up uptime monitoring

## Troubleshooting

### Common Issues

1. **Firebase Token Errors**
   - Verify service account JSON is correctly base64 encoded
   - Check Firebase project ID matches
   - Ensure service account has proper permissions

2. **Database Connection Issues**
   - Verify NeonDB connection string format
   - Check if database exists and is accessible
   - Verify SSL requirements (NeonDB requires SSL)

3. **CORS Issues**
   - Update backend CORS origins
   - Check frontend domain configuration
   - Verify protocol (http vs https)

### Support Contacts

- NeonDB: https://neon.tech/docs
- Firebase: https://firebase.google.com/support
- Deployment platforms: Check respective documentation