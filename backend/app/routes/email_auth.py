from flask import Blueprint, request, jsonify, session
from .auth import make_jwt, sb_headers, sb_url
import os, hashlib, secrets, requests as http_requests

email_bp = Blueprint('email_auth', __name__)

def hash_password(password: str) -> str:
    salt = os.environ.get('SECRET_KEY', 'taskflow-salt')
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()

@email_bp.route('/register', methods=['POST'])
def register():
    data     = request.get_json()
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    name     = (data.get('full_name') or '').strip()

    if not email or not password or not name:
        return jsonify({'error': 'Name, email and password are required.'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400

    check = http_requests.get(sb_url(f"users?email=eq.{email}&select=id"), headers=sb_headers())
    if isinstance(check.json(), list) and len(check.json()) > 0:
        return jsonify({'error': 'An account with this email already exists.'}), 409

    pw_hash = hash_password(password)
    resp    = http_requests.post(sb_url('users'), headers=sb_headers(), json={
        'google_id':    f'email_{secrets.token_hex(16)}',
        'email':         email,
        'full_name':     name,
        'password_hash': pw_hash,
    })

    if resp.status_code not in (200, 201):
        return jsonify({'error': 'Failed to create account.'}), 500

    data_resp = resp.json()
    user      = data_resp[0] if isinstance(data_resp, list) else data_resp
    token     = make_jwt(user)
    return jsonify({'token': token, 'user': user}), 201

@email_bp.route('/login', methods=['POST'])
def email_login():
    data     = request.get_json()
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    pw_hash = hash_password(password)
    resp    = http_requests.get(
        sb_url(f"users?email=eq.{email}&password_hash=eq.{pw_hash}&select=*"),
        headers=sb_headers()
    )
    users = resp.json()
    if not isinstance(users, list) or len(users) == 0:
        return jsonify({'error': 'Invalid email or password.'}), 401

    user  = users[0]
    token = make_jwt(user)
    return jsonify({'token': token, 'user': user}), 200