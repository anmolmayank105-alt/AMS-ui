# ALUMNETICS - Quick Start Guide

## 🚀 Starting the Application

### ✅ RECOMMENDED METHOD (Tested & Working)

**Backend:**
1. Navigate to: `E:\demo\demo\alumnetics-backend\`
2. Double-click: `start-server.bat`
3. Server will start in a new window - **DON'T CLOSE THIS WINDOW!**

**Frontend:**
1. Open PowerShell in: `E:\demo\demo\alumnetics-frontend\`
2. Run: `npx http-server -p 3000 -c-1`

### Alternative: PowerShell Script
1. Right-click: `start-server.ps1` (in backend folder)
2. Select "Run with PowerShell"

### Manual Command
```powershell
cd "E:\demo\demo\alumnetics-backend"
node server.js
```

## 🌐 Accessing the Application

### Frontend (Main Application)
Open in Chrome: `file:///E:/demo/demo/alumnetics-frontend/index.html`

### Backend API Endpoints
- Health Check: `http://localhost:5000/health`
- API Documentation: `http://localhost:5000/api`
- All API Routes: `http://localhost:5000/api/*`

## ✅ Verify Server is Running

Check in PowerShell:
```powershell
netstat -ano | findstr :5000
```

Should show:
```
TCP    0.0.0.0:5000           0.0.0.0:0              LISTENING
```

## 🔧 Fixed Issues

### CORS Configuration
✅ Backend now accepts requests from all origins in development
✅ File:// protocol URLs are now supported
✅ No more "blocked by CORS policy" errors

### Server Stability
✅ Batch file keeps server running permanently
✅ Server runs in separate window
✅ Easy to restart when needed

## 🐛 Troubleshooting

### Connection Refused Error
1. Make sure the server window is open and running
2. Check if port 5000 is in use: `netstat -ano | findstr :5000`
3. Restart the server using `start-server.bat`

### CORS Errors
✅ Fixed! Server now allows all origins in development mode

### Tailwind CSS Warning
ℹ️ This is just a warning for production use
ℹ️ Application works fine - can be ignored in development

## 📦 MongoDB Connection

Connected to: MongoDB Atlas Cloud Database
Connection String: `mongodb+srv://starunkumarainds2024_db_user:***@cluster0.bc9ss4x.mongodb.net/alumnetics`

## 🎯 Application Features

### Authentication
- Register new users with role selection
- Login with email and password
- JWT-based authentication
- Role-based access control

### Core Features
- 📅 **Events**: Create, browse, and register for alumni events
- 💼 **Jobs**: Post job opportunities and apply
- 💬 **Messages**: Real-time chat with Socket.io
- 💰 **Fundraising**: Create campaigns and donations
- 👥 **Network**: Connect with alumni and students
- 📊 **Admin**: Platform management and analytics

## 📁 File Structure

```
E:\demo\demo\
├── alumnetics-backend/          # Backend API Server
│   ├── server.js                # Main server file
│   ├── start-server.bat         # Windows startup script
│   ├── start-server.ps1         # PowerShell startup script
│   └── src/                     # Source code
│       ├── models/              # Database models
│       ├── controllers/         # API controllers
│       └── routes/              # API routes
└── alumnetics-frontend/         # Frontend Application
    ├── index.html               # Landing page
    ├── pages/                   # All pages
    │   ├── auth/                # Login & Register
    │   ├── dashboards/          # Role-based dashboards
    │   ├── events/              # Event pages
    │   └── ...                  # Other features
    └── assets/                  # CSS, JS, Images
        └── js/
            ├── api-service.js   # API integration
            └── utils.js         # Utility functions
```

## 🎓 User Roles

1. **Student**: Access courses, events, apply for jobs
2. **Alumni**: Post jobs, create events, mentor students
3. **Faculty**: Manage courses, oversee activities
4. **Employer**: Post job opportunities, recruit
5. **Admin**: Full platform management

## 💡 Development Tips

### Keep Server Running
- The batch file window must stay open
- Server will restart if window is closed and batch file is run again

### Testing Changes
1. Make changes to code
2. Stop server (close batch file window)
3. Restart server (double-click `start-server.bat`)
4. Refresh browser

### Database
- All data persists in MongoDB Atlas
- No local database setup needed
- Cloud-hosted and accessible anywhere

---

**Created**: October 6, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
