#!/usr/bin/env python3
import sys
sys.path.insert(0, 'c:\\VS Code\\careerConnect\\backend')

from app import create_app
from app.models.recruiter_model import Recruiter
import json

app = create_app()
with app.app_context():
    recruiter = Recruiter.query.first()
    if recruiter and recruiter.token:
        print(f"✓ Found recruiter: {recruiter.name} (token: {recruiter.token[:20]}...)")
        
        # Test the API endpoint directly
        from flask import Flask
        with app.test_client() as client:
            headers = {'Authorization': f'Bearer {recruiter.token}'}
            
            # Test getting job applicants
            response = client.get('/api/jobs/1/applicants', headers=headers)
            print(f"\n📋 GET /api/jobs/1/applicants")
            print(f"  Status: {response.status_code}")
            print(f"  Response: {json.dumps(response.get_json(), indent=2)}")
    else:
        print("❌ No recruiter or token found!")
