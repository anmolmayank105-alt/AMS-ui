import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitials, isAuthenticated, getCurrentUser } from '../utils/helpers';
import { api, API_ENDPOINTS } from '../services/api';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deleteEmailError, setDeleteEmailError] = useState('');

  useEffect(() => {
    // Check authentication using helper
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    loadProfileData();
  }, [navigate]);

  const loadProfileData = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      const profileData = response.data || response.user || response;
      setUser(profileData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      const fallbackUser = getCurrentUser();
      setUser(fallbackUser);
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Double-check email validation before proceeding
    const entered = deleteConfirmEmail.trim().toLowerCase();
    const actual = (user?.email || '').trim().toLowerCase();
    
    // Block if email is empty or doesn't match
    if (!entered || entered !== actual) {
      setDeleteEmailError('You must enter your email address to confirm deletion');
      return;
    }

    setDeleteEmailError('');

    // Final confirmation dialog
    if (!confirm(`Are you ABSOLUTELY sure you want to delete your account (${user.email})? This action is PERMANENT and CANNOT be undone!`)) {
      return;
    }

    try {
      await api.delete('/users/profile');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      alert('Your account has been permanently deleted.');
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      setDeleteEmailError(error.message || 'Failed to delete account. Please try again.');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-cyan-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-12 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get user initials using helper
  const userInitials = user ? getInitials(user.name, 'AD') : 'AD';
  const isDeleteEnabled = deleteConfirmEmail.trim().toLowerCase() === (user?.email || '').trim().toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-cyan-50 relative">
      <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_0%_0%,rgba(255,255,255,.15),transparent),radial-gradient(600px_300px_at_100%_100%,rgba(255,255,255,.12),transparent)] pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-md border-b border-white/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="ALUMNETICS" className="w-10 h-10 rounded-xl object-cover border border-white/40 shadow" />
            <div className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">ALUMNETICS</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/dashboard/admin')} className="px-3 py-2 text-sm rounded-lg text-purple-700 hover:text-purple-900 hover:bg-purple-50 transition">
              Admin Dashboard
            </button>
            <span className="px-3 py-2 text-sm rounded-lg bg-purple-50 text-purple-700">Profile</span>
            <button onClick={() => navigate('/profile/edit')} className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition shadow-md">
              Edit Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header */}
        <section className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative w-28 h-28 rounded-2xl shadow-lg overflow-hidden">
              {user?.profilePicture?.url ? (
                <img 
                  src={user.profilePicture.url} 
                  alt={user.fullName || 'Profile'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                  {userInitials}
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Active</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-gray-900">{user?.fullName || user?.name || 'Administrator'}</h1>
              <p className="text-gray-700">{user?.email || 'admin@university.edu'} • {user?.institution?.name || 'Platform Administrator'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 border border-red-200">{user?.role || 'Administrator'}</span>
                <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 border border-purple-200">Full Access</span>
              </div>
            </div>
          </div>
        </section>

        {/* Grid Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* About */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-sm text-gray-700 leading-6">
                {user?.bio || 'Platform administrator responsible for managing users, events, content, and overall system operations.'}
              </p>
            </div>

            {/* Responsibilities */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  User management and approval
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  Event creation and moderation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  Content moderation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  Platform analytics and reporting
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  System configuration
                </li>
              </ul>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Admin Activity</h2>
              <p className="text-sm text-gray-500 italic">No recent activity</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span>{user.email || 'admin@example.com'}</span>
                </div>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Platform Overview</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-semibold text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Active Events</span>
                  <span className="font-semibold text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pending Approvals</span>
                  <span className="font-semibold text-orange-600">0</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition text-left">
                  View All Users
                </button>
                <button className="w-full px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-left">
                  Manage Events
                </button>
                <button className="w-full px-4 py-2 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition text-left">
                  Review Approvals
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Delete Account Section */}
        <section className="flex justify-center mt-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-red-200 max-w-md w-full">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-600 mb-2 flex items-center justify-center gap-2">
                ⚠️ Danger Zone
              </h2>
              <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all associated data</p>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Account?</h3>
            </div>
            
            <p className="text-gray-700">Are you absolutely sure you want to delete your account? This action is <strong>permanent</strong> and cannot be undone.</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>This will permanently delete:</strong><br/>
                • Your profile and personal information<br/>
                • All your posts and connections<br/>
                • Your event registrations<br/>
                • All associated data
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-900">
                To confirm, please type your email address:
              </label>
              <input 
                type="email" 
                id="confirmEmail"
                value={deleteConfirmEmail}
                onChange={(e) => {
                  setDeleteConfirmEmail(e.target.value);
                  if (deleteEmailError) setDeleteEmailError('');
                }}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              {deleteEmailError && (
                <p className="text-xs text-red-600">{deleteEmailError}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmEmail('');
                  setDeleteEmailError('');
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 transition-all duration-200">
                Cancel
              </button>
              <button 
                onClick={isDeleteEnabled ? handleDeleteAccount : null}
                disabled={!isDeleteEnabled}
                className={`flex-1 px-4 py-2 rounded-xl text-white transition-all duration-200 ${
                  isDeleteEnabled
                    ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                    : 'bg-red-300 cursor-not-allowed opacity-50 pointer-events-none'
                }`}>
                Yes, Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
