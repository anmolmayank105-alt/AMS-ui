// API Configuration
// Automatically detects environment and sets the correct backend URL

if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('localhost') === false) {
    // Production Vercel deployment
    window.API_BASE_URL = 'https://ams-ui-gamma.vercel.app/api';
} else {
    // Local development
    window.API_BASE_URL = 'http://localhost:5000/api';
}

console.log('API_BASE_URL configured:', window.API_BASE_URL);
