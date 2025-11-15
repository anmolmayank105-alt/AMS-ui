# 🔌 Backend API Integration Guide

## ✅ Integration Complete

The React frontend has been successfully connected to the backend API!

---

## 📁 Files Created/Modified

### New Files:
1. **`src/services/api.js`** - Complete API service layer
2. **`.env.local`** - Local environment variables
3. **`.env.example`** - Environment template

### Modified Files:
1. **`src/pages/Login.jsx`** - Now uses real API for authentication
2. **`src/pages/Register.jsx`** - Now uses real API for registration  
3. **`src/pages/EventsPage.jsx`** - Now fetches events from API

---

## 🚀 Quick Start

### 1. Start Backend Server

```bash
cd e:\demo\demo\alumnetics-backend
npm install
npm run dev
```

Backend will run on: **http://localhost:5000**

### 2. Configure Frontend

The frontend is already configured! `.env.local` is set to:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

### 3. Start Frontend

```bash
cd e:\demo\demo\alumnetics-react
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 📡 API Service Features

### Authentication
- ✅ Automatic token management
- ✅ Automatic header injection (`Authorization: Bearer <token>`)
- ✅ Auto-logout on 401 (Unauthorized)
- ✅ Error handling with user-friendly messages

### Request Methods
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
await api.put(API_ENDPOINTS.PROFILE.UPDATE, {
  name: 'John Doe'
});

// DELETE request
await api.delete(API_ENDPOINTS.EVENTS.DELETE(eventId));
```

---

## 🔐 Authentication Flow

### 1. Login
```javascript
// Frontend (Login.jsx)
const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
  email: formData.email,
  password: formData.password,
});

// Store token and user data
localStorage.setItem('authToken', response.token);
localStorage.setItem('userData', JSON.stringify(response.user));

// Redirect based on role
navigate(`/dashboard/${response.user.role}`);
```

### 2. Registration
```javascript
// Frontend (Register.jsx)
const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'student',
  college: 'MIT',
  // ... other fields
});

// Success message
alert(response.message);
navigate('/login');
```

### 3. Protected Requests
```javascript
// API service automatically adds auth token
const profile = await api.get(API_ENDPOINTS.AUTH.PROFILE);
// Request headers include: Authorization: Bearer <token>
```

---

## 📋 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/verify-email/:token` - Verify email

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (auth required)
- `PUT /api/events/:id` - Update event (auth required)
- `DELETE /api/events/:id` - Delete event (auth required)
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/events/:id/register` - Unregister from event
- `GET /api/events/my/events` - Get my events

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/search` - Search users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats` - Get user statistics

### Profile
- `GET /api/profile` - Get own profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/photo` - Upload profile photo
- `PUT /api/profile/privacy` - Update privacy settings
- `GET /api/profile/public/:id` - Get public profile

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job posting
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/:id/apply` - Apply for job

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages` - Send message
- `DELETE /api/messages/:id` - Delete message
- `PUT /api/messages/:id/read` - Mark as read

### Fundraising
- `GET /api/fundraising` - Get all campaigns
- `GET /api/fundraising/:id` - Get campaign by ID
- `POST /api/fundraising` - Create campaign
- `POST /api/fundraising/:id/donate` - Make donation
- `GET /api/fundraising/my/campaigns` - Get my campaigns
- `GET /api/fundraising/my/donations` - Get my donations

### Mentorship
- `GET /api/mentorship/mentors` - Get all mentors
- `GET /api/mentorship/requests` - Get mentorship requests
- `POST /api/mentorship/requests` - Create request
- `PUT /api/mentorship/requests/:id` - Update request
- `GET /api/mentorship/mentees` - Get my mentees
- `GET /api/mentorship/mentors/me` - Get my mentors

---

## 🛠️ How to Use in Components

### Example 1: Fetch Data
```javascript
import { api, API_ENDPOINTS } from '../services/api';

const MyComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.EVENTS.GET_ALL);
        setData(response.events || []);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ... render component
};
```

