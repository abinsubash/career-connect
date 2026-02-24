from flask import request,jsonify
from app.db import db
from app.models.user_model import User
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def register():
    data = request.json

    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    new_user = User(
        email=data["email"],
        password=hashed_pw
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"})
