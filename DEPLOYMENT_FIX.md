# Messaging "Not Found" Error - Deployment Fix

## Problem
After deployment, messaging page shows "not found" error because the frontend cannot connect to the backend API.

## Root Cause
The frontend is trying to connect to `http://localhost:5000/api` (development URL) instead of the deployed backend URL.

## Solution

### Option 1: Deploy Backend First (Recommended)

1. **Deploy the backend to Vercel:**
   ```bash
   cd alumnetics-backend
   vercel --prod
   ```
   
2. **Copy the backend deployment URL** (e.g., `https://alumnetics-backend-xyz.vercel.app`)

3. **Update `vercel.json` in root** with your actual backend URL:
   ```json
   {
     "buildCommand": "cd alumnetics-react && npm install && npm run build",
     "outputDirectory": "alumnetics-react/dist",
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://YOUR-BACKEND-URL.vercel.app/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

4. **Set environment variable in Vercel Dashboard:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add: `VITE_API_URL` = `https://YOUR-BACKEND-URL.vercel.app/api`
   - Redeploy the frontend

### Option 2: Monorepo Deployment

If deploying both frontend and backend in the same Vercel project:

1. **Create `vercel.json` in `alumnetics-backend/`:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "api/index.js"
       },
       {
         "src": "/health",
         "dest": "api/index.js"
       }
     ]
   }
   ```

2. **Update root `vercel.json`:**
   ```json
   {
     "buildCommand": "cd alumnetics-react && npm install && npm run build",
     "outputDirectory": "alumnetics-react/dist",
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ],
     "env": {
       "VITE_API_URL": "/api"
     }
   }
   ```

### Option 3: Environment Variables Only

If you can't modify `vercel.json`, just set environment variables:

**In Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add these variables:
   - `VITE_API_URL` = `https://your-backend-url.vercel.app/api`
3. Redeploy (or trigger a new build)

**In GitHub (for automatic deployments):**
1. Create `.env.production` in `alumnetics-react/`:
   ```bash
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```
2. Commit and push

## Quick Test

After deploying, test these endpoints:

1. **Backend Health Check:**
   ```
   https://your-backend-url.vercel.app/health
   ```
   Should return: `{"status":"OK",...}`

2. **Frontend API Check:**
   - Open browser DevTools → Network tab
   - Navigate to messaging page
   - Check if API calls go to correct URL
   - Should see: `https://your-backend-url.vercel.app/api/messages/...`

## Common Issues

### Issue 1: CORS Error
**Symptom:** "Access to fetch has been blocked by CORS policy"

**Fix:** Update backend CORS configuration in `alumnetics-backend/api/index.js`:
```javascript
app.use(cors({
  origin: [
    'https://your-frontend-url.vercel.app',
    process.env.CLIENT_URL
  ],
  credentials: true
}));
```

### Issue 2: 404 on API Routes
**Symptom:** All API calls return 404

**Fix:** Ensure backend routes are registered:
- Check `alumnetics-backend/api/index.js` has `app.use('/api', apiRoutes)`
- Verify `alumnetics-backend/src/routes/index.js` registers message routes

### Issue 3: WebSocket Connection Failed
**Symptom:** Real-time messaging doesn't work

**Fix:** Socket.io doesn't work on Vercel serverless functions. Use polling:
- Frontend already has polling fallback
- Ensure `/api/messages/poll` endpoint works

## Verification Steps

1. ✅ Backend deployed and accessible
2. ✅ Frontend environment variable set
3. ✅ vercel.json updated with backend URL
4. ✅ CORS configured for frontend domain
5. ✅ Test messaging page loads
6. ✅ Test sending a message
7. ✅ Test receiving messages

## Need Help?

If you still see "not found" error:
1. Check browser console for exact error
2. Check Network tab for failed requests
3. Verify environment variables are set in Vercel
4. Ensure backend is deployed and running
