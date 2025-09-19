#!/usr/bin/env python3
"""
SQLite to NeonDB Migration Script

This script migrates data from the existing SQLite database to NeonDB (PostgreSQL).
It handles the schema differences and provides options for different migration strategies.

Usage:
    python sqlite_to_neon_migration.py --sqlite-path ./pawpilot.db --neon-url "postgresql://..."
"""

import argparse
import sqlite3
import psycopg2
import csv
import os
import sys
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SQLiteToNeonMigrator:
    def __init__(self, sqlite_path, neon_url):
        self.sqlite_path = sqlite_path
        self.neon_url = neon_url
        self.sqlite_conn = None
        self.neon_conn = None
        
    def connect_databases(self):
        """Connect to both SQLite and NeonDB"""
        try:
            self.sqlite_conn = sqlite3.connect(self.sqlite_path)
            self.sqlite_conn.row_factory = sqlite3.Row  # Enable column access by name
            logger.info(f"Connected to SQLite database: {self.sqlite_path}")
            
            self.neon_conn = psycopg2.connect(self.neon_url)
            logger.info("Connected to NeonDB")
            
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            sys.exit(1)
    
    def close_connections(self):
        """Close database connections"""
        if self.sqlite_conn:
            self.sqlite_conn.close()
        if self.neon_conn:
            self.neon_conn.close()
    
    def export_to_csv(self, output_dir="migration_data"):
        """Export SQLite data to CSV files"""
        os.makedirs(output_dir, exist_ok=True)
        
        tables = ['users', 'pets', 'vaccinations']
        
        for table in tables:
            try:
                cursor = self.sqlite_conn.cursor()
                cursor.execute(f"SELECT * FROM {table}")
                rows = cursor.fetchall()
                
                if rows:
                    # Get column names
                    columns = [description[0] for description in cursor.description]
                    
                    # Write to CSV
                    csv_path = os.path.join(output_dir, f"{table}.csv")
                    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
                        writer = csv.writer(csvfile)
                        writer.writerow(columns)  # Header
                        writer.writerows(rows)
                    
                    logger.info(f"Exported {len(rows)} rows from {table} to {csv_path}")
                else:
                    logger.info(f"No data found in {table}")
                    
            except Exception as e:
                logger.error(f"Failed to export {table}: {e}")
    
    def import_from_csv(self, input_dir="migration_data"):
        """Import CSV data to NeonDB"""
        cursor = self.neon_conn.cursor()
        
        # Import users
        users_csv = os.path.join(input_dir, "users.csv")
        if os.path.exists(users_csv):
            try:
                with open(users_csv, 'r', encoding='utf-8') as f:
                    cursor.copy_expert(
                        "COPY users(id, email, hashed_password) FROM STDIN WITH CSV HEADER",
                        f
                    )
                logger.info("Imported users data")
            except Exception as e:
                logger.error(f"Failed to import users: {e}")
        
        # Import pets
        pets_csv = os.path.join(input_dir, "pets.csv")
        if os.path.exists(pets_csv):
            try:
                with open(pets_csv, 'r', encoding='utf-8') as f:
                    cursor.copy_expert(
                        "COPY pets(id, name, breed, age, weight, owner_id) FROM STDIN WITH CSV HEADER",
                        f
                    )
                logger.info("Imported pets data")
            except Exception as e:
                logger.error(f"Failed to import pets: {e}")
        
        # Import vaccinations
        vaccinations_csv = os.path.join(input_dir, "vaccinations.csv")
        if os.path.exists(vaccinations_csv):
            try:
                with open(vaccinations_csv, 'r', encoding='utf-8') as f:
                    cursor.copy_expert(
                        "COPY vaccinations(id, vaccine_name, date_given, due_date, pet_id) FROM STDIN WITH CSV HEADER",
                        f
                    )
                logger.info("Imported vaccinations data")
            except Exception as e:
                logger.error(f"Failed to import vaccinations: {e}")
        
        self.neon_conn.commit()
    
    def direct_migration(self):
        """Direct migration from SQLite to NeonDB"""
        sqlite_cursor = self.sqlite_conn.cursor()
        neon_cursor = self.neon_conn.cursor()
        
        # Migrate users
        try:
            sqlite_cursor.execute("SELECT id, email, hashed_password FROM users")
            users = sqlite_cursor.fetchall()
            
            for user in users:
                # Generate temporary Firebase UID for existing users
                temp_firebase_uid = f"migrated-user-{user[0]}"
                neon_cursor.execute(
                    "INSERT INTO users (firebase_uid, email, hashed_password) VALUES (%s, %s, %s)",
                    (temp_firebase_uid, user[1], user[2])
                )
            
            logger.info(f"Migrated {len(users)} users")
        except Exception as e:
            logger.error(f"Failed to migrate users: {e}")
        
        # Migrate pets
        try:
            sqlite_cursor.execute("SELECT name, breed, age, weight, owner_id FROM pets")
            pets = sqlite_cursor.fetchall()
            
            for pet in pets:
                neon_cursor.execute(
                    "INSERT INTO pets (name, breed, age, weight, owner_id) VALUES (%s, %s, %s, %s, %s)",
                    pet
                )
            
            logger.info(f"Migrated {len(pets)} pets")
        except Exception as e:
            logger.error(f"Failed to migrate pets: {e}")
        
        # Migrate vaccinations
        try:
            sqlite_cursor.execute("SELECT vaccine_name, date_given, due_date, pet_id FROM vaccinations")
            vaccinations = sqlite_cursor.fetchall()
            
            for vaccination in vaccinations:
                neon_cursor.execute(
                    "INSERT INTO vaccinations (vaccine_name, date_given, due_date, pet_id) VALUES (%s, %s, %s, %s)",
                    vaccination
                )
            
            logger.info(f"Migrated {len(vaccinations)} vaccinations")
        except Exception as e:
            logger.error(f"Failed to migrate vaccinations: {e}")
        
        self.neon_conn.commit()
    
    def verify_migration(self):
        """Verify that migration was successful"""
        sqlite_cursor = self.sqlite_conn.cursor()
        neon_cursor = self.neon_conn.cursor()
        
        tables = ['users', 'pets', 'vaccinations']
        
        for table in tables:
            # Count rows in SQLite
            sqlite_cursor.execute(f"SELECT COUNT(*) FROM {table}")
            sqlite_count = sqlite_cursor.fetchone()[0]
            
            # Count rows in NeonDB
            neon_cursor.execute(f"SELECT COUNT(*) FROM {table}")
            neon_count = neon_cursor.fetchone()[0]
            
            logger.info(f"{table}: SQLite={sqlite_count}, NeonDB={neon_count}")
            
            if sqlite_count != neon_count:
                logger.warning(f"Row count mismatch for {table}!")
            else:
                logger.info(f"✓ {table} migration verified")

