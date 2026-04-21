#!/usr/bin/env python3
import sys
sys.path.insert(0, 'c:\\VS Code\\careerConnect\\backend')

from app import create_app
from app.models.job_model import Job
from app.models.application_model import Application

app = create_app()
with app.app_context():
    jobs = Job.query.all()
    print(f"Total jobs: {len(jobs)}")
    for job in jobs:
        app_count = len(job.applications) if job.applications else 0
        print(f"  - Job {job.id}: '{job.title}' (recruiter_id={job.recruiter_id}, apps={app_count}, active={job.is_active})")
    
    print(f"\nTotal applications: {Application.query.count()}")
    apps = Application.query.all()
    for app in apps[:5]:  # Show first 5
        print(f"  - App {app.id}: user_id={app.user_id}, job_id={app.job_id}, status={app.status}")
