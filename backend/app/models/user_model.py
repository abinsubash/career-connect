from app.db import db

class User(db.Model):
    id               = db.Column(db.Integer, primary_key=True)
    # Auth
    name             = db.Column(db.String(100))
    email            = db.Column(db.String(100), unique=True, nullable=False)
    password         = db.Column(db.String(200))
    is_verified      = db.Column(db.Boolean, default=False)
    # Personal
    phone            = db.Column(db.String(20))
    headline         = db.Column(db.String(200))
    dob              = db.Column(db.String(20))
    gender           = db.Column(db.String(30))
    city             = db.Column(db.String(100))
    state            = db.Column(db.String(100))
    country          = db.Column(db.String(100))
    avatar           = db.Column(db.String(500))
    photo            = db.Column(db.String(500))
    # Professional
    job_title        = db.Column(db.String(100))
    experience_level = db.Column(db.String(20))
    skills           = db.Column(db.Text)
    # Preferences
    preferred_role     = db.Column(db.String(100))
    preferred_location = db.Column(db.String(100))
    expected_salary    = db.Column(db.String(50))

    # ── Helpers ───────────────────────────────────────────────────────────────
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "headline": self.headline,
            "job_title": self.job_title,
            "experience_level": self.experience_level,
            "skills": self.skills,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "location": f"{self.city or ''}, {self.country or ''}".strip(" ,"),
            "preferred_role": self.preferred_role,
            "expected_salary": self.expected_salary,
            "avatar": self.avatar,
            "photo": self.photo,
            "bio": self.headline or "",
            "title": self.job_title or "Job Seeker",
        }

    def __repr__(self):
        return f"<User id={self.id} name={self.name!r} email={self.email!r}>"