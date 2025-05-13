// Import the `useStore` hook from the Zustand store located in the alertStore module.
// Zustand is a small, fast state-management library. This store is assumed to manage alert state.
import { useStore } from '@zustand/alert/alertStore';

/**
 * Custom React hook to simplify the usage of the global alert system.
 *
 * This hook wraps Zustand's `useStore` and provides a convenient `displayAlert` function
 * that can be used in any component to trigger alerts with a specific type and message.
 *
 * @returns {Object} An object containing `displayAlert`, a function to trigger alerts.
 */
const useAlert = () => {
  // Extract the `showAlert` function from the Zustand alert store.
  // `showAlert` is assumed to be a method that updates the alert state to show a new alert.
  const { showAlert } = useStore();

  /**
   * A wrapper function around the `showAlert` method.
   * It formats the alert payload and ensures the alert is set to open.
   *
   * @param {string} type - The type of alert (e.g., 'success', 'error', 'info', 'warning').
   * @param {string} message - The message text to be displayed in the alert.
   */
  const displayAlert = (type, message) => {
    showAlert({
      type, // Alert type (controls style or severity)
      message, // Alert content (what the user sees)
      open: true, // Ensures the alert is visible
    });
  };

  // Return the `displayAlert` function so that components can use it to trigger alerts.
  return { displayAlert };
};

// Export the `useAlert` hook as the default export of this module.
// This allows other components to import and use it like: `const { displayAlert } = useAlert();`
export default useAlert;
