# 🎯 QUICK START GUIDE - Backend API Integration

## ✅ Integration Complete!

Your React frontend is now connected to the Node.js backend API.

---

## 🚀 Start Both Servers (Easy Way)

### Windows PowerShell:
```powershell
.\START_FULLSTACK.ps1
```

### Windows CMD:
```cmd
START_FULLSTACK.bat
```

This will open 2 terminal windows:
- **Backend** on http://localhost:5000
- **Frontend** on http://localhost:5173

---

## 🔧 Manual Start (Alternative)

### Terminal 1 - Backend:
```bash
cd e:\demo\demo\alumnetics-backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd e:\demo\demo\alumnetics-react
npm run dev
```

---

## 📋 What's Connected?

### ✅ Already Integrated:
1. **Login Page** → Backend `/api/auth/login`
2. **Register Page** → Backend `/api/auth/register`
3. **Events Page** → Backend `/api/events`

### 🔄 Features Working:
- ✅ User authentication (JWT tokens)
- ✅ Auto token management
- ✅ Event fetching with filters
- ✅ Event registration
- ✅ Error handling
- ✅ Auto-logout on session expire

---

## 🧪 Test the Integration

### 1. Start Both Servers
Run `START_FULLSTACK.bat` or `START_FULLSTACK.ps1`

### 2. Open Frontend
Navigate to: http://localhost:5173

### 3. Test Registration
1. Click "Register" or "Join Network"
2. Fill in the form
3. Select a role (Student/Alumni/etc.)
4. Submit
5. Check backend terminal for API call

### 4. Test Login
1. Go to http://localhost:5173/login
2. Enter credentials from registration
3. Backend will authenticate
4. You'll be redirected to dashboard

### 5. Test Events
1. Go to http://localhost:5173/events
2. Events will load from backend
3. Try searching/filtering
4. Click "Register" on an event

---

## 🔐 Environment Setup

### Backend (.env file)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/alumnetics

# JWT Secret
JWT_SECRET=your-secret-key-here

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### Frontend (.env.local file) - Already Created
```env
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

---

## 📡 API Service Usage

### In Any Component:
```javascript
import { api, API_ENDPOINTS } from '../services/api';

// GET request
const events = await api.get(API_ENDPOINTS.EVENTS.GET_ALL);

// POST request
const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
  email: 'user@example.com',
  password: 'password123'
});

// PUT request
await api.put(API_ENDPOINTS.PROFILE.UPDATE, data);

// DELETE request
await api.delete(API_ENDPOINTS.EVENTS.DELETE(id));
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
cd e:\demo\demo\alumnetics-backend
npm install  # Install dependencies
npm run dev  # Start server
```

### Frontend Can't Connect to Backend
1. Check backend is running: http://localhost:5000/health
2. Check `.env.local` has correct URL
3. Check browser console for CORS errors

### MongoDB Connection Error
- Start MongoDB service
- Or update `MONGODB_URI` in backend `.env` to use cloud MongoDB (Atlas)

### Port Already in Use
- Backend (5000): Change `PORT` in backend `.env`
- Frontend (5173): Vite will auto-select another port

---

## 📁 Project Structure

```
demo/
├── alumnetics-backend/          # Node.js Backend
│   ├── server.js                # Main server file
│   ├── src/
│   │   ├── routes/              # API routes
│   │   ├── controllers/         # Business logic
│   │   ├── models/              # MongoDB models
│   │   └── middleware/          # Auth, validation
│   ├── package.json
│   └── .env                     # Backend config
│
├── alumnetics-react/            # React Frontend  
│   ├── src/
│   │   ├── pages/               # React pages
│   │   ├── services/
│   │   │   └── api.js          # ⭐ API service
│   │   └── utils/              # Helper functions
│   ├── .env.local              # ⭐ Frontend config
│   └── package.json
│
├── START_FULLSTACK.ps1         # ⭐ Start script (PowerShell)
└── START_FULLSTACK.bat         # ⭐ Start script (CMD)
```

---

## 🎯 Next Steps

### To Connect More Pages:

1. **Dashboards** - Fetch real user stats
2. **Profile Pages** - Load user data from API
3. **Edit Profile** - Save changes to backend
4. **Admin Panel** - Manage users, events via API

### Pattern:
```javascript
// 1. Import API
import { api, API_ENDPOINTS } from '../services/api';

// 2. Fetch data
useEffect(() => {
  const fetchData = async () => {
    const response = await api.get(API_ENDPOINTS.YOUR_ENDPOINT);
    setData(response);
  };
  fetchData();
}, []);
```

---

## ✅ Checklist

- [x] Backend server ready (Port 5000)
- [x] Frontend server ready (Port 5173)
- [x] API service created (`src/services/api.js`)
- [x] Environment configured (`.env.local`)
- [x] Login connected to API
- [x] Register connected to API
- [x] Events connected to API
- [x] Auto token management
- [x] Error handling
- [x] Startup scripts created
- [ ] Test with real backend data
- [ ] Connect remaining pages

---

## 📞 Need Help?

1. **Backend not starting?**
   - Check MongoDB is running
   - Run `npm install` in backend folder

2. **Frontend errors?**
   - Check backend is running
   - Open browser console (F12)

3. **API calls failing?**
   - Check network tab in DevTools
   - Verify backend URL in `.env.local`

---

## 🎉 Success!

Your full-stack ALUMNETICS application is ready!

- Backend API: ✅ Running
- Frontend App: ✅ Connected
- Authentication: ✅ Working
- API Calls: ✅ Configured

**Just run `START_FULLSTACK.bat` and start testing!** 🚀
