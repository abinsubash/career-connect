from flask import request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity
from app.db import db
from app.models.job_model import Job
from app.models.recruiter_model import Recruiter
from app.models.user_model import User
from app.models.application_model import Application
from datetime import datetime
from werkzeug.utils import secure_filename
import os


# ── Helpers ───────────────────────────────────────────────────────────

def _get_recruiter_id():
    """
    Always returns recruiter_id as int.
    JWT identity is stored as int(recruiter.id) in auth controller.
    """
    try:
        identity = get_jwt_identity()
        recruiter_id = int(identity)
        print(f"DEBUG: JWT identity: {identity}, recruiter_id: {recruiter_id}")  # DEBUG
        return recruiter_id
    except Exception as e:
        print(f"DEBUG: Error getting recruiter_id: {e}")  # DEBUG
        raise


def _validate_job_fields(data, partial=False):
    """
    Validate job fields.
    partial=False  → all required fields must be present (create)
    partial=True   → only validate fields that are present in data (update)
    """
    errors = {}

    # title
    if not partial or "title" in data:
        title = data.get("title", "")
        if not title or not str(title).strip():
            errors["title"] = "Job title is required"
        elif len(title) > 200:
            errors["title"] = "Job title must be under 200 characters"

    # department
    if not partial or "department" in data:
        if not data.get("department") or not str(data["department"]).strip():
            errors["department"] = "Department is required"

    # type
    if not partial or "type" in data:
        valid_types = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"]
        if not data.get("type") or data["type"] not in valid_types:
            errors["type"] = f"Job type must be one of {valid_types}"

    # location
    if not partial or "location" in data:
        if not data.get("location") or not str(data["location"]).strip():
            errors["location"] = "Location is required"

    # location_type
    if not partial or "location_type" in data:
        valid_loc_types = ["On-site", "Remote", "Hybrid"]
        if not data.get("location_type") or data["location_type"] not in valid_loc_types:
            errors["location_type"] = f"Location type must be one of {valid_loc_types}"

    # salary_min
    if not partial or "salary_min" in data:
        if data.get("salary_min") is None or data["salary_min"] == "":
            errors["salary_min"] = "Minimum salary is required"
        else:
            try:
                if int(data["salary_min"]) < 0:
                    errors["salary_min"] = "Salary must be non-negative"
            except (ValueError, TypeError):
                errors["salary_min"] = "Salary must be a number"

    # salary_max (optional but validated when present)
    if "salary_max" in data and data["salary_max"] not in (None, ""):
        try:
            salary_max = int(data["salary_max"])
            salary_min = int(data.get("salary_min", 0))
            if salary_max < salary_min:
                errors["salary_max"] = "Maximum salary must be greater than minimum"
        except (ValueError, TypeError):
            errors["salary_max"] = "Salary must be a number"

    # experience
    if not partial or "experience" in data:
        if not data.get("experience") or not str(data["experience"]).strip():
            errors["experience"] = "Experience level is required"

    # openings
    if not partial or "openings" in data:
        if data.get("openings") is None or data["openings"] == "":
            errors["openings"] = "Number of openings is required"
        else:
            try:
                if int(data["openings"]) <= 0:
                    errors["openings"] = "Openings must be at least 1"
            except (ValueError, TypeError):
                errors["openings"] = "Openings must be a number"

    # skills
    if not partial or "skills" in data:
        skills = data.get("skills")
        if not skills or not isinstance(skills, list) or len(skills) == 0:
            errors["skills"] = "At least one skill is required"

    # description
    if not partial or "description" in data:
        desc = data.get("description", "")
        if not desc or not str(desc).strip():
            errors["description"] = "Job description is required"
        elif len(desc) < 20:
            errors["description"] = "Job description must be at least 20 characters"

    return errors


