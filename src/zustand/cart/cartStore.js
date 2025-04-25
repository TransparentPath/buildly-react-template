// Import the `create` function from Zustand for creating a global state store
import { create } from 'zustand';

/**
 * Zustand store for managing cart state across the application.
 *
 * This store:
 * - Initializes the cart data from `localStorage` if available.
 * - Provides a method to update the cart both in state and in `localStorage`.
 */
const useCartStore = create((set) => ({
  /**
   * `data` holds the current state of the cart.
   * It is initialized from localStorage under the key 'cart', or defaults to an empty array.
   * This allows the cart to persist between page reloads.
   */
  data: JSON.parse(localStorage.getItem('cart')) || [],

  /**
   * `setCart` updates the cart:
   * - Saves the new cart data to localStorage
   * - Updates the in-memory state so components react to the change
   *
   * @param {Array} data - The new array of cart items to be saved and set
   */
  setCart: (data) => {
    // Persist the cart data to localStorage
    localStorage.setItem('cart', JSON.stringify(data));

    // Update Zustand's in-memory store with the new cart data
    set({ data });
  },
}));

// Export the custom hook to be used in React components
export { useCartStore };
