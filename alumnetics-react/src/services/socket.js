import { io } from 'socket.io-client';

/**
 * Socket Service - Adaptive real-time messaging
 * 
 * - Local: Uses Socket.io WebSocket (real-time)
 * - Vercel: Falls back to HTTP polling (near real-time)
 * - Always works, gracefully handles both environments
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.useWebSocket = false;
    this.pollingInterval = null;
    this.lastMessageTime = Date.now();
    this.listeners = new Map();
  }

  /**
   * Initialize socket connection
   * @param {string} token - JWT authentication token
   */
  async connect(token) {
    if (!token) {
      console.warn('⚠️ No token provided for socket connection');
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const baseUrl = apiUrl.replace('/api', '');

    try {
      // Try WebSocket connection first (works in local development)
      this.socket = io(baseUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 5000
      });

      // Wait for connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 5000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.useWebSocket = true;
          console.log('✅ Socket.io connected (WebSocket mode)');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      // Setup Socket.io event listeners
      this.setupSocketListeners();

    } catch (error) {
      // Fallback to HTTP polling (Vercel-friendly)
      console.log('⚠️ WebSocket unavailable, using HTTP polling mode');
      console.log('   This is normal for Vercel deployments');
      
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      
      this.useWebSocket = false;
      this.isConnected = true; // Polling is active
      this.startPolling(token, apiUrl);
    }
  }

  /**
   * Setup Socket.io event listeners
   */
  setupSocketListeners() {
    if (!this.socket) return;

    // New message received
    this.socket.on('newMessage', (data) => {
      this.emit('newMessage', data);
    });

    // Message marked as read
    this.socket.on('messageRead', (data) => {
      this.emit('messageRead', data);
    });

    // Message sent confirmation
    this.socket.on('messageSent', (data) => {
      this.emit('messageSent', data);
    });

    // User online status
    this.socket.on('userOnline', (data) => {
      this.emit('userOnline', data);
    });

    // User offline status
    this.socket.on('userOffline', (data) => {
      this.emit('userOffline', data);
    });

    // Typing indicator
    this.socket.on('userTyping', (data) => {
      this.emit('userTyping', data);
    });

    // Disconnection
    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('❌ Socket.io disconnected:', reason);
      
      // Try to reconnect if not intentional
      if (reason !== 'io client disconnect') {
        console.log('🔄 Attempting to reconnect...');
      }
    });

    // Reconnection
    this.socket.on('reconnect', (attemptNumber) => {
      this.isConnected = true;
      console.log('✅ Socket.io reconnected after', attemptNumber, 'attempts');
    });
  }

  /**
   * HTTP polling fallback for Vercel deployments
   * @param {string} token - JWT token
   * @param {string} apiUrl - API base URL
   */
  startPolling(token, apiUrl) {
    // Poll every 3 seconds for new messages
    this.pollingInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `${apiUrl}/messages/poll?since=${this.lastMessageTime}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            console.warn('⚠️ Authentication expired, stopping polling');
            this.disconnect();
            return;
          }
          return;
        }

        const result = await response.json();

        if (result.success && result.data?.messages?.length > 0) {
          result.data.messages.forEach(msg => {
            this.emit('newMessage', { message: msg });
            this.lastMessageTime = Math.max(
              this.lastMessageTime,
              new Date(msg.createdAt).getTime()
            );
          });
        }

      } catch (error) {
        // Silently handle polling errors (network issues, etc.)
        if (error.message !== 'Failed to fetch') {
          console.error('Polling error:', error);
        }
      }
    }, 3000); // Poll every 3 seconds
  }

  /**
   * Send a message (always uses REST API for reliability)
   * @param {string} recipientId - Recipient user ID
   * @param {string} content - Message content
   * @returns {Promise} API response
   */
  async sendMessage(recipientId, content) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId, content })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to send message');
      }

      return result;

    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.isConnected = false;
    this.useWebSocket = false;
    this.listeners.clear();
    
    console.log('🔌 Socket service disconnected');
  }

  /**
   * Get connection status
   * @returns {Object} Connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      mode: this.useWebSocket ? 'WebSocket' : 'HTTP Polling'
    };
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isSocketConnected() {
    return this.isConnected;
  }
}

// Export singleton instance
export default new SocketService();
