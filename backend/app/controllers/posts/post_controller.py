import uuid
import os
import base64
from flask import request, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime
from app.models.post_model import Post
from app.models.user_model import User
from app.db import db

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../../uploads/posts')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class PostController:
    @staticmethod
    def create_post(user_id):
        """Create a new post"""
        try:
            data = request.form.to_dict()
            caption = data.get('caption', '')
            
            post_id = str(uuid.uuid4())
            image_url = None
            
            # Handle image upload
            if 'image' in request.files:
                file = request.files['image']
                if file and allowed_file(file.filename):
                    filename = f"{post_id}_{secure_filename(file.filename)}"
                    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
                    filepath = os.path.join(UPLOAD_FOLDER, filename)
                    file.save(filepath)
                    image_url = f"/uploads/posts/{filename}"
            
            new_post = Post(
                id=post_id,
                user_id=user_id,
                caption=caption,
                image_url=image_url,
                created_at=datetime.utcnow()
            )
            
            db.session.add(new_post)
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Post created successfully',
                'post': new_post.to_dict()
            }, 201
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}, 400

    @staticmethod
    def get_all_posts(page=1, limit=10):
        """Get all posts from all users"""
        try:
            offset = (page - 1) * limit
            posts = Post.query.order_by(Post.created_at.desc()).offset(offset).limit(limit).all()
            total = Post.query.count()
            
            return {
                'success': True,
                'posts': [p.to_dict() for p in posts],
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }, 200
        except Exception as e:
            return {'success': False, 'error': str(e)}, 400

    @staticmethod
    def get_user_posts(user_id, page=1, limit=10):
        """Get all posts from a specific user"""
        try:
            offset = (page - 1) * limit
            posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).offset(offset).limit(limit).all()
            total = Post.query.filter_by(user_id=user_id).count()
            
            return {
                'success': True,
                'posts': [p.to_dict() for p in posts],
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }, 200
        except Exception as e:
            return {'success': False, 'error': str(e)}, 400

    @staticmethod
    def get_post(post_id):
        """Get a specific post"""
        try:
            post = Post.query.get(post_id)
            if not post:
                return {'success': False, 'error': 'Post not found'}, 404
            
            return {'success': True, 'post': post.to_dict()}, 200
        except Exception as e:
            return {'success': False, 'error': str(e)}, 400

    @staticmethod
    def delete_post(post_id, user_id):
        """Delete a post (only owner can delete)"""
        try:
            post = Post.query.get(post_id)
            if not post:
                return {'success': False, 'error': 'Post not found'}, 404
            
            if post.user_id != user_id:
                return {'success': False, 'error': 'Unauthorized to delete this post'}, 403
            
            # Delete image file if exists
            if post.image_url:
                try:
                    filepath = os.path.join(os.path.dirname(__file__), f"../../{post.image_url.lstrip('/')}")
                    if os.path.exists(filepath):
                        os.remove(filepath)
                except Exception as e:
                    print(f"Error deleting image: {e}")
            
            db.session.delete(post)
            db.session.commit()
            
            return {'success': True, 'message': 'Post deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}, 400

    @staticmethod
    def update_post(post_id, user_id):
        """Update post caption (only owner can update)"""
        try:
            post = Post.query.get(post_id)
            if not post:
                return {'success': False, 'error': 'Post not found'}, 404
            
            if post.user_id != user_id:
                return {'success': False, 'error': 'Unauthorized to update this post'}, 403
            
            data = request.get_json()
            if 'caption' in data:
                post.caption = data['caption']
                post.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            return {'success': True, 'message': 'Post updated successfully', 'post': post.to_dict()}, 200
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}, 400
