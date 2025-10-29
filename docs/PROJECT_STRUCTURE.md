# ALUMNETICS - Project Structure Guide

## 📁 Clean & Organized Structure

### Root Directory (`demo/`)
```
demo/
├── alumnetics-backend/          # Backend API Server
├── alumnetics-frontend/         # Frontend Web App
├── docs/                        # All Documentation
├── README.md                    # Main project README
├── START_APP.bat               # Windows quick start
└── START_APP.ps1               # PowerShell quick start
```

---

## 🔧 Backend Structure (`alumnetics-backend/`)

```
alumnetics-backend/
├── src/
│   ├── controllers/            # Business Logic
│   │   ├── authController.js       # Authentication
│   │   ├── eventController.js      # Event management
│   │   ├── userController.js       # User management
│   │   ├── jobController.js        # Job portal
│   │   ├── messageController.js    # Messaging
│   │   └── ...
│   │
│   ├── models/                 # Database Models
│   │   ├── User.js                 # User schema
│   │   ├── Event.js                # Event schema
│   │   ├── Job.js                  # Job schema
│   │   ├── Message.js              # Message schema
│   │   └── ...
│   │
│   ├── routes/                 # API Routes
│   │   ├── auth.js                 # /api/auth/*
│   │   ├── events.js               # /api/events/*
│   │   ├── users.js                # /api/users/*
│   │   └── ...
│   │
│   ├── middleware/             # Express Middleware
│   │   └── auth.js                 # JWT authentication
│   │
│   └── utils/                  # Helper Functions
│
├── scripts/                    # Utility Scripts ⭐ NEW
│   ├── test-events.js             # Check database events
│   ├── fix-events.js              # Fix user/event data
│   └── approve-events.js          # Auto-approve events
│
├── server.js                   # Main server file
├── package.json                # Dependencies
└── .env                        # Environment variables
```

### Script Usage:
```bash
# Check what's in the database
node scripts/test-events.js

# Fix user institutions and approve events
node scripts/fix-events.js

# Approve all pending events
node scripts/approve-events.js
```

---

## 🎨 Frontend Structure (`alumnetics-frontend/`)

```
alumnetics-frontend/
├── pages/
│   ├── auth/                   # Authentication Pages
│   │   ├── login.html              # Login page
│   │   └── register.html           # Registration page
│   │
│   ├── dashboard/              # Dashboard Pages
│   │   ├── admin-dashboard-fixed.html  ✅ MAIN ADMIN DASHBOARD
│   │   ├── admin-events-new.html       ✅ MAIN ADMIN EVENTS
│   │   └── student-dashboard.html      ✅ STUDENT DASHBOARD
│   │
│   ├── events/                 # Event Pages
│   │   └── index.html              ✅ MAIN STUDENT EVENTS
│   │
│   ├── profile/                # Profile Pages
│   │   └── index.html              # User profile
│   │
│   ├── jobs/                   # Job Portal
│   │   └── index.html              # Job listings
│   │
│   ├── fundraising/            # Fundraising
│   │   └── index.html              # Campaign listings
│   │
│   ├── messaging/              # Messaging
│   │   └── index.html              # Chat interface
│   │
│   └── network/                # Alumni Network
│       └── index.html              # Network page
│
├── assets/
│   ├── css/                    # Stylesheets
│   │   └── ...
│   │
│   ├── js/                     # JavaScript
│   │   ├── api-service.js          # API communication ⭐ IMPORTANT
│   │   ├── utils.js                # Utility functions
│   │   ├── config.js               # Configuration
│   │   └── ...
│   │
│   └── images/                 # Images
│       └── ...
│
└── index.html                  # Landing page
```

### Key Files:
- ✅ `admin-dashboard-fixed.html` - Main admin dashboard (use this)
- ✅ `admin-events-new.html` - Admin events management (use this)
- ✅ `student-dashboard.html` - Student dashboard
- ✅ `events/index.html` - Student events page (completely rebuilt)

---

## 📚 Documentation (`docs/`)

```
docs/
├── EVENT_TROUBLESHOOTING.md    # Event system guide
├── QUICK_START.md              # Getting started
├── START_HERE.md               # Project overview
├── ROADMAP.md                  # Future plans
├── SUMMARY.md                  # Project summary
└── README_VERCEL.md            # Deployment guide
```

---

## 🗑️ Removed Files (Cleanup)

### Deleted Duplicate Admin Pages:
- ❌ `admin-dashboard.html` (old version)
- ❌ `admin-dashboard-v2.html` (duplicate)
- ❌ `admin-dashboard-new.html` (duplicate)
- ❌ `admin-events.html` (old version)
- ❌ `admin-events-table-view.html` (old version)

### Deleted Old Documentation:
- ❌ 23 old markdown files
- ❌ Various debug/test files
- ❌ Backup files (.backup)
- ❌ Duplicate notes

**Total Cleaned: 33 files** 🎉

---

## 🚀 Quick Access URLs

### Admin:
- Login: http://localhost:3000/pages/auth/login.html
- Dashboard: http://localhost:3000/pages/dashboard/admin-dashboard-fixed.html
- Events: http://localhost:3000/pages/dashboard/admin-events-new.html

### Student:
- Login: http://localhost:3000/pages/auth/login.html
- Dashboard: http://localhost:3000/pages/dashboard/student-dashboard.html
- Events: http://localhost:3000/pages/events/index.html

### API:
- Backend: http://localhost:5000
- Health: http://localhost:5000/api/health
- API Docs: http://localhost:5000/api/docs (if configured)

---

## 📝 File Naming Convention

### Active Files:
- `*-fixed.html` - Final, working version
- `*-new.html` - Current implementation
- `index.html` - Main page for that section

### Avoid:
- `*-old.html`
- `*-v2.html`, `*-v3.html`
- `*-backup.*`
- `test-*.html`

---

## 🎯 Best Practices

### When Adding New Features:
1. ✅ Update the main file (e.g., `admin-dashboard-fixed.html`)
2. ✅ Don't create duplicate versions
3. ✅ Use descriptive commits
4. ✅ Update documentation in `docs/`

### When Debugging:
1. ✅ Use browser console (F12)
2. ✅ Check backend logs
3. ✅ Run `scripts/test-events.js` to verify database
4. ✅ See `docs/EVENT_TROUBLESHOOTING.md`

### File Organization:
1. ✅ Backend scripts → `alumnetics-backend/scripts/`
2. ✅ Documentation → `docs/`
3. ✅ Keep root directory clean
4. ✅ One main version per page

---

## 🔐 Important Notes

### Active Pages (DO NOT DELETE):
- `admin-dashboard-fixed.html` ⭐
- `admin-events-new.html` ⭐
- `student-dashboard.html` ⭐
- `events/index.html` ⭐

### Critical Scripts:
- `alumnetics-backend/scripts/` folder
- `assets/js/api-service.js`
- `assets/js/utils.js`

### Documentation:
- All docs now in `docs/` folder
- Keep `README.md` in root
- Reference docs from code comments

---

**Last Cleanup:** October 23, 2025  
**Structure Version:** 2.0  
**Status:** ✅ Clean & Organized
