import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getInitials, getCurrentUser } from '../utils/helpers';
import { api, API_ENDPOINTS } from '../services/api';

const ViewProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [searchParams]);

  const loadUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const userId = searchParams.get('id');
    
    try {
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }

      const currentUser = getCurrentUser();
      const viewingOwnProfile = currentUser?._id === userId || currentUser?.id === userId;
      setIsOwnProfile(viewingOwnProfile);

      // Fetch user profile from API
      console.log('🔍 Fetching profile for user ID:', userId);
      const response = await api.get(API_ENDPOINTS.PROFILE.GET_PUBLIC(userId));
      console.log('📦 Raw API Response:', response);
      
      const profileData = response.data?.user || response.user || response.data || response;
      console.log('👤 Profile Data:', profileData);
      
      setUser(profileData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError(error.message || 'User not found');
      setLoading(false);
    }
  }, [searchParams]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const sendMessage = useCallback(() => {
    // Navigate to messaging page with the user pre-selected
    navigate('/messages', { state: { selectedUser: user } });
  }, [navigate, user]);

  const editProfile = useCallback(() => {
    const userData = getCurrentUser();
    if (userData?.role === 'student') {
      navigate('/profile/student');
    } else if (userData?.role === 'alumni') {
      navigate('/profile/alumni');
    } else if (userData?.role === 'admin') {
      navigate('/profile/admin');
    }
  }, [navigate]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        {/* Floating particles */}
        <div className="fixed top-[10%] left-[10%] w-20 h-20 bg-white/15 rounded-full animate-float"></div>
        <div className="fixed top-[60%] right-[15%] w-16 h-16 bg-white/15 rounded-full animate-float" style={{ animationDelay: '-5s' }}></div>
        <div className="fixed bottom-[10%] left-[70%] w-24 h-24 bg-white/15 rounded-full animate-float" style={{ animationDelay: '-10s' }}></div>

        <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="AlumNetics" className="w-12 h-12 rounded-xl object-cover shadow-2xl ring-2 ring-white/50 hover:scale-110 transition-transform duration-300" />
              <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">ALUMNETICS</span>
            </div>
            <button onClick={goBack} className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              ← Back to Dashboard
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8 text-center relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-10 shadow-2xl hover:-translate-y-2 transition-transform duration-300">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-purple-600 mx-auto mb-4"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-ping rounded-full h-16 w-16 border-4 border-purple-400 opacity-20"></div>
            </div>
            <p className="text-gray-700 text-lg font-semibold">Loading profile...</p>
            <p className="text-gray-500 text-xs mt-2">Please wait while we fetch the details</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        {/* Floating particles */}
        <div className="fixed top-[10%] left-[10%] w-20 h-20 bg-white/15 rounded-full animate-float"></div>
        <div className="fixed top-[60%] right-[15%] w-16 h-16 bg-white/15 rounded-full animate-float" style={{ animationDelay: '-5s' }}></div>
        <div className="fixed bottom-[10%] left-[70%] w-24 h-24 bg-white/15 rounded-full animate-float" style={{ animationDelay: '-10s' }}></div>

        <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="AlumNetics" className="w-12 h-12 rounded-xl object-cover shadow-2xl ring-2 ring-white/50 hover:scale-110 transition-transform duration-300" />
              <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">ALUMNETICS</span>
            </div>
            <button onClick={goBack} className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              ← Back to Dashboard
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8 text-center relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl hover:-translate-y-2 transition-transform duration-300">
            <div className="text-5xl mb-4 animate-bounce">😕</div>
            <p className="text-red-600 font-extrabold text-xl mb-2">{error}</p>
            <p className="text-gray-600 text-sm mb-6">The profile you're looking for doesn't exist or has been removed.</p>
            <button onClick={goBack} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-xl transform hover:scale-105 transition-all">
              Go Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profile Content
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Floating particles */}
      <div className="fixed top-[10%] left-[10%] w-20 h-20 bg-white/15 rounded-full animate-float"></div>
      <div className="fixed top-[60%] right-[15%] w-16 h-16 bg-white/15 rounded-full animate-float" style={{ animationDelay: '-5s' }}></div>
      <div className="fixed bottom-[10%] left-[70%] w-24 h-24 bg-white/15 rounded-full animate-float" style={{ animationDelay: '-10s' }}></div>

      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="AlumNetics" className="w-12 h-12 rounded-xl object-cover shadow-2xl ring-2 ring-white/50 hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">ALUMNETICS</span>
          </div>
          <button onClick={goBack} className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Profile Header Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 hover:-translate-y-2 transition-transform duration-300">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              {user?.profilePicture?.url ? (
                <img 
                  src={user.profilePicture.url} 
                  alt={user.fullName || 'Profile'} 
                  className="w-24 h-24 rounded-full object-cover shadow-2xl ring-4 ring-white group-hover:ring-purple-300 transition-all duration-300 transform group-hover:scale-105"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-blue-600 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl ring-4 ring-white group-hover:ring-purple-300 transition-all duration-300 transform group-hover:scale-105">
                  {getInitials(user?.fullName || user?.firstName)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] px-2 py-1 rounded-full shadow-lg border-2 border-white font-semibold animate-pulse">
                ✓ Active
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                {user?.fullName || 'User Name'}
              </h1>
              <p className="text-lg text-gray-700 mb-4">
                <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {user?.role || 'Student'}
                </span>
              </p>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 rounded-full text-xs font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border border-purple-200">
                  📚 {user?.department || 'Department'}
                </span>
                <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full text-xs font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border border-blue-200">
                  🎓 {user?.institution?.name || 'Institution'}
                </span>
                <span className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-xs font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border border-green-200">
                  📅 {user?.graduationYear ? `Class of ${user.graduationYear}` : 'Class of 2024'}
                </span>
              </div>

              {/* Bio */}
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 shadow-inner">
                <p className="text-gray-700 text-sm leading-relaxed italic">
                  {user?.bio || 'No bio available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Details Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Contact Information */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/20 hover:-translate-y-2 transition-transform duration-300">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📧</span> 
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Contact Information</span>
            </h2>
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-0.5">Email Address</p>
                  {user?.email ? (
                    <a href={`mailto:${user.email}`} className="text-purple-700 font-bold text-sm hover:text-purple-900 truncate block hover:underline">
                      {user.email}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic text-sm truncate block">🔒 Hidden by user</span>
                  )}
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-0.5">Phone Number</p>
                  {user?.phone ? (
                    <a href={`tel:${user.phone}`} className="text-green-700 font-bold text-sm hover:text-green-900 truncate block hover:underline">
                      {user.phone}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic text-sm truncate block">🔒 Hidden by user</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/20 hover:-translate-y-2 transition-transform duration-300">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎓</span> 
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Academic Details</span>
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-0.5">Degree Program</p>
                <p className="text-gray-900 font-bold text-sm italic">{user?.degree || 'Not specified'}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-0.5">Graduation Year</p>
                <p className="text-gray-900 font-bold text-sm italic">{user?.graduationYear || 'Not specified'}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-0.5">Location</p>
                <p className="text-gray-900 font-bold text-sm italic">{user?.location || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center pb-6">
          {isOwnProfile ? (
            <button onClick={editProfile} className="group px-6 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
              <span className="flex items-center gap-2">
                ✏️ Edit Profile
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </span>
            </button>
          ) : (
            <button onClick={sendMessage} className="group px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
              <span className="flex items-center gap-2">
                💬 Send Message
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </span>
            </button>
          )}
          <button onClick={goBack} className="px-6 py-3 bg-white/90 backdrop-blur-md text-gray-800 rounded-xl font-bold text-sm hover:bg-white transition-all shadow-lg border-2 border-white/40 transform hover:scale-105 hover:shadow-xl">
            ← Back to Search
          </button>
        </div>
      </main>
    </div>
  );
};

export default ViewProfile;
