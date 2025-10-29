/**
 * AlumNetics API Service
 * Centralized service for all backend API communications
 * Includes MongoDB integration support and error handling
 */

class AlumNeticsAPI {
    constructor() {
        // Use environment variable or fallback to localhost
        this.baseURL = window.API_BASE_URL || 'http://localhost:5000/api';
        this.token = localStorage.getItem('authToken');
        this.refreshToken = localStorage.getItem('refreshToken');
        this.isOnline = navigator.onLine;
        
        // Setup offline/online detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // ============== AUTHENTICATION METHODS ==============
    
    async register(userData) {
        try {
            const response = await this.makeRequest('POST', '/auth/register', userData);
            if (response.success && response.data.token) {
                this.setAuthTokens(response.data.token, response.data.refreshToken);
                // Store user data for offline access
                localStorage.setItem('userData', JSON.stringify(response.data.user));
            }
            return response;
        } catch (error) {
            throw this.handleError(error, 'Registration failed');
        }
    }

    async login(credentials) {
        try {
            const response = await this.makeRequest('POST', '/auth/login', credentials);
            if (response.success && response.data.token) {
                this.setAuthTokens(response.data.token, response.data.refreshToken);
                // Store user data for offline access
                localStorage.setItem('userData', JSON.stringify(response.data.user));
            }
            return response;
        } catch (error) {
            throw this.handleError(error, 'Login failed');
        }
    }

    async logout() {
        try {
            await this.makeRequest('POST', '/auth/logout');
            this.clearAuthTokens();
            return { success: true };
        } catch (error) {
            // Even if logout fails on server, clear local tokens
            this.clearAuthTokens();
            return { success: true };
        }
    }

    async refreshAuthToken() {
        try {
            const response = await this.makeRequest('POST', '/auth/refresh-token', {
                refreshToken: this.refreshToken
            });
            if (response.success && response.data.token) {
                this.setAuthTokens(response.data.token, response.data.refreshToken);
            }
            return response;
        } catch (error) {
            this.clearAuthTokens();
            throw this.handleError(error, 'Token refresh failed');
        }
    }

    // ============== USER MANAGEMENT METHODS ==============
    
    async getUsers(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            return await this.makeRequest('GET', `/users?${queryString}`);
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch users');
        }
    }

    async searchUsers(query, filters = {}) {
        try {
            const params = { q: query, ...filters };
            const queryString = new URLSearchParams(params).toString();
            return await this.makeRequest('GET', `/users/search?${queryString}`);
        } catch (error) {
            throw this.handleError(error, 'User search failed');
        }
    }

    async getUserProfile(userId = null) {
        try {
            const endpoint = userId ? `/users/${userId}` : '/auth/profile';
            return await this.makeRequest('GET', endpoint);
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch user profile');
        }
    }

    async updateProfile(profileData) {
        try {
            return await this.makeRequest('PUT', '/users/profile', profileData);
        } catch (error) {
            throw this.handleError(error, 'Profile update failed');
        }
    }

    async deleteAccount() {
        try {
            const response = await this.makeRequest('DELETE', '/users/profile');
            if (response.success) {
                // Clear all stored data
                this.clearAuthTokens();
                localStorage.removeItem('userData');
            }
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to delete account');
        }
    }

    // ============== EVENT MANAGEMENT METHODS ==============
    
