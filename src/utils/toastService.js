/**
 * Toast Service - Allows showing toasts from anywhere in the app (including non-React code)
 * Uses a simple event-based approach that ToastContext listens to
 */

// Store callbacks registered by ToastProvider
let toastCallback = null;

/**
 * Register the toast callback from ToastProvider
 */
export function registerToastCallback(callback) {
    toastCallback = callback;
}

/**
 * Unregister the toast callback
 */
export function unregisterToastCallback() {
    toastCallback = null;
}

/**
 * Show a toast message
 * @param {string} message - The message to display
 * @param {'success' | 'error' | 'warning' | 'info'} type - Toast type
 * @param {number} duration - Duration in ms (default 5000)
 */
export function showToast(message, type = 'info', duration = 5000) {
    if (toastCallback) {
        toastCallback(message, type, duration);
    } else {
        // Fallback to console if ToastProvider not mounted yet
        console.log(`[Toast ${type}]: ${message}`);
    }
}

/**
 * Convenience methods
 */
export const toast = {
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    warning: (message, duration) => showToast(message, 'warning', duration),
    info: (message, duration) => showToast(message, 'info', duration),
};

export default toast;
