// API Configuration
// Points to separate backend deployment

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Local development - backend runs on separate port
    window.API_BASE_URL = 'http://localhost:5000/api';
} else {
    // Production - use deployed backend
    window.API_BASE_URL = 'https://alumnetics-backend.vercel.app/api';
}

console.log('API_BASE_URL configured:', window.API_BASE_URL);
