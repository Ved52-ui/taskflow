from flask import Blueprint, request, jsonify, session
from ..services.supabase_client import get_supabase
from ..services.email import send_task_assigned, send_task_completed

tasks_bp = Blueprint('tasks', __name__)

def require_auth(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated

@tasks_bp.route('/', methods=['GET'])
@require_auth
def get_tasks():
    db = get_supabase()
    tasks = db.table('tasks').select('*, creator:creator_id(*), assignee:assignee_id(*)').execute()
    return jsonify(tasks.data)

@tasks_bp.route('/', methods=['POST'])
@require_auth
def create_task():
    data = request.get_json()
    db   = get_supabase()
    new_task = {
        'title':       data['title'],
        'description': data.get('description', ''),
        'priority':    data.get('priority', 'medium'),
        'due_date':    data.get('due_date') or None,
        'assignee_id': data.get('assignee_id') or None,
        'creator_id':  session['user_id'],
    }
    result = db.table('tasks').insert(new_task).execute()
    task   = result.data[0]
    if data.get('assignee_id'):
        try:
            assignee = db.table('users').select('email').eq('id', data['assignee_id']).single().execute()
            creator  = db.table('users').select('full_name').eq('id', session['user_id']).single().execute()
            send_task_assigned(
                to_email=assignee.data['email'],
                task_title=data['title'],
                assigner_name=creator.data['full_name'],
                access_token=session.get('google_access_token', ''),
                refresh_token=session.get('google_refresh_token', '')
            )
        except Exception as e:
            print(f'Email error: {e}')
    return jsonify(task), 201

@tasks_bp.route('/<task_id>', methods=['PATCH'])
@require_auth
def update_task(task_id):
    data = request.get_json()
    db   = get_supabase()
    old  = db.table('tasks').select('*, creator:creator_id(*), assignee:assignee_id(*)').eq('id', task_id).single().execute().data
    result = db.table('tasks').update(data).eq('id', task_id).execute()
    task   = result.data[0]
    if data.get('status') == 'done' and old['status'] != 'done':
        try:
            completer  = db.table('users').select('full_name').eq('id', session['user_id']).single().execute()
            recipients = {old['creator']['email']}
            if old.get('assignee'):
                recipients.add(old['assignee']['email'])
            for email in recipients:
                send_task_completed(
                    to_email=email,
                    task_title=old['title'],
                    completer_name=completer.data['full_name'],
                    access_token=session.get('google_access_token', ''),
                    refresh_token=session.get('google_refresh_token', '')
                )
        except Exception as e:
            print(f'Email error: {e}')
    return jsonify(task)

@tasks_bp.route('/<task_id>', methods=['DELETE'])
@require_auth
def delete_task(task_id):
    db = get_supabase()
    db.table('tasks').delete().eq('id', task_id).execute()
    return jsonify({'message': 'Deleted'}), 200