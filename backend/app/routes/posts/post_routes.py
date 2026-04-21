from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ...controllers.posts.post_controller import PostController

post_routes = Blueprint('posts', __name__, url_prefix='/api/posts')

@post_routes.route('/create', methods=['POST'])
@jwt_required()
def create_post():
    """Create a new post"""
    user_id = get_jwt_identity()
    return PostController.create_post(user_id)

@post_routes.route('/all', methods=['GET'])
def get_all_posts():
    """Get all posts"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    return PostController.get_all_posts(page, limit)

@post_routes.route('/user/<user_id>', methods=['GET'])
def get_user_posts(user_id):
    """Get posts from a specific user"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    return PostController.get_user_posts(user_id, page, limit)

@post_routes.route('/<post_id>', methods=['GET'])
def get_post(post_id):
    """Get a specific post"""
    return PostController.get_post(post_id)

@post_routes.route('/<post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    """Delete a post"""
    user_id = get_jwt_identity()
    return PostController.delete_post(post_id, user_id)

@post_routes.route('/<post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    """Update a post"""
    user_id = get_jwt_identity()
    return PostController.update_post(post_id, user_id)
