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
    apply_for_job,
    get_user_applications,
)

job_routes = Blueprint("jobs", __name__, url_prefix="/api/jobs")

# ── Public Job Browsing (No Auth) ────────────────────────────────────
job_routes.route("/all", methods=["GET"])(get_all_jobs)

# ── Recruiter Job Management ──────────────────────────────────────────
job_routes.route("",                methods=["POST"])(jwt_required()(create_job))
job_routes.route("",                methods=["GET"])(jwt_required()(get_my_jobs))
job_routes.route("/<int:job_id>",   methods=["GET"])(jwt_required()(get_job))
job_routes.route("/<int:job_id>",   methods=["PUT"])(jwt_required()(update_job))
job_routes.route("/<int:job_id>",   methods=["DELETE"])(jwt_required()(delete_job))

# ── Recruiter Applicant Management ───────────────────────────────────
job_routes.route("/<int:job_id>/applicants", methods=["GET"])(jwt_required()(get_job_applicants))
job_routes.route("/<int:job_id>/applicants/<int:application_id>/status",          methods=["PUT"])(jwt_required()(update_application_status))
job_routes.route("/<int:job_id>/applicants/<int:application_id>/resume",          methods=["GET"])(jwt_required()(download_resume))

# ── User Job Applications ─────────────────────────────────────────────
job_routes.route("/<int:job_id>/apply", methods=["POST"])(jwt_required()(apply_for_job))
job_routes.route("/user/applications",  methods=["GET"])(jwt_required()(get_user_applications))
