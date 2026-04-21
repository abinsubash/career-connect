from datetime import datetime
from sqlalchemy.dialects.mysql import LONGBLOB
from app.db import db

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('user.id'), nullable=False)
    caption = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    image_data = db.Column(LONGBLOB, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='posts')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user': {
                'id': self.user.id,
                'name': self.user.name,
                'avatar': self.user.email.split('@')[0][0].upper() if self.user.email else 'U',
            } if self.user else None,
            'caption': self.caption,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
