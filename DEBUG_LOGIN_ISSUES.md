# Debugging Taskflow Login Issues

## Quick Diagnosis

### Step 1: Check Browser Console
1. Open your Vercel app in browser
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Try to login and watch for errors

Common errors:
- `CORS error` → Backend CORS not configured for your Vercel domain
- `Unexpected token '<'` → Backend returning HTML error instead of JSON
- `Undefined is not an object reading 'token'` → Callback token not being passed

### Step 2: Check Network Tab
1. Open **Network** tab in DevTools
2. Try to login again
3. Look for these requests:

**For Google Login:**
- Request to `/auth/google/login` should redirect to `accounts.google.com`
- After Google auth, should redirect back to `your-vercel-url/auth/login/callback?token=xxx`

**For Email Login:**
- POST to `/auth/email/login` should return `{"token": "...", "user": {...}}`
- Check status code: should be `200` or `201`

### Step 3: Check Railway Backend Logs
1. Go to Railway dashboard → Your Backend service
2. Click **Logs** tab
3. Try to login again and watch the logs
4. Look for:
   - Any Python errors
   - Failed requests to Supabase
   - CORS errors

### Step 4: Verify Environment Variables

**Check what's actually set:**

In Railway dashboard:
```
Backend → Settings → Variables
- FRONTEND_URL = ? (should be https://your-vercel-url.vercel.app)
- GOOGLE_REDIRECT_URI = ? (should be https://your-railway-url/auth/google/callback)
- GOOGLE_CLIENT_ID = ? (should not be empty)
```

In Vercel dashboard:
```
Settings → Environment Variables
- NEXT_PUBLIC_API_URL = ? (should be https://your-railway-url)
```

---

## Common Issues & Solutions

### Issue 1: "Cannot POST /auth/email/login"
**Symptom:** 404 error when submitting login form

**Cause:** Frontend is calling wrong API URL

**Solution:**
```
1. Check Vercel env vars: NEXT_PUBLIC_API_URL should be set
2. Redeploy Vercel after setting env var
3. Check that Railway backend URL is correct and doesn't have trailing slash
```

---

### Issue 2: CORS error in console
**Symptom:** `Access to XMLHttpRequest blocked by CORS policy`

**Cause:** Backend's `FRONTEND_URL` env var doesn't match your Vercel domain

**Solution:**
```
1. Get your Vercel URL (e.g., https://taskflow-app.vercel.app)
2. In Railway dashboard → Backend Variables
3. Set: FRONTEND_URL = https://taskflow-app.vercel.app (exact match!)
4. Redeploy backend
5. Wait a few minutes and test again
```

---

### Issue 3: Blank page after Google auth
**Symptom:** After clicking Google button, page goes blank or redirects to login

**Cause:** Token not being passed in callback URL or token not saved

**Solution:**
```
1. In Chrome DevTools, check Network tab
2. Find the redirect after Google auth
3. Look at the URL - should have ?token=xxxx
4. If token is there, check localStorage by running in console:
   console.log(localStorage.getItem('taskflow_token'))
5. If token is NOT there, it's failing at the callback handler
```

---

### Issue 4: Showing as logged out immediately
**Symptom:** Login works, redirects to dashboard, but immediately shows login page

**Cause:** Token validation failing - either:
- Token is corrupted
- Backend can't read the token (secret key mismatch)
- User lookup failing in Supabase

**Solution:**
```
1. In browser console:
   console.log(localStorage.getItem('taskflow_token'))
2. Copy the token and go to jwt.io
3. Paste it in the "Encoded" section
4. Check if the data looks correct
5. If token looks valid, issue is backend-side - check Railway logs
```

---

### Issue 5: Google login infinitely redirects
**Symptom:** Click Google button, redirects to Google, logs in, redirects back, then infinite loop

**Cause:** `GOOGLE_REDIRECT_URI` not set correctly or mismatched in Google Console

**Solution:**
```
1. Check Railway: GOOGLE_REDIRECT_URI = https://your-railway-url/auth/google/callback
2. Go to Google Cloud Console
3. Your OAuth app → Authorized redirect URIs
4. Check it EXACTLY matches GOOGLE_REDIRECT_URI (including https://, no trailing slash)
5. Add it if not present
6. Wait a few minutes and test
```

---

## Advanced Debugging

### Get actual API URL from frontend
```javascript
// Run in browser console on your Vercel app
console.log("API URL:", process.env.NEXT_PUBLIC_API_URL)
```

### Test backend directly
```bash
# Test if backend is running
curl https://your-railway-url/health

# Test if CORS is working (replace with your Vercel URL)
curl -H "Origin: https://your-vercel-url.vercel.app" \
     https://your-railway-url/health
```

### Check backend environment
```bash
# SSH into Railway (if available) or check logs
# Look for these lines in startup logs:
# - FRONTEND_URL being set
# - CORS configuration
# - Flask app starting on port 5000
```

---

## Still Not Working?

1. **Restart both services:**
   - Railway: Click restart in dashboard
   - Vercel: Redeploy (push to main branch or click redeploy button)

2. **Clear browser cache:**
   - DevTools → Settings → check "Disable cache while DevTools open"
   - Or do hard refresh: Ctrl+Shift+R

3. **Check for typos:**
   - URLs should not have trailing slashes
   - Domains should be exact matches
   - No extra spaces in env vars

4. **Last resort:**
   - Check all env vars match exactly
   - Redeploy both services fresh
   - Clear all cookies/localStorage
   - Try in incognito/private mode
