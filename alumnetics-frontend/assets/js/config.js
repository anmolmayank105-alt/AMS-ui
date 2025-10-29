// API Configuration
// Since frontend and backend are on the same domain, use relative paths

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Local development - backend runs on separate port
    window.API_BASE_URL = 'http://localhost:5000/api';
} else {
    // Production - both on same domain, use relative path
    window.API_BASE_URL = '/api';
}

console.log('API_BASE_URL configured:', window.API_BASE_URL);
