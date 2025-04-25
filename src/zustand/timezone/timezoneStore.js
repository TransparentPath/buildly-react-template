// Import the `create` function from Zustand to create a state store
import { create } from 'zustand';

// Import a function that retrieves the current user from context
import { getUser } from '@context/User.context';

/**
 * Zustand store for managing and updating the user's timezone.
 *
 * This store:
 * - Initializes the timezone from the user context (if available).
 * - Provides a method to update the timezone in the in-memory state.
 */
const useStore = create((set) => ({
  /**
   * `data` holds the current user's timezone.
   * It is initialized by calling `getUser()` and accessing the `user_timezone` field.
   * If no user is available, it defaults to an empty string.
   */
  data: getUser() ? getUser().user_timezone : '',

  /**
   * `setTimezone` updates the user's timezone in the in-memory state.
   *
   * @param {string} data - The new timezone to be stored (e.g., 'America/New_York')
   */
  setTimezone: (data) => {
    // Update Zustand store with the new timezone
    set({ data });
  },
}));

// Export the store hook so it can be used in React components
export { useStore };