def _apply_job_fields(job, data):
    """Write validated data fields onto a Job instance."""
    field_map = {
        "title":         lambda v: v.strip(),
        "department":    lambda v: v.strip(),
        "type":          lambda v: v.strip(),
        "location":      lambda v: v.strip(),
        "location_type": lambda v: v.strip(),
        "priority":      lambda v: v,
        "experience":    lambda v: v.strip(),
        "skills":        lambda v: v,
        "is_active":     lambda v: bool(v),
    }

    for field, transform in field_map.items():
        if field in data:
            setattr(job, field, transform(data[field]))

    if "salary_min" in data and data["salary_min"] not in (None, ""):
        job.salary_min = int(data["salary_min"])

    if "salary_max" in data:
        job.salary_max = int(data["salary_max"]) if data["salary_max"] not in (None, "") else None

    if "openings" in data and data["openings"] not in (None, ""):
        job.openings = int(data["openings"])

    if "description" in data:
        job.description = data["description"].strip()

    if "requirements" in data:
        job.requirements = (data["requirements"] or "").strip() or None

    if "benefits" in data:
        job.benefits = (data["benefits"] or "").strip() or None


# ── Recruiter Job Management ──────────────────────────────────────────

def create_job():
    """Create a new job posting"""
    try:
        recruiter_id = _get_recruiter_id()  # ← always int

        recruiter = Recruiter.query.get(recruiter_id)
        if not recruiter:
            return jsonify({"errors": {"general": "Recruiter not found"}}), 404

        data = request.get_json() or {}
        errors = _validate_job_fields(data, partial=False)

        # deadline (optional)
        deadline = None
        if data.get("deadline"):
            try:
                deadline = datetime.strptime(data["deadline"], "%Y-%m-%d").date()
            except (ValueError, TypeError):
                errors["deadline"] = "Invalid deadline format (use YYYY-MM-DD)"

        if errors:
            return jsonify({"errors": errors}), 400

        job = Job(recruiter_id=recruiter_id, is_active=True, deadline=deadline)
        _apply_job_fields(job, data)

        # set priority default if not provided
        if not data.get("priority"):
            job.priority = "Normal"

        db.session.add(job)
        db.session.commit()

        return jsonify({"message": "Job created successfully", "job": job.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"errors": {"general": str(e)}}), 500


def get_my_jobs():
    """Get all jobs posted by the current recruiter"""
    try:
        recruiter_id = _get_recruiter_id()  # ← always int

        page   = request.args.get("page",   1,     type=int)
        limit  = request.args.get("limit",  10,    type=int)
        status = request.args.get("status", "all")  # all | active | inactive

        limit = min(limit, 100)
        skip  = (page - 1) * limit

        query = Job.query.filter_by(recruiter_id=recruiter_id)

        if status == "active":
            query = query.filter_by(is_active=True)
        elif status == "inactive":
            query = query.filter_by(is_active=False)

        total = query.count()
        jobs  = query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()

        return jsonify({
            "jobs": [job.to_dict() for job in jobs],
            "pagination": {
                "total": total,
                "page":  page,
                "limit": limit,
                "pages": (total + limit - 1) // limit,
            },
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"errors": {"general": str(e)}}), 500


def get_job(job_id):
    """Get a single job (recruiter must own it)"""
    try:
        recruiter_id = _get_recruiter_id()  # ← always int

        job = Job.query.get(job_id)
        if not job:
            return jsonify({"errors": {"general": "Job not found"}}), 404

        # Now both sides are int — no more str != int → 403
        if job.recruiter_id != recruiter_id:
            return jsonify({"errors": {"general": "Unauthorized"}}), 403

        include_apps = request.args.get("include_applications", "false").lower() == "true"

        return jsonify({"job": job.to_dict(include_applications=include_apps)}), 200

    except Exception as e:
        return jsonify({"errors": {"general": str(e)}}), 500


def update_job(job_id):
    """Update a job posting (partial update supported)"""
    try:
        recruiter_id = _get_recruiter_id()  # ← always int

        job = Job.query.get(job_id)
        if not job:
            return jsonify({"errors": {"general": "Job not found"}}), 404
        if job.recruiter_id != recruiter_id:
            return jsonify({"errors": {"general": "Unauthorized"}}), 403

        data   = request.get_json() or {}
        errors = _validate_job_fields(data, partial=True)

        # deadline (optional)
        if "deadline" in data and data["deadline"]:
            try:
                job.deadline = datetime.strptime(data["deadline"], "%Y-%m-%d").date()
            except (ValueError, TypeError):
                errors["deadline"] = "Invalid deadline format (use YYYY-MM-DD)"

        if errors:
            return jsonify({"errors": errors}), 400

        _apply_job_fields(job, data)
        db.session.commit()

        return jsonify({"message": "Job updated successfully", "job": job.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"errors": {"general": str(e)}}), 500


