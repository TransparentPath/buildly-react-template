// Import the `useCartStore` hook from the Zustand store located in the cartStore module.
// Zustand is a lightweight state management library. This particular store manages cart state.
import { useCartStore } from '@zustand/cart/cartStore';

/**
 * Custom React hook to interact with the global cart state.
 *
 * This hook provides a simple interface to update the cart using the Zustand store.
 *
 * @returns {Object} An object containing the `cart` function for updating the cart data.
 */
const useCart = () => {
  // Destructure `setCart` from the Zustand cart store.
  // `setCart` is a function defined in the Zustand store to update the cart state.
  const { setCart } = useCartStore();

  /**
   * A wrapper function to update the cart state.
   *
   * This function can be used in components to update the cart with new data.
   * It delegates the state update to Zustand's `setCart` method.
   *
   * @param {any} data - The new cart data to be saved in the store.
   */
  const cart = (data) => {
    setCart(data); // Update the cart state in the store
  };

  // Return the `cart` function so that components can use it to modify the cart state.
  return { cart };
};

// Export the `useCart` hook as the default export from this module.
// Usage example in a component: `const { cart } = useCart();`
export default useCart;
