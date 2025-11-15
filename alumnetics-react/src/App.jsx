import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import './App.css';

// Eager load only critical pages (Landing, Login)
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';

// Lazy load all other pages for better initial load time
const Register = lazy(() => import('./pages/Register'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const AlumniDashboard = lazy(() => import('./pages/AlumniDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const AlumniProfile = lazy(() => import('./pages/AlumniProfile'));
const AdminProfile = lazy(() => import('./pages/AdminProfile'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const ViewProfile = lazy(() => import('./pages/ViewProfile'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const MessagingPage = lazy(() => import('./pages/MessagingPage'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#4F46E5'
  }}>
    <div>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      Loading...
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/alumni" element={<AlumniDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/profile/student" element={<StudentProfile />} />
          <Route path="/profile/alumni" element={<AlumniProfile />} />
          <Route path="/profile/admin" element={<AdminProfile />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/messages" element={<MessagingPage />} />
          <Route path="/profile/view" element={<ViewProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
