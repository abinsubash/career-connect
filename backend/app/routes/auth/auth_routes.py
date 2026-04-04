from flask import Blueprint
from app.controllers.auth.auth_controller import (
    register, delete_all_users, google_signup, google_callback,
    send_otp, verify_otp, resend_otp, onboarding, recruiter_signup,
    login, logout, me
)
from flask_jwt_extended import jwt_required

auth_bp = Blueprint("auth", __name__)

# ── User routes ──────────────────────────────────────────────
auth_bp.route("/signup",          methods=["POST"])(register)
auth_bp.route("/delete_all_users",methods=["GET"])(delete_all_users)
auth_bp.route("/googleSignup",    methods=["POST"])(google_signup)
auth_bp.route("/google-callback", methods=["POST"])(google_callback)
auth_bp.route("/send-otp",        methods=["POST"])(send_otp)
auth_bp.route("/verify-otp",      methods=["POST"])(verify_otp)
auth_bp.route("/resend-otp",      methods=["POST"])(resend_otp)
auth_bp.route("/onboarding",      methods=["POST"])(onboarding)

# ── Recruiter routes ─────────────────────────────────────────
auth_bp.route("/recruiter/signup", methods=["POST"])(recruiter_signup)
auth_bp.route("/recruiter/login",  methods=["POST"])(login)
auth_bp.route("/recruiter/logout", methods=["POST"])(logout)

# /me is protected — wrap it with jwt_required before registering
auth_bp.route("/recruiter/me", methods=["GET"])(jwt_required()(me))