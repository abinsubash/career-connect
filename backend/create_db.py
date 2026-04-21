#!/usr/bin/env python
"""
Direct database creation - bypasses app context complications
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

# Delete old database
db_path = Path(__file__).parent / "instance" / "careerconnect.db"
if db_path.exists():
    os.remove(str(db_path))
    print(f"✅ Deleted old database")

# Explicit imports in correct order
from app.db import db
from app.models.recruiter_model import Recruiter
from app.models.user_model import User
from app.models.job_model import Job
from app.models.application_model import Application
from app.models.otp_model import OTPStore

# Create app context
from app import create_app
app = create_app()

print("\n🔧 Creating database tables...")
with app.app_context():
    print(f"📋 Models registered in db.metadata:")
    for table_name in db.metadata.tables:
        print(f"   - {table_name}")
        table = db.metadata.tables[table_name]
        for col in table.columns:
            print(f"     └─ {col.name} ({col.type})")
    
    print(f"\n📝 Creating all tables...")
    db.create_all()
    print(f"✅ Tables created!")

# Verify with direct sqlite3 query
import sqlite3
if db_path.exists():
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    print(f"\n✅ Created tables in {db_path}:")
    for table in tables:
        print(f"   - {table[0]}")
        cursor.execute(f"PRAGMA table_info({table[0]})")
        cols = cursor.fetchall()
        for col in cols:
            print(f"     └─ {col[1]} ({col[2]})")
    conn.close()
else:
    print(f"❌ Database file not found at {db_path}")
