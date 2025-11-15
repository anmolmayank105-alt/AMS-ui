# 🚀 Quick Start Guide - AlumNetics

## ✅ PROBLEM FIXED

The `ERR_CONNECTION_REFUSED` error was caused by the **backend server not running**.

### 🔧 What Was Wrong:
- Backend server stopped or crashed
- Frontend couldn't connect to `http://localhost:5000`
- Result: All API calls failed

### ✅ What's Fixed:
- Backend server restarted on port 5000 ✓
- Frontend running on port 5173 ✓
- Socket.io enabled for real-time messaging ✓
- MongoDB connected ✓

---

## 🎯 How to Start the App (3 Easy Ways)

### **Method 1: Double-Click Batch File (Easiest)**
1. Navigate to: `E:\demo\demo\`
2. Double-click: **`START_BOTH_SERVERS.bat`**
3. Wait for browser to open automatically
4. Done! ✓

### **Method 2: PowerShell Script (Recommended)**
1. Right-click: **`START_BOTH_SERVERS.ps1`**
2. Select: "Run with PowerShell"
3. Browser opens automatically
4. Done! ✓

### **Method 3: Manual Start (If needed)**
```powershell
# Terminal 1 - Backend
cd E:\demo\demo\alumnetics-backend
node server.js

# Terminal 2 - Frontend
cd E:\demo\demo\alumnetics-react
npm run dev
```

---

## 🌐 Access URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | http://localhost:5173 | ✅ Running |
| **Backend API** | http://localhost:5000/api | ✅ Running |
| **Socket.io** | ws://localhost:5000 | ✅ Enabled |

---

## 🎨 Available Dashboards

### 1. **Student Dashboard** (`/dashboard/student`)
- View profile
- Browse events
- Network with alumni
- **✨ Send messages** (new!)

### 2. **Alumni Dashboard** (`/dashboard/alumni`)
- Mentor students
- Post job opportunities
- Attend events
- **✨ Send messages** (new!)

### 3. **Admin Dashboard** (`/dashboard/admin`)
- Manage users
- Approve events
- View analytics
- **✨ Send messages** (new!)

---

## 💬 Messaging Feature (NEW)

### How to Access:
1. Login to any dashboard
2. Click **"Messages"** button in sidebar
3. See list of conversations on left
4. Click any person to open chat on right
5. Type and send messages!

### Features:
- ✅ Real-time updates (Socket.io WebSocket)
- ✅ Conversation list with previews
- ✅ Unread message badges
- ✅ Online/offline status
- ✅ Message history
- ✅ Beautiful gradient UI
- ✅ Auto-scroll to latest message
- ✅ Vercel-compatible (HTTP polling fallback)

---

## 🐛 Troubleshooting

### Error: `ERR_CONNECTION_REFUSED`
**Problem**: Backend server not running  
**Solution**: Run `START_BOTH_SERVERS.bat` or start backend manually

### Error: Port Already in Use
**Problem**: Old process still running  
**Solution**: 
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /F /PID <process_id>

# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /F /PID <process_id>
```

### Error: CORS Policy
**Problem**: Backend not sending CORS headers  
**Solution**: Backend must be running - CORS is already configured

### Messages Button Redirects to Login
**Problem**: Wrong authentication method  
**Solution**: ✅ FIXED - Now uses `authToken` from localStorage

### MongoDB Connection Error
**Problem**: MongoDB not running  
**Solution**: Start MongoDB service or check connection string

---

## 🔒 Authentication

The app uses **JWT tokens** stored in localStorage:
- Key: `authToken`
- Helpers: `isAuthenticated()`, `getCurrentUser()`, `logout()`

### Test Accounts:
You'll need to create accounts via the signup page, or use existing accounts in your database.

---

## 📦 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + Vite | Latest |
| **Backend** | Node.js + Express | Latest |
| **Database** | MongoDB | Latest |
| **Real-time** | Socket.io | 4.7.2 |
| **Styling** | CSS + Gradients | Custom |
| **Authentication** | JWT | Custom |

---

## ✨ Recent Updates

### November 4, 2025 - Messaging Feature
- ✅ Socket.io integration (WebSocket + HTTP polling)
- ✅ MessagingPage component with split view
- ✅ Real-time message delivery
- ✅ Conversation list with previews
- ✅ Messages button in all 3 dashboards
- ✅ Vercel deployment compatible
- ✅ Authentication fixed (authToken usage)
- ✅ Backend CORS properly configured

---

## 📝 Next Steps

1. **Test the Messaging Feature**:
   - Login with 2 different accounts
   - Send messages between them
   - Watch real-time updates!

2. **Customize Styling** (Optional):
   - Edit `alumnetics-react/src/assets/css/messaging.css`
   - Change colors, fonts, layout

3. **Deploy to Production**:
   - Backend: Vercel/Render
   - Frontend: Vercel/Netlify
   - Database: MongoDB Atlas

---

## 🆘 Getting Help

If servers won't start:
1. Check if ports 5000 and 5173 are available
2. Verify Node.js is installed: `node --version`
3. Check MongoDB is running
4. Look for error messages in terminal
5. Try manual start method to see detailed errors

---

## 🎉 Enjoy Your App!

You now have a **fully functional alumni management system** with:
- ✅ Complete user dashboards
- ✅ Real-time messaging
- ✅ Event management
- ✅ Profile system
- ✅ Beautiful UI
- ✅ Production-ready code

**Both servers are running - refresh your browser and start using the app!** 🚀
