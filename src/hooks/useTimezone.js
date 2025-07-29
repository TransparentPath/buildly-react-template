// Import the `useStore` hook from the Zustand timezone store.
// Zustand is a minimal, scalable state-management library for React.
// This store is assumed to manage timezone-related state.
import { useStore } from '@zustand/timezone/timezoneStore';

/**
 * Custom React hook to interact with the global timezone state.
 *
 * This hook provides a simple interface to update the user's timezone in the global store.
 *
 * @returns {Object} An object containing the `timezone` function to update the timezone state.
 */
const useTimezone = () => {
  // Destructure `setTimezone` from the Zustand timezone store.
  // `setTimezone` is a function that updates the current timezone state in the store.
  const { setTimezone } = useStore();

  /**
   * A wrapper function to update the timezone value in the Zustand store.
   *
   * This function can be used in any component to set the user's current timezone.
   *
   * @param {any} data - The new timezone data to store (e.g., 'America/New_York').
   */
  const timezone = (data) => {
    setTimezone(data); // Update the timezone in the Zustand store
  };

  // Return the `timezone` function so components can use it to change the timezone.
  return { timezone };
};

// Export the `useTimezone` hook as the default export of the module.
// Usage in a component: `const { timezone } = useTimezone();`
export default useTimezone;
