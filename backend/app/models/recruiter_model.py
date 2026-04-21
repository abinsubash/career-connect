from app.db import db

class Recruiter(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    # Account
    name       = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(100), unique=True, nullable=False)
    password   = db.Column(db.String(200), nullable=False)
    # Company
    company    = db.Column(db.String(100))
    website    = db.Column(db.String(200))
    size       = db.Column(db.String(50))
    # Role
    role       = db.Column(db.String(100))
    department = db.Column(db.String(100))
    
    # ── Relationships ────────────────────────────────────────────────────────
    jobs = db.relationship(
        "Job",
        back_populates="recruiter",
        cascade="all, delete-orphan",
        lazy="select",
    )