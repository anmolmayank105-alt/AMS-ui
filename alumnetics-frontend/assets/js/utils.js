/**
 * AlumNetics Utility Functions
 * Common utilities for frontend functionality and MongoDB integration
 */

class AlumNeticsUtils {
    constructor() {
        // Use getter to ensure API is available when called
        Object.defineProperty(this, 'api', {
            get: function() {
                return window.AlumNeticsAPI;
            }
        });
    }

    // ============== AUTHENTICATION UTILITIES ==============
    
    redirectIfNotAuthenticated() {
        if (!this.api.isAuthenticated()) {
            window.location.href = '../auth/login.html';
            return false;
        }
        return true;
    }

    redirectBasedOnRole() {
        const user = this.api.getCurrentUser();
        if (!user) {
            // Determine correct path based on current location
            const path = window.location.pathname;
            const isInRoot = path === '/' || path.endsWith('/index.html') || path.endsWith('demo/') || !path.includes('/pages/');
            window.location.href = isInRoot ? 'pages/auth/login.html' : '../auth/login.html';
            return;
        }

        const role = user.role;
        // Determine correct path based on current location
        const path = window.location.pathname;
        const isInRoot = path === '/' || path.endsWith('/index.html') || path.endsWith('demo/') || !path.includes('/pages/');
        const dashboardPrefix = isInRoot ? 'pages/dashboard/' : '../dashboard/';
        
        console.log('Redirect check - Path:', path, 'IsRoot:', isInRoot, 'Prefix:', dashboardPrefix, 'Role:', role);
        
        // Normalize role to lowercase for consistency
        const normalizedRole = role ? role.toLowerCase().trim() : '';
        
        switch (normalizedRole) {
            case 'admin':
                window.location.href = dashboardPrefix + 'admin-dashboard-fixed.html';
                break;
            case 'alumni':
                window.location.href = dashboardPrefix + 'alumni-dashboard.html';
                break;
            case 'student':
                window.location.href = dashboardPrefix + 'student-dashboard.html';
                break;
            case 'faculty':
                // Faculty can use alumni dashboard for now
                window.location.href = dashboardPrefix + 'alumni-dashboard.html';
                break;
            case 'employer':
                // Employer gets alumni dashboard for now
                window.location.href = dashboardPrefix + 'alumni-dashboard.html';
                break;
            case 'institute':
                // Institute admin gets admin dashboard
                window.location.href = dashboardPrefix + 'admin-dashboard-fixed.html';
                break;
            default:
                console.error('Invalid or missing role:', role);
                alert(`Invalid role specified: ${role}. Please contact support.`);
                window.location.href = isInRoot ? 'pages/auth/login.html' : '../auth/login.html';
        }
    }

    // ============== UI UTILITIES ==============
    
    showLoading(elementId = 'loading') {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
        }
        
