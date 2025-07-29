// Import mutation and query client hooks from React Query
import { useMutation, useQueryClient } from 'react-query';
// Import custom HTTP service for API interaction
import { httpService } from '@modules/http/http.service';
// Utility function to extract and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Custom hook to edit an existing product.
 *
 * This hook:
 * - Sends a PATCH request to update the product based on its ID.
 * - Invalidates the cached 'products' query for the given organization.
 * - Displays success or error notifications via the provided alert function.
 * - Optionally redirects the user after a successful update.
 *
 * @param {string} organization - Used to scope cache invalidation to the products of this organization.
 * @param {object} history - React Router history object for programmatic navigation.
 * @param {string} redirectTo - URL path to redirect to after successful edit.
 * @param {Function} displayAlert - Function to show success or error alerts.
 * @returns {object} - Mutation object returned by useMutation.
 */
export const useEditProductMutation = (
  organization,
  history,
  redirectTo,
  displayAlert,
  section,
) => {
  // Get query client instance to manage query cache
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function to send a PATCH request for editing a product.
     *
     * @param {object} productData - Object containing the product data to update. Must include an `id`.
     * @returns {Promise<object>} - The updated product data returned from the server.
     */
    async (productData) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}shipment/product/${productData.id}`, // API endpoint with dynamic product ID
        productData,
      );
      return response.data;
    },
    {
      /**
       * Callback executed after a successful mutation.
       * - Invalidates the 'products' query cache for the specified organization.
       * - Displays a success alert.
       * - Navigates to a specified path if `history` and `redirectTo` are provided.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['products', organization],
        });
        displayAlert('success', 'Product successfully edited!');
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      /**
       * Callback executed when the mutation fails.
       * - Displays a formatted error message.
       *
       * @param {any} error - The error thrown by the mutation.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'edit product', displayAlert);
      },
    },
  );
};
