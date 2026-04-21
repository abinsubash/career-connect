import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # ✅ Use a proper 32+ character secret for JWT
    SECRET_KEY = os.getenv("SECRET_KEY") or "my-super-secret-key-that-is-long-enough-for-jwt-256-bit"

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///careerconnect.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")