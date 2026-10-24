# OAuth Flow Diagram

## How Login Works (Simplified)
j
```
┌─────────────┐          ┌──────────────────┐       ┌───────────┐
│   Vercel    │          │  Railway Backend │       │  Google   │
│  Frontend   │          │   (Flask Server) │       │  OAuth    │
└──────┬──────┘          └────────┬─────────┘       └─────┬─────┘
       │                         │                        │
       │ 1. Click "Google Login" │                        │
       ├────────────────────────>│                        │
       │                         │ 2. Redirect to Google  │
       │                         ├───────────────────────>│
       │<─────────────────────────────────────────────────┤
       │         3. Google login page                      │
       │                                                   │
       │ 4. User logs in with Google account              │
       │                         ┌─────────────────────────┤
       │                         │ 5. Authorization code   │
       │                         │<──────────────────────┤
       │                         │                        │
       │ 6. Redirect back with code & state               │
       │<────────────────────────┤                        │
       │  /callback?code=xxx     │                        │
       │                         │                        │
       │ 7. Frontend sends code to backend                │
       ├────────────────────────>│                        │
       │  /auth/google/callback  │                        │
       │                         │ 8. Verify with Google  │
       │                         ├───────────────────────>│
       │                         │<───────────────────────┤
       │                         │  (ID token validated)   │
       │                         │                        │
       │                         │ 9. Create/Update user in DB
       │                         │                        │
       │ 10. Return JWT token                             │
       │<────────────────────────┤                        │
       │  redirect?token=jwt     │                        │
       │                         │                        │
       │ 11. Save token to localStorage
       │ 12. Redirect to /dashboard
       │                         │                        │
```

## Email Login Flow

```
┌─────────────┐          ┌──────────────────┐       ┌─────────────┐
│   Vercel    │          │  Railway Backend │       │  Supabase   │
│  Frontend   │          │   (Flask Server) │       │  Database   │
└──────┬──────┘          └────────┬─────────┘       └──────┬──────┘
       │                         │                        │
       │ 1. Enter email/password │                        │
       ├────────────────────────>│                        │
       │  POST /auth/email/login │                        │
       │                         │ 2. Hash password       │
       │                         │    Query database       │
       │                         ├───────────────────────>│
       │                         │<───────────────────────┤
       │                         │  (User data returned)   │
       │                         │                        │
       │                         │ 3. Verify password     │
       │                         │    Create JWT token    │
       │ 4. Return JWT token     │                        │
       │<────────────────────────┤                        │
       │  {token: "...", user}   │                        │
       │                         │                        │
       │ 5. Save token to localStorage
       │ 6. Fetch user data with token
       │ 7. Redirect to /dashboard
```

## Environment Variables Flow

```
┌─────────────────────────────────────────┐
│         Google Cloud Console            │
│  (OAuth Credentials & Redirect URIs)    │
│  GOOGLE_CLIENT_ID                       │
│  GOOGLE_CLIENT_SECRET                   │
└────────┬──────────────────────┬─────────┘
         │                      │
         │ Config              │ Config
         ▼                      ▼
┌──────────────────────┐  ┌──────────────────────┐
│  Railway Backend     │  │  Vercel Frontend     │
│  Environment Vars:   │  │  Environment Vars:   │
│                      │  │                      │
│ GOOGLE_CLIENT_ID ──┐ │  │ NEXT_PUBLIC_API_URL  │
│ GOOGLE_CLIENT_    ├─┼──┼─> https://railway-url│
│   SECRET           │ │  │                      │
│ GOOGLE_REDIRECT_URI│ │  │ Points to:           │
│   = https://       │ │  │ Railway backend API  │
│   railway-url/auth/│ │  │                      │
│   google/callback  │ │  │ Used by all API      │
│                    │ │  │ calls (login,        │
│ FRONTEND_URL       │ │  │ register, tasks...)  │
│   = https://vercel │ │  │                      │
│   -url.vercel.app  │ │  │                      │
│                    │ │  │                      │
│ (CORS whitelist)   │ │  │                      │
└────────────────────┘ │  └──────────────────────┘
                       │
         Redirect back to Vercel URL after login
```

## What Goes Wrong

### Scenario 1: GOOGLE_REDIRECT_URI = localhost
```
❌ User clicks Google → redirects to accounts.google.com
❌ Google tries to redirect back to localhost → FAILS
❌ User sees error in Google (redirect_uri_mismatch)
```

### Scenario 2: NEXT_PUBLIC_API_URL = localhost
```
✓ Frontend loads in Vercel (production)
❌ Frontend tries to call http://localhost:5000/auth/email/login
❌ CORS error or refused connection
❌ Login fails
```

### Scenario 3: FRONTEND_URL not set correctly
```
✓ User logs in successfully at Railway backend
❌ Backend tries to redirect to ${FRONTEND_URL}/auth/login/callback
❌ If FRONTEND_URL is wrong, redirect goes to wrong place
❌ User sees 404 or stays on Google page
```

## Test Checklist

Before deploying:

- [ ] GOOGLE_REDIRECT_URI in Railway = https://your-railway-backend-url/auth/google/callback
- [ ] FRONTEND_URL in Railway = https://your-vercel-url.vercel.app
- [ ] NEXT_PUBLIC_API_URL in Vercel = https://your-railway-backend-url
- [ ] All 3 values match your actual Railway and Vercel domains
- [ ] Google Console has correct Redirect URIs and Origins
- [ ] Both services are redeployed after changing env vars
