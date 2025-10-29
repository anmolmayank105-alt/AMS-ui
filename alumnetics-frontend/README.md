# AlumNetics Frontend-Backend Integration Guide

## 📁 Project Structure

```
alumnetics-frontend/
├── pages/
│   ├── auth/
│   │   ├── login.html (✅ Integrated with backend)
│   │   └── registration.html (🔄 Next to integrate)
│   ├── dashboard/
│   │   ├── student-dashboard.html
│   │   ├── alumni-dashboard.html
│   │   └── admin-dashboard.html
│   └── admin/
├── assets/
│   ├── js/
│   │   ├── api-service.js (✅ Complete API layer)
│   │   └── utils.js (✅ Utility functions)
│   ├── css/
│   │   └── custom.css
│   └── images/
│       └── logo.jpeg
```

## 🚀 Backend API Integration Features

### ✅ Completed Components:

1. **API Service Layer (`api-service.js`)**
   - Complete REST API integration
   - MongoDB connection monitoring
   - Authentication management (JWT tokens)
   - Offline support with request queuing
   - Error handling and retry mechanisms
   - All CRUD operations for:
     - Users & Authentication
     - Events Management
     - Job Postings
     - Messaging System
     - Fundraising Campaigns
     - Analytics & Admin functions

2. **Utility Functions (`utils.js`)**
   - Form validation and sanitization
   - UI components (loading, toasts, pagination)
   - Data formatting (dates, currency, numbers)
   - Search and filtering utilities
   - File upload handling
   - Database status monitoring

3. **Login Page Integration**
   - Real-time backend authentication
   - Form validation with error handling
   - Loading states and user feedback
   - Role-based dashboard redirection
   - Remember me functionality
   - Social login framework (ready for OAuth)

## 🔧 Backend API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Token refresh
- `GET /api/auth/profile` - Current user profile

### User Management
- `GET /api/users` - Get all users (with filters)
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar

### Events System
- `GET /api/events` - Get events (with pagination)
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/register` - Register for event
- `GET /api/events/my/events` - User's events

### Job Management
- `GET /api/jobs` - Get job listings
- `GET /api/jobs/search` - Search jobs
- `POST /api/jobs` - Create job posting
- `POST /api/jobs/:id/apply` - Apply to job
- `GET /api/jobs/my/applications` - User's applications

### Messaging
- `GET /api/messages/conversations` - Get conversations
- `POST /api/messages` - Send message
- `GET /api/messages/:userId` - Get messages with user
- `GET /api/messages/unread-count` - Unread count

### Fundraising
- `GET /api/fundraising` - Get campaigns
- `POST /api/fundraising` - Create campaign
- `POST /api/fundraising/:id/donate` - Make donation
- `GET /api/fundraising/my/campaigns` - User's campaigns

## 🗄️ MongoDB Integration

### Database Connection Features:
- **Real-time Connection Monitoring**: UI shows database status
- **Automatic Reconnection**: Handles connection drops gracefully
- **Offline Mode**: Queues requests when database is unavailable
- **Data Synchronization**: Syncs offline changes when reconnected

### Collections Structure:
```javascript
// Users Collection
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  role: Enum['student', 'alumni', 'admin'],
  profile: {
    firstName: String,
    lastName: String,
    profilePicture: String,
    // ... additional profile fields
  },
  academic: {
    institution: String,
    department: String,
    graduationYear: Number
  },
  professional: {
    currentPosition: String,
    company: String,
    experience: Number
  }
}

// Events Collection
{
  _id: ObjectId,
  title: String,
  description: String,
  date: Date,
  location: Object,
  organizer: ObjectId (ref: User),
  attendees: [ObjectId] (ref: User),
  capacity: Number,
  registrationDeadline: Date
}

// Jobs Collection
{
  _id: ObjectId,
  title: String,
  company: Object,
  description: String,
  requirements: Object,
  postedBy: ObjectId (ref: User),
  applications: [Object],
  status: Enum['active', 'closed'],
  location: Object,
  salary: Object
}

// Messages Collection
{
  _id: ObjectId,
  sender: ObjectId (ref: User),
  recipient: ObjectId (ref: User),
  content: String,
  messageType: Enum['text', 'image', 'file'],
  isRead: Boolean,
  createdAt: Date
}

// Fundraising Campaigns Collection
{
  _id: ObjectId,
  title: String,
  description: String,
  goalAmount: Number,
  currentAmount: Number,
  createdBy: ObjectId (ref: User),
  donations: [Object],
  category: String,
  endDate: Date
}
```

## 🔐 Authentication & Security

### JWT Token Management:
- **Access Tokens**: Short-lived (15 minutes)
- **Refresh Tokens**: Long-lived (7 days)
- **Automatic Refresh**: Seamless token renewal
- **Secure Storage**: localStorage with fallback strategies

### Security Features:
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Server-side validation for all endpoints
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured for secure cross-origin requests
- **XSS Protection**: Input sanitization and output encoding

## 🌐 How to Use

### 1. Start Backend Server:
```bash
cd alumnetics-backend
npm start
# Server runs on http://localhost:5000
```

### 2. Open Frontend:
- Navigate to `alumnetics-frontend/pages/auth/login.html`
- The page automatically connects to the backend API
- Database status is shown in real-time

### 3. Test Integration:
- Try logging in with valid credentials
- Check browser console for API calls
- Monitor database connection status
- Test offline/online functionality

## 🧪 Testing Features

### Frontend Testing:
- Form validation (empty fields, invalid email, etc.)
- Loading states and error handling
- Offline mode (disconnect internet and try actions)
- Database status monitoring

### Backend Testing:
- API endpoints via browser or Postman
- Database queries in MongoDB Compass
- Real-time features with multiple browser tabs
- Authentication flow with token management

## 📱 Responsive Design

- **Mobile-First**: Optimized for all screen sizes
- **Progressive Web App Ready**: Offline functionality
- **Touch-Friendly**: Mobile gesture support
- **Fast Loading**: Optimized assets and lazy loading

## 🔮 Next Steps

1. **Complete Registration Page Integration**
2. **Dashboard Pages with Real Data**
3. **Events System Frontend**
4. **Job Board Interface**
5. **Real-time Messaging UI**
6. **Fundraising Campaign Pages**
7. **Admin Panel Integration**
8. **Mobile App Version**

## 📞 Support & Documentation

- **API Documentation**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/health`
- **Database Status**: Monitored in UI
- **Error Logging**: Check browser console for detailed errors

---

**Status**: ✅ Core integration complete, ready for full feature implementation
**MongoDB**: ✅ Ready for connection and data storage
**API**: ✅ All endpoints functional and tested
**Frontend**: ✅ Organized structure with backend integration