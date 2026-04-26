import uuid
import os
import shutil
from flask import request, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime
from PIL import Image
from io import BytesIO
from app.models.post_model import Post, PostLike
from app.models.user_model import User
from app.db import db

# ──────────────────────────────────────────────────────────────────────────────
# UPLOAD CONFIGURATION
# ──────────────────────────────────────────────────────────────────────────────

# Get the absolute path for uploads directory
# __file__ = backend/app/controllers/posts/post_controller.py
# Need to go up 4 levels to get to backend/
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
UPLOAD_FOLDER = os.path.join(BACKEND_DIR, 'uploads', 'posts')

print(f"📁 UPLOAD_FOLDER configured as: {UPLOAD_FOLDER}")

# Ensure uploads directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# File configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MIN_FILE_SIZE = 10 * 1024  # 10KB minimum
MAX_IMAGE_DIMENSION = 4000  # 4000px max width/height
MIN_IMAGE_DIMENSION = 100  # 100px minimum

def allowed_file(filename):
    """Check if file extension is allowed"""
    if not filename or '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in ALLOWED_EXTENSIONS

def validate_image(file):
    """Comprehensive image validation"""
    errors = []
    
    try:
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            errors.append(f"File size too large ({file_size/1024/1024:.1f}MB). Maximum allowed: 5MB")
        
        if file_size < MIN_FILE_SIZE:
            errors.append(f"File size too small. Minimum required: 10KB")
        
        # Check image dimensions and format
        try:
            img = Image.open(file)
            width, height = img.size
            
            # Check minimum dimensions
            if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
                errors.append(f"Image too small. Minimum size: {MIN_IMAGE_DIMENSION}x{MIN_IMAGE_DIMENSION}px")
            
            # Check maximum dimensions
            if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
                errors.append(f"Image too large. Maximum size: {MAX_IMAGE_DIMENSION}x{MAX_IMAGE_DIMENSION}px")
            
            # Check aspect ratio (prevent extremely stretched images)
            aspect_ratio = max(width, height) / min(width, height)
            if aspect_ratio > 5:
                errors.append("Image aspect ratio too extreme (max 5:1)")
            
            # Verify image format
            if img.format not in ['PNG', 'JPEG', 'GIF', 'WEBP']:
                errors.append(f"Unsupported image format: {img.format}. Use PNG, JPG, GIF, or WebP")
            
            file.seek(0)  # Reset file pointer
        except Exception as e:
            errors.append(f"Invalid or corrupted image file: {str(e)}")
    
    except Exception as e:
        errors.append(f"Error validating file: {str(e)}")
    
    return errors