    async getEvents(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            return await this.makeRequest('GET', `/events?${queryString}`);
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch events');
        }
    }

    async getEvent(eventId) {
        try {
            return await this.makeRequest('GET', `/events/${eventId}`);
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch event details');
        }
    }

    async createEvent(eventData) {
        try {
            return await this.makeRequest('POST', '/events', eventData);
        } catch (error) {
            throw this.handleError(error, 'Event creation failed');
        }
    }

    async registerForEvent(eventId) {
        try {
            return await this.makeRequest('POST', `/events/${eventId}/register`);
        } catch (error) {
            throw this.handleError(error, 'Event registration failed');
        }
    }

    async updateEvent(eventId, eventData) {
        try {
            return await this.makeRequest('PUT', `/events/${eventId}`, eventData);
        } catch (error) {
            throw this.handleError(error, 'Event update failed');
        }
    }

    async deleteEvent(eventId) {
        try {
            return await this.makeRequest('DELETE', `/events/${eventId}`);
        } catch (error) {
            throw this.handleError(error, 'Event deletion failed');
        }
    }

    async getMyEvents() {
        try {
            return await this.makeRequest('GET', '/events/my/events');
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch your events');
        }
    }

    async approveEvent(eventId) {
        try {
            return await this.makeRequest('PUT', `/events/${eventId}/approve`);
        } catch (error) {
            throw this.handleError(error, 'Event approval failed');
        }
    }

    async getEventAttendees(eventId) {
        try {
            return await this.makeRequest('GET', `/events/${eventId}/attendees`);
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch event attendees');
        }
    }

    async getEventAnalytics(eventId) {
        try {
            return await this.makeRequest('GET', `/events/${eventId}/analytics`);
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch event analytics');
        }
    }

    async unregisterFromEvent(eventId) {
        try {
            return await this.makeRequest('DELETE', `/events/${eventId}/register`);
        } catch (error) {
            throw this.handleError(error, 'Failed to unregister from event');
        }
    }

    // ============== JOB MANAGEMENT METHODS ==============
    
    async getJobs(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            return await this.makeRequest('GET', `/jobs?${queryString}`);
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch jobs');
        }
    }

    async searchJobs(query, filters = {}) {
        try {
            const params = { q: query, ...filters };
            const queryString = new URLSearchParams(params).toString();
            return await this.makeRequest('GET', `/jobs/search?${queryString}`);
        } catch (error) {
            throw this.handleError(error, 'Job search failed');
        }
    }

    async getJob(jobId) {
        try {
            return await this.makeRequest('GET', `/jobs/${jobId}`);
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch job details');
        }
    }

    async createJob(jobData) {
        try {
            return await this.makeRequest('POST', '/jobs', jobData);
        } catch (error) {
            throw this.handleError(error, 'Job posting failed');
        }
    }

    async applyToJob(jobId, applicationData) {
        try {
            return await this.makeRequest('POST', `/jobs/${jobId}/apply`, applicationData);
        } catch (error) {
            throw this.handleError(error, 'Job application failed');
        }
    }

    async getMyApplications() {
        try {
            return await this.makeRequest('GET', '/jobs/my/applications');
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch your applications');
        }
    }

    // ============== MESSAGING METHODS ==============
    
    async getConversations(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            return await this.makeRequest('GET', `/messages/conversations?${queryString}`);
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch conversations');
        }
    }

    async getMessages(userId, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            return await this.makeRequest('GET', `/messages/${userId}?${queryString}`);
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch messages');
        }
    }

    async sendMessage(messageData) {
        try {
            return await this.makeRequest('POST', '/messages', messageData);
        } catch (error) {
            throw this.handleError(error, 'Failed to send message');
        }
    }

    async getUnreadCount() {
        try {
            return await this.makeRequest('GET', '/messages/unread-count');
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch unread count');
        }
    }

    // ============== FUNDRAISING METHODS ==============
    
    async getCampaigns(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            return await this.makeRequest('GET', `/fundraising?${queryString}`);
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch campaigns');
        }
    }

    async getCampaign(campaignId) {
        try {
            return await this.makeRequest('GET', `/fundraising/${campaignId}`);
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch campaign details');
        }
    }

    async createCampaign(campaignData) {
        try {
            return await this.makeRequest('POST', '/fundraising', campaignData);
        } catch (error) {
            throw this.handleError(error, 'Campaign creation failed');
        }
    }

    async donateToCampaign(campaignId, donationData) {
        try {
            return await this.makeRequest('POST', `/fundraising/${campaignId}/donate`, donationData);
        } catch (error) {
            throw this.handleError(error, 'Donation failed');
        }
    }

    async getMyCampaigns() {
        try {
            return await this.makeRequest('GET', '/fundraising/my/campaigns');
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch your campaigns');
        }
    }

    // ============== ANALYTICS & ADMIN METHODS ==============
    
    async getAnalytics(type, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            return await this.makeRequest('GET', `/${type}/analytics?${queryString}`);
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch analytics');
        }
    }

    async approveContent(type, contentId) {
        try {
            return await this.makeRequest('PUT', `/${type}/${contentId}/approve`);
        } catch (error) {
            throw this.handleError(error, 'Approval failed');
        }
    }

    // ============== UTILITY METHODS ==============
    
    async makeRequest(method, endpoint, data = null) {
        // Check offline status for non-GET requests
        if (!this.isOnline && method !== 'GET') {
            return this.handleOfflineRequest(method, endpoint, data);
        }

        const url = `${this.baseURL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Add authentication header if token exists
        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }

        // Add data for POST/PUT requests
        if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            // Handle token expiration
            if (response.status === 401 && this.refreshToken) {
                await this.refreshAuthToken();
                // Retry the original request with new token
                options.headers['Authorization'] = `Bearer ${this.token}`;
                return await fetch(url, options).then(res => res.json());
            }

            const result = await response.json();
            
            if (!response.ok) {
                console.error('API Error Response:', result);
                if (result.errors && Array.isArray(result.errors)) {
                    console.error('Validation Errors:', result.errors);
                    throw new Error(result.errors.join(', ') || result.message);
                }
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            return result;
        } catch (error) {
            if (!this.isOnline) {
                return this.handleOfflineRequest(method, endpoint, data);
            }
            throw error;
        }
    }

    handleOfflineRequest(method, endpoint, data) {
        // Store offline requests for later sync
        const offlineRequest = {
            method,
            endpoint,
            data,
            timestamp: new Date().toISOString()
        };
        
        const offlineRequests = JSON.parse(localStorage.getItem('offlineRequests') || '[]');
        offlineRequests.push(offlineRequest);
        localStorage.setItem('offlineRequests', JSON.stringify(offlineRequests));
        
        return {
            success: false,
            offline: true,
            message: 'Request saved for when connection is restored'
        };
    }

    async syncOfflineData() {
        const offlineRequests = JSON.parse(localStorage.getItem('offlineRequests') || '[]');
        
        for (const request of offlineRequests) {
            try {
                await this.makeRequest(request.method, request.endpoint, request.data);
            } catch (error) {
                console.error('Failed to sync offline request:', error);
            }
        }
        
        // Clear synced requests
        localStorage.removeItem('offlineRequests');
    }

    setAuthTokens(token, refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
        localStorage.setItem('authToken', token);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
    }

    clearAuthTokens() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
    }

    handleError(error, defaultMessage) {
        console.error('API Error:', error);
        
        // Return user-friendly error messages
        if (error.message) {
            return new Error(error.message);
        }
        
        return new Error(defaultMessage);
    }

    // Database connection status check
    async checkDatabaseConnection() {
        try {
            // Direct fetch to health endpoint (not using makeRequest to avoid /api prefix)
            const response = await fetch('http://localhost:5000/health');
            const data = await response.json();
            return {
                connected: data.status === 'OK',
                database: 'MongoDB',
                message: `Server ${data.status} - ${data.environment}`,
                timestamp: data.timestamp
            };
        } catch (error) {
            return {
                connected: false,
                database: 'MongoDB',
                message: 'Connection failed'
            };
        }
    }

    // Get current user data
    getCurrentUser() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    // Get user profile from server
    async getProfile() {
        try {
            return await this.getUserProfile();
        } catch (error) {
            // If API fails, return cached user data
            const user = this.getCurrentUser();
            if (user) {
                return { success: true, data: user };
            }
            throw this.handleError(error, 'Failed to get profile');
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token && !!this.getCurrentUser();
    }

    // Get user role for authorization
    getUserRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    }
}

// Create global API instance only if it doesn't exist
if (!window.AlumNeticsAPI) {
    window.AlumNeticsAPI = new AlumNeticsAPI();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlumNeticsAPI;
}