from flask import Blueprint, redirect, request, session, jsonify
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import os, warnings, requests as http_requests, jwt, datetime

auth_bp = Blueprint('auth', __name__)

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE']  = '1'

SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.send',
]

def sb_headers():
    key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
    return {
        'apikey':        key,
        'Authorization': f'Bearer {key}',
        'Content-Type':  'application/json',
        'Prefer':        'return=representation',
    }

def sb_url(path):
    return f"{os.environ['SUPABASE_URL']}/rest/v1/{path}"

def make_jwt(user: dict) -> str:
    payload = {
        'user_id':    user['id'],
        'user_email': user['email'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
    }
    return jwt.encode(payload, os.environ['SECRET_KEY'], algorithm='HS256')

def get_current_user():
    token = None
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    if not token:
        token = request.cookies.get('taskflow_token')
    if not token:
        return None
    try:
        payload = jwt.decode(token, os.environ['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except Exception:
        return None

def make_flow():
    return Flow.from_client_config(
        client_config={
            'web': {
                'client_id':     os.environ['GOOGLE_CLIENT_ID'],
                'client_secret': os.environ['GOOGLE_CLIENT_SECRET'],
                'auth_uri':      'https://accounts.google.com/o/oauth2/auth',
                'token_uri':     'https://oauth2.googleapis.com/token',
                'redirect_uris': [os.environ['GOOGLE_REDIRECT_URI']],
            }
        },
        scopes=SCOPES,
        redirect_uri=os.environ['GOOGLE_REDIRECT_URI']
    )

@auth_bp.route('/google/login')
def google_login():
    flow = make_flow()
    auth_url, state = flow.authorization_url(
        access_type='offline',
        prompt='consent',
        include_granted_scopes='true'
    )
    session['oauth_state'] = state
    return redirect(auth_url)

@auth_bp.route('/google/callback')
def google_callback():
    flow         = make_flow()
    callback_url = request.url.replace('https://', 'http://')

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        flow.fetch_token(authorization_response=callback_url)

    creds   = flow.credentials
    id_info = id_token.verify_oauth2_token(
        creds.id_token,
        grequests.Request(),
        os.environ['GOOGLE_CLIENT_ID'],
        clock_skew_in_seconds=10
    )

    google_id  = id_info['sub']
    email      = id_info['email']
    full_name  = id_info.get('name', '')
    avatar_url = id_info.get('picture', '')

    check    = http_requests.get(sb_url(f"users?google_id=eq.{google_id}&select=*"), headers=sb_headers())
    existing = check.json() if isinstance(check.json(), list) else []

    if len(existing) > 0:
        upd  = http_requests.patch(sb_url(f"users?google_id=eq.{google_id}"), headers=sb_headers(),
                                   json={'email': email, 'full_name': full_name, 'avatar_url': avatar_url})
        res  = upd.json()
        user = res[0] if isinstance(res, list) and res else existing[0]
    else:
        ins  = http_requests.post(sb_url("users"), headers=sb_headers(),
                                  json={'google_id': google_id, 'email': email,
                                        'full_name': full_name, 'avatar_url': avatar_url})
        res  = ins.json()
        if isinstance(res, list) and res:
            user = res[0]
        elif isinstance(res, dict) and 'id' in res:
            user = res
        else:
            return redirect(f"{os.environ['FRONTEND_URL']}/auth/login?error=failed")

    # Store tokens in session for Gmail use
    session['user_id']              = user['id']
    session['google_access_token']  = creds.token
    session['google_refresh_token'] = creds.refresh_token

    # Create JWT and redirect with it
    token    = make_jwt(user)
    frontend = os.environ['FRONTEND_URL']
    return redirect(f"{frontend}/auth/callback?token={token}")

@auth_bp.route('/me')
def me():
    payload = get_current_user()
    if not payload:
        return jsonify({'error': 'Unauthenticated'}), 401
    resp = http_requests.get(sb_url(f"users?id=eq.{payload['user_id']}&select=*"), headers=sb_headers())
    data = resp.json()
    if not isinstance(data, list) or len(data) == 0:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(data[0])

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'}), 200