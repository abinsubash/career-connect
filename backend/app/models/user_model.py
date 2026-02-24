from app.db import db

class User(db.Model):
    id=db.Coulmn(db.Integer,primary_key = True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100),unique = True ,nullable = False)
    password = db.Column(db.String(100))