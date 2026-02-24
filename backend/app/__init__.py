from flask import Flask
from flask_cors import CORS
from .config import Config
from .db import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(config)


    CORS(app)
    db.init_app(app)

    from .routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp,url_prefix="/api/auth")
    
    return app