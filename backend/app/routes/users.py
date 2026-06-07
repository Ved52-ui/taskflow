from flask import Blueprint, jsonify, session
import os, requests as http_requests

users_bp = Blueprint('users', __name__)

def headers():
    return {
        'apikey':        os.environ['SUPABASE_SERVICE_ROLE_KEY'],
        'Authorization': f"Bearer {os.environ['SUPABASE_SERVICE_ROLE_KEY']}",
        'Content-Type':  'application/json',
    }

def url(path):
    return f"{os.environ['SUPABASE_URL']}/rest/v1/{path}"

@users_bp.route('/', methods=['GET'])
def get_users():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    r = http_requests.get(
        url("users?select=id,email,full_name,avatar_url"),
        headers=headers()
    )
    return jsonify(r.json())