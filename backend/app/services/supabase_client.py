from supabase import create_client, Client
import os

def get_supabase() -> Client:
    url = os.environ.get('SUPABASE_URL', '')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
    return create_client(url, key)