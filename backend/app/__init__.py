from flask import Flask
from flask_cors import CORS
from .config import Config
from .db import db

def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///careerconnect.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app, resources={r"/api/*": {"origins": "*"}},supports_credentials=True)
    db.init_app(app)

    from .routes.auth.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    return app