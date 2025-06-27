// Import necessary hooks and utilities
import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Custom hook to handle the creation of a new product via API.
 *
 * This hook uses `react-query`'s `useMutation` to:
 * - Send a POST request to create a new product.
 * - Invalidate the 'products' query cache to reflect the new data.
 * - Display a success message to the user.
 * - Optionally redirect the user to another page after success.
 * - Display a friendly error message on failure.
 *
 * @param {string} organization - The organization identifier used to scope query keys.
 * @param {object} history - React Router history object for navigation.
 * @param {string} redirectTo - The route to redirect to after successful creation.
 * @param {function} displayAlert - Callback to display success/error messages to the user.
 *
 * @returns {object} mutation - A mutation object from `react-query` with properties like `mutate`, `isLoading`, etc.
 */
export const useAddProductMutation = (organization, history, redirectTo, displayAlert, section) => {
  // Initialize the query client to interact with the cache
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function that sends product data to the backend to create a new product.
     *
     * @param {object} productData - The payload containing product details.
     * @returns {Promise<any>} - Response data from the API.
     */
    async (productData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}shipment/product/`, // API endpoint for creating a product
        productData, // Payload
      );
      return response.data;
    },
    {
      /**
       * Called when the mutation is successful.
       * - Invalidates the 'products' cache for the given organization to fetch updated data.
       * - Displays a success message.
       * - Redirects to a new route if applicable.
       */
      onSuccess: async () => {
        // Refresh product list cache
        await queryClient.invalidateQueries({
          queryKey: ['products', organization],
        });
        // Show a success alert to the user
        displayAlert('success', 'Successfully added product');
        // Redirect if routing info is provided
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      /**
       * Called when the mutation fails.
       * - Uses a utility function to extract and display a user-friendly error message.
       *
       * @param {any} error - The error object from the failed API call.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'create product', displayAlert);
      },
    },
  );
};
