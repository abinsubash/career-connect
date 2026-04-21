from flask import Blueprint, request
from app.controllers.auth.auth_controller import (
    register, delete_all_users, google_signup, google_callback,
    send_otp, verify_otp, resend_otp, onboarding, recruiter_signup,
    user_login, login, logout, me, get_profile, update_profile
)
from flask_jwt_extended import jwt_required

auth_bp = Blueprint("auth", __name__)

# ── User routes ──────────────────────────────────────────────
auth_bp.route("/auth/signup",          methods=["POST"])(register)
auth_bp.route("/auth/login",           methods=["POST"])(user_login)
auth_bp.route("/auth/delete_all_users",methods=["GET"])(delete_all_users)
auth_bp.route("/auth/googleSignup",    methods=["POST"])(google_signup)
auth_bp.route("/auth/google-callback", methods=["POST"])(google_callback)
auth_bp.route("/auth/send-otp",        methods=["POST"])(send_otp)
auth_bp.route("/auth/verify-otp",      methods=["POST"])(verify_otp)
auth_bp.route("/auth/resend-otp",      methods=["POST"])(resend_otp)
auth_bp.route("/auth/onboarding",      methods=["POST"])(onboarding)

# Profile endpoint - handle both GET and PUT on the same route
def profile_route():
    if request.method == "GET":
        return get_profile()
    elif request.method == "PUT":
        return update_profile()

auth_bp.add_url_rule("/auth/profile", "profile", jwt_required()(profile_route), methods=["GET", "PUT"])

# ── Recruiter routes ─────────────────────────────────────────
auth_bp.route("/auth/recruiter/signup", methods=["POST"])(recruiter_signup)
auth_bp.route("/auth/recruiter/login",  methods=["POST"])(login)
auth_bp.route("/auth/recruiter/logout", methods=["POST"])(logout)

# /me is protected — wrap it with jwt_required before registering
auth_bp.route("/auth/recruiter/me", methods=["GET"])(jwt_required()(me))