def main():
    parser = argparse.ArgumentParser(description='Migrate SQLite data to NeonDB')
    parser.add_argument('--sqlite-path', required=True, help='Path to SQLite database file')
    parser.add_argument('--neon-url', required=True, help='NeonDB connection URL')
    parser.add_argument('--method', choices=['csv', 'direct'], default='csv', 
                       help='Migration method: csv (export/import) or direct')
    parser.add_argument('--csv-dir', default='migration_data', help='Directory for CSV files')
    parser.add_argument('--verify', action='store_true', help='Verify migration after completion')
    
    args = parser.parse_args()
    
    # Validate inputs
    if not os.path.exists(args.sqlite_path):
        logger.error(f"SQLite database not found: {args.sqlite_path}")
        sys.exit(1)
    
    migrator = SQLiteToNeonMigrator(args.sqlite_path, args.neon_url)
    
    try:
        migrator.connect_databases()
        
        if args.method == 'csv':
            logger.info("Starting CSV-based migration...")
            migrator.export_to_csv(args.csv_dir)
            migrator.import_from_csv(args.csv_dir)
        else:
            logger.info("Starting direct migration...")
            migrator.direct_migration()
        
        if args.verify:
            logger.info("Verifying migration...")
            migrator.verify_migration()
        
        logger.info("Migration completed successfully!")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)
    
    finally:
        migrator.close_connections()

if __name__ == "__main__":
    main()