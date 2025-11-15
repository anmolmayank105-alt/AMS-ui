// API Configuration
const API_CONFIG = {
  // Base URL - Change this based on environment
  // Always use lowercase to avoid case sensitivity issues
  BASE_URL: (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').toLowerCase(),
  
  // Timeout
  TIMEOUT: 30000,
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  
  // Events endpoints
  EVENTS: {
    GET_ALL: '/events',
    GET_BY_ID: (id) => `/events/${id}`,
    CREATE: '/events',
    UPDATE: (id) => `/events/${id}`,
    DELETE: (id) => `/events/${id}`,
    MY_EVENTS: '/events/my/events',
    REGISTER: (id) => `/events/${id}/register`,
    UNREGISTER: (id) => `/events/${id}/register`,
    ATTENDEES: (id) => `/events/${id}/attendees`,
    APPROVE: (id) => `/events/${id}/approve`,
    ANALYTICS: (id) => `/events/${id}/analytics`,
  },
  
  // Users endpoints
  USERS: {
    GET_ALL: '/users',
    GET_BY_ID: (id) => `/users/${id}`,
    SEARCH: '/users/search',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    STATS: '/users/stats',
  },
  
  // Profile endpoints
  PROFILE: {
    GET: '/users/profile',
    UPDATE: '/users/profile',
    UPDATE_PHOTO: '/users/profile/photo',
    UPDATE_PRIVACY: '/users/profile/privacy',
    GET_PUBLIC: (id) => `/users/${id}`,
  },
  
  // Jobs endpoints
  JOBS: {
    GET_ALL: '/jobs',
    GET_BY_ID: (id) => `/jobs/${id}`,
    CREATE: '/jobs',
    UPDATE: (id) => `/jobs/${id}`,
    DELETE: (id) => `/jobs/${id}`,
    MY_JOBS: '/jobs/my/jobs',
    APPLY: (id) => `/jobs/${id}/apply`,
    APPLICATIONS: (id) => `/jobs/${id}/applications`,
  },
  
  // Messages endpoints
  MESSAGES: {
    GET_CONVERSATIONS: '/messages/conversations',
    GET_MESSAGES: (userId) => `/messages/${userId}`,
    SEND: '/messages',
    DELETE: (id) => `/messages/${id}`,
    MARK_READ: (id) => `/messages/${id}/read`,
  },
  
  // Fundraising endpoints
  FUNDRAISING: {
    GET_ALL: '/fundraising',
    GET_BY_ID: (id) => `/fundraising/${id}`,
    CREATE: '/fundraising',
    UPDATE: (id) => `/fundraising/${id}`,
    DELETE: (id) => `/fundraising/${id}`,
    MY_CAMPAIGNS: '/fundraising/my/campaigns',
    DONATE: (id) => `/fundraising/${id}/donate`,
    MY_DONATIONS: '/fundraising/my/donations',
  },
  
  // Mentorship endpoints
  MENTORSHIP: {
    GET_MENTORS: '/mentorship/mentors',
    GET_REQUESTS: '/mentorship/requests',
    CREATE_REQUEST: '/mentorship/requests',
    UPDATE_REQUEST: (id) => `/mentorship/requests/${id}`,
    MY_MENTEES: '/mentorship/mentees',
    MY_MENTORS: '/mentorship/mentors/me',
  }
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
};

// API Request Helper
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Build headers with auth token
  buildHeaders(customHeaders = {}) {
    const headers = { ...API_CONFIG.HEADERS, ...customHeaders };
    const token = this.getAuthToken();
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: this.buildHeaders(options.headers),
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Handle different response statuses
      if (response.status === 401) {
        // Unauthorized - redirect to login
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          window.location.href = '/login';
        }
        throw new Error('Invalid email or password');
      }

      if (response.status === 403) {
        throw new Error('Access forbidden. You do not have permission.');
      }

      if (response.status === 404) {
        throw new Error('Resource not found.');
      }

      if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      }

      // Parse JSON response
      let data;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        console.error('❌ Response not OK:', data);
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      console.error('❌ API Request failed:', {
        error: error.message,
        name: error.name,
        url,
        endpoint
      });
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Cannot connect to server. Please check if the backend is running.');
      }
      
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: HTTP_METHODS.GET,
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: HTTP_METHODS.DELETE,
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: HTTP_METHODS.PATCH,
      body: JSON.stringify(data),
    });
  }

  // Upload file (FormData)
  async upload(endpoint, formData) {
    const headers = {};
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData, browser will set it with boundary

    return this.request(endpoint, {
      method: HTTP_METHODS.POST,
      headers,
      body: formData,
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;

// Export convenience methods
export const api = {
  get: (endpoint, params) => apiService.get(endpoint, params),
  post: (endpoint, data) => apiService.post(endpoint, data),
  put: (endpoint, data) => apiService.put(endpoint, data),
  delete: (endpoint) => apiService.delete(endpoint),
  patch: (endpoint, data) => apiService.patch(endpoint, data),
  upload: (endpoint, formData) => apiService.upload(endpoint, formData),
};
