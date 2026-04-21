"""
Database Reset Script
Removes old database and recreates it with new schema
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

def reset_database():
    """Reset the database by removing old file and creating new schema"""
    db_path = Path(__file__).parent / "instance" / "careerconnect.db"
    
    print(f"🔍 Checking database at: {db_path}")
    
    # Try to remove the database file
    if db_path.exists():
        try:
            os.remove(str(db_path))
            print(f"✅ Old database deleted: {db_path}")
        except PermissionError:
            print(f"⚠️  Could not delete database (locked). Close all backend servers and try again.")
            return False
        except Exception as e:
            print(f"❌ Error deleting database: {e}")
            return False
    else:
        print(f"ℹ️  Database file not found (will be created)")
    
    # Create new database with updated schema
    print("\n📦 Creating new database with updated schema...")
    try:
        from app import create_app
        from app.db import db
        
        app = create_app()
        with app.app_context():
            # Debug: print registered models
            print(f"📋 Registered models before create_all():")
            for table in db.metadata.tables:
                print(f"   - {table}")
            
            db.create_all()
            
            # Debug: verify tables were created
            import sqlite3
            db_file = Path(__file__).parent / "instance" / "careerconnect.db"
            if db_file.exists():
                sqlite_conn = sqlite3.connect(str(db_file))
                cursor = sqlite_conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = cursor.fetchall()
                print(f"\n📋 Tables created in database:")
                for table in tables:
                    print(f"   - {table[0]}")
                sqlite_conn.close()
            
            print("✅ Database created with new schema!")
            return True
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = reset_database()
    sys.exit(0 if success else 1)
