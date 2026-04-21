from datetime import datetime, timezone
from app.db import db


class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)

    # ── Relationship ──────────────────────────────────────────────────────────
    recruiter_id = db.Column(
        db.Integer,
        db.ForeignKey("recruiter.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Step 0 · Basic Info ───────────────────────────────────────────────────
    title        = db.Column(db.String(200), nullable=False)
    department   = db.Column(db.String(100), nullable=False)
    type         = db.Column(db.String(50),  nullable=False)   # Full-time | Part-time | Contract | Internship | Freelance
    location     = db.Column(db.String(200), nullable=False)
    location_type = db.Column(db.String(20), nullable=False)   # On-site | Remote | Hybrid
    priority     = db.Column(db.String(20),  nullable=False, default="Normal")  # Low | Normal | Urgent

    # ── Step 1 · Details ─────────────────────────────────────────────────────
    salary_min   = db.Column(db.Integer,     nullable=False)   # ₹/yr
    salary_max   = db.Column(db.Integer,     nullable=True)    # ₹/yr (optional)
    experience   = db.Column(db.String(50),  nullable=False)   # e.g. "Mid-level (3–5 yrs)"
    openings     = db.Column(db.Integer,     nullable=False, default=1)
    deadline     = db.Column(db.Date,        nullable=True)
    skills       = db.Column(db.JSON,        nullable=False, default=list)
    # Stored as a JSON array, e.g. ["React", "Node.js", "Python"]

    # ── Step 2 · Requirements ─────────────────────────────────────────────────
    description  = db.Column(db.Text,        nullable=False)
    requirements = db.Column(db.Text,        nullable=True)
    benefits     = db.Column(db.Text,        nullable=True)

    # ── Status & Timestamps ───────────────────────────────────────────────────
    is_active    = db.Column(db.Boolean,     nullable=False, default=True)
    created_at   = db.Column(db.DateTime,    nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at   = db.Column(db.DateTime,    nullable=False, default=lambda: datetime.now(timezone.utc),
                             onupdate=lambda: datetime.now(timezone.utc))

    # ── Relationship back-ref ─────────────────────────────────────────────────
    recruiter = db.relationship(
        "Recruiter",
        back_populates="jobs",
        lazy="select",
    )
    
    applications = db.relationship(
        "Application",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # ── Helpers ───────────────────────────────────────────────────────────────
    def to_dict(self, include_applications=False):
        result = {
            "id":            self.id,
            "recruiter_id":  self.recruiter_id,
            # Basic Info
            "title":         self.title,
            "department":    self.department,
            "type":          self.type,
            "location":      self.location,
            "location_type": self.location_type,
            "priority":      self.priority,
            # Details
            "salary_min":    self.salary_min,
            "salary_max":    self.salary_max,
            "experience":    self.experience,
            "openings":      self.openings,
            "deadline":      self.deadline.isoformat() if self.deadline else None,
            "skills":        self.skills or [],
            # Requirements
            "description":   self.description,
            "requirements":  self.requirements,
            "benefits":      self.benefits,
            # Meta
            "is_active":     self.is_active,
            "created_at":    self.created_at.isoformat(),
            "updated_at":    self.updated_at.isoformat(),
            "applicant_count": len(self.applications) if self.applications else 0,
            # Recruiter info
            "recruiter":     {
                "id": self.recruiter.id,
                "name": self.recruiter.name,
                "company_name": self.recruiter.company or self.recruiter.name,
                "email": self.recruiter.email,
            } if self.recruiter else None,
        }
        
        if include_applications and self.applications:
            result["applications"] = [app.to_dict() for app in self.applications]
        
        return result

    def __repr__(self):
        return f"<Job id={self.id} title={self.title!r} recruiter_id={self.recruiter_id}>"