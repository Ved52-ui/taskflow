from flask import Blueprint, jsonify, session
from ..services.supabase_client import get_supabase

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
def get_users():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    db    = get_supabase()
    users = db.table('users').select('id, email, full_name, avatar_url').execute()
    return jsonify(users.data)