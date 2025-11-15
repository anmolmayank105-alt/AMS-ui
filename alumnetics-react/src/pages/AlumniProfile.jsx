import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitials, isAuthenticated, getCurrentUser } from '../utils/helpers';
import { api, API_ENDPOINTS } from '../services/api';

// Initial privacy settings constant
const INITIAL_PRIVACY_SETTINGS = {
  profileVisibility: true,
  showEmail: false,
  showPhone: false,
  allowMessages: true
};

const AlumniProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [privacySettings, setPrivacySettings] = useState(INITIAL_PRIVACY_SETTINGS);
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

  const loadProfileData = useCallback(async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      const profileData = response.data || response.user || response;
      
      setUser(profileData);
      
      if (profileData.privacy) {
        setPrivacySettings({
          profileVisibility: profileData.privacy.profileVisibility !== false,
          showEmail: profileData.privacy.showEmail === true,
          showPhone: profileData.privacy.showPhone === true,
          allowMessages: profileData.privacy.allowMessages !== false,
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      const fallbackUser = getCurrentUser();
      setUser(fallbackUser);
      setLoading(false);
    }
  }, []);

  const togglePrivacy = useCallback(() => {
    setShowPrivacy(prev => !prev);
  }, []);

  const handlePrivacyChange = useCallback(async (setting) => {
    const newSettings = {
      ...privacySettings,
      [setting]: !privacySettings[setting]
    };
    
    setPrivacySettings(newSettings);
    
    try {
      await api.put(API_ENDPOINTS.PROFILE.UPDATE_PRIVACY, {
        privacy: newSettings
      });
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      setPrivacySettings(privacySettings);
    }
  }, [privacySettings]);

  const handleDeleteAccount = useCallback(async () => {
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
  }, [deleteConfirmEmail, user, navigate]);

  const isDeleteEnabled = deleteConfirmEmail.trim().toLowerCase() === (user?.email || '').trim().toLowerCase();

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
  const userInitials = user ? getInitials(user.name, 'AL') : 'AL';

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
            <button onClick={() => navigate('/dashboard/alumni')} className="px-3 py-2 text-sm rounded-lg text-purple-700 hover:text-purple-900 hover:bg-purple-50 transition">
              Alumni Dashboard
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
              <h1 className="text-2xl font-extrabold text-gray-900">{user?.fullName || user?.name || 'Alumni Name'}</h1>
              <p className="text-gray-700">{user?.email || 'alumni@university.edu'} • {user?.institution?.name || user?.college || 'University Name'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 border border-purple-200">{user?.role || 'Alumni'}</span>
                {user?.graduationYear && <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200">Class of {user.graduationYear}</span>}
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
                {user?.bio || <span className="italic text-gray-500">No bio added yet. Click "Edit Profile" to add your bio and tell others about yourself!</span>}
              </p>
            </div>

            {/* Work Experience */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Experience</h2>
              <div className="space-y-4">
                {user?.workExperience && user.workExperience.length > 0 ? (
                  user.workExperience.map((work, idx) => (
                    <div key={idx} className="border-l-4 border-purple-400 pl-4">
                      <h3 className="text-sm font-semibold text-gray-900">{work.position || work.title}</h3>
                      <p className="text-sm text-gray-700">{work.company}</p>
                      <p className="text-xs text-gray-500">{work.duration || work.year}</p>
                      {work.description && <p className="text-sm text-gray-600 mt-1">{work.description}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No work experience added yet</p>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
              <div className="space-y-4">
                {user?.education && user.education.length > 0 ? (
                  user.education.map((edu, idx) => (
                    <div key={idx} className="border-l-4 border-blue-400 pl-4">
                      <h3 className="text-sm font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-sm text-gray-700">{edu.institution}</p>
                      <p className="text-xs text-gray-500">{edu.year}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No education information added yet</p>
                )}
              </div>
            </div>

            {/* Mentorship */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mentorship</h2>
              <p className="text-sm text-gray-500 italic">Not offering mentorship yet</p>
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
                  <span>{user.email || 'email@example.com'}</span>
                </div>
                <div className={`flex items-center gap-2 ${user?.phone ? 'text-gray-700' : 'text-gray-500'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span className={user?.phone ? '' : 'italic'}>{user?.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {user?.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500 italic">No skills added yet</span>
                )}
              </div>
            </div>

            {/* Industry */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Industry</h2>
              <p className="text-sm text-gray-500 italic">No industry specified</p>
            </div>

            {/* Availability */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Availability</h2>
              <p className="text-sm text-gray-700">
                <span className="text-gray-500 italic">No availability information</span>
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={togglePrivacy}>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🔒</span> Privacy Settings
              </h2>
              <p className="text-sm text-gray-600 mt-1">Control who can see your profile information</p>
            </div>
            <button className="p-3 rounded-full hover:bg-gray-100 transition-all">
              <svg className={`w-6 h-6 text-gray-600 transform transition-transform duration-300 ${showPrivacy ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>

          {showPrivacy && (
            <div className="space-y-4 mt-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">👁️ Profile Visibility</h3>
                    <p className="text-sm text-gray-600 mt-1">Make your profile visible to other users when they search</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" checked={privacySettings.profileVisibility} onChange={() => handlePrivacyChange('profileVisibility')} className="sr-only peer" />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">📧 Show Email</h3>
                    <p className="text-sm text-gray-600 mt-1">Display your email address on your public profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" checked={privacySettings.showEmail} onChange={() => handlePrivacyChange('showEmail')} className="sr-only peer" />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">📱 Show Phone</h3>
                    <p className="text-sm text-gray-600 mt-1">Display your phone number on your public profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" checked={privacySettings.showPhone} onChange={() => handlePrivacyChange('showPhone')} className="sr-only peer" />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">💬 Allow Messages</h3>
                    <p className="text-sm text-gray-600 mt-1">Allow other users to send you messages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" checked={privacySettings.allowMessages} onChange={() => handlePrivacyChange('allowMessages')} className="sr-only peer" />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
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

export default AlumniProfile;
