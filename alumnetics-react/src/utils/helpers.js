// Utility functions for the application

/**
 * Generate initials from a name
 * @param {string} name - Full name
 * @param {string} fallback - Fallback initials if name is empty
 * @returns {string} Two uppercase letters
 */
export const getInitials = (name, fallback = 'U') => {
  if (!name) return fallback;
  const nameParts = name.trim().split(' ');
  return nameParts.length > 1 
    ? nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

/**
 * Format a date string to local date
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Format a date string to local time
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time
 */
export const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString();
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  return !!(token && userData);
};

/**
 * Get current user data from localStorage
 * @returns {object|null} User data or null
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Logout user by clearing localStorage
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};
