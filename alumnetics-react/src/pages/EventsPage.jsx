import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, API_ENDPOINTS } from '../services/api';
import { getCurrentUser } from '../utils/helpers';

// Move constant outside component to avoid recreation on every render
const DEFAULT_IMAGES = {
  'reunion': 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=200&fit=crop',
  'networking': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop',
  'workshop': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop',
  'webinar': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop',
  'meetup': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop',
  'seminar': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
  'career': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=200&fit=crop',
  'conference': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
  'hackathon': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop',
  'fundraising': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=200&fit=crop',
  'social': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=200&fit=crop',
  'other': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=200&fit=crop'
};

const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'networking',
    startDate: '',
    endDate: '',
    location: '',
    maxAttendees: '',
    registrationDeadline: ''
  });

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    loadEvents();
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📊 Loading events...');
      
      // Build query parameters
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (typeFilter) params.eventType = typeFilter;
      
      // Fetch events from API
      const response = await api.get(API_ENDPOINTS.EVENTS.GET_ALL, params);
      
      console.log('📦 Events response:', response);
      
      // Set events from response - handle response.data.events structure
      const events = response.data?.events || response.events || [];
      console.log('✅ Loaded events:', events.length, 'events');
      setEvents(events);
    } catch (error) {
      console.error('❌ Failed to load events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter]);

  const handleSearch = useCallback(() => {
    loadEvents();
  }, [loadEvents]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      loadEvents();
    }
  }, [loadEvents]);

  const handleRegister = useCallback(async (eventId, e) => {
    e.stopPropagation();
    try {
      // Call API to register for event
      const response = await api.post(API_ENDPOINTS.EVENTS.REGISTER(eventId));
      
      alert(response.message || '✅ Successfully registered for the event!');
      
      // Reload events to reflect updated registration status
      loadEvents();
    } catch (error) {
      console.error('Registration failed:', error);
      alert(error.message || 'Failed to register. Please try again.');
    }
  }, [loadEvents]);

  const handleCreateEvent = useCallback(async (e) => {
    e.preventDefault();
    try {
      console.log('Creating event:', newEvent);
      const response = await api.post(API_ENDPOINTS.EVENTS.CREATE, newEvent);
      
      alert('✅ Event created successfully!');
      setShowCreateModal(false);
      setNewEvent({
        title: '',
        description: '',
        eventType: 'networking',
        startDate: '',
        endDate: '',
        location: '',
        maxAttendees: '',
        registrationDeadline: ''
      });
      
      // Reload events
      loadEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
      alert(error.message || 'Failed to create event. Please try again.');
    }
  }, [newEvent, loadEvents]);

  const handleEventInputChange = useCallback((field, value) => {
    setNewEvent(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const getEventImage = useCallback((event) => {
    if (event?.coverImage?.url) return event.coverImage.url;
    if (event?.coverImage && typeof event.coverImage === 'string') return event.coverImage;
    if (event?.imageUrl) return event.imageUrl;
    return DEFAULT_IMAGES[event?.eventType] || DEFAULT_IMAGES['other'];
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const formatTime = useCallback((dateString) => {
    return new Date(dateString).toLocaleTimeString();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">📅 Events Hub</h1>
              <p className="text-white/80 text-sm">Discover and join alumni events</p>
            </div>
            <div className="flex gap-3">
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all"
                >
                  + Create Event
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-all"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Search and Filters */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search events..."
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
            >
              <option value="">All Types</option>
              <option value="webinar">Webinar</option>
              <option value="workshop">Workshop</option>
              <option value="meetup">Meetup</option>
              <option value="reunion">Reunion</option>
              <option value="hackathon">Hackathon</option>
              <option value="career">Career Fair</option>
              <option value="conference">Conference</option>
              <option value="seminar">Seminar</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-all"
            >
              🔍 Search
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-96 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="relative h-48 bg-gradient-to-r from-purple-600 to-indigo-600">
                  <img
                    src={getEventImage(event)}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGES['other'];
                    }}
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {event.description || 'No description available'}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📅</span>
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📍</span>
                      <span>{event.location || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>👥</span>
                      <span>{event.attendees?.length || 0} registered</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleRegister(event._id, e)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-all font-medium"
                  >
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
            <p className="text-white/80">Check back later for upcoming events!</p>
          </div>
        )}
      </main>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Create New Event</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
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
                    <option value="networking">Networking</option>
                    <option value="workshop">Workshop</option>
                    <option value="webinar">Webinar</option>
                    <option value="reunion">Reunion</option>
                    <option value="seminar">Seminar</option>
                    <option value="career">Career Fair</option>
                    <option value="conference">Conference</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="fundraising">Fundraising</option>
                    <option value="social">Social</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => handleEventInputChange('location', e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="Event location"
                  />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attendees
                  </label>
                  <input
                    type="number"
                    value={newEvent.maxAttendees}
                    onChange={(e) => handleEventInputChange('maxAttendees', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="Leave empty for unlimited"
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
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-all"
                >
                  Create Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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

export default EventsPage;
