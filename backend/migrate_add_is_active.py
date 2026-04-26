#!/usr/bin/env python
"""
Database migration script to add is_active column to posts table
Run this from the backend directory: python migrate_add_is_active.py
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.db import db
from sqlalchemy import text

def migrate():
    """Add is_active column to posts table"""
    app = create_app()
    
    with app.app_context():
        try:
            # Check if column exists using SQLite pragma
            result = db.session.execute(
                text("PRAGMA table_info(posts)")
            )
            
            columns = [row[1] for row in result]
            if 'is_active' in columns:
                print("✅ Column 'is_active' already exists in posts table")
                return
            
            # Add the column (SQLite syntax)
            print("➕ Adding 'is_active' column to posts table...")
            db.session.execute(
                text("ALTER TABLE posts ADD COLUMN is_active BOOLEAN DEFAULT 1 NOT NULL")
            )
            db.session.commit()
            print("✅ Successfully added 'is_active' column to posts table")
            print("   - Default value: TRUE (1)")
            print("   - All existing posts are now ACTIVE")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error during migration: {str(e)}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

if __name__ == '__main__':
    migrate()
