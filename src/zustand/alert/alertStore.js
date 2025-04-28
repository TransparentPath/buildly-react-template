// Import the `create` function from Zustand, a small state-management library
import { create } from 'zustand';

/**
 * Zustand store to manage alert data state
 *
 * This store provides a simple mechanism to show or hide alert data
 * (typically used in notifications, pop-ups, banners, etc.).
 */
const useStore = create((set) => ({
  // `data` holds the current alert data.
  // It can be any object representing alert content or null when hidden.
  data: null,

  /**
   * Show alert with provided `data`
   * @param {*} data - The alert content to show (e.g. { message: "Error!", type: "error" })
   */
  showAlert: (data) => {
    set({ data }); // Update the `data` field in state
  },

  /**
   * Hide the alert by resetting `data` to null
   */
  hideAlert: () => {
    set({ data: null }); // Clear the alert data
  },
}));

// Export the store hook so components can use it
export { useStore };