def delete_job(job_id):
    """Delete a job posting"""
    try:
        recruiter_id = _get_recruiter_id()  # ← always int

        job = Job.query.get(job_id)
        if not job:
            return jsonify({"errors": {"general": "Job not found"}}), 404
        if job.recruiter_id != recruiter_id:
            return jsonify({"errors": {"general": "Unauthorized"}}), 403

        db.session.delete(job)
        db.session.commit()

        return jsonify({"message": "Job deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"errors": {"general": str(e)}}), 500


# ── Recruiter Applicant Management ────────────────────────────────────

def get_job_applicants(job_id):
    """Get all applicants for a job"""
    try:
        recruiter_id = _get_recruiter_id()  # ← always int

        job = Job.query.get(job_id)
        if not job:
            return jsonify({"errors": {"general": "Job not found"}}), 404
        if job.recruiter_id != recruiter_id:
            return jsonify({"errors": {"general": "Unauthorized"}}), 403

        status_filter = request.args.get("status")
        query = Application.query.filter_by(job_id=job_id)
        if status_filter:
            query = query.filter_by(status=status_filter)

        applications = query.order_by(Application.applied_at.desc()).all()

        return jsonify({
            "applications": [app.to_dict() for app in applications],
            "total": len(applications),
        }), 200

    except Exception as e:
        return jsonify({"errors": {"general": str(e)}}), 500


def update_application_status(job_id, application_id):
    """Update application status"""
    try:
        recruiter_id = _get_recruiter_id()  # ← always int

        job = Job.query.get(job_id)
        if not job:
            return jsonify({"errors": {"general": "Job not found"}}), 404
        if job.recruiter_id != recruiter_id:
            return jsonify({"errors": {"general": "Unauthorized"}}), 403

        app = Application.query.get(application_id)
        if not app or app.job_id != job_id:
            return jsonify({"errors": {"general": "Application not found"}}), 404

        data       = request.get_json() or {}
        new_status = data.get("status")

        valid_statuses = ["applied", "shortlisted", "rejected", "hired", "withdrawn"]
        if new_status not in valid_statuses:
            return jsonify({"errors": {"status": f"Invalid status. Must be one of {valid_statuses}"}}), 400

        app.status = new_status
        db.session.commit()

        return jsonify({"message": "Application status updated", "application": app.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"errors": {"general": str(e)}}), 500


def download_resume(job_id, application_id):
    """Download applicant resume — recruiter must own the job"""
    try:
        from flask import send_file
        
        recruiter_id = _get_recruiter_id()  # ← always int

        # Verify job exists and belongs to recruiter
        job = Job.query.get(job_id)
        if not job:
            return jsonify({"errors": {"general": "Job not found"}}), 404
        if job.recruiter_id != recruiter_id:
            return jsonify({"errors": {"general": "Unauthorized"}}), 403

        # Verify application exists and belongs to this job
        app = Application.query.get(application_id)
        if not app or app.job_id != job_id:
            return jsonify({"errors": {"general": "Application not found"}}), 404
        
        if not app.resume_path:
            return jsonify({"errors": {"general": "No resume attached to this application"}}), 404

        # Build full file path
        file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], app.resume_path)
        
        # Verify file exists
        if not os.path.exists(file_path):
            return jsonify({"errors": {"general": "Resume file not found"}}), 404

        # Get user name for better filename
        user_name = (app.user.name if app.user else "candidate").replace(" ", "_")
        file_ext = os.path.splitext(app.resume_path)[1]
        download_filename = f"resume_{user_name}{file_ext}"

        return send_file(
            file_path,
            as_attachment=True,
            download_name=download_filename,
            mimetype='application/octet-stream'
        )

    except Exception as e:
        return jsonify({"errors": {"general": str(e)}}), 500


# ── Public Job Browsing ───────────────────────────────────────────────