class PostController:
    @staticmethod
    def create_post(user_id):
        """Create a new post with comprehensive validation"""
        try:
            print(f"\n\n{'='*80}")
            print(f"📝 POST CREATION REQUEST FROM USER: {user_id}")
            print(f"{'='*80}")
            print(f"Request form data: {request.form.to_dict()}")
            print(f"Request files: {list(request.files.keys())}")
            
            # ────────────────────────────────────────────────────────────────
            # 1. VALIDATE REQUEST DATA
            # ────────────────────────────────────────────────────────────────
            
            if not request.files and not request.form:
                error_msg = 'No data provided'
                print(f"❌ {error_msg}")
                return {
                    'success': False,
                    'error': error_msg
                }, 400
            
            print(f"📋 Request form keys: {list(request.form.keys())}")
            print(f"📋 Request files keys: {list(request.files.keys())}")
            
            # ────────────────────────────────────────────────────────────────
            # 2. VALIDATE CAPTION
            # ────────────────────────────────────────────────────────────────
            
            data = request.form.to_dict()
            caption = data.get('caption', '').strip()
            
            print(f"📝 Caption: '{caption}' (length: {len(caption)})")
            
            if caption:
                # Validation rules for caption
                if len(caption) < 1:
                    error_msg = 'Caption cannot be empty if provided'
                    print(f"❌ {error_msg}")
                    return {
                        'success': False,
                        'error': error_msg
                    }, 400
                
                if len(caption) > 500:
                    error_msg = f'Caption too long ({len(caption)}/500 characters). Please shorten it.'
                    print(f"❌ {error_msg}")
                    return {
                        'success': False,
                        'error': error_msg
                    }, 400
                
                # Check for spam or invalid content
                if '\n' * 3 in caption:
                    error_msg = 'Caption has too many line breaks'
                    print(f"❌ {error_msg}")
                    return {
                        'success': False,
                        'error': error_msg
                    }, 400
            
            print(f"✅ Caption validation passed")
            
            # ────────────────────────────────────────────────────────────────
            # 3. VALIDATE IMAGE (REQUIRED)
            # ────────────────────────────────────────────────────────────────
            
            if 'image' not in request.files:
                error_msg = 'Image is required. Please upload an image file.'
                print(f"❌ {error_msg}")
                return {
                    'success': False,
                    'error': error_msg
                }, 400
            
            file = request.files['image']
            
            if not file or file.filename == '':
                error_msg = 'No image file selected. Please choose a file to upload.'
                print(f"❌ {error_msg}")
                return {
                    'success': False,
                    'error': error_msg
                }, 400
            
            print(f"📋 Image file received: {file.filename}")
            
            # Check file extension
            if not allowed_file(file.filename):
                error_msg = f'Invalid file type. Allowed formats: {", ".join(ALLOWED_EXTENSIONS).upper()}'
                print(f"❌ {error_msg}")
                return {
                    'success': False,
                    'error': error_msg
                }, 400
            
            print(f"✅ File extension valid")
            
            # Validate image content
            validation_errors = validate_image(file)
            if validation_errors:
                error_msg = ' • '.join(validation_errors)
                print(f"❌ Image validation error: {error_msg}")
                return {
                    'success': False,
                    'error': error_msg
                }, 400
            
            print(f"✅ Image validation passed")
            
            # ────────────────────────────────────────────────────────────────
            # 4. PREPARE AND SAVE IMAGE
            # ────────────────────────────────────────────────────────────────
            
            post_id = str(uuid.uuid4())
            filename = f"{post_id}_{secure_filename(file.filename)}"
            
            # Ensure directory exists
            try:
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            except Exception as e:
                return {
                    'success': False,
                    'error': f'Server error: Could not create upload directory. {str(e)}'
                }, 500
            
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            # Save file
            try:
                print(f"📤 Saving file to: {filepath}")
                file.save(filepath)
                
                # Verify file was saved
                if not os.path.exists(filepath):
                    print(f"❌ File not found after save: {filepath}")
                    return {
                        'success': False,
                        'error': 'File upload failed. Could not save the file.'
                    }, 500
                
                file_size = os.path.getsize(filepath)
                
                # Verify file has content
                if file_size == 0:
                    print(f"❌ Empty file: {filepath}")
                    os.remove(filepath)
                    return {
                        'success': False,
                        'error': 'Uploaded file is empty'
                    }, 400
                
                print(f"✅ File saved successfully: {filename} ({file_size/1024:.1f}KB)")
            
            except Exception as e:
                # Clean up if something went wrong
                if os.path.exists(filepath):
                    try:
                        os.remove(filepath)
                    except:
                        pass
                
                return {
                    'success': False,
                    'error': f'Error saving file: {str(e)}'
                }, 500
            
            image_url = f"/uploads/posts/{filename}"
            
            # ────────────────────────────────────────────────────────────────
            # 5. CREATE POST IN DATABASE
            # ────────────────────────────────────────────────────────────────
            
            try:
                new_post = Post(
                    id=post_id,
                    user_id=user_id,
                    caption=caption if caption else None,
                    image_url=image_url,
                    created_at=datetime.utcnow()
                )
                
                db.session.add(new_post)
                db.session.commit()
                
                print(f"✅ Post created successfully: {post_id}")
                print(f"   Image saved to: {filepath}")
                print(f"   Image URL: {image_url}")
                
                return {
                    'success': True,
                    'message': 'Post created successfully!',
                    'post': new_post.to_dict()
                }, 201
            
            except Exception as e:
                db.session.rollback()
                
                # Clean up uploaded file on DB error
                try:
                    if os.path.exists(filepath):
                        os.remove(filepath)
                except:
                    pass
                
                return {
                    'success': False,
                    'error': f'Error saving post to database: {str(e)}'
                }, 500
        
        except Exception as e:
            print(f"❌ Unexpected error in create_post: {str(e)}")
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }, 500

    @staticmethod
    def get_all_posts(page=1, limit=10, user_id=None):
        """Get all posts from all users"""
        try:
            limit = min(limit, 50)  # Max 50 per page
            offset = (page - 1) * limit
            
            query = Post.query.order_by(Post.created_at.desc())
            total = query.count()
            posts = query.offset(offset).limit(limit).all()
            
            posts_data = []
            for post in posts:
                post_dict = post.to_dict()
                if user_id:
                    post_dict['is_liked_by_me'] = any(like.user_id == user_id for like in post.likes)
                posts_data.append(post_dict)
            
            return {
                'success': True,
                'posts': posts_data,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }, 200
        except Exception as e:
            return {'success': False, 'error': str(e)}, 400

    @staticmethod
    def get_user_posts(user_id, page=1, limit=10, current_user_id=None):
        """Get all posts from a specific user"""
        try:
            limit = min(limit, 50)
            offset = (page - 1) * limit
            
            query = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc())
            total = query.count()
            posts = query.offset(offset).limit(limit).all()
            
            posts_data = []
            for post in posts:
                post_dict = post.to_dict()
                if current_user_id:
                    post_dict['is_liked_by_me'] = any(like.user_id == current_user_id for like in post.likes)
                posts_data.append(post_dict)
            
            return {
                'success': True,
                'posts': posts_data,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }, 200
        except Exception as e:
            return {'success': False, 'error': str(e)}, 400

    @staticmethod
    def get_post(post_id, user_id=None):
        """Get a specific post"""
        try:
            post = Post.query.get(post_id)
            if not post:
                return {'success': False, 'error': 'Post not found'}, 404
            
            post_dict = post.to_dict()
            if user_id:
                post_dict['is_liked_by_me'] = any(like.user_id == user_id for like in post.likes)
            
            return {'success': True, 'post': post_dict}, 200
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
                return {'success': False, 'error': 'You don\'t have permission to delete this post'}, 403
            
            # Delete image file if exists
            if post.image_url:
                try:
                    # Extract filename from URL
                    filename = os.path.basename(post.image_url)
                    filepath = os.path.join(UPLOAD_FOLDER, filename)
                    
                    if os.path.exists(filepath):
                        os.remove(filepath)
                        print(f"✅ Image deleted: {filepath}")
                    else:
                        print(f"⚠️  Image file not found: {filepath}")
                
                except Exception as e:
                    print(f"❌ Error deleting image file: {str(e)}")
                    # Continue with DB deletion even if file deletion fails
            
            # Delete from database
            db.session.delete(post)
            db.session.commit()
            
            print(f"✅ Post deleted from database: {post_id}")
            
            return {
                'success': True,
                'message': 'Post deleted successfully'
            }, 200
        
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error deleting post: {str(e)}")
            return {
                'success': False,
                'error': f'Error deleting post: {str(e)}'
            }, 500

    @staticmethod
    def update_post(post_id, user_id):
        """Update post caption and/or active status (only owner can update)"""
        try:
            post = Post.query.get(post_id)
            if not post:
                return {'success': False, 'error': 'Post not found'}, 404
            
            if post.user_id != user_id:
                return {'success': False, 'error': 'You don\'t have permission to update this post'}, 403
            
            data = request.get_json()
            if not data:
                return {'success': False, 'error': 'No data provided'}, 400
            
            # Update caption if provided
            if 'caption' in data:
                caption = data['caption'].strip() if data['caption'] else ''
                
                # Validate caption
                if caption and len(caption) > 500:
                    return {
                        'success': False,
                        'error': f'Caption too long ({len(caption)}/500). Please shorten it.'
                    }, 400
                
                post.caption = caption if caption else None
            
            # Update is_active status if provided
            if 'is_active' in data:
                post.is_active = bool(data['is_active'])
            
            post.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            print(f"✅ Post updated: {post_id} - Active: {post.is_active}")
            
            return {
                'success': True,
                'message': 'Post updated successfully',
                'post': post.to_dict()
            }, 200
        
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error updating post: {str(e)}")
            return {
                'success': False,
                'error': f'Error updating post: {str(e)}'
            }, 500

    @staticmethod
    def like_post(post_id, user_id):
        """Like a post"""
        try:
            post = Post.query.get(post_id)
            if not post:
                return {'success': False, 'error': 'Post not found'}, 404
            
            # Check if already liked
            existing_like = PostLike.query.filter_by(user_id=user_id, post_id=post_id).first()
            if existing_like:
                return {'success': False, 'error': 'You already liked this post'}, 400
            
            like_id = str(uuid.uuid4())
            new_like = PostLike(
                id=like_id,
                user_id=user_id,
                post_id=post_id,
                created_at=datetime.utcnow()
            )
            
            post.likes_count += 1
            db.session.add(new_like)
            db.session.commit()
            
            print(f"❤️  Post liked by {user_id}: {post_id} (Total likes: {post.likes_count})")
            
            return {
                'success': True,
                'message': 'Post liked successfully',
                'likes_count': post.likes_count
            }, 200
        
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error liking post: {str(e)}")
            return {
                'success': False,
                'error': f'Error liking post: {str(e)}'
            }, 500

    @staticmethod
    def unlike_post(post_id, user_id):
        """Unlike a post"""
        try:
            post = Post.query.get(post_id)
            if not post:
                return {'success': False, 'error': 'Post not found'}, 404
            
            like = PostLike.query.filter_by(user_id=user_id, post_id=post_id).first()
            if not like:
                return {'success': False, 'error': 'You haven\'t liked this post'}, 400
            
            post.likes_count = max(0, post.likes_count - 1)
            db.session.delete(like)
            db.session.commit()
            
            print(f"💔 Post unliked by {user_id}: {post_id} (Total likes: {post.likes_count})")
            
            return {
                'success': True,
                'message': 'Post unliked successfully',
                'likes_count': post.likes_count
            }, 200
        
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error unliking post: {str(e)}")
            return {
                'success': False,
                'error': f'Error unliking post: {str(e)}'
            }, 500
