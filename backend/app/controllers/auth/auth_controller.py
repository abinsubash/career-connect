from flask import Blueprint, request, jsonify
from app.db import db
from app.models.user_model import User
from app.models.otp_model import OTPStore
from app.models.recruiter_model import Recruiter
from flask_bcrypt import Bcrypt
from google.auth.transport import requests as grequests
from google.oauth2 import id_token
from datetime import datetime, timedelta
from app.utils.email_service import generate_otp, send_otp_email
from app.config import Config
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    set_access_cookies,
    unset_jwt_cookies,
    jwt_required,
)
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename
import secrets
import requests
import re
import os

# ── Constants ────────────────────────────────────────────────
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

bcrypt = Bcrypt()

UPLOAD_FOLDER = "uploads/photos"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ── Helpers ──────────────────────────────────────────────────
def _err(msg, status=400):
    return jsonify({"error": msg}), status


def _validate_login(data):
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email:
        raise ValueError("Email is required.")
    if not EMAIL_RE.match(email):
        raise ValueError("Enter a valid email address.")
    if not password:
        raise ValueError("Password is required.")
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters.")

    return email, password


def _validate_register(data):
    name     = (data.get("name") or "").strip()
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    company  = (data.get("company") or "").strip()

    if not name:
        raise ValueError("Full name is required.")
    if len(name) < 2:
        raise ValueError("Name must be at least 2 characters.")
    if not email:
        raise ValueError("Email is required.")
    if not EMAIL_RE.match(email):
        raise ValueError("Enter a valid email address.")
    if not password:
        raise ValueError("Password is required.")
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters.")

    return {
        "name":       name,
        "email":      email,
        "password":   password,
        "company":    company or None,
        "website":    (data.get("website") or "").strip() or None,
        "size":       (data.get("size") or "").strip() or None,
        "role":       (data.get("role") or "").strip() or None,
        "department": (data.get("department") or "").strip() or None,
    }


# ── User Auth ─────────────────────────────────────────────────
def register():
    data = request.json
    full_name = f"{data.get('firstName', '')} {data.get('lastName', '')}".strip()

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already registered"}), 409

    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    new_user = User(
        name=full_name,
        email=data["email"],
        password=hashed_pw,
        phone=data.get("phone"),
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201


def delete_all_users():
    User.query.delete()
    db.session.commit()
    return jsonify({"message": "All users deleted successfully"})


def google_signup():
    data = request.get_json()
    token = data.get("token")

    if not token:
        return jsonify({"error": "Token missing"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            grequests.Request(),
            "1074816357514-q45pvn5ar592gd4paj6cr3pe6od7e2m4.apps.googleusercontent.com"
        )

        email = idinfo.get("email")
        name  = idinfo.get("name")

        if not email:
            return jsonify({"error": "Email not found in Google token"}), 400

        user = User.query.filter_by(email=email).first()
        if user:
            return jsonify({
                "message": "User already exists",
                "user": {"id": user.id, "email": user.email, "name": user.name}
            }), 200

        new_user = User(name=name, email=email, password=None)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "Google signup successful",
            "user": {"id": new_user.id, "email": new_user.email, "name": new_user.name}
        }), 201

    except ValueError as ve:
        return jsonify({"error": f"Invalid Google token: {str(ve)}"}), 401
    except Exception as e:
        return jsonify({"error": f"Authentication error: {str(e)}"}), 500


