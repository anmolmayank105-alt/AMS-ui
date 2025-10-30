# Switch Mode - Production/Development Configuration Fix

## Problem Identified
The application had hardcoded `http://localhost:5000` URLs in multiple files, causing connection failures in production deployment on Render.

## Root Cause
Pages were using `api-service.js` without first loading `config.js`, which sets the correct `window.API_BASE_URL` based on environment (localhost vs production).

---

## Changes Made

### 1. Frontend Configuration Files

#### Added `config.js` to ALL pages using API calls:

**Files Modified:**
- ✅ `alumnetics-frontend/pages/dashboard/student-dashboard.html` - Added config.js script tag
- ✅ `alumnetics-frontend/pages/dashboard/alumni-dashboard.html` - Added config.js script tag
- ✅ `alumnetics-frontend/pages/dashboard/admin-dashboard-fixed.html` - Added config.js script tag
- ✅ `alumnetics-frontend/pages/dashboard/admin-events-new.html` - Added config.js script tag
- ✅ `alumnetics-frontend/pages/dashboard/student-profile.html` - Added config.js script tag
- ✅ `alumnetics-frontend/pages/events/index.html` - Added config.js script tag
- ✅ `alumnetics-frontend/pages/profile/view-profile.html` - Added config.js script tag

**Change Pattern:**
```html
<!-- BEFORE -->
<script src="../../assets/js/api-service.js"></script>

<!-- AFTER -->
<script src="../../assets/js/config.js"></script>
<script src="../../assets/js/api-service.js"></script>
```

---

### 2. Profile Management Script

#### File: `alumnetics-frontend/assets/js/profile.js`

**Line 58 - Fetch Profile Function:**
```javascript
// BEFORE
const response = await fetch('http://localhost:5000/api/profile/me', {

// AFTER
const apiBaseUrl = window.API_BASE_URL || 'http://localhost:5000/api';
const response = await fetch(`${apiBaseUrl}/profile/me`, {
```

**Line 921 - Save Profile Function:**
```javascript
// BEFORE
const response = await fetch('http://localhost:5000/api/profile/me', {

// AFTER
const apiBaseUrl = window.API_BASE_URL || 'http://localhost:5000/api';
const response = await fetch(`${apiBaseUrl}/profile/me`, {
```

---

### 3. Backend CORS Configuration

#### File: `alumnetics-backend/server.js`

**Added new frontend URL to allowed origins:**
```javascript
const allowedOrigins = [
  'https://ams-ui-1.onrender.com',           // ← NEW: Added current frontend URL
  'https://ams-ui-frontend.onrender.com',
  'https://alumnetics-frontend.vercel.app',
  'https://ams-ui-one.vercel.app',
  'https://frontend-two-eosin-67.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];
```

---

## How It Works Now

### Development Mode (localhost)
```javascript
// config.js detects localhost
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.API_BASE_URL = 'http://localhost:5000/api';
}
```
→ Frontend connects to: `http://localhost:5000/api`

### Production Mode (Render)
```javascript
// config.js detects production domain
else {
    window.API_BASE_URL = 'https://ams-ui-mw1o.onrender.com/api';
}
```
→ Frontend connects to: `https://ams-ui-mw1o.onrender.com/api`

---

## Deployment URLs

### Backend (Node.js Web Service)
- **URL:** https://ams-ui-mw1o.onrender.com
- **Health Check:** https://ams-ui-mw1o.onrender.com/health
- **API Base:** https://ams-ui-mw1o.onrender.com/api

### Frontend (Static Site)
- **URL:** https://ams-ui-1.onrender.com
- **Root Directory:** `alumnetics-frontend`
- **Publish Directory:** `.`

---

## Git Commits Made

1. **commit caab41e** - "CRITICAL FIX: Add config.js to all dashboard pages"
2. **commit aba265e** - "CRITICAL FIX Round 3: Add config.js to ALL pages using api-service.js"
3. **commit 7f13c06** - "FIX: Replace hardcoded localhost in profile.js with window.API_BASE_URL"
4. **commit 2e52170** - "Update CORS for new frontend URL + force redeploy"

---

## Testing Checklist

- ✅ Login page connects to production backend
- ✅ Register page connects to production backend
- ✅ Student dashboard loads events from production
- ✅ Alumni dashboard loads data from production
- ✅ Admin dashboard connects to production API
- ✅ Events page loads from production backend
- ✅ Profile view fetches from production
- ✅ Profile edit saves to production backend
- ✅ No more `ERR_CONNECTION_REFUSED` errors
- ✅ No more `localhost:5000` connection attempts in production

---

## Key Takeaway

**Always load `config.js` BEFORE `api-service.js` or any file making API calls!**

This ensures the correct API URL is set based on the environment, enabling seamless switching between development and production modes.

---

**Date:** October 30, 2025  
**Status:** ✅ Complete - All fixes deployed to production
