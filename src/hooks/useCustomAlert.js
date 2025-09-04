// Import the `useCustomAlertStore` hook from the Zustand store
import { useCustomAlertStore } from '@zustand/customAlert/customAlertStore';

/**
 * Custom React hook to simplify the usage of the custom alert system.
 *
 * This hook provides convenient functions that mimic the behavior of native
 * window.alert() and window.confirm() but with enhanced customization options.
 *
 * @returns {Object} An object containing alert functions
 */
const useCustomAlert = () => {
  // Extract functions from the Zustand custom alert store
  const {
    showCustomAlert, hideCustomAlert, alert, confirm,
  } = useCustomAlertStore();

  /**
   * Display a simple alert with customizable title and button text
   * @param {string} message - The message to display
   * @param {string} [title] - The title of the alert dialog (default: 'Alert')
   * @param {string} [buttonText] - Text for the button (default: 'OK')
   * @returns {Promise<boolean>} Promise that resolves when the alert is dismissed
   */
  const showAlert = (message, title = 'Alert', buttonText = 'OK') => alert(message, title, buttonText);

  /**
   * Display a confirmation dialog with OK/Cancel buttons
   * @param {string} message - The message to display
   * @param {string} [title] - The title of the confirm dialog (default: 'Confirm')
   * @param {string} [confirmText] - Text for the confirm button (default: 'OK')
   * @param {string} [cancelText] - Text for the cancel button (default: 'Cancel')
   * @returns {Promise<boolean>} Promise that resolves to true if confirmed, false if cancelled
   */
  const showConfirm = (message, title = 'Confirm', confirmText = 'OK', cancelText = 'Cancel') => confirm(message, title, confirmText, cancelText);

  /**
   * Display an alert with full configuration options
   * @param {Object} config - Full configuration object
   * @param {string} config.message - The message to display (required)
   * @param {string} [config.title] - The title of the alert dialog
   * @param {string} [config.buttonText] - Text for the main button
   * @param {string} [config.cancelButtonText] - Text for cancel button
   * @param {boolean} [config.showCancelButton] - Whether to show cancel button
   * @param {boolean} [config.showCloseButton] - Whether to show close button in header
   * @param {boolean} [config.allowBackdropClose] - Whether clicking backdrop closes dialog
   * @param {boolean} [config.allowEscapeClose] - Whether escape key closes dialog
   * @param {string} [config.type] - Alert type for styling ('info', 'success', 'warning', 'error')
   * @param {Function} [config.onConfirm] - Callback when confirm button is clicked
   * @param {Function} [config.onClose] - Callback when dialog is closed/cancelled
   * @returns {Promise<boolean>} Promise that resolves based on user action
   */
  const showCustomAlertDialog = (config) => alert(config);

  /**
   * Display different types of alerts with predefined styling
   */
  const showSuccess = (message, title = 'Success', buttonText = 'OK') => alert({
    message,
    title,
    buttonText,
    type: 'success',
  });

  const showError = (message, title = 'Error', buttonText = 'OK') => alert({
    message,
    title,
    buttonText,
    type: 'error',
  });

  const showWarning = (message, title = 'Warning', buttonText = 'OK') => alert({
    message,
    title,
    buttonText,
    type: 'warning',
  });

  const showInfo = (message, title = 'Information', buttonText = 'OK') => alert({
    message,
    title,
    buttonText,
    type: 'info',
  });

  /**
   * Manually hide the current alert
   */
  const hideAlert = () => hideCustomAlert();

  // Return all the alert functions
  return {
    showAlert,
    showConfirm,
    showCustomAlertDialog,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert,
    // Direct access to store functions for advanced usage
    showCustomAlert,
    alert,
    confirm,
  };
};

// Export the `useCustomAlert` hook as the default export
export default useCustomAlert;
