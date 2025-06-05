// Import hooks from React Query for managing mutations and query cache
import { useMutation, useQueryClient } from 'react-query';
// Import the custom HTTP service for API communication
import { httpService } from '@modules/http/http.service';
// Import a utility function to extract and display error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Custom React hook to handle editing an existing item.
 *
 * This hook:
 * - Sends a PATCH request to update item details.
 * - Invalidates the 'items' cache for the provided organization to refresh data.
 * - Optionally redirects the user upon success.
 * - Displays a success or error message using the provided alert function.
 *
 * @param {string} organization - Used to scope cache invalidation to this organization.
 * @param {object} history - React Router history object for navigation after success.
 * @param {string} redirectTo - Path to navigate to after successful edit.
 * @param {Function} displayAlert - Function to display alert messages.
 * @returns {object} The mutation object returned by useMutation.
 */
export const useEditItemMutation = (
  organization,
  history,
  redirectTo,
  displayAlert,
  section,
) => {
  // Get the React Query client instance to interact with cached queries
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function to send a PATCH request for updating an item.
     *
     * @param {object} itemData - Object containing updated item data, must include an `id`.
     * @returns {Promise<object>} The response data from the API.
     */
    async (itemData) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}shipment/item/${itemData.id}`, // API endpoint with dynamic item ID
        itemData,
      );
      return response.data;
    },
    {
      /**
       * Callback executed after a successful mutation.
       * - Invalidates the 'items' query cache for the organization.
       * - Displays a success alert.
       * - Redirects to the given path if `history` and `redirectTo` are provided.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['items', organization],
        });
        displayAlert('success', 'Item successfully edited!');
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      /**
       * Callback executed when the mutation results in an error.
       * - Uses a utility to extract a user-friendly message and display it.
       *
       * @param {any} error - Error thrown during the request.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'edit item', displayAlert);
      },
    },
  );
};
