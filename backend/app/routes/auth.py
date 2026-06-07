from flask import Blueprint, redirect, request, session, jsonify
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import os, warnings, requests as http_requests

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

    print(f"[AUTH] Google ID: {google_id}, Email: {email}")

    # Check if user exists
    check_resp = http_requests.get(
        sb_url(f"users?google_id=eq.{google_id}&select=*"),
        headers=sb_headers()
    )
    print(f"[AUTH] Check response status: {check_resp.status_code}")
    print(f"[AUTH] Check response body:   {check_resp.text}")

    existing_list = check_resp.json()

    # existing_list should be a list
    if not isinstance(existing_list, list):
        existing_list = []

    if len(existing_list) > 0:
        # User exists — update their info
        print("[AUTH] User exists, updating...")
        update_resp = http_requests.patch(
            sb_url(f"users?google_id=eq.{google_id}"),
            headers=sb_headers(),
            json={
                'email':      email,
                'full_name':  full_name,
                'avatar_url': avatar_url,
            }
        )
        print(f"[AUTH] Update status: {update_resp.status_code}, body: {update_resp.text}")
        updated = update_resp.json()
        user = updated[0] if isinstance(updated, list) and len(updated) > 0 else existing_list[0]
    else:
        # New user — insert
        print("[AUTH] New user, inserting...")
        insert_resp = http_requests.post(
            sb_url("users"),
            headers=sb_headers(),
            json={
                'google_id':  google_id,
                'email':      email,
                'full_name':  full_name,
                'avatar_url': avatar_url,
            }
        )
        print(f"[AUTH] Insert status: {insert_resp.status_code}, body: {insert_resp.text}")
        inserted = insert_resp.json()

        if isinstance(inserted, list) and len(inserted) > 0:
            user = inserted[0]
        elif isinstance(inserted, dict) and 'id' in inserted:
            user = inserted
        else:
            print(f"[AUTH] ERROR: unexpected insert response: {inserted}")
            return jsonify({'error': 'Failed to create user', 'detail': str(inserted)}), 500

    print(f"[AUTH] Final user: {user}")

    session['user_id']              = user['id']
    session['user_email']           = user['email']
    session['google_access_token']  = creds.token
    session['google_refresh_token'] = creds.refresh_token

    return redirect(f"{os.environ['FRONTEND_URL']}/dashboard")

@auth_bp.route('/me')
def me():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthenticated'}), 401
    resp = http_requests.get(
        sb_url(f"users?id=eq.{session['user_id']}&select=*"),
        headers=sb_headers()
    )
    data = resp.json()
    if not isinstance(data, list) or len(data) == 0:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(data[0])

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'}), 200