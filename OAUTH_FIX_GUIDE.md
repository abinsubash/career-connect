# OAuth Setup Fix - Complete Guide

## ✅ Issues Fixed

### 1. **Invalid Google Client ID Error**
   - **Problem**: Backend was using placeholder `"YOUR_GOOGLE_CLIENT_ID"` instead of the actual Google Client ID
   - **Fix**: Replaced with your actual Client ID: `1074816357514-q45pvn5ar592gd4paj6cr3pe6od7e2m4.apps.googleusercontent.com`
   - **Files Updated**:
     - `backend/app/controllers/auth/auth_controller.py` - Fixed google_signup() function
     - `backend/app/config.py` - Added GOOGLE_CLIENT_ID configuration

### 2. **Missing Dependencies**
   - **Problem**: Required Python packages were not in requirements.txt
   - **Fix**: Added missing packages:
     - `flask-bcrypt==1.0.1` (for password hashing)
     - `google-auth==2.28.0` (for OAuth verification)
     - `google-auth-httplib2==0.2.0` (for HTTP requests)
   - **File Updated**: `backend/requirements.txt`

### 3. **Missing Imports in Auth Controller**
   - **Problem**: Google OAuth verification imports were missing
   - **Fix**: Added imports:
     ```python
     from google.auth.transport import requests as grequests
     from google.oauth2 import id_token
     from app.models.otp_model import OTPStore
     from app.utils.email_service import generate_otp, send_otp_email
     ```

### 4. **Missing OTP Model**
   - **Problem**: `OTPStore` model was referenced but not created
   - **Fix**: Created new file `backend/app/models/otp_model.py` with OTPStore class
   - **File Created**: `backend/app/models/otp_model.py`

### 5. **User Model Missing Field**
   - **Problem**: `verify_otp()` function was setting `is_verified` field that didn't exist
   - **Fix**: Added `is_verified = db.Column(db.Boolean, default=False)` to User model
   - **File Updated**: `backend/app/models/user_model.py`

### 6. **Missing Route Imports**
   - **Fix**: Updated auth_routes.py to properly import all auth controller functions
   - **File Updated**: `backend/app/routes/auth/auth_routes.py`

---

## 🔧 Next Steps

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Setup Environment Variables (for Email)
Create a `.env` file in the `backend` folder:
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

**How to get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Copy the 16-character password
4. Paste it as `GMAIL_APP_PASSWORD`

### Step 3: Update Database
Run the Flask app to create new tables:
```bash
python run.py
```

The database will auto-create tables for the new `OTPStore` model.

### Step 4: Test Google OAuth
1. Try signing up with Google again
2. You should now see the OTP verification flow
3. Check your email for OTP verification code

---

## 📋 Summary of Changes

| File | Changes |
|------|---------|
| `auth_controller.py` | Fixed Client ID, added imports, improved error handling |
| `config.py` | Added GOOGLE_CLIENT_ID |
| `requirements.txt` | Added google-auth, flask-bcrypt |
| `otp_model.py` | **NEW** - OTPStore model for OTP storage |
| `user_model.py` | Added is_verified field |
| `auth_routes.py` | Fixed imports for verify_otp and resend_otp |

---

## 🐛 Debugging

If you still get errors:

1. **"invalid_client"** - Ensure the Google Client ID matches your OAuth app
2. **"Token missing"** - Check frontend is sending the token correctly
3. **"Failed to send email"** - Verify Gmail credentials in .env file
4. **Database errors** - Delete `instance/careerconnect.db` and restart Flask to recreate tables

