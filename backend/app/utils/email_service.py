import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

GMAIL_USER = os.environ.get("GMAIL_USER")       # your Gmail address
GMAIL_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")  # Gmail App Password (not your real password)

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(to_email: str, otp: str, name: str = "User"):
    subject = "Your CareerConnect Verification Code"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563eb;">CareerConnect</h2>
        <p>Hi <strong>{name}</strong>,</p>
        <p>Your verification code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1e40af; background: #eff6ff; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0;">
            {otp}
        </div>
        <p style="color: #64748b; font-size: 14px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p style="color: #94a3b8; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = GMAIL_USER
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_USER, GMAIL_PASSWORD)
        server.sendmail(GMAIL_USER, to_email, msg.as_string())