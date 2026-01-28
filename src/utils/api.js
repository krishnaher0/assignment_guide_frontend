import axios from 'axios';
import { toast } from './toastService';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Required for CSRF cookies
});

// CSRF Token Management
let csrfToken = null;

/**
 * Fetches a fresh CSRF token from the server
 */
const fetchCsrfToken = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/csrf-token`,
            { withCredentials: true }
        );
        csrfToken = response.data.csrfToken;
        return csrfToken;
    } catch (error) {
        console.error('[CSRF] Failed to fetch token:', error);
        return null;
    }
};

// Fetch CSRF token on initial load
fetchCsrfToken();

// Add a request interceptor to attach tokens
api.interceptors.request.use(
    async (config) => {
        // Attach JWT token
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }

        // Attach CSRF token for state-changing requests
        const statefulMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        if (statefulMethods.includes(config.method.toUpperCase())) {
            // If we don't have a token, fetch one
            if (!csrfToken) {
                await fetchCsrfToken();
            }

            if (csrfToken) {
                config.headers['X-CSRF-Token'] = csrfToken;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle auth errors and show toast notifications
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message || 'An error occurred';
        const errorCode = error.response?.data?.code;

        // Handle CSRF token errors (403 with CSRF_INVALID code)
        if (status === 403 && errorCode === 'CSRF_INVALID') {
            console.warn('[CSRF] Invalid token, fetching new token and retrying...');

            // Fetch a new CSRF token
            await fetchCsrfToken();

            // Retry the original request with the new token
            if (csrfToken) {
                error.config.headers['X-CSRF-Token'] = csrfToken;
                return api.request(error.config);
            }

            toast.error('Security token expired. Please try again.');
            return Promise.reject(error);
        }

        // Handle unauthorized (401) - token expired or invalid
        if (status === 401) {
            // Clear all auth data
            // Clear all auth data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('admin_token');

            // Redirect to login if not already on auth pages
            // But DON'T redirect if this is an explicit 401 from the login page itself (like "Verify email")
            // We check this by seeing if the request URL was /auth/login
            const isLoginRequest = error.config.url.includes('/auth/login');

            if (!isLoginRequest) {
                toast.error('Session expired. Please log in again.');
            }

            if (!isLoginRequest && !window.location.pathname.startsWith('/auth') &&
                window.location.pathname !== '/admin') {
                window.location.href = '/auth/login';
            } else if (isLoginRequest) {
                // If it's a login failure, just let the error propagate so the UI can show the message
                // Don't clear storage or toast "Session expired"
                localStorage.removeItem('user'); // Ensure clean state but don't redirect
                toast.error(message);
                return Promise.reject(error);
            }
        }
        // Handle forbidden (403) - role mismatch or insufficient permissions
        else if (status === 403) {
            toast.error('Access denied. You do not have permission for this action.');

            const user = JSON.parse(localStorage.getItem('user'));

            // If we get a 403, redirect user to their appropriate dashboard
            if (user?.role) {
                let redirectPath = '/auth/login';
                switch (user.role) {
                    case 'admin':
                        redirectPath = '/admin/dashboard';
                        break;
                    case 'developer':
                        redirectPath = '/developer';
                        break;
                    case 'client':
                        redirectPath = '/dashboard/client';
                        break;
                }

                // Only redirect if not already on the correct path
                if (!window.location.pathname.startsWith(redirectPath.split('/').slice(0, 2).join('/'))) {
                    window.location.href = redirectPath;
                }
            }
        }
        // Handle not found (404)
        else if (status === 404) {
            toast.error(message || 'Resource not found');
        }
        // Handle validation errors (400)
        else if (status === 400) {
            toast.error(message || 'Invalid request');
        }
        // Handle server errors (500)
        else if (status >= 500) {
            toast.error('Server error. Please try again later.');
        }
        // Handle network errors
        else if (!error.response) {
            toast.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
    }
);

export default api;