def get_all_jobs():
    """Get all active jobs — public, no auth required"""
    try:
        page     = request.args.get("page",   1,  type=int)
        limit    = request.args.get("limit",  10, type=int)
        location = request.args.get("location")
        job_type = request.args.get("type")
        search   = request.args.get("search")

        limit = min(limit, 100)
        skip  = (page - 1) * limit

        query = Job.query.filter_by(is_active=True)

        if location:
            query = query.filter(Job.location.ilike(f"%{location}%"))
        if job_type:
            query = query.filter_by(type=job_type)
        if search:
            query = query.filter(
                Job.title.ilike(f"%{search}%") | Job.description.ilike(f"%{search}%")
            )

        total = query.count()
        jobs  = query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()

        return jsonify({
            "jobs": [job.to_dict() for job in jobs],
            "pagination": {
                "total": total,
                "page":  page,
                "limit": limit,
                "pages": (total + limit - 1) // limit,
            },
        }), 200

    except Exception as e:
        return jsonify({"errors": {"general": str(e)}}), 500


# ── User Job Applications ─────────────────────────────────────────────

def apply_for_job(job_id):
    """Apply for a job with optional resume upload"""
    try:
        user_id = int(get_jwt_identity())  # ← cast to int for consistency

        user = User.query.get(user_id)
        if not user:
            return jsonify({"errors": {"general": "User not found"}}), 404

        job = Job.query.get(job_id)
        if not job:
            return jsonify({"errors": {"general": "Job not found"}}), 404
        if not job.is_active:
            return jsonify({"errors": {"general": "This job is no longer active"}}), 400

        existing = Application.query.filter_by(user_id=user_id, job_id=job_id).first()
        if existing:
            return jsonify({"errors": {"general": "You have already applied for this job"}}), 400

        # ────────────────────────────────────────────────────────────────────
        # Handle form data (cover_letter) and file upload (resume)
        # ────────────────────────────────────────────────────────────────────
        cover_letter = (request.form.get("cover_letter") or "").strip()
        resume_path = None
        errors = {}

        # Check if resume file is provided
        if "resume" in request.files:
            resume_file = request.files["resume"]
            
            if resume_file.filename == "":
                errors["resume"] = "No file selected"
            else:
                # ──────────────────────────────────────────────────────────
                # Validate file type
                # ──────────────────────────────────────────────────────────
                allowed_exts = current_app.config.get("ALLOWED_EXTENSIONS", {'pdf', 'doc', 'docx'})
                file_ext = os.path.splitext(resume_file.filename)[1].lstrip('.').lower()
                
                if file_ext not in allowed_exts:
                    errors["resume"] = f"File type '.{file_ext}' not allowed. Use: {', '.join(allowed_exts)}"
                else:
                    # ──────────────────────────────────────────────────────
                    # Save file with secure name: user_{user_id}_job_{job_id}_{timestamp}.ext
                    # ──────────────────────────────────────────────────────
                    try:
                        timestamp = int(datetime.now().timestamp() * 1000)  # ms precision
                        secure_name = f"user_{user_id}_job_{job_id}_{timestamp}.{file_ext}"
                        upload_path = os.path.join(current_app.config["UPLOAD_FOLDER"], secure_name)
                        
                        resume_file.save(upload_path)
                        resume_path = secure_name  # Store only filename, not full path
                        
                    except Exception as save_err:
                        errors["resume"] = f"Failed to save file: {str(save_err)}"

        if errors:
            return jsonify({"errors": errors}), 400

        # ────────────────────────────────────────────────────────────────────
        # Create application record
        # ────────────────────────────────────────────────────────────────────
        application = Application(
            user_id=user_id,
            job_id=job_id,
            cover_letter=cover_letter or None,
            resume_path=resume_path,
            status="applied",
        )

        db.session.add(application)
        db.session.commit()

        return jsonify({
            "message": "Application submitted successfully",
            "application": application.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"errors": {"general": str(e)}}), 500


def get_user_applications():
    """Get all applications for the current user"""
    try:
        user_id = int(get_jwt_identity())  # ← cast to int for consistency

        page   = request.args.get("page",  1,  type=int)
        limit  = request.args.get("limit", 10, type=int)
        status = request.args.get("status")

        limit = min(limit, 100)
        skip  = (page - 1) * limit

        query = Application.query.filter_by(user_id=user_id)
        if status:
            query = query.filter_by(status=status)

        total        = query.count()
        applications = query.order_by(Application.applied_at.desc()).offset(skip).limit(limit).all()

        return jsonify({
            "applications": [app.to_dict() for app in applications],
            "pagination": {
                "total": total,
                "page":  page,
                "limit": limit,
                "pages": (total + limit - 1) // limit,
            },
        }), 200

    except Exception as e:
        return jsonify({"errors": {"general": str(e)}}), 500