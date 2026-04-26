from flask import Flask, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config
from .db import db
import os

def create_app():
    app = Flask(__name__, instance_path=os.path.join(os.path.dirname(__file__), '..', 'instance'))

    app.config.from_object(Config)

    # Use absolute path for database
    db_path = os.path.join(app.instance_path, 'careerconnect.db')
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # ──────────────────────────────────────────────────────────────────────────
    # FILE UPLOAD CONFIGURATION
    # ──────────────────────────────────────────────────────────────────────────
    UPLOADS_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'resumes')
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    
    app.config["UPLOAD_FOLDER"] = UPLOADS_DIR
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB max file size
    app.config["ALLOWED_EXTENSIONS"] = {'pdf', 'doc', 'docx'}  # Allowed resume file types
    
    # ──────────────────────────────────────────────────────────────────────────
    
    # JWT Configuration - use the same secret key as config
    app.config["JWT_SECRET_KEY"] = Config.SECRET_KEY
    app.config["JWT_TOKEN_LOCATION"] = ["cookies", "headers"]  # Accept from both cookies and headers
    app.config["JWT_COOKIE_NAME"] = "access_token_cookie"  # Explicit cookie name
    app.config["JWT_HEADER_NAME"] = "Authorization"  # Accept Authorization header
    app.config["JWT_HEADER_TYPE"] = "Bearer"  # Expect "Bearer <token>"
    app.config["JWT_COOKIE_SECURE"] = False  # Set True in production with HTTPS
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False
    app.config["JWT_COOKIE_SAMESITE"] = "Lax"
    app.config["JWT_COOKIE_PATH"] = "/"  # Ensure cookie available for all paths
    app.config["JWT_COOKIE_DOMAIN"] = None  # Allow all subdomains on localhost
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False  # Allow non-expiring tokens for dev

    # CORS Configuration - allow specific origins in development
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ["http://127.0.0.1:5173", "http://localhost:5173"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "expose_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
                "max_age": 3600,
            },
            r"/uploads/*": {
                "origins": ["http://127.0.0.1:5173", "http://localhost:5173"],
                "methods": ["GET", "OPTIONS"],
                "allow_headers": ["Content-Type"],
                "max_age": 3600,
            }
        },
    )
    db.init_app(app)
    jwt = JWTManager(app)

    # JWT Error Handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        print(f"DEBUG: Unauthorized error: {error}")  # DEBUG
        return jsonify({"error": "Missing or invalid authorization token"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"DEBUG: Invalid token error: {error}")  # DEBUG
        return jsonify({"error": "Invalid token"}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print(f"DEBUG: Token expired")  # DEBUG
        return jsonify({"error": "Token has expired"}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        print(f"DEBUG: Token revoked")  # DEBUG
        return jsonify({"error": "Token has been revoked"}), 401

    # Route to serve uploaded images
    @app.route('/uploads/posts/<filename>', methods=['GET'])
    def serve_post_image(filename):
        """Serve uploaded post images"""
        try:
            print(f"\n📸 Serving image: {filename}")
            
            uploads_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'posts')
            uploads_dir = os.path.normpath(os.path.abspath(uploads_dir))
            filepath = os.path.normpath(os.path.abspath(os.path.join(uploads_dir, filename)))
            
            print(f"   Path: {filepath}")
            
            # Security check
            uploads_dir_with_sep = uploads_dir + os.sep
            if not filepath.startswith(uploads_dir_with_sep) and filepath != uploads_dir:
                print(f"⚠️  Invalid path")
                return {'error': 'Invalid file path'}, 403
            
            if not os.path.exists(filepath):
                print(f"⚠️  File not found")
                return {'error': 'Image not found'}, 404
            
            # Read and return file
            with open(filepath, 'rb') as f:
                data = f.read()
            
            print(f"✅ Served {len(data)} bytes")
            return data, 200, {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=86400'
            }
        
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500

    # Import models to register them
    from .models.recruiter_model import Recruiter
    from .models.user_model import User
    from .models.job_model import Job
    from .models.application_model import Application
    from .models.otp_model import OTPStore
    from .models.post_model import Post, PostLike

    from .routes.auth.auth_routes import auth_bp
    from .routes.jobs.job_routes import job_routes
    from .routes.posts.post_routes import post_routes
    
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(job_routes)
    app.register_blueprint(post_routes)

    return app