### Example 2: Submit Form
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await api.post(API_ENDPOINTS.EVENTS.CREATE, {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      // ...
    });
    
    alert('Event created successfully!');
    navigate('/events');
  } catch (error) {
    alert(error.message || 'Failed to create event');
  }
};
```

### Example 3: Delete Resource
```javascript
const handleDelete = async (id) => {
  if (!confirm('Are you sure?')) return;
  
  try {
    await api.delete(API_ENDPOINTS.EVENTS.DELETE(id));
    alert('Deleted successfully!');
    // Refresh list
    loadEvents();
  } catch (error) {
    alert(error.message || 'Failed to delete');
  }
};
```

---

## 🔧 Error Handling

The API service automatically handles common errors:

### HTTP Status Codes
- **401 Unauthorized** → Auto-logout & redirect to login
- **403 Forbidden** → "Access forbidden" error
- **404 Not Found** → "Resource not found" error
- **500 Server Error** → "Server error" message
- **Timeout** → "Request timeout" error

### Usage in Components
```javascript
try {
  const response = await api.post(endpoint, data);
  // Success
} catch (error) {
  // Error message is user-friendly
  alert(error.message); // e.g., "Invalid credentials"
}
```

---

## 🌍 Environment Configuration

### Development
```env
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

### Production (Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_ENV=production
```

### Staging
```env
VITE_API_URL=https://staging-api.example.com/api
VITE_ENV=staging
```

---

## ✅ Integration Checklist

- [x] API service created (`src/services/api.js`)
- [x] Environment variables configured (`.env.local`)
- [x] Login page connected to API
- [x] Register page connected to API
- [x] Events page connected to API
- [x] Auth token management implemented
- [x] Error handling configured
- [x] Auto-logout on unauthorized
- [ ] All remaining pages to be connected

---

## 🔜 Next Steps

### To Connect Remaining Pages:

1. **AdminDashboard** - Fetch user stats, events, etc.
2. **StudentDashboard** - Fetch personalized data
3. **AlumniDashboard** - Fetch alumni-specific data
4. **EditProfile** - Update profile via API
5. **ViewProfile** - Fetch user profile by ID
6. **All Profile Pages** - Fetch and update data

### Pattern to Follow:
```javascript
// 1. Import API service
import { api, API_ENDPOINTS } from '../services/api';

// 2. Use in useEffect or handlers
const loadData = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.YOUR_ENDPOINT);
    setData(response);
  } catch (error) {
    console.error('Error:', error);
  }
};

// 3. Call on mount
useEffect(() => {
  loadData();
}, []);
```

---

## 🎯 Key Features

✅ **Centralized API Logic** - Single source for all API calls  
✅ **Token Management** - Automatic auth header injection  
✅ **Error Handling** - User-friendly error messages  
✅ **Type Safety** - Predefined endpoints  
✅ **Timeout Handling** - 30-second default timeout  
✅ **CORS Configured** - Backend allows localhost:5173  
✅ **Ready for Production** - Environment-based URLs  

---

## 🚀 Testing

### 1. Test Backend is Running
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2025-10-31T...",
  "environment": "development"
}
```

### 2. Test Login
1. Start backend: `npm run dev` in backend folder
2. Start frontend: `npm run dev` in React folder
3. Navigate to http://localhost:5173/login
4. Try logging in (register first if needed)

### 3. Test Events
1. Go to http://localhost:5173/events
2. Events should load from backend
3. Click on an event to see details
4. Try registering for an event

---

## 📞 Support

If you encounter issues:

1. **Check Backend is Running**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Check MongoDB Connection**
   - Ensure MongoDB is running
   - Check MONGODB_URI in backend .env

3. **Check Console Errors**
   - Open browser DevTools (F12)
   - Look for network errors or API errors

4. **Check CORS**
   - Backend should allow localhost:5173
   - Already configured in backend server.js

---

**Integration Status:** ✅ **COMPLETE**  
**Date:** October 31, 2025  
**Backend API:** http://localhost:5000/api  
**Frontend App:** http://localhost:5173  
