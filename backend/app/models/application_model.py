from datetime import datetime, timezone
from app.db import db


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_id = db.Column(
        db.Integer,
        db.ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Application Data ──────────────────────────────────────────────────────
    status = db.Column(
        db.String(20),
        nullable=False,
        default="applied",
    )  # applied | shortlisted | rejected | hired | withdrawn
    cover_letter = db.Column(db.Text, nullable=True)
    resume_path = db.Column(db.String(500), nullable=True)  # Path to uploaded resume (PDF/DOC/DOCX)
    applied_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ── Relationships back-ref ────────────────────────────────────────────────
    user = db.relationship(
        "User",
        lazy="select",
    )
    job = db.relationship(
        "Job",
        lazy="select",
    )

    # ── Helpers ───────────────────────────────────────────────────────────────
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "job_id": self.job_id,
            "status": self.status,
            "cover_letter": self.cover_letter,
            "resume_path": self.resume_path,
            "applied_at": self.applied_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "user": self.user.to_dict() if self.user else None,
            "job": self.job.to_dict() if self.job else None,
        }

    def __repr__(self):
        return f"<Application id={self.id} user_id={self.user_id} job_id={self.job_id} status={self.status!r}>"
