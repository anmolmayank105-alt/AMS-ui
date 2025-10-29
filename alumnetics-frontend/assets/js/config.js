// API Configuration
// For local development, use localhost
// For production, set this to your Vercel backend URL

// You can set this before loading api-service.js or let it auto-detect
window.API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://ams-ui-gamma.vercel.app/api';

// Or use environment-specific config
if (window.location.hostname.includes('vercel.app')) {
    // Production Vercel deployment
    window.API_BASE_URL = 'https://ams-ui-gamma.vercel.app/api';
} else {
    // Local development
    window.API_BASE_URL = 'http://localhost:5000/api';
}
