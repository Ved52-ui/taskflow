from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import base64, os

def _get_gmail_service(access_token: str, refresh_token: str):
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri='https://oauth2.googleapis.com/token',
        client_id=os.environ['GOOGLE_CLIENT_ID'],
        client_secret=os.environ['GOOGLE_CLIENT_SECRET'],
    )
    return build('gmail', 'v1', credentials=creds)

def _build_email(to: str, subject: str, html_body: str) -> str:
    msg = MIMEMultipart('alternative')
    msg['To'] = to
    msg['Subject'] = subject
    msg.attach(MIMEText(html_body, 'html'))
    return base64.urlsafe_b64encode(msg.as_bytes()).decode()

def send_task_assigned(to_email, task_title, assigner_name, access_token, refresh_token):
    subject = f'[TaskFlow] New task assigned: {task_title}'
    body = f'''
    <div style="font-family:sans-serif;max-width:500px;margin:auto">
      <h2 style="color:#1E40AF">You have a new task!</h2>
      <p><strong>{assigner_name}</strong> assigned you a task:</p>
      <h3 style="background:#DBEAFE;padding:12px;border-radius:8px">{task_title}</h3>
      <a href="{os.environ['FRONTEND_URL']}/dashboard"
         style="background:#1E40AF;color:white;padding:10px 20px;
                border-radius:8px;text-decoration:none">
        View Dashboard
      </a>
    </div>'''
    service = _get_gmail_service(access_token, refresh_token)
    service.users().messages().send(
        userId='me',
        body={'raw': _build_email(to_email, subject, body)}
    ).execute()

def send_task_completed(to_email, task_title, completer_name, access_token, refresh_token):
    subject = f'[TaskFlow] Task completed: {task_title}'
    body = f'''
    <div style="font-family:sans-serif;max-width:500px;margin:auto">
      <h2 style="color:#065F46">Task Completed!</h2>
      <p><strong>{completer_name}</strong> completed:</p>
      <h3 style="background:#D1FAE5;padding:12px;border-radius:8px">{task_title}</h3>
      <a href="{os.environ['FRONTEND_URL']}/dashboard"
         style="background:#065F46;color:white;padding:10px 20px;
                border-radius:8px;text-decoration:none">
        View Dashboard
      </a>
    </div>'''
    service = _get_gmail_service(access_token, refresh_token)
    service.users().messages().send(
        userId='me',
        body={'raw': _build_email(to_email, subject, body)}
    ).execute()