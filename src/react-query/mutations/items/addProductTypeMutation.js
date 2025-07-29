// Import necessary hooks and helpers
import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Custom hook for adding a new product type.
 *
 * This hook leverages `react-query`'s `useMutation` to:
 * - Send a POST request to the backend to create a product type.
 * - Invalidate the 'productTypes' query to refresh data.
 * - Show a success message to the user.
 * - Optionally redirect to another page after successful creation.
 * - Handle and display API errors gracefully.
 *
 * @param {string} organization - Organization identifier for scoping query keys.
 * @param {object} history - React Router history object used for redirection.
 * @param {string} redirectTo - Path to redirect after a successful mutation.
 * @param {function} displayAlert - Function to show toast/alert messages to the user.
 *
 * @returns {object} - Mutation object with helpers like `mutate`, `isLoading`, etc.
 */
export const useAddProductTypeMutation = (organization, history, redirectTo, displayAlert, section) => {
  // Initialize the query client to interact with the cache
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function to send a POST request for creating a product type.
     *
     * @param {object} productTypeData - The data payload for the new product type.
     * @returns {Promise<any>} - The response data from the backend.
     */
    async (productTypeData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}shipment/product_type/`, // Backend endpoint for product type creation
        productTypeData,
      );
      return response.data;
    },
    {
      /**
       * Runs after a successful mutation:
       * - Invalidates the 'productTypes' query for the given organization.
       * - Shows a success alert.
       * - Redirects the user if `history` and `redirectTo` are provided.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['productTypes', organization], // Ensures fresh data is fetched
        });
        displayAlert('success', 'Successfully added product type');
        if (history && redirectTo) {
          history.push(redirectTo); // Navigate to the specified path
        }
      },
      /**
       * Runs if the mutation fails:
       * - Uses a utility to extract and display a human-readable error.
       *
       * @param {any} error - The error thrown during the mutation.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'create product type', displayAlert);
      },
    },
  );
};
