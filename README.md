<div align="center">

<img src="https://img.shields.io/badge/⚡-TaskFlow-FF4D00?style=for-the-badge&labelColor=0a0a0f&color=6366f1" alt="TaskFlow" height="40"/>
jhnj
# TaskFlow

### Full-Stack Collaborative Task Management Application

**Assign. Track. Ship. Together.**

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg?style=flat-square)](#)

---

🌐 **[Live Demo](https://taskflow-et5a-epbljo92h-veds-projects-e8f6d857.vercel.app)** · 📖 **[API Docs](#-api-reference)** · 🐛 **[Report Bug](issues)** · ✨ **[Request Feature](issues)**

</div>

---


</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication
- **Google OAuth 2.0** — One-click sign in with any Google account
- **Email + Password** — Register and login with custom credentials
- **JWT Tokens** — Secure cross-domain authentication
- **Instant Registration** — No email verification required
- **Profile Photo Upload** — Change avatar from dashboard
- **Persistent Sessions** — Stay logged in across visits

</td>
<td width="50%">

### 📋 Task Management
- **Create Tasks** — Title, description, priority, due date
- **4 Priority Levels** — Low, Medium, High, Urgent
- **3 Status Stages** — Todo → In Progress → Done
- **Filter & Count** — Filter tasks by status with live counts
- **Delete Tasks** — Creators can delete their own tasks
- **Completion Progress** — Visual ring showing % complete

</td>
</tr>
<tr>
<td width="50%">

### 👥 Team Collaboration
- **Assign Tasks** — Assign any task to any registered user
- **Creator Tracking** — See who created each task
- **Assignee Display** — Visual badges showing task owners
- **Multi-user Support** — Unlimited team members

</td>
<td width="50%">

### 📧 Email Notifications
- **Task Assigned** — Email sent to assignee when task is created
- **Task Completed** — Email sent to creator + assignee on completion
- **Gmail API** — Sent via Google's official API
- **HTML Emails** — Beautifully formatted notification emails

</td>
</tr>
</table>

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│              Next.js 16 + TypeScript (Vercel)               │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS + JWT Bearer Token
                       │ Axios with interceptors
┌──────────────────────▼──────────────────────────────────────┐
│                     FLASK API                               │
│              Python 3.14 + Gunicorn (Railway)               │
│                                                             │
│  /auth/google/login     →  OAuth 2.0 flow                   │
│  /auth/google/callback  →  JWT token generation             │
│  /auth/email/register   →  Email account creation           │
│  /auth/email/login      →  Email authentication             │
│  /auth/me               →  Current user info                │
│  /api/tasks/            →  CRUD operations                  │
│  /api/users/            →  User directory                   │
└──────┬───────────────────────────────────┬──────────────────┘
       │ REST API calls                    │ Gmail API
       │ (python requests)                 │ (google-api-python-client)
┌──────▼──────────────┐         ┌──────────▼──────────────────┐
│  Supabase           │         │  Google Cloud               │
│  PostgreSQL         │         │                             │
│  (managed DB)       │         │  • OAuth 2.0                │
│                     │         │  • Gmail API                │
│  Tables:            │         │  • People API               │
│  • users            │         │                             │
│  • tasks            │         └─────────────────────────────┘
└─────────────────────┘
```

---

## 🛠 Tech Stack

<div align="center">

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js + TypeScript | 16.2.7 | React framework with App Router |
| **Styling** | Tailwind CSS + Custom CSS | 3.x | Utility-first + animations |
| **HTTP Client** | Axios | Latest | API calls with JWT interceptors |
| **Backend** | Python Flask | 3.0.3 | REST API server |
| **Auth** | Google OAuth 2.0 + JWT | — | Cross-domain authentication |
| **Database** | Supabase (PostgreSQL) | — | Managed relational database |
| **Email** | Gmail API | v1 | Transactional notifications |
| **Frontend Deploy** | Vercel | — | Edge CDN + CI/CD |
| **Backend Deploy** | Railway | — | Container hosting |
| **CORS** | Flask-CORS | 4.0.1 | Cross-origin resource sharing |

</div>

---

## 🗄 Database Schema

### `users` table

```sql
CREATE TABLE public.users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id     TEXT UNIQUE NOT NULL,      -- Google sub ID or email_ prefix
  email         TEXT UNIQUE NOT NULL,      -- User email address
  full_name     TEXT NOT NULL,             -- Display name
  avatar_url    TEXT,                      -- Google profile picture URL
  password_hash TEXT,                      -- SHA-256 hash (email auth only)
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### `tasks` table

```sql
CREATE TABLE public.tasks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,             -- Task title
  description   TEXT,                      -- Optional details
  status        task_status DEFAULT 'todo',-- todo | in_progress | done
  priority      task_priority DEFAULT 'medium', -- low | medium | high | urgent
  due_date      DATE,                      -- Optional deadline
  creator_id    UUID REFERENCES users(id), -- Who created it
  assignee_id   UUID REFERENCES users(id), -- Who it's assigned to
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security

```sql
-- All authenticated users can read all tasks and users
-- Only task creators can modify/delete their tasks
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/auth/google/login` | Redirect to Google OAuth | ❌ |
| `GET` | `/auth/google/callback` | OAuth callback → JWT | ❌ |
| `POST` | `/auth/email/register` | Register with email/password | ❌ |
| `POST` | `/auth/email/login` | Login with email/password | ❌ |
| `GET` | `/auth/me` | Get current user | ✅ |
| `POST` | `/auth/logout` | Clear session | ✅ |
| `GET` | `/health` | Health check | ❌ |

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/tasks/` | Get all tasks | ✅ |
| `POST` | `/api/tasks/` | Create a new task | ✅ |
| `PATCH` | `/api/tasks/:id` | Update task (status, etc.) | ✅ |
| `DELETE` | `/api/tasks/:id` | Delete a task | ✅ |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/users/` | Get all users (for assignment) | ✅ |

### Request/Response Examples

**POST** `/auth/email/register`
```json
// Request
{
  "full_name": "Ved Patel",
  "email": "ved@example.com",
  "password": "securepassword"
}

// Response 201
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "ved@example.com",
    "full_name": "Ved Patel"
  }
}
```

**POST** `/api/tasks/`
```json
// Request
{
  "title": "Design new landing page",
  "description": "Update the hero section",
  "priority": "high",
  "due_date": "2026-06-30",
  "assignee_id": "user-uuid-here"
}

