// Import React Query hooks for managing mutations and cache
import { useMutation, useQueryClient } from 'react-query';
// Import the HTTP service for making API requests
import { httpService } from '@modules/http/http.service';
// Import a utility for handling and displaying error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Custom hook to delete an item type.
 *
 * This hook:
 * - Sends a DELETE request to remove an item type by its ID.
 * - Invalidates the cached query for item types to ensure the UI reflects changes.
 * - Displays a success or error message to the user via the `displayAlert` callback.
 *
 * @param {string} organization - The organization identifier, used in the query key for scoping.
 * @param {Function} displayAlert - A callback to show alerts to the user (e.g., toast/snackbar).
 * @returns {Object} - The mutation object returned by useMutation.
 */
export const useDeleteItemTypeMutation = (organization, displayAlert) => {
  // Get a reference to the query client for managing React Query cache
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Async mutation function that sends the DELETE request to the API.
     *
     * @param {string|number} itemTypeId - The ID of the item type to delete.
     * @returns {Promise<void>}
     */
    async (itemTypeId) => {
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}shipment/item_type/${itemTypeId}`, // API endpoint for deleting item type
      );
    },
    {
      /**
       * Callback executed after successful mutation.
       * - Invalidates the 'itemTypes' query for the current organization to refresh data.
       * - Displays a success alert.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['itemTypes', organization],
        });
        displayAlert('success', 'Item type deleted successfully!');
      },
      /**
       * Callback executed if the mutation fails.
       * - Uses a utility function to extract and display a relevant error message.
       *
       * @param {any} error - The error object thrown during the mutation.
       */
      onError: (error) => {
        getErrorMessage(error, 'delete item type', displayAlert);
      },
    },
  );
};
