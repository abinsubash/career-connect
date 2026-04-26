from datetime import datetime
from sqlalchemy.dialects.mysql import LONGBLOB
from app.db import db

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('user.id'), nullable=False)
    caption = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=False)
    likes_count = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='posts')
    likes = db.relationship('PostLike', backref='post', cascade='all, delete-orphan')

    def to_dict(self, include_likes=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'user': {
                'id': self.user.id,
                'name': self.user.name,
                'avatar': self.user.email.split('@')[0][0].upper() if self.user.email else 'U',
            } if self.user else None,
            'caption': self.caption,
            'image_url': f"http://localhost:5000{self.image_url}" if self.image_url.startswith('/') else self.image_url,
            'likes_count': self.likes_count,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_likes:
            data['liked_by'] = [like.user_id for like in self.likes]
        
        # Debug logging
        import sys
        print(f"\n📸 POST TO_DICT:")
        print(f"   Stored image_url: {self.image_url}")
        print(f"   Returned image_url: {data['image_url']}", file=sys.stdout)
        
        return data


class PostLike(db.Model):
    __tablename__ = 'post_likes'

    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.String(50), db.ForeignKey('posts.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = db.relationship('User', backref='post_likes')

    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='unique_user_post_like'),)
