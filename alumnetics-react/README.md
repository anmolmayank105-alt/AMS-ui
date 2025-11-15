# 🎓 ALUMNETICS - Alumni Management System (React)

> A modern, full-featured alumni management system built with React, Vite, and Tailwind CSS

![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react) ![Vite](https://img.shields.io/badge/Vite-7.1.12-646CFF?logo=vite) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser at http://localhost:5173
```

---

## ✨ Features

- 🔐 **Multi-Role Authentication** - Student, Alumni, Admin, Faculty, Staff, Guest
- 👥 **User Profiles** - Comprehensive profile pages with privacy controls
- 📅 **Event Management** - Browse, search, filter, and register for events
- 💼 **Dashboards** - Role-specific dashboards with analytics
- 🎨 **Modern UI** - Glassmorphism effects, gradients, smooth animations
- 📱 **Responsive** - Works on all devices
- ⚡ **Fast** - Built with Vite for instant HMR

---

## 📁 Project Structure

```
alumnetics-react/
├── src/
│   ├── pages/              # All page components (12 pages)
│   │   ├── LandingPage.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── AlumniDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── StudentProfile.jsx
│   │   ├── AlumniProfile.jsx
│   │   ├── AdminProfile.jsx
│   │   ├── EventsPage.jsx
│   │   ├── ViewProfile.jsx
│   │   └── EditProfile.jsx
│   ├── App.jsx            # Main routing
│   ├── index.css          # Global styles
│   └── main.jsx           # Entry point
├── public/
│   └── logo.jpeg          # App logo
└── README.md              # This file
```

---

## 🗺️ Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | LandingPage | Homepage with all sections |
| `/login` | Login | Login form with role-based routing |
| `/register` | Register | Registration with 6 roles |
| `/dashboard/student` | StudentDashboard | Student dashboard |
| `/dashboard/alumni` | AlumniDashboard | Alumni dashboard |
| `/dashboard/admin` | AdminDashboard | Admin panel (4 tabs) |
| `/profile/student` | StudentProfile | Student profile view |
| `/profile/alumni` | AlumniProfile | Alumni profile view |
| `/profile/admin` | AdminProfile | Admin profile view |
| `/events` | EventsPage | Events listing with filters |
| `/profile/view?id=X` | ViewProfile | Public profile view |
| `/profile/edit` | EditProfile | Profile editing form |

---

## 🛠️ Tech Stack

- **React 18.3.1** - UI library
- **Vite 7.1.12** - Build tool
- **React Router DOM 6.x** - Routing
- **Tailwind CSS** - Styling (via CDN)
- **LocalStorage** - Mock auth & data

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🎨 Key Features by Page

### Landing Page
- Hero section, Features, Events, Network, Jobs, Success Stories, Stats, CTA

### Login/Register
- Form validation, Role selection, Remember me, Mock authentication

### Dashboards
- Welcome section, Quick actions, Events, Activities, Network stats

### Profile Pages
- Avatar, Contact info, Academic details, Skills, Privacy settings (4 toggles)

### Events Page
- Search & filter, Event cards, Modal details, Default images

### Edit Profile
- 5 sections: Basic, Academic, Skills, Privacy, Actions
- Form validation, Auto-save

---

## 🔐 Authentication

**Current:** Mock authentication with localStorage
- `authToken` - JWT token (mock)
- `userData` - User profile data

**Role-Based Routing:**
- Student → `/dashboard/student`
- Alumni → `/dashboard/alumni`
- Admin → `/dashboard/admin`

---

## 🔮 Next Steps

### Phase 1: Backend Integration
- [ ] Connect to Node.js backend (port 5000)
- [ ] Replace mock auth with JWT
- [ ] Fetch data from MongoDB
- [ ] Add API service layer

### Phase 2: New Features
- [ ] Jobs page
- [ ] Messaging system
- [ ] Fundraising campaigns
- [ ] Alumni directory
- [ ] Notifications

### Phase 3: Advanced
- [ ] Real-time chat (WebSocket)
- [ ] File uploads
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] PWA support

---

## 🐛 Known Issues

1. **Mock Auth** - Using localStorage, needs backend
2. **Empty States** - Awaiting API integration
3. **Image Uploads** - Not yet implemented

---

## 📝 Development

### Adding a New Page
1. Create `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx`
3. Link from relevant pages
4. Test navigation

### Code Standards
- Functional components with hooks
- Keep components under 300 lines
- Meaningful variable names
- Comment complex logic

---

## 👨‍💻 Author

**ALUMNETICS Development Team**

---

## 📄 License

Proprietary and confidential.

---

**Version:** 1.0.0  
**Last Updated:** October 31, 2025  
**Status:** ✅ All 12 core pages complete, ready for API integration
