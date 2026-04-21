#!/usr/bin/env python3
import sys
sys.path.insert(0, 'c:\\VS Code\\careerConnect\\backend')

from app import create_app
from app.models.recruiter_model import Recruiter

app = create_app()
with app.app_context():
    recruiter = Recruiter.query.first()
    if recruiter:
        print(f"Recruiter: {recruiter.name} (ID: {recruiter.id})")
        print(f"  - Email: {recruiter.email}")
        print(f"  - Token: {recruiter.token[:20]}..." if recruiter.token else "  - Token: None")
    else:
        print("No recruiter found!")
