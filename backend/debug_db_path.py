#!/usr/bin/env python
"""Debug database path and creation"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app import create_app
from app.db import db

app = create_app()

print(f"🔍 Database configuration:")
print(f"   SQLALCHEMY_DATABASE_URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
print(f"   Instance path: {app.instance_path}")
print(f"   Current working directory: {Path.cwd()}")

with app.app_context():
    print(f"\n🔧 Creating tables...")
    db.create_all()
    
    # Check the actual database file location
    import sqlite3
    from pathlib import Path
    # Try different possible locations
    possible_paths = [
        Path.cwd() / "instance" / "careerconnect.db",
        Path.cwd() / "careerconnect.db",
        Path(__file__).parent / "instance" / "careerconnect.db",
        Path(__file__).parent / "careerconnect.db",
        Path(app.instance_path) / "careerconnect.db" if hasattr(app, 'instance_path') else None,
    ]
    
    print(f"\n🔎 Checking for database file at:")
    for path in possible_paths:
        if path is None:
            continue
        exists = path.exists() if path else False
        print(f"   {path}: {'✅ EXISTS' if exists else '❌ NOT FOUND'}")
        if exists:
            print(f"      Size: {path.stat().st_size} bytes")
