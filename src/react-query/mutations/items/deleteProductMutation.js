// Import React Query hooks for mutation and query cache handling
import { useMutation, useQueryClient } from 'react-query';
// Import the HTTP service to make API calls
import { httpService } from '@modules/http/http.service';
// Import a utility to extract and show error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Custom React hook to handle deleting a product.
 *
 * This hook:
 * - Sends a DELETE request to the backend to remove a product by its ID.
 * - Invalidates the relevant cached queries so the product list stays up to date.
 * - Displays success or error notifications using a passed alert function.
 *
 * @param {string} organization - The organization identifier, used in the query key to scope cache.
 * @param {Function} displayAlert - Callback to trigger a user alert (e.g., snackbar or toast).
 * @returns {Object} The mutation object returned by React Query's useMutation.
 */
export const useDeleteProductMutation = (organization, displayAlert) => {
  // Instantiate the query client to interact with the React Query cache
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function that deletes a product by its ID.
     *
     * @param {string | number} productId - The ID of the product to be deleted.
     * @returns {Promise<void>} Resolves once the product is deleted.
     */
    async (productId) => {
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}shipment/product/${productId}`, // DELETE endpoint for product
      );
    },
    {
      /**
       * Called when the mutation succeeds.
       * - Invalidates the 'products' query for the organization to refresh the product list.
       * - Displays a success alert to inform the user.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['products', organization],
        });
        displayAlert('success', 'Product deleted successfully!');
      },
      /**
       * Called if the mutation throws an error.
       * - Displays a user-friendly error message using a shared utility.
       *
       * @param {any} error - The error returned by the failed mutation.
       */
      onError: (error) => {
        getErrorMessage(error, 'delete product', displayAlert);
      },
    },
  );
};
