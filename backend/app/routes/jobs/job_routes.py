from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.jobs.job_controller import (
    create_job,
    get_my_jobs,
    get_job,
    update_job,
    delete_job,
    get_job_applicants,
    update_application_status,
    download_resume,
    get_all_jobs,
    get_user_jobs,
    apply_for_job,
    get_user_applications,
)

job_routes = Blueprint("jobs", __name__, url_prefix="/api/jobs")

# ── Public Job Browsing (No Auth) ────────────────────────────────────
@job_routes.route("/all", methods=["GET"])
def route_get_all_jobs():
    return get_all_jobs()

@job_routes.route("/user/<int:recruiter_id>", methods=["GET"])
def route_get_user_jobs(recruiter_id):
    return get_user_jobs(recruiter_id)

# ── Recruiter Job Management ──────────────────────────────────────────
@job_routes.route("", methods=["POST"])
@jwt_required()
def route_create_job():
    return create_job()

@job_routes.route("", methods=["GET"])
@jwt_required()
def route_get_my_jobs():
    return get_my_jobs()

@job_routes.route("/<int:job_id>", methods=["GET"])
@jwt_required()
def route_get_job(job_id):
    return get_job(job_id)

@job_routes.route("/<int:job_id>", methods=["PUT"])
@jwt_required()
def route_update_job(job_id):
    return update_job(job_id)

@job_routes.route("/<int:job_id>", methods=["DELETE"])
@jwt_required()
def route_delete_job(job_id):
    return delete_job(job_id)

# ── Recruiter Applicant Management ───────────────────────────────────
@job_routes.route("/<int:job_id>/applicants", methods=["GET"])
@jwt_required()
def route_get_job_applicants(job_id):
    return get_job_applicants(job_id)

@job_routes.route("/<int:job_id>/applicants/<int:application_id>/status", methods=["PUT"])
@jwt_required()
def route_update_application_status(job_id, application_id):
    return update_application_status(job_id, application_id)

@job_routes.route("/<int:job_id>/applicants/<int:application_id>/resume", methods=["GET"])
@jwt_required()
def route_download_resume(job_id, application_id):
    return download_resume(job_id, application_id)

# ── User Job Applications ─────────────────────────────────────────────
@job_routes.route("/<int:job_id>/apply", methods=["POST"])
@jwt_required()
def route_apply_for_job(job_id):
    return apply_for_job(job_id)

@job_routes.route("/user/applications", methods=["GET"])
@jwt_required()
def route_get_user_applications():
    return get_user_applications()
