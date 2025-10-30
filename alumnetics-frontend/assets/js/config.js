// API Configuration
// Points to backend deployment

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Local development - backend runs on separate port
    window.API_BASE_URL = 'http://localhost:5000/api';
} else {
    // Production - use Render backend
    window.API_BASE_URL = 'https://ams-ui-mw1o.onrender.com/api';
}

console.log('API_BASE_URL configured:', window.API_BASE_URL);