def google_callback():
    data = request.get_json()
    code = data.get("code")

    if not code:
        return jsonify({"error": "Authorization code missing"}), 400

    try:
        token_response = requests.post("https://oauth2.googleapis.com/token", data={
            "code":          code,
            "client_id":     Config.GOOGLE_CLIENT_ID,
            "client_secret": Config.GOOGLE_CLIENT_SECRET,
            "redirect_uri":  "postmessage",
            "grant_type":    "authorization_code",
        })
        print("Google token response:", token_response.status_code, token_response.text)
        token_response.raise_for_status()

        access_token = token_response.json().get("access_token")
        if not access_token:
            return jsonify({"error": "Failed to obtain access token"}), 400

        userinfo = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        ).json()

        email       = userinfo.get("email")
        given_name  = userinfo.get("given_name", "")
        family_name = userinfo.get("family_name", "")
        picture     = userinfo.get("picture", "")

        if not email:
            return jsonify({"error": "Email not found"}), 400

        token = secrets.token_urlsafe(32)
        user  = User.query.filter_by(email=email).first()

        if user:
            return jsonify({
                "firstName": user.name.split()[0] if " " in user.name else user.name,
                "lastName":  user.name.split()[-1] if " " in user.name else "",
                "email":     user.email,
                "avatar":    picture,
                "token":     token,
            }), 200

        new_user = User(
            name=f"{given_name} {family_name}".strip(),
            email=email,
            password=None,
            is_verified=True,
        )
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "firstName": given_name,
            "lastName":  family_name,
            "email":     email,
            "avatar":    picture,
            "token":     token,
        }), 201

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to exchange code: {str(e)}"}), 400
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": f"Authentication error: {str(e)}"}), 500


def send_otp():
    data  = request.json
    name  = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    hashed_pw  = bcrypt.generate_password_hash(password).decode("utf-8")
    otp        = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    OTPStore.query.filter_by(email=email).delete()
    db.session.add(OTPStore(
        email=email, otp=otp, name=name,
        hashed_password=hashed_pw, expires_at=expires_at
    ))
    db.session.commit()

    try:
        send_otp_email(email, otp, name)
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500

    return jsonify({"message": "OTP sent successfully"}), 200


def verify_otp():
    data  = request.json
    email = data.get("email")
    otp   = data.get("otp")

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    record = OTPStore.query.filter_by(email=email, otp=otp).first()
    if not record:
        return jsonify({"error": "Invalid OTP"}), 400

    if datetime.utcnow() > record.expires_at:
        db.session.delete(record)
        db.session.commit()
        return jsonify({"error": "OTP has expired. Please request a new one."}), 400

    db.session.add(User(
        name=record.name,
        email=record.email,
        password=record.hashed_password,
        is_verified=True,
    ))
    db.session.delete(record)
    db.session.commit()

    return jsonify({"message": "Email verified! Account created successfully."}), 201


def resend_otp():
    email  = (request.json or {}).get("email")
    record = OTPStore.query.filter_by(email=email).first()

    if not record:
        return jsonify({"error": "No pending signup for this email"}), 404

    record.otp        = generate_otp()
    record.expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.session.commit()

    try:
        send_otp_email(email, record.otp, record.name)
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500

    return jsonify({"message": "OTP resent successfully"}), 200


def onboarding():
    email = request.form.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.headline         = request.form.get("headline")
    user.dob              = request.form.get("dob")
    user.gender           = request.form.get("gender")
    user.city             = request.form.get("city")
    user.state            = request.form.get("state")
    user.country          = request.form.get("country")
    user.avatar           = request.form.get("avatar")
    user.job_title        = request.form.get("jobTitle")
    user.experience_level = request.form.get("experienceLevel")
    user.skills           = request.form.get("skills")
    user.preferred_role     = request.form.get("preferredRole")
    user.preferred_location = request.form.get("preferredLocation")
    user.expected_salary    = request.form.get("expectedSalary")

    photo = request.files.get("photo")
    if photo:
        filename = secure_filename(f"{user.id}_{photo.filename}")
        path = os.path.join(UPLOAD_FOLDER, filename)
        photo.save(path)
        user.photo = path

    db.session.commit()
    return jsonify({"message": "Profile completed successfully"}), 200


# ── User Profile Operations ───────────────────────────────────
def get_profile():
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user.to_dict()), 200


