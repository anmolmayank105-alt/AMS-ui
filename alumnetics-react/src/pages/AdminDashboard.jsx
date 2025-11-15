import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, API_ENDPOINTS } from '../services/api';
import { isAuthenticated, getCurrentUser, logout } from '../utils/helpers';
import { getEventImage } from '../utils/eventImages';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'networking',
    category: '',
    startDate: '',
    endDate: '',
    eventMode: 'physical',
    venueName: '',
    virtualLink: '',
    location: '',
    maxAttendees: '',
    registrationFee: '0',
    registrationDeadline: '',
    status: 'draft'
  });
  
  // Data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    pendingApprovals: 0
  });
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      // Small delay to ensure localStorage is available
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Check authentication
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }
      
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      // Load admin data
      loadDashboardData();
    };
    
    checkAuth();
  }, [navigate]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📊 Loading admin dashboard data...');
      
      // Fetch stats, events, and users in parallel
      const [statsResponse, eventsResponse, usersResponse] = await Promise.all([
        api.get(API_ENDPOINTS.USERS.STATS).catch((err) => {
          console.error('❌ Failed to load stats:', err);
          return { totalUsers: 0, totalEvents: 0, activeEvents: 0, pendingApprovals: 0 };
        }),
        api.get(API_ENDPOINTS.EVENTS.GET_ALL).catch((err) => {
          console.error('❌ Failed to load events:', err);
          return { data: { events: [] } };
        }),
        api.get(API_ENDPOINTS.USERS.GET_ALL).catch((err) => {
          console.error('❌ Failed to load users:', err);
          return { data: { users: [] } };
        })
      ]);
      
      console.log('📦 Stats response:', statsResponse);
      console.log('📦 Events response:', eventsResponse);
      console.log('📦 Users response:', usersResponse);
      
      // Update stats
      if (statsResponse) {
        setStats({
          totalUsers: statsResponse.totalUsers || 0,
          totalEvents: statsResponse.totalEvents || 0,
          activeEvents: statsResponse.activeEvents || 0,
          pendingApprovals: statsResponse.pendingApprovals || 0
        });
      }
      
      // Update events - handle response.data.events structure
      const events = eventsResponse.data?.events || eventsResponse.events || [];
      console.log('✅ Loaded events:', events.length, 'events');
      setEvents(events);
      
      // Update users - handle response.data.users structure
      const users = usersResponse.data?.users || usersResponse.users || [];
      console.log('✅ Loaded users:', users.length, 'users');
      setUsers(users);
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [navigate]);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    console.log('🚀 ADMIN SEARCH STARTED - Query:', searchQuery);
    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      // Build search params (backend expects 'q' parameter)
      const params = { q: searchQuery };
      if (userRoleFilter) params.role = userRoleFilter;
      
      console.log('📡 Calling API with params:', params);
      
      // Search users via API
      const response = await api.get(API_ENDPOINTS.USERS.SEARCH, params);
      
      console.log('📦 Raw API Response:', response);
      console.log('📦 Response.data:', response.data);
      console.log('📦 Response.data.users:', response.data?.users);
      
      // Extract users with proper fallbacks
      const users = response.data?.users || response.users || [];
      console.log('✅ Search found', users.length, 'users:', users);
      
      setSearchResults(users);
      console.log('💾 State updated with users');
      console.log('🏁 ADMIN SEARCH COMPLETED');
    } catch (error) {
      console.error('❌ Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, userRoleFilter]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setUserRoleFilter('');
  }, []);

  const handleApproveEvent = useCallback(async (eventId) => {
    try {
      await api.put(API_ENDPOINTS.EVENTS.APPROVE(eventId));
      alert('Event approved successfully!');
      loadDashboardData();
    } catch (error) {
      alert(error.message || 'Failed to approve event');
    }
  }, [loadDashboardData]);

  const handleDeleteEvent = useCallback(async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await api.delete(API_ENDPOINTS.EVENTS.DELETE(eventId));
      alert('Event deleted successfully!');
      loadDashboardData();
    } catch (error) {
      alert(error.message || 'Failed to delete event');
    }
  }, [loadDashboardData]);

  const handleCreateEvent = useCallback(async (e) => {
    e.preventDefault();
    try {
      console.log(editingEventId ? 'Updating event:' : 'Creating event:', newEvent);
      
      if (editingEventId) {
        // Update existing event
        await api.put(API_ENDPOINTS.EVENTS.UPDATE(editingEventId), newEvent);
        alert('✅ Event updated successfully!');
      } else {
        // Create new event
        await api.post(API_ENDPOINTS.EVENTS.CREATE, newEvent);
        alert('✅ Event created successfully!');
      }
      
      setShowCreateEventModal(false);
      setEditingEventId(null);
      setNewEvent({
        title: '',
        description: '',
        eventType: 'networking',
        category: '',
        startDate: '',
        endDate: '',
        eventMode: 'physical',
        venueName: '',
        virtualLink: '',
        location: '',
        maxAttendees: '',
        registrationFee: '0',
        registrationDeadline: '',
        status: 'draft'
      });
      
      // Reload events
      loadDashboardData();
    } catch (error) {
      console.error('Failed to save event:', error);
      alert(error.message || 'Failed to save event. Please try again.');
    }
  }, [newEvent, editingEventId, loadDashboardData]);

  const handleEditEvent = useCallback((event) => {
    setEditingEventId(event._id);
    setNewEvent({
      title: event.title || '',
      description: event.description || '',
      eventType: event.eventType || 'networking',
      category: event.category || '',
      startDate: event.startDate ? event.startDate.slice(0, 16) : '',
      endDate: event.endDate ? event.endDate.slice(0, 16) : '',
      eventMode: event.eventMode || 'physical',
      venueName: event.venueName || '',
      virtualLink: event.virtualLink || '',
      location: event.location || '',
      maxAttendees: event.maxAttendees || '',
      registrationFee: event.registrationFee || '0',
      registrationDeadline: event.registrationDeadline ? event.registrationDeadline.slice(0, 16) : '',
      status: event.status || 'draft'
    });
    setShowCreateEventModal(true);
  }, []);

  const handleEventInputChange = useCallback((field, value) => {
    setNewEvent(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleDeleteUser = useCallback(async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(API_ENDPOINTS.USERS.DELETE(userId));
      alert('User deleted successfully!');
      loadDashboardData();
    } catch (error) {
      alert(error.message || 'Failed to delete user');
    }
  }, [loadDashboardData]);

  const switchSection = useCallback((section) => {
    setActiveSection(section);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 relative overflow-hidden">
      {/* Floating shapes for animation */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-purple-200/30 rounded-full animate-[float_6s_ease-in-out_infinite]"></div>
      <div className="absolute top-60 right-20 w-16 h-16 bg-blue-200/30 rounded-full animate-[float_6s_ease-in-out_infinite_2s]"></div>
      <div className="absolute bottom-32 left-3/4 w-20 h-20 bg-cyan-200/30 rounded-full animate-[float_6s_ease-in-out_infinite_4s]"></div>
      
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
                <button 
                  onClick={() => switchSection('overview')} 
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeSection === 'overview' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => switchSection('events')} 
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeSection === 'events' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>Events</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => switchSection('users')} 
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeSection === 'users' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span>Users</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => switchSection('analytics')} 
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeSection === 'analytics' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span>Analytics</span>
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
                  onClick={() => navigate('/profile/admin')}
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
                    alt={user.fullName || 'Admin'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    <span>{user?.fullName ? user.fullName.charAt(0).toUpperCase() : (user?.firstName?.[0] || user?.initials || 'AD')}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{user?.fullName || user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Admin')}</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg text-sm">
              Logout
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl border border-white/20 p-8 text-white animate-[fadeInUp_0.6s_ease-out]">
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-2">Welcome Back, {user?.fullName || user?.name || 'Admin'}! 👋</h2>
                  <p className="text-purple-100">Here's what's happening with your platform today.</p>
                </div>
              </div>

              {/* Search Section */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 animate-[fadeInUp_0.6s_ease-out_0.05s]">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🔍 Quick Search</h3>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                      placeholder="Search users, events, or content..."
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <button 
                    onClick={performSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                  {showSearchResults && (
                    <button 
                      onClick={clearSearch}
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {/* Search Results */}
                {showSearchResults && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Search Results ({searchResults.length})
                      </h4>
                      <button onClick={clearSearch} className="text-sm text-gray-600 hover:text-gray-900">Clear</button>
                    </div>
                    {isSearching ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {searchResults.map((result) => (
                          <div 
                            key={result._id} 
                            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              {result.profilePicture?.url ? (
                                <img 
                                  src={result.profilePicture.url} 
                                  alt={result.fullName || `${result.firstName} ${result.lastName}`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {result.firstName?.[0] || result.fullName?.charAt(0) || 'U'}
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{result.fullName || (result.firstName && result.lastName ? `${result.firstName} ${result.lastName}` : 'Unknown User')}</p>
                                <p className="text-sm text-gray-600">
                                  {result.role} • {result.institution?.name || 'No institution'}
                                </p>
                              </div>
                              <button
                                onClick={() => navigate(`/profile/view?id=${result._id}`)}
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1 text-sm"
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
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p>No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers}</h3>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-xs text-green-600 mt-2">↑ 12% from last month</p>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalEvents}</h3>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-xs text-green-600 mt-2">↑ 8 events this month</p>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeEvents}</h3>
                  <p className="text-sm text-gray-600">Active Events</p>
                  <p className="text-xs text-blue-600 mt-2">Published</p>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingApprovals}</h3>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  <p className="text-xs text-orange-600 mt-2">Requires attention</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Recent Activity</h3>
                <div className="text-center text-gray-500 py-8">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  <p className="font-medium">No recent activity</p>
                </div>
              </div>
            </div>
          )}

          {/* Events Section */}
          {activeSection === 'events' && (
            <div className="space-y-6">
              {/* Events Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl border border-white/20 p-8 text-white animate-[fadeInUp_0.6s_ease-out]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Event Management 📅</h2>
                    <p className="text-purple-100">Create and manage all platform events</p>
                  </div>
                  <button 
                    onClick={() => setShowCreateEventModal(true)}
                    className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition shadow-lg"
                  >
                    + Create Event
                  </button>
                </div>
              </div>

              {/* Event Filters */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events..." 
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  
                  <select 
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="reunion">Reunion</option>
                    <option value="networking">Networking</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="career-fair">Career Fair</option>
                    <option value="fundraising">Fundraising</option>
                    <option value="social">Social</option>
                    <option value="other">Other</option>
                  </select>

                  <select 
                    value={eventStatusFilter}
                    onChange={(e) => setEventStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition shadow-lg">
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Events Grid */}
              {loading ? (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                  <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No Events Yet</h4>
                  <p className="text-gray-500 mb-6">Create your first event to get started!</p>
                  <button 
                    onClick={() => setShowCreateEventModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition shadow-lg"
                  >
                    + Create First Event
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div key={event._id} className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300">
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={getEventImage(event)} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=200&fit=crop';
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span>{new Date(event.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span>{event.location || 'Location TBD'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              event.status === 'published' ? 'bg-green-100 text-green-700' :
                              event.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                              event.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {event.status || 'draft'}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-700">
                              {event.eventType || 'event'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditEvent(event)}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                          >
                            Edit
                          </button>
                          {event.status === 'draft' && (
                            <button 
                              onClick={() => handleApproveEvent(event._id)}
                              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
                            >
                              Approve
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteEvent(event._id)}
                            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <div className="space-y-6">
              {/* Users Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl border border-white/20 p-8 text-white animate-[fadeInUp_0.6s_ease-out]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">User Management 👥</h2>
                    <p className="text-purple-100">Manage all platform users and roles</p>
                  </div>
                  <button className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition shadow-lg">
                    + Add User
                  </button>
                </div>
              </div>

              {/* User Filters */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..." 
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  
                  <select 
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="">All Roles</option>
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>

                  <select className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>

                  <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition shadow-lg">
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Users Grid - Empty State */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No Users Found</h4>
                <p className="text-gray-500">Users will appear here once they register</p>
              </div>
            </div>
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl border border-white/20 p-8 text-white animate-[fadeInUp_0.6s_ease-out]">
                <h2 className="text-3xl font-bold mb-2">Platform Analytics 📈</h2>
                <p className="text-purple-100">Insights and statistics about your platform</p>
              </div>

              {/* Analytics Charts - Empty State */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                    <p className="text-gray-500">No data available yet</p>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Participation</h3>
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                    </svg>
                    <p className="text-gray-500">No data available yet</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateEventModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{editingEventId ? 'Edit Event' : 'Create New Event'}</h2>
                <button
                  onClick={() => {
                    setShowCreateEventModal(false);
                    setEditingEventId(null);
                  }}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => handleEventInputChange('title', e.target.value)}
                    required
                    maxLength={200}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => handleEventInputChange('description', e.target.value)}
                    required
                    maxLength={2000}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="Describe your event"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    value={newEvent.eventType}
                    onChange={(e) => handleEventInputChange('eventType', e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="reunion">Reunion</option>
                    <option value="networking">Networking</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="career">Career Fair</option>
                    <option value="fundraising">Fundraising</option>
                    <option value="social">Social</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => handleEventInputChange('category', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select category</option>
                    <option value="academic">Academic</option>
                    <option value="professional">Professional</option>
                    <option value="social">Social</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="charity">Charity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.startDate}
                    onChange={(e) => handleEventInputChange('startDate', e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.endDate}
                    onChange={(e) => handleEventInputChange('endDate', e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Mode *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="eventMode"
                        value="physical"
                        checked={newEvent.eventMode === 'physical'}
                        onChange={(e) => handleEventInputChange('eventMode', e.target.value)}
                        className="mr-2"
                      />
                      <span>Physical</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="eventMode"
                        value="virtual"
                        checked={newEvent.eventMode === 'virtual'}
                        onChange={(e) => handleEventInputChange('eventMode', e.target.value)}
                        className="mr-2"
                      />
                      <span>Virtual</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="eventMode"
                        value="hybrid"
                        checked={newEvent.eventMode === 'hybrid'}
                        onChange={(e) => handleEventInputChange('eventMode', e.target.value)}
                        className="mr-2"
                      />
                      <span>Hybrid</span>
                    </label>
                  </div>
                </div>

                {(newEvent.eventMode === 'physical' || newEvent.eventMode === 'hybrid') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      value={newEvent.venueName}
                      onChange={(e) => handleEventInputChange('venueName', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="Enter venue name"
                    />
                  </div>
                )}

                {(newEvent.eventMode === 'physical' || newEvent.eventMode === 'hybrid') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => handleEventInputChange('location', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="City, State"
                    />
                  </div>
                )}

                {(newEvent.eventMode === 'virtual' || newEvent.eventMode === 'hybrid') && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Virtual Meeting Link
                    </label>
                    <input
                      type="url"
                      value={newEvent.virtualLink}
                      onChange={(e) => handleEventInputChange('virtualLink', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="https://zoom.us/..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attendees
                  </label>
                  <input
                    type="number"
                    value={newEvent.maxAttendees}
                    onChange={(e) => handleEventInputChange('maxAttendees', e.target.value)}
                    min="1"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Fee (USD)
                  </label>
                  <input
                    type="number"
                    value={newEvent.registrationFee}
                    onChange={(e) => handleEventInputChange('registrationFee', e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.registrationDeadline}
                    onChange={(e) => handleEventInputChange('registrationDeadline', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newEvent.status}
                    onChange={(e) => handleEventInputChange('status', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-all"
                >
                  {editingEventId ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateEventModal(false);
                    setEditingEventId(null);
                  }}
                  className="px-6 py-3 border-2 border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
