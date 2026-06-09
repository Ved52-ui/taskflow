from flask import Flask, app
from flask_cors import CORS
from flask_session import Session
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY']           = os.environ['SECRET_KEY']
    app.config['SESSION_TYPE']         = 'filesystem'
    app.config['SESSION_PERMANENT']    = True
    app.config['SESSION_FILE_DIR']     = './flask_sessions'
    app.config['SESSION_COOKIE_NAME']  = 'taskflow_session'
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE']   = False

    Session(app)

    CORS(app,
         supports_credentials=True,
         origins=[os.environ.get('FRONTEND_URL', 'http://localhost:3000')],
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
    )

    from .routes.auth       import auth_bp
    from .routes.tasks      import tasks_bp
    from .routes.users      import users_bp
    from .routes.email_auth import email_bp
    app.register_blueprint(auth_bp,   url_prefix='/auth')
    app.register_blueprint(email_bp,  url_prefix='/auth/email')
    app.register_blueprint(tasks_bp,  url_prefix='/api/tasks')
    app.register_blueprint(users_bp,  url_prefix='/api/users')

    @app.route('/health')
    def health():
        return {'status': 'ok'}, 200

    return app