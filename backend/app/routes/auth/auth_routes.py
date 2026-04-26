from flask import Blueprint, request
from app.controllers.auth.auth_controller import (
    register, delete_all_users, google_signup, google_callback,
    send_otp, verify_otp, resend_otp, onboarding, recruiter_signup,
    user_login, login, logout, me, get_profile, update_profile
)
from flask_jwt_extended import jwt_required

auth_bp = Blueprint("auth", __name__)

# ── User routes ──────────────────────────────────────────────
@auth_bp.route("/auth/signup", methods=["POST"])
def route_register():
    return register()

@auth_bp.route("/auth/login", methods=["POST"])
def route_user_login():
    return user_login()

@auth_bp.route("/auth/delete_all_users", methods=["GET"])
def route_delete_all_users():
    return delete_all_users()

@auth_bp.route("/auth/googleSignup", methods=["POST"])
def route_google_signup():
    return google_signup()

@auth_bp.route("/auth/google-callback", methods=["POST"])
def route_google_callback():
    return google_callback()

@auth_bp.route("/auth/send-otp", methods=["POST"])
def route_send_otp():
    return send_otp()

@auth_bp.route("/auth/verify-otp", methods=["POST"])
def route_verify_otp():
    return verify_otp()

@auth_bp.route("/auth/resend-otp", methods=["POST"])
def route_resend_otp():
    return resend_otp()

@auth_bp.route("/auth/onboarding", methods=["POST"])
def route_onboarding():
    return onboarding()

# Profile endpoint - handle both GET and PUT on the same route
@auth_bp.route("/auth/profile", methods=["GET", "PUT"])
@jwt_required()
def route_profile():
    if request.method == "GET":
        return get_profile()
    elif request.method == "PUT":
        return update_profile()

# ── Recruiter routes ─────────────────────────────────────────
@auth_bp.route("/auth/recruiter/signup", methods=["POST"])
def route_recruiter_signup():
    return recruiter_signup()

@auth_bp.route("/auth/recruiter/login", methods=["POST"])
def route_recruiter_login():
    return login()

@auth_bp.route("/auth/recruiter/logout", methods=["POST"])
def route_recruiter_logout():
    return logout()

# /me is protected
@auth_bp.route("/auth/recruiter/me", methods=["GET"])
@jwt_required()
def route_recruiter_me():
    return me()