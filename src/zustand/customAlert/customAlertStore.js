// Import the `create` function from Zustand, a small state-management library
import { create } from 'zustand';

/**
 * Zustand store to manage custom alert dialog state
 *
 * This store provides functionality to show modal alerts similar to window.alert()
 * but with enhanced customization options for title, message, and button text.
 */
const useCustomAlertStore = create((set, get) => ({
  // `alertData` holds the current alert configuration
  // It can be null when no alert is shown, or an object with alert options
  alertData: null,

  /**
   * Show custom alert with provided configuration
   * @param {Object} config - Alert configuration object
   * @param {string} config.message - The message to display (required)
   * @param {string} [config.title] - The title of the alert dialog (default: 'Alert')
   * @param {string} [config.buttonText] - Text for the main button (default: 'OK')
   * @param {string} [config.cancelButtonText] - Text for cancel button (default: 'Cancel')
   * @param {boolean} [config.showCancelButton] - Whether to show cancel button (default: false)
   * @param {boolean} [config.showCloseButton] - Whether to show close button in header (default: true)
   * @param {boolean} [config.allowBackdropClose] - Whether clicking backdrop closes dialog (default: true)
   * @param {boolean} [config.allowEscapeClose] - Whether escape key closes dialog (default: true)
   * @param {string} [config.type] - Alert type for styling ('info', 'success', 'warning', 'error')
   * @param {Function} [config.onConfirm] - Callback when confirm button is clicked
   * @param {Function} [config.onClose] - Callback when dialog is closed/cancelled
   * @param {Function} [config.resolve] - Promise resolve function (for internal use)
   */
  showCustomAlert: (config) => {
    set({ alertData: config });
  },

  /**
   * Hide the custom alert by clearing alertData
   */
  hideCustomAlert: () => {
    set({ alertData: null });
  },

  /**
   * Promise-based alert function that mimics window.alert() behavior
   * @param {string|Object} messageOrConfig - Message string or full configuration object
   * @param {string} [title] - Title for the alert (when first param is string)
   * @param {string} [buttonText] - Button text (when first param is string)
   * @returns {Promise<boolean>} Promise that resolves to true when confirmed, false when cancelled
   */
  alert: (messageOrConfig, title, buttonText) => new Promise((resolve) => {
    let config;

    // Handle both string message and object config
    if (typeof messageOrConfig === 'string') {
      config = {
        message: messageOrConfig,
        title,
        buttonText,
      };
    } else {
      config = messageOrConfig;
    }

    // Add the resolve function to the config
    config.resolve = resolve;

    set({ alertData: config });
  }),

  /**
   * Promise-based confirm function that shows an alert with OK/Cancel buttons
   * @param {string|Object} messageOrConfig - Message string or full configuration object
   * @param {string} [title] - Title for the confirm dialog (when first param is string)
   * @param {string} [confirmText] - Confirm button text (when first param is string)
   * @param {string} [cancelText] - Cancel button text (when first param is string)
   * @returns {Promise<boolean>} Promise that resolves to true when confirmed, false when cancelled
   */
  confirm: (messageOrConfig, title, confirmText, cancelText) => new Promise((resolve) => {
    let config;

    // Handle both string message and object config
    if (typeof messageOrConfig === 'string') {
      config = {
        message: messageOrConfig,
        title: title || 'Confirm',
        buttonText: confirmText || 'OK',
        cancelButtonText: cancelText || 'Cancel',
        showCancelButton: true,
      };
    } else {
      config = {
        ...messageOrConfig,
        showCancelButton: true,
      };
    }

    // Add the resolve function to the config
    config.resolve = resolve;

    set({ alertData: config });
  }),
}));

// Export the store hook so components can use it
export { useCustomAlertStore };
