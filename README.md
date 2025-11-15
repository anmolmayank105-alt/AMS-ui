# Alumnetics - Alumni Management Platform

A comprehensive full-stack alumni management system built with React, Node.js, Express, and MongoDB. Connect alumni, manage events, facilitate networking, and strengthen community engagement.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd demo
   ```

2. **Install Backend Dependencies**
   ```bash
   cd alumnetics-backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../alumnetics-react
   npm install
   ```

4. **Configure Environment Variables**
   
   Backend (`alumnetics-backend/.env`):
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=production
   ```
   
   Frontend (`alumnetics-react/.env.local`):
   ```env
   VITE_API_URL=http://localhost:5000
   ```

### Running the Application

**Option 1: Using Scripts (Recommended)**
```bash
# From root directory
scripts\START_FULLSTACK.bat    # Windows Batch
scripts\START_FULLSTACK.ps1    # PowerShell
```

**Option 2: Manual Start**

Terminal 1 - Backend:
```bash
cd alumnetics-backend
npm start
```

Terminal 2 - Frontend:
```bash
cd alumnetics-react
npm run dev
```

**Access the Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
demo/
├── .documentation/           # Project documentation
│   ├── archived/            # Historical documentation
│   ├── guides/              # Development guides
│   └── optimization/        # Performance reports
├── scripts/                 # Startup and utility scripts
├── alumnetics-backend/      # Express.js REST API
│   ├── api/                # API entry point
│   ├── scripts/            # Database and utility scripts
│   └── src/
│       ├── controllers/    # Business logic
│       ├── middleware/     # Express middleware
│       ├── models/         # MongoDB schemas
│       ├── routes/         # API routes
│       └── utils/          # Helper utilities
├── alumnetics-react/        # React frontend (Vite)
│   ├── public/             # Static assets
│   └── src/
│       ├── assets/         # Images, styles
│       ├── pages/          # React components
│       ├── services/       # API integration
│       └── utils/          # Frontend utilities
└── alumnetics-frontend/     # Static HTML backup
```

## ✨ Features

### User Management
- **Multi-role System**: Alumni, Students, Admin
- **Profile Management**: Comprehensive user profiles with institution, graduation year, department
- **Privacy Controls**: Customizable profile visibility
- **Search & Discovery**: Advanced search with filters

### Event Management
- **Create & Manage Events**: Full CRUD operations
- **Event Categories**: Workshops, networking, reunions, career fairs, webinars
- **RSVP System**: Event registration and attendance tracking
- **Rich Details**: Images, descriptions, locations, dates
- **Institution-specific**: Filter events by institution

### Networking
- **Alumni Directory**: Browse and connect with alumni
- **Student Access**: Students can view and network with alumni
- **Connection Management**: Send and accept connection requests
- **Profile Discovery**: Search by institution, year, department

### Administrative Tools
- **User Management**: Approve, manage, and moderate users
- **Event Moderation**: Approve and manage events
- **Analytics Dashboard**: User and event statistics
- **Bulk Operations**: Efficient management tools

## 🔧 Technology Stack

### Frontend
- **React 19.1.1**: Modern UI library
- **Vite 7.1.12**: Fast build tool and dev server
- **React Router DOM 7.9.5**: Client-side routing
- **Axios**: HTTP client for API requests

### Backend
- **Node.js & Express.js**: RESTful API server
- **MongoDB & Mongoose**: NoSQL database with ODM
- **JWT Authentication**: Secure token-based auth
- **bcrypt**: Password hashing
- **express-validator**: Input validation
- **compression**: Response compression (46% smaller payloads)

### Performance Optimizations
- **Database Indexing**: 19 optimized MongoDB indexes
- **Query Optimization**: lean() queries, parallel execution
- **Response Compression**: gzip level 6
- **Code Splitting**: Vendor and page-level chunks
- **Production Build**: Terser minification, console removal

**Performance Metrics:**
- Query time: 200ms → 75ms (62% faster)
- Search time: 350ms → 140ms (60% faster)
- Payload size: 120KB → 65KB (46% reduction)

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user profile

### Users
- `GET /api/users` - Get all users (with filters)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin only)

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/attend` - RSVP to event
- `DELETE /api/events/:id/attend` - Cancel RSVP

See `.documentation/guides/API_INTEGRATION.md` for complete API documentation.

## 🛠️ Development

### Running in Development Mode
```bash
# Backend with nodemon
cd alumnetics-backend
npm run dev

# Frontend with Vite HMR
cd alumnetics-react
npm run dev
```

### Building for Production
```bash
cd alumnetics-react
npm run build
```

### Environment Setup
1. Configure MongoDB Atlas connection
2. Set up environment variables
3. Run database scripts if needed (see `alumnetics-backend/scripts/`)

### Common Scripts (Backend)
- `npm start` - Start production server
- `npm run dev` - Development with nodemon
- `node scripts/check-user.js` - Verify user data
- `node scripts/reset-password.js` - Reset user password

## 📚 Documentation

- **Setup Guide**: `.documentation/guides/FULL_API_INTEGRATION_COMPLETE.md`
- **API Reference**: `.documentation/guides/API_INTEGRATION.md`
- **Testing Guide**: `.documentation/guides/TESTING.md`
- **Changelog**: `.documentation/guides/CHANGELOG.md`
- **Optimization Report**: `.documentation/optimization/OPTIMIZATION_COMPLETE.md`
- **Future Improvements**: `.documentation/FUTURE_IMPROVEMENTS.md` ⭐ NEW

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Verify port 5000 is not in use
- Ensure all dependencies are installed: `npm install`

### Frontend can't connect to backend
- Verify `VITE_API_URL` in `.env.local`
- Check backend is running on correct port
- Clear browser cache and restart dev server

### Database queries slow
- Ensure all indexes are created (check console on server start)
- Review `.documentation/optimization/OPTIMIZATION_COMPLETE.md`

### React server crashes
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for config syntax errors
- Restart with: `npm run dev`

## 🔐 Default Test User

**Email**: anmolmayank7@gmail.com  
**Password**: (set during registration)  
**Role**: Student  
**Institution**: Netaji Subhas Engineering College

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions, please check the documentation in `.documentation/guides/` or create an issue in the repository.

---

**Built with ❤️ for alumni communities worldwide**
