from flask import Blueprint, request, jsonify, session
from ..services.email import send_task_assigned, send_task_completed
from .auth import get_current_user
import os, requests as http_requests

tasks_bp = Blueprint('tasks', __name__)

def headers():
    return {
        'apikey':        os.environ['SUPABASE_SERVICE_ROLE_KEY'],
        'Authorization': f"Bearer {os.environ['SUPABASE_SERVICE_ROLE_KEY']}",
        'Content-Type':  'application/json',
        'Prefer':        'return=representation',
    }

def url(path):
    return f"{os.environ['SUPABASE_URL']}/rest/v1/{path}"

def require_auth(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated

def get_user(user_id):
    r    = http_requests.get(url(f"users?id=eq.{user_id}&select=*"), headers=headers())
    data = r.json()
    return data[0] if data else None

def enrich_task(task):
    if task.get('creator_id'):
        task['creator']  = get_user(task['creator_id'])
    if task.get('assignee_id'):
        task['assignee'] = get_user(task['assignee_id'])
    return task

@tasks_bp.route('/', methods=['GET'])
@require_auth
def get_tasks():
    r     = http_requests.get(url("tasks?select=*&order=created_at.desc"), headers=headers())
    tasks = r.json()
    return jsonify([enrich_task(t) for t in tasks])

@tasks_bp.route('/', methods=['POST'])
@require_auth
def create_task():
    data     = request.get_json()
    cur_user = request.current_user
    new_task = {
        'title':       data['title'],
        'description': data.get('description', ''),
        'priority':    data.get('priority', 'medium'),
        'creator_id':  cur_user['user_id'],
    }
    if data.get('due_date'):
        new_task['due_date']    = data['due_date']
    if data.get('assignee_id'):
        new_task['assignee_id'] = data['assignee_id']

    r    = http_requests.post(url("tasks"), headers=headers(), json=new_task)
    task = r.json()[0] if r.json() else {}

    if data.get('assignee_id'):
        try:
            assignee = get_user(data['assignee_id'])
            creator  = get_user(cur_user['user_id'])
            if assignee and creator:
                send_task_assigned(
                    to_email=assignee['email'],
                    task_title=data['title'],
                    assigner_name=creator['full_name'],
                    access_token=session.get('google_access_token', ''),
                    refresh_token=session.get('google_refresh_token', '')
                )
        except Exception as e:
            print(f'Email error: {e}')

    return jsonify(enrich_task(task)), 201

@tasks_bp.route('/<task_id>', methods=['PATCH'])
@require_auth
def update_task(task_id):
    data     = request.get_json()
    cur_user = request.current_user

    old_r = http_requests.get(url(f"tasks?id=eq.{task_id}&select=*"), headers=headers())
    old   = old_r.json()[0] if old_r.json() else {}

    r    = http_requests.patch(url(f"tasks?id=eq.{task_id}"), headers=headers(), json=data)
    task = r.json()[0] if r.json() else {}

    if data.get('status') == 'done' and old.get('status') != 'done':
        try:
            completer = get_user(cur_user['user_id'])
            creator   = get_user(old['creator_id'])  if old.get('creator_id')  else None
            assignee  = get_user(old['assignee_id']) if old.get('assignee_id') else None

            recipients = set()
            if creator:  recipients.add(creator['email'])
            if assignee: recipients.add(assignee['email'])

            for email in recipients:
                send_task_completed(
                    to_email=email,
                    task_title=old.get('title', ''),
                    completer_name=completer['full_name'] if completer else 'Someone',
                    access_token=session.get('google_access_token', ''),
                    refresh_token=session.get('google_refresh_token', '')
                )
        except Exception as e:
            print(f'Email error: {e}')

    return jsonify(enrich_task(task))

@tasks_bp.route('/<task_id>', methods=['DELETE'])
@require_auth
def delete_task(task_id):
    http_requests.delete(url(f"tasks?id=eq.{task_id}"), headers=headers())
    return jsonify({'message': 'Deleted'}), 200