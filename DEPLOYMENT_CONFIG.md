# Taskflow Deployment Configuration Guide

## For Railway Backend (Production)

### Required Environment Variables:

```env
# Railway Backend Environment Variables
SECRET_KEY=your-secret-key-here
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-railway-backend-url/auth/google/callback
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
```

### How to Get Your Railway Backend URL:
1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to "Settings" → "Domain"
4. You'll see a URL like: `https://taskflow-backend-production.up.railway.app`
5. Use this as your `GOOGLE_REDIRECT_URI` and for the frontend's `NEXT_PUBLIC_API_URL`

---

## For Vercel Frontend (Production)

### Required Environment Variables:

Create a `.env.local` file OR set them in Vercel dashboard under Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-railway-backend-url
```

Example:
```env
NEXT_PUBLIC_API_URL=https://taskflow-backend-production.up.railway.app
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Add Authorized redirect URIs:
   - `https://your-railway-backend-url/auth/google/callback` (Production)
   - `http://localhost:5000/auth/google/callback` (Local Development)
6. Add Authorized JavaScript origins:
   - `https://your-vercel-frontend-url.vercel.app` (Production)
   - `http://localhost:3000` (Local Development)

---

## Step-by-Step Deployment Checklist

### Step 1: Identify Your URLs
- **Railway Backend URL**: `https://your-railway-url` (from Railway dashboard)
- **Vercel Frontend URL**: `https://your-project.vercel.app` (from Vercel dashboard)

### Step 2: Update Google OAuth
In Google Cloud Console:
- Add `https://your-railway-url/auth/google/callback` to Authorized redirect URIs
- Add `https://your-project.vercel.app` to Authorized JavaScript origins

### Step 3: Set Railway Environment Variables
In Railway dashboard → your backend service → Variables:

```
FRONTEND_URL = https://your-project.vercel.app
GOOGLE_REDIRECT_URI = https://your-railway-url/auth/google/callback
```

(Keep other vars like SUPABASE_URL, GOOGLE_CLIENT_ID, etc.)

### Step 4: Set Vercel Environment Variables
In Vercel dashboard → your project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://your-railway-url
```

### Step 5: Deploy
- Push changes to trigger redeploy (or manually redeploy in each dashboard)
- Test login flow

---

## Testing

### Local Development (localhost)
```
Frontend: http://localhost:3000
Backend: http://localhost:5000
API calls should work with .env files set
```

### Production (Deployed)
1. Visit: `https://your-vercel-frontend.vercel.app/auth/login`
2. Click "Continue with Google"
3. You should be redirected through Railway backend → Google → back to your Vercel app
4. Token should be stored in localStorage

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Login redirects to login page after Google auth | Token not being passed or saved | Check if `?token=xxx` is in callback URL |
| "Cannot POST /auth/email/login" | Frontend calling wrong API URL | Check `NEXT_PUBLIC_API_URL` env var |
| CORS error in console | `FRONTEND_URL` doesn't match Vercel domain | Update Railway env var to exact Vercel URL |
| Google login doesn't redirect | `GOOGLE_REDIRECT_URI` incorrect | Check it matches Railway backend URL |
| Blank page after login | Token saved but API call failing | Check if backend is running and reachable |

