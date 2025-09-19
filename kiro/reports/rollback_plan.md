# Rollback Plan - Firebase Auth + NeonDB Migration

## Overview

This document outlines the rollback procedures in case issues arise during or after the Firebase Authentication and NeonDB migration.

## Pre-Migration Backup

**CRITICAL: Create these backups BEFORE starting migration**

### 1. SQLite Database Backup
```bash
# Create backup of existing SQLite database
cp backend/pawpilot.db backend/pawpilot_backup_$(date +%Y%m%d_%H%M%S).db

# Export to SQL dump
sqlite3 backend/pawpilot.db .dump > pawpilot_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Code Backup
```bash
# Create backup branch before starting migration
git checkout main
git checkout -b backup/pre-firebase-migration
git push origin backup/pre-firebase-migration
```

### 3. Environment Configuration Backup
```bash
# Backup current environment files
cp backend/.env backend/.env.backup
cp frontend/.env frontend/.env.backup
```

## Rollback Scenarios

### Scenario 1: Rollback During Development (Before Production Deploy)

**When to use:** Issues found during local testing or staging

**Steps:**
1. **Revert to backup branch**
   ```bash
   git checkout backup/pre-firebase-migration
   git checkout -b rollback/firebase-migration
   ```

2. **Restore SQLite database**
   ```bash
   cd backend
   cp pawpilot_backup_YYYYMMDD_HHMMSS.db pawpilot.db
   ```

3. **Restore environment files**
   ```bash
   cp backend/.env.backup backend/.env
   cp frontend/.env.backup frontend/.env
   ```

4. **Reinstall original dependencies**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

5. **Test original functionality**
   ```bash
   # Start backend
   cd backend
   uvicorn main:app --reload
   
   # Start frontend
   cd frontend
   npm run dev
   ```

### Scenario 2: Rollback After Production Deploy (Emergency)

**When to use:** Critical issues in production affecting users

**Steps:**

1. **Immediate: Revert deployment**
   ```bash
   # If using Vercel
   vercel rollback
   
   # If using Railway/Heroku
   # Use platform-specific rollback commands
   
   # If using manual deployment
   git revert HEAD~1  # Revert last commit
   git push origin main
   ```

2. **Database rollback (if data corruption)**
   ```bash
   # Connect to production database
   psql $PRODUCTION_DATABASE_URL
   
   # Drop new tables (if safe to do so)
   DROP TABLE IF EXISTS alembic_version;
   # Note: Only do this if no critical data was added
   ```

3. **Restore from backup**
   ```bash
   # If you have a database backup
   pg_restore -d $PRODUCTION_DATABASE_URL backup_file.sql
   ```

### Scenario 3: Partial Rollback (Keep NeonDB, Revert Auth)

**When to use:** Database migration successful but Firebase auth issues

**Steps:**

1. **Revert authentication code only**
   ```bash
   git checkout backup/pre-firebase-migration -- backend/auth.py
   git checkout backup/pre-firebase-migration -- backend/routers/authentication.py
   git checkout backup/pre-firebase-migration -- frontend/src/pages/LoginPage.jsx
   git checkout backup/pre-firebase-migration -- frontend/src/pages/RegisterPage.jsx
   git checkout backup/pre-firebase-migration -- frontend/src/api/axiosConfig.js
   ```

2. **Update database connection to keep NeonDB**
   ```python
   # In backend/database.py - keep NeonDB connection
   DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL")
   ```

3. **Restore JWT authentication**
   ```bash
   # Reinstall JWT dependencies
   pip install python-jose[cryptography]
   ```

### Scenario 4: Data Recovery

**When to use:** User data needs to be recovered from backups

**Steps:**

1. **Identify affected data**
   ```sql
   -- Check what data exists
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM pets;
   SELECT COUNT(*) FROM vaccinations;
   ```

2. **Restore specific tables**
   ```bash
   # Export specific table from backup
   sqlite3 pawpilot_backup.db -header -csv "SELECT * FROM users;" > users_backup.csv
   
   # Import to current database
   psql $DATABASE_URL -c "\copy users FROM 'users_backup.csv' CSV HEADER"
   ```

3. **Merge data (if needed)**
   ```sql
   -- Example: Merge user data
   INSERT INTO users (firebase_uid, email, name, hashed_password)
   SELECT 'temp-' || id, email, email, hashed_password 
   FROM backup_users 
   WHERE email NOT IN (SELECT email FROM users);
   ```

## Testing Rollback Procedures

### 1. Test Environment Rollback
```bash
# Create test scenario
git checkout feat/firebase-auth-neon-migration
# Make some test changes
# Practice rollback steps

# Verify rollback success
curl http://localhost:8000/
# Should return original API response
```

### 2. Database Rollback Test
```bash
# Test with copy of production data
cp production_backup.db test_rollback.db
# Practice restoration procedures
```

## Prevention Measures

### 1. Staged Deployment
- Deploy to staging environment first
- Run full test suite
- Manual testing of all features
- Load testing if applicable

### 2. Feature Flags
```python
# Example: Use feature flags for gradual rollout
USE_FIREBASE_AUTH = os.getenv("USE_FIREBASE_AUTH", "false").lower() == "true"

if USE_FIREBASE_AUTH:
    # New Firebase auth
    pass
else:
    # Old JWT auth
    pass
```

### 3. Database Migrations
```bash
# Always test migrations on copy of production data
pg_dump $PRODUCTION_DB > prod_copy.sql
createdb test_migration
psql test_migration < prod_copy.sql
# Test migration on test_migration database
```

## Communication Plan

### Internal Team
1. **Before Migration**
   - Notify team of migration window
   - Share rollback procedures
   - Assign rollback responsibilities

2. **During Issues**
   - Immediate Slack/Teams notification
   - Status page update (if applicable)
   - Stakeholder notification

### Users (if applicable)
1. **Planned Maintenance**
   ```
   Subject: PawPilot Maintenance - Enhanced Security Update
   
   We're upgrading our authentication system for better security.
   Expected downtime: 30 minutes
   Date: [DATE] [TIME]
   
   What to expect:
   - You may need to log in again
   - All your pet data will be preserved
   ```

2. **Emergency Rollback**
   ```
   Subject: PawPilot Service Restored
   
   We've resolved the technical issue and restored normal service.
   All data is safe and secure.
   
   If you experience any issues, please contact support.
   ```

## Post-Rollback Actions

### 1. Root Cause Analysis
- Document what went wrong
- Identify prevention measures
- Update rollback procedures

### 2. Data Integrity Check
```sql
-- Verify data consistency
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM pets;
SELECT COUNT(*) FROM vaccinations;

-- Check for orphaned records
SELECT * FROM pets WHERE owner_id NOT IN (SELECT id FROM users);
```

### 3. System Health Check
- Monitor error rates
- Check performance metrics
- Verify all endpoints working
- Test user workflows

## Emergency Contacts

- **Database Issues:** [DBA Contact]
- **Infrastructure:** [DevOps Contact]  
- **Application:** [Lead Developer]
- **Business:** [Product Owner]

## Rollback Checklist

- [ ] Backup created and verified
- [ ] Rollback procedure tested in staging
- [ ] Team notified of rollback
- [ ] Users notified (if needed)
- [ ] Rollback executed
- [ ] System health verified
- [ ] Data integrity confirmed
- [ ] Monitoring restored
- [ ] Post-mortem scheduled