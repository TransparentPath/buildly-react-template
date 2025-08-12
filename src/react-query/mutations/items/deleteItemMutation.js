// Import necessary hooks and utility methods
import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';
import i18n from '../../../i18n/index';

/**
 * Custom hook to delete an item using React Query mutation.
 *
 * Responsibilities:
 * - Sends a DELETE request to remove an item by its ID.
 * - Invalidates the 'items' query cache for the given organization to refresh the data.
 * - Displays success or error alerts based on API response.
 *
 * @param {string} organization - The organization identifier used to scope the query key.
 * @param {function} displayAlert - A function to display alerts to the user (success or error).
 *
 * @returns {object} - The mutation object from React Query, including `mutate`, `isLoading`, etc.
 */
export const useDeleteItemMutation = (organization, displayAlert, section) => {
  // Access React Query's client to manage the query cache
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function that sends a DELETE request to the backend.
     *
     * @param {string|number} itemId - The ID of the item to be deleted.
     * @returns {Promise<void>}
     */
    async (itemId) => {
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}shipment/item/${itemId}`, // Endpoint for item deletion
      );
    },
    {
      /**
       * Callback triggered on successful deletion.
       * - Invalidates the 'items' query to refresh the list.
       * - Shows a success message to the user.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['items', organization],
        });
        displayAlert('success', i18n.t('api.successMessages.Item deleted successfully!'));
      },
      /**
       * Callback triggered if an error occurs during the deletion.
       * - Extracts and displays a readable error message.
       *
       * @param {any} error - Error object thrown during mutation.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'delete item', displayAlert);
      },
    },
  );
};