def update_profile():
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Update allowed fields
    if "name" in data:
        user.name = data.get("name", "").strip()
    if "phone" in data:
        user.phone = data.get("phone", "").strip()
    if "headline" in data:
        user.headline = data.get("headline", "").strip()
    if "job_title" in data:
        user.job_title = data.get("job_title", "").strip()
    if "city" in data:
        user.city = data.get("city", "").strip()
    if "state" in data:
        user.state = data.get("state", "").strip()
    if "country" in data:
        user.country = data.get("country", "").strip()
    if "experience_level" in data:
        user.experience_level = data.get("experience_level", "").strip()
    if "skills" in data:
        user.skills = data.get("skills", "").strip()
    if "preferred_role" in data:
        user.preferred_role = data.get("preferred_role", "").strip()
    if "preferred_location" in data:
        user.preferred_location = data.get("preferred_location", "").strip()
    if "expected_salary" in data:
        user.expected_salary = data.get("expected_salary", "").strip()

    try:
        db.session.commit()
        return jsonify({
            "message": "Profile updated successfully",
            "user": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update profile: {str(e)}"}), 500


# ── Recruiter Auth ────────────────────────────────────────────
def recruiter_signup():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name     = data.get("name")
    email    = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"error": "Name, email and password are required"}), 400

    if Recruiter.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 409

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
    recruiter = Recruiter(
        name=name, email=email, password=hashed_pw,
        company=data.get("company"), website=data.get("website"),
        size=data.get("size"), role=data.get("role"),
        department=data.get("department"),
    )
    db.session.add(recruiter)
    db.session.commit()

    # PyJWT requires identity to be a string for proper JWT encoding
    token = create_access_token(
        identity=str(recruiter.id),
        additional_claims={"role": "recruiter"},
        expires_delta=timedelta(days=7),
    )

    resp = jsonify({
        "message": "Recruiter registered successfully",
        "token": token,
        "recruiter": {
            "id":      recruiter.id,
            "name":    recruiter.name,
            "email":   recruiter.email,
            "company": recruiter.company,
        },
    })
    set_access_cookies(resp, token)
    return resp, 201

def user_login():
    data = request.get_json(silent=True) or {}
    try:
        email, password = _validate_login(data)
    except ValueError as exc:
        return _err(str(exc), 422)

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return _err("Incorrect email or password.", 401)

    # PyJWT requires identity to be a string for proper JWT encoding
    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": "user"},
        expires_delta=timedelta(days=7),
    )
    resp = jsonify({
        "message": "Login successful.",
        "token": token,
        "user": {
            "id":    user.id,
            "name":  user.name,
            "email": user.email,
        },
    })
    set_access_cookies(resp, token)
    return resp, 200


def login():
    data = request.get_json(silent=True) or {}
    try:
        email, password = _validate_login(data)
    except ValueError as exc:
        return _err(str(exc), 422)

    recruiter = Recruiter.query.filter_by(email=email).first()
    if not recruiter or not bcrypt.check_password_hash(recruiter.password, password):
        return _err("Incorrect email or password.", 401)

    # PyJWT requires identity to be a string for proper JWT encoding
    token = create_access_token(
        identity=str(recruiter.id),
        additional_claims={"role": "recruiter"},
        expires_delta=timedelta(days=7),
    )
    resp = jsonify({
        "message": "Login successful.",
        "token": token,
        "recruiter": {
            "id":      recruiter.id,
            "name":    recruiter.name,
            "email":   recruiter.email,
            "company": recruiter.company,
        },
    })
    set_access_cookies(resp, token)
    return resp, 200


def logout():
    resp = jsonify({"message": "Logged out."})
    unset_jwt_cookies(resp)
    return resp, 200


def me():
    recruiter_id = int(get_jwt_identity())
    recruiter    = Recruiter.query.get_or_404(recruiter_id)
    return jsonify({
        "id":         recruiter.id,
        "name":       recruiter.name,
        "email":      recruiter.email,
        "company":    recruiter.company,
        "website":    recruiter.website,
        "size":       recruiter.size,
        "role":       recruiter.role,
        "department": recruiter.department,
    }), 200