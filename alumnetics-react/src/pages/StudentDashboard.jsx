import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitials, isAuthenticated, getCurrentUser, logout } from '../utils/helpers';
import { api, API_ENDPOINTS } from '../services/api';
import { getEventImage } from '../utils/eventImages';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🎓 StudentDashboard: Checking authentication...');
      
      // Small delay to ensure localStorage is available
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Check authentication using helper
      const authCheck = isAuthenticated();
      console.log('🎓 isAuthenticated():', authCheck);
      
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('userData');
      console.log('🎓 Token in localStorage:', storedToken ? 'YES (length: ' + storedToken.length + ')' : 'NO');
      console.log('🎓 User in localStorage:', storedUser ? 'YES' : 'NO');
      
      if (!authCheck) {
        console.log('❌ Not authenticated, redirecting to login...');
        navigate('/login');
        return;
      }
      
      console.log('✅ Authenticated! Loading dashboard...');
      const currentUser = getCurrentUser();
      console.log('✅ Current user:', currentUser);
      setUser(currentUser);
      
      // Load dashboard data
      loadDashboardData();
    };
    
    checkAuth();
  }, [navigate]);

  const loadDashboardData = useCallback(async () => {
    try {
      console.log('📊 Loading dashboard data...');
      
      // Fetch upcoming events and jobs
      const [eventsResponse, jobsResponse] = await Promise.all([
        api.get(API_ENDPOINTS.EVENTS.GET_ALL, { limit: 3, upcoming: true }).catch((err) => {
          console.error('❌ Failed to load events:', err);
          return { data: { events: [] } };
        }),
        api.get(API_ENDPOINTS.JOBS.GET_ALL, { limit: 3 }).catch((err) => {
          console.error('❌ Failed to load jobs:', err);
          return { data: { jobs: [] } };
        })
      ]);
      
      console.log('📦 Events response:', eventsResponse);
      console.log('📦 Jobs response:', jobsResponse);
      
      // Update events - handle response.data.events structure
      const events = eventsResponse.data?.events || eventsResponse.events || [];
      console.log('✅ Loaded events:', events.length, 'events');
      setUpcomingEvents(events);
      
      // Update jobs - handle response.data.jobs structure
      const jobs = jobsResponse.data?.jobs || jobsResponse.jobs || [];
      console.log('✅ Loaded jobs:', jobs.length, 'jobs');
      setRecommendedJobs(jobs);
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
    }
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [navigate]);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    console.log('🚀 SEARCH STARTED - Query:', searchQuery);
    setIsSearching(true);
    setShowResults(true);
    
    try {
      const params = { q: searchQuery };
      if (roleFilter) params.role = roleFilter;
      
      console.log('📡 Calling API with params:', params);
      const response = await api.get(API_ENDPOINTS.USERS.SEARCH, params);
      
      console.log('📦 Raw API Response:', response);
      console.log('📦 Response.data:', response.data);
      console.log('📦 Response.data.users:', response.data?.users);
      
      // Extract users array from response
      const users = response.data?.users || response.users || [];
      console.log('✅ Search found', users.length, 'users:', users);
      
      setSearchResults(users);
      console.log('💾 State updated with users');
    } catch (error) {
      console.error('❌ Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      console.log('🏁 SEARCH COMPLETED');
    }
  }, [searchQuery, roleFilter]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setRoleFilter('');
    setSearchResults([]);
    setShowResults(false);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 relative overflow-hidden">
      {/* Floating shapes for animation */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-purple-200/30 rounded-full animate-[float_6s_ease-in-out_infinite] pointer-events-none"></div>
      <div className="absolute top-60 right-20 w-16 h-16 bg-blue-200/30 rounded-full animate-[float_6s_ease-in-out_infinite_2s] pointer-events-none"></div>
      <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-cyan-200/30 rounded-full animate-[float_6s_ease-in-out_infinite_4s] pointer-events-none"></div>
      
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white/90 backdrop-blur-md border-r border-white/20 shadow-xl flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <img src="/logo.jpeg" alt="ALUMNETICS" className="w-10 h-10 rounded-xl object-cover shadow-lg border border-white/40" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ALUMNETICS</h1>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                  </svg>
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  <span>Fundraisers</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
                  </svg>
                  <span>Alumni Network</span>
                </a>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/events')}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>Events</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/messages')}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  <span>Messages</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/profile/student')}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>Profile</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg">
                {user?.profilePicture?.url ? (
                  <img 
                    src={user.profilePicture.url} 
                    alt={user.fullName || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    <span>{user?.fullName ? user.fullName.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{user?.fullName || user?.name || 'User'}</p>
                <p className="text-xs text-gray-600">{user?.institution?.name || user?.college || 'Student'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg text-sm">
              Logout
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl border border-white/20 p-8 text-white animate-[fadeInUp_0.6s_ease-out] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-12 gap-2 p-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
                ))}
              </div>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Welcome back! 👋</h2>
              <p className="text-xl text-purple-100 mb-6">Ready to connect with your alumni network today?</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <span className="text-2xl">🎓</span>
                  <span className="text-sm font-medium">{user?.institution?.name || user?.college || 'Your University'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 animate-[fadeInUp_0.6s_ease-out_0.05s]">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🔍 Search Alumni & Students</h3>
            <p className="text-sm text-gray-600 mb-4">Find students and alumni from your university</p>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                  placeholder="Search by name, department, graduation year..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="alumni">Alumni</option>
              </select>
              <button 
                onClick={() => {
                  console.log('🔴 BUTTON CLICKED!');
                  console.log('Search query:', searchQuery);
                  performSearch();
                }} 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Search
              </button>
            </div>

            {/* Search Results */}
            {showResults && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">Search Results</h4>
                  <button onClick={clearSearch} className="text-sm text-gray-600 hover:text-gray-900">Clear</button>
                </div>
                {isSearching ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p>No users found from your university</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {searchResults.map((result, idx) => (
                      <div key={result._id || idx} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {result.profilePicture?.url ? (
                            <img 
                              src={result.profilePicture.url} 
                              alt={result.fullName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {result.fullName?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{result.fullName}</h4>
                            <p className="text-sm text-gray-600">{result.role} • {result.institution?.name}</p>
                            {result.department && <p className="text-xs text-gray-500">{result.department}</p>}
                          </div>
                          <button
                            onClick={() => navigate(`/profile/view?id=${result._id}`)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            Visit Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.6s_ease-out_0.1s] relative z-10">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 pointer-events-auto">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Join Events</h3>
              <p className="text-gray-600 text-sm mb-4">Participate in networking events and workshops</p>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Browse Events clicked!');
                  navigate('/events');
                }}
                className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 cursor-pointer relative z-50 pointer-events-auto"
              >
                Browse Events
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Send Messages</h3>
              <p className="text-gray-600 text-sm mb-4">Reach out to alumni and build connections</p>
              <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200">Message</button>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Profile</h3>
              <p className="text-gray-600 text-sm mb-4">Keep your information current and discoverable</p>
              <button 
                onClick={() => navigate('/profile/edit')}
                className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-[fadeInUp_0.6s_ease-out_0.2s]">
            {/* Network Growth Chart */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">📈 Network Growth</h3>
                  <p className="text-gray-600 text-sm">Your connections over time</p>
                </div>
              </div>
              
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
                </svg>
                <p className="text-gray-500 font-medium">No connections yet</p>
                <p className="text-gray-400 text-sm mt-2">Start connecting with alumni to see your network grow!</p>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-sm font-medium text-blue-800">Build your network by connecting with alumni</span>
                </div>
              </div>
            </div>

            {/* Activity Pie Chart */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">🎯 Activity Breakdown</h3>
                  <p className="text-gray-600 text-sm">Your platform engagement</p>
                </div>
              </div>

              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                </svg>
                <p className="text-gray-500 font-medium">No activity yet</p>
                <p className="text-gray-400 text-sm mt-2">Start using the platform to see your activity stats!</p>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 animate-[fadeInUp_0.6s_ease-out_0.3s]">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">🏆 Recent Achievements</h3>
                <p className="text-gray-600 text-sm">Your latest milestones and accomplishments</p>
              </div>
            </div>

            <div className="text-center py-12">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
              <h4 className="text-lg font-semibold text-gray-600 mb-2">No Achievements Yet</h4>
              <p className="text-gray-500">Start connecting, attending events, and messaging alumni to unlock achievements!</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Alumni Connections */}
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 animate-[fadeInUp_0.6s_ease-out_0.3s]">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">🎓 Recent Alumni Connections</h3>
                  <p className="text-gray-600 text-sm">Connect with fellow graduates</p>
                </div>
              </div>

              <div className="text-center py-12">
                <p className="text-gray-500">No alumni connections yet. Start networking!</p>
              </div>

              <button className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg">
                View All Alumni
              </button>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 animate-[fadeInUp_0.6s_ease-out_0.4s]">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">📅 Upcoming Events</h3>
                  <p className="text-gray-600 text-sm">Don't miss these opportunities</p>
                </div>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-gray-500 font-medium">No upcoming events</p>
                  <p className="text-gray-400 text-sm mt-2">Check back soon for new events!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event._id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          <img 
                            src={getEventImage(event)} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=200&fit=crop';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              {new Date(event.startDate).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                              {event.eventType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('View All Events clicked!');
                  navigate('/events');
                }}
                className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg cursor-pointer relative z-50 pointer-events-auto"
              >
                View All Events
              </button>
            </div>
          </div>

          {/* Network Stats */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl shadow-2xl border border-white/20 p-8 animate-[fadeInUp_0.6s_ease-out_0.5s] relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-8 gap-4 p-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3 mb-8 relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">📊 Your Network Stats</h3>
                <p className="text-cyan-100 text-sm">Overview of your activities and connections</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              {[
                { icon: 'M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z', number: '0', label: 'Alumni Connections' },
                { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', number: '0', label: 'Events Attended' },
                { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', number: '0', label: 'Messages Sent' },
                { icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', number: '0', label: 'Profile Views' }
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path>
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-cyan-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Help Button */}
      <div className="fixed bottom-6 right-6">
        <button className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;