// Response 201
{
  "id": "task-uuid",
  "title": "Design new landing page",
  "status": "todo",
  "priority": "high",
  "creator": { "id": "...", "full_name": "Ved Patel" },
  "assignee": { "id": "...", "full_name": "John Smith" }
}
```

---

## 🚀 Local Development

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| Python | 3.11+ | [python.org](https://python.org) |
| Git | 2.x+ | [git-scm.com](https://git-scm.com) |

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your keys
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local
```

### 4. Database Setup

Run migrations in order in **Supabase SQL Editor**:

```bash
backend/migrations/001_users.sql
backend/migrations/002_tasks.sql
backend/migrations/003_rls.sql
```

### 5. Run Both Servers

```bash
# Terminal 1 — Backend
cd backend && python run.py
# Runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm run dev
# Runs on http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key-min-32-chars

# Google OAuth + Gmail
GOOGLE_CLIENT_ID=your--------------------------------------
GOOGLE_CLIENT_SECRET=y---------------------------------
GOOGLE_REDIRECT_URI=----------------------------

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ..-----------------

# App
FRONTEND_URL=http://localhost:3000
GMAIL_SENDER_EMAIL=-----------------
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📁 Project Structure

```
taskflow/
├── 📁 backend/                    # Flask API
│   ├── 📁 app/
│   │   ├── 📁 routes/
│   │   │   ├── auth.py           # Google OAuth + JWT
│   │   │   ├── email_auth.py     # Email/password auth
│   │   │   ├── tasks.py          # Task CRUD
│   │   │   └── users.py          # User directory
│   │   ├── 📁 services/
│   │   │   ├── email.py          # Gmail API service
│   │   │   └── supabase_client.py
│   │   └── __init__.py           # App factory + CORS
│   ├── 📁 migrations/
│   │   ├── 001_users.sql
│   │   ├── 002_tasks.sql
│   │   └── 003_rls.sql
│   ├── .env.example
│   ├── Procfile                   # Railway deployment
│   ├── railway.json
│   ├── requirements.txt
│   └── run.py
│
├── 📁 frontend/                   # Next.js App
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📁 auth/
│   │   │   │   ├── 📁 login/     # Login + Register page
│   │   │   │   └── 📁 callback/  # OAuth token handler
│   │   │   ├── 📁 dashboard/     # Main task dashboard
│   │   │   └── layout.tsx
│   │   ├── 📁 components/
│   │   │   ├── TaskCard.tsx      # Individual task display
│   │   │   └── CreateTaskForm.tsx
│   │   ├── 📁 lib/
│   │   │   ├── api.ts            # Axios client + JWT
│   │   │   └── auth-context.tsx  # Auth state management
│   │   └── 📁 types/
│   │       └── index.ts          # TypeScript interfaces
│   ├── .env.example
│   └── next.config.ts
│
└── README.md
```

---

## 🚢 Deployment

### Frontend → Vercel

```bash
# 1. Push to GitHub
git push origin main

# 2. Import to Vercel
# vercel.com → New Project → Import repo
# Root Directory: frontend
# Add env: NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
```

### Backend → Railway

```bash
# 1. Railway → New Project → Deploy from GitHub
# Root Directory: backend
# Add all environment variables from .env.example
```

### Live URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://taskflow-et5a-epbljo92h-veds-projects-e8f6d857.vercel.app |
| **Backend API** | https://taskflow-production-9121.up.railway.app |
| **Health Check** | https://taskflow-production-9121.up.railway.app/health |

---

## 🔒 Security

- **JWT Authentication** — HS256 signed tokens with 30-day expiry
- **Password Hashing** — SHA-256 with secret key salt
- **Row Level Security** — Supabase RLS policies on all tables
- **CORS Protection** — Restricted to known frontend origins
- **HTTPS Only** — All production traffic encrypted
- **Service Role Key** — Never exposed to frontend
- **OAuth 2.0** — Industry standard Google authentication

---

## 📧 Email Notifications

TaskFlow sends **HTML emails** via the Gmail API for two events:

| Event | Recipients | Trigger |
|-------|-----------|---------|
| **Task Assigned** | Assignee | When a task is created with an assignee |
| **Task Completed** | Creator + Assignee | When task status changes to `done` |

Email is sent using the **logged-in user's OAuth token** — so emails come from the actual user's Gmail account.

---

## 🤝 Contributing

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m 'feat: add amazing feature'

# 4. Push to branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Built with ⚡ by [Ved Patel](https://github.com/Ved52-ui)**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Ved52-ui/taskflow)
[![Vercel](https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://taskflow-et5a-epbljo92h-veds-projects-e8f6d857.vercel.app)

*If you found this helpful, please give it a ⭐*

</div>
