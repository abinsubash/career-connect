import os
class Config:
    SECRET_KEY = "secret123"
    SQLALCHEMY_DATABASE_URI = "sqlite:///careerconnect.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False