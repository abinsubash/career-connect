#!/usr/bin/env python
"""Force database creation with explicit SQLite connection"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

db_file = Path(__file__).parent / "instance" / "careerconnect.db"

# Delete old file
if db_file.exists():
    db_file.unlink()
    print(f"✅ Deleted old database")

# Create the directory if it doesn't exist
db_file.parent.mkdir(parents=True, exist_ok=True)

# Create app and get SQLAlchemy connection
from app import create_app
from app.db import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print(f"📋 Models registered:")
    for table in db.metadata.tables:
        print(f"   - {table}")
    
    print(f"\n🔧 Creating all database tables...")
    db.create_all()
    
    # Force a write to ensure file is created using SQLAlchemy transaction
    with db.engine.begin() as conn:
        # Test that tables exist
        inspector_result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = inspector_result.fetchall()
        print(f"\n✅ Tables created in SQLAlchemy:")
        for table in tables:
            print(f"   - {table[0]}")
        # Transaction auto-commits on context exit

# Verify file exists
if db_file.exists():
    print(f"\n✅ Database file created: {db_file}")
    print(f"   Size: {db_file.stat().st_size} bytes")
else:
    print(f"\n❌ Database file still not found at {db_file}")
