from flask import Blueprint, redirect, request, session, jsonify
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from ..services.supabase_client import get_supabase
import os

auth_bp = Blueprint('auth', __name__)

SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.send',
]

def make_flow():
    return Flow.from_client_config(
        client_config={
            'web': {
                'client_id': os.environ['GOOGLE_CLIENT_ID'],
                'client_secret': os.environ['GOOGLE_CLIENT_SECRET'],
                'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
                'token_uri': 'https://oauth2.googleapis.com/token',
                'redirect_uris': [os.environ['GOOGLE_REDIRECT_URI']],
            }
        },
        scopes=SCOPES,
        redirect_uri=os.environ['GOOGLE_REDIRECT_URI']
    )

@auth_bp.route('/google/login')
def google_login():
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
    flow = make_flow()
    auth_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    session['oauth_state'] = state
    return redirect(auth_url)

@auth_bp.route('/google/callback')
def google_callback():
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
    flow = make_flow()
    flow.fetch_token(authorization_response=request.url)
    creds = flow.credentials
    id_info = id_token.verify_oauth2_token(
        creds.id_token, grequests.Request(), os.environ['GOOGLE_CLIENT_ID']
    )
    db = get_supabase()
    user_data = {
        'google_id':  id_info['sub'],
        'email':      id_info['email'],
        'full_name':  id_info.get('name', ''),
        'avatar_url': id_info.get('picture', ''),
    }
    result = db.table('users').upsert(user_data, on_conflict='google_id').execute()
    user = result.data[0]
    session['user_id']              = user['id']
    session['user_email']           = user['email']
    session['google_access_token']  = creds.token
    session['google_refresh_token'] = creds.refresh_token
    return redirect(f"{os.environ['FRONTEND_URL']}/dashboard")

@auth_bp.route('/me')
def me():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthenticated'}), 401
    db   = get_supabase()
    user = db.table('users').select('*').eq('id', session['user_id']).single().execute()
    return jsonify(user.data)

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'}), 200