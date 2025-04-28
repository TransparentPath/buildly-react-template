// Import necessary hooks from React Query for mutation and cache handling
import { useMutation, useQueryClient } from 'react-query';
// Import a custom HTTP service for making API requests
import { httpService } from '@modules/http/http.service';
// Import a utility function for extracting and displaying error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Custom React hook to handle deletion of a product type.
 *
 * This hook:
 * - Sends a DELETE request to remove a product type by its ID.
 * - Invalidates the cached 'productTypes' query for the given organization to keep the UI in sync.
 * - Displays a success or error alert based on the result of the operation.
 *
 * @param {string} organization - Identifier used in the query key to scope cache invalidation.
 * @param {Function} displayAlert - Callback function used to show success or error notifications.
 * @returns {Object} The mutation object from React Query.
 */
export const useDeleteProductTypeMutation = (organization, displayAlert) => {
  // Create a query client instance to interact with the cache
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Function to delete a product type.
     *
     * @param {string|number} productTypeId - ID of the product type to be deleted.
     * @returns {Promise<void>} A promise that resolves once the deletion is complete.
     */
    async (productTypeId) => {
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}shipment/product_type/${productTypeId}`, // API endpoint for deleting product type
      );
    },
    {
      /**
       * Success callback that runs after the mutation completes successfully.
       * - Invalidates the 'productTypes' cache for the given organization.
       * - Displays a success alert.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['productTypes', organization],
        });
        displayAlert('success', 'Product type deleted successfully!');
      },
      /**
       * Error callback that handles any issues during the mutation.
       * - Extracts and displays a readable error message using a utility function.
       *
       * @param {any} error - Error thrown during the mutation request.
       */
      onError: (error) => {
        getErrorMessage(error, 'delete product type', displayAlert);
      },
    },
  );
};