        // Create loading overlay if it doesn't exist
        if (!document.getElementById('loadingOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            overlay.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span class="text-gray-700">Loading...</span>
                </div>
            `;
            document.body.appendChild(overlay);
        }
    }

    hideLoading(elementId = 'loading') {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
        
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = this.getToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `transform transition-all duration-300 ease-in-out ${this.getToastClasses(type)}`;
        toast.innerHTML = `
            <div class="flex items-center p-4 rounded-lg shadow-lg">
                <div class="flex-shrink-0">
                    ${this.getToastIcon(type)}
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-white">${message}</p>
                </div>
                <div class="ml-auto pl-3">
                    <button class="inline-flex text-white hover:text-gray-200 focus:outline-none" onclick="this.parentElement.parentElement.remove()">
                        <span class="sr-only">Close</span>
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }

    getToastContainer() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'fixed top-4 right-4 space-y-2 z-50';
            document.body.appendChild(container);
        }
        return container;
    }

    getToastClasses(type) {
        const classes = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        return classes[type] || classes.info;
    }

    getToastIcon(type) {
        const icons = {
            success: '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
            error: '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>',
            warning: '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
            info: '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
        };
        return icons[type] || icons.info;
    }

    // ============== DATA FORMATTING UTILITIES ==============
    
    formatDate(dateString, format = 'short') {
        const date = new Date(dateString);
        const options = {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
            time: { hour: '2-digit', minute: '2-digit' }
        };
        return date.toLocaleDateString('en-US', options[format] || options.short);
    }

    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(number);
    }

    truncateText(text, length = 100) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    // ============== FORM UTILITIES ==============
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^\+?[\d\s\-\(\)]+$/;
        return re.test(phone);
    }

    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    serializeForm(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }

    // ============== DATABASE CONNECTION UTILITIES ==============
    
    async checkDatabaseStatus() {
        try {
            const status = await this.api.checkDatabaseConnection();
            this.updateDatabaseStatusUI(status);
            return status;
        } catch (error) {
            console.error('Database status check failed:', error);
            this.updateDatabaseStatusUI({ connected: false, message: 'Connection check failed' });
            return { connected: false };
        }
    }

    updateDatabaseStatusUI(status) {
        const statusElement = document.getElementById('dbStatus');
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}"></div>
                    <span class="text-sm text-gray-600">
                        Database: ${status.connected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            `;
        }
    }

    // ============== LOCAL STORAGE UTILITIES ==============
    
    setLocalData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to store data:', error);
            return false;
        }
    }

    getLocalData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Failed to retrieve data:', error);
            return defaultValue;
        }
    }

    removeLocalData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove data:', error);
            return false;
        }
    }

    // ============== SEARCH UTILITIES ==============
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async performSearch(query, type, filters = {}) {
        if (query.length < 2) return { results: [], total: 0 };
        
        try {
            let response;
            switch (type) {
                case 'users':
                    response = await this.api.searchUsers(query, filters);
                    break;
                case 'jobs':
                    response = await this.api.searchJobs(query, filters);
                    break;
                case 'events':
                    response = await this.api.getEvents({ ...filters, search: query });
                    break;
                case 'campaigns':
                    response = await this.api.getCampaigns({ ...filters, search: query });
                    break;
                default:
                    throw new Error('Invalid search type');
            }
            
            return {
                results: response.data || [],
                total: response.pagination?.totalResults || 0
            };
        } catch (error) {
            console.error('Search failed:', error);
            this.showToast('Search failed. Please try again.', 'error');
            return { results: [], total: 0 };
        }
    }

    // ============== PAGINATION UTILITIES ==============
    
    createPagination(container, currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const maxVisiblePages = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        let paginationHTML = `
            <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div class="flex flex-1 justify-between sm:hidden">
                    <button ${currentPage === 1 ? 'disabled' : ''} 
                            onclick="changePage(${currentPage - 1})"
                            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                        Previous
                    </button>
                    <button ${currentPage === totalPages ? 'disabled' : ''} 
                            onclick="changePage(${currentPage + 1})"
                            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}">
                        Next
                    </button>
                </div>
                <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Showing page <span class="font-medium">${currentPage}</span> of <span class="font-medium">${totalPages}</span>
                        </p>
                    </div>
                    <div>
                        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
        `;

        // Previous button
        paginationHTML += `
            <button ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="changePage(${currentPage - 1})"
                    class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                <span class="sr-only">Previous</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
            </button>
        `;

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="changePage(${i})"
                        class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            i === currentPage 
                                ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="changePage(${currentPage + 1})"
                    class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}">
                <span class="sr-only">Next</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
            </button>
                        </nav>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = paginationHTML;

        // Add page change handler to window
        window.changePage = onPageChange;
    }

    // ============== FILE UPLOAD UTILITIES ==============
    
    async uploadFile(file, endpoint) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${this.api.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.api.token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            return await response.json();
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Create global utils instance only if it doesn't exist
if (!window.AlumNeticsUtils) {
    window.AlumNeticsUtils = new AlumNeticsUtils();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlumNeticsUtils;
}