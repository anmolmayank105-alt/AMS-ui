# Alumnetics - Quick Reference Guide

## 🚀 Quick Start (30 seconds)

```bash
# Option 1: Using startup script
scripts\START_FULLSTACK.bat

# Option 2: Manual start
# Terminal 1
cd alumnetics-backend && npm start

# Terminal 2  
cd alumnetics-react && npm run dev
```

**Access URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📁 Project Structure (Simplified)

```
demo/
├── README.md                 # 👈 Start here - comprehensive guide
├── .documentation/           # All documentation
│   ├── PROJECT_STATUS.md    # Project overview & status
│   ├── guides/              # API docs, testing, changelog
│   ├── optimization/        # Performance reports
│   └── archived/            # Old documentation
├── scripts/                  # Startup scripts
├── alumnetics-backend/       # Express API (port 5000)
└── alumnetics-react/         # React app (port 5173)
```

## 📚 Documentation Map

| Document | Purpose | Location |
|----------|---------|----------|
| **README.md** | Master guide - start here | Root |
| **PROJECT_STATUS.md** | Project status & metrics | `.documentation/` |
| **API_INTEGRATION.md** | Complete API reference | `.documentation/guides/` |
| **TESTING.md** | Testing guide | `.documentation/guides/` |
| **OPTIMIZATION_COMPLETE.md** | Performance report | `.documentation/optimization/` |
| **CHANGELOG.md** | Version history | `.documentation/guides/` |

## 🔑 Environment Setup

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=production
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000
```

## 🎯 Common Tasks

### Start Development
```bash
scripts\START_FULLSTACK.bat
```

### Build for Production
```bash
cd alumnetics-react
npm run build
```

### Check User Account
```bash
cd alumnetics-backend
node scripts/check-user.js
```

### Reset Password
```bash
cd alumnetics-backend
node scripts/reset-password.js
```

## 🔐 Test Account

**Email**: anmolmayank7@gmail.com  
**Role**: Student  
**Institution**: Netaji Subhas Engineering College

## 📊 Performance Stats

- **Query Speed**: 62% faster (200ms → 75ms)
- **Search Speed**: 60% faster (350ms → 140ms)
- **Payload Size**: 46% smaller (120KB → 65KB)
- **Database Indexes**: 19 optimized indexes
- **Console Logs**: 0 in production (180+ removed)

## 🛠️ Tech Stack

**Frontend**: React 19 + Vite 7  
**Backend**: Node.js + Express  
**Database**: MongoDB Atlas  
**Auth**: JWT + bcrypt

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check MongoDB URI, verify port 5000 free |
| Frontend 502 error | Start backend first, check VITE_API_URL |
| React server crashed | `cd alumnetics-react && npm run dev` |
| Can't login | Check user exists: `node scripts/check-user.js` |

## 📞 Need More Help?

- **Full Documentation**: See `README.md`
- **Project Status**: See `.documentation/PROJECT_STATUS.md`
- **API Reference**: See `.documentation/guides/API_INTEGRATION.md`

## ✅ Project Status

- ✅ **60% Performance Improvement**
- ✅ **Production Ready**
- ✅ **Fully Documented**
- ✅ **Optimized & Clean**

---

**Last Updated**: January 2025
