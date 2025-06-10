// Import mutation and query client hooks from React Query
import { useMutation, useQueryClient } from 'react-query';
// Import custom HTTP service for API interaction
import { httpService } from '@modules/http/http.service';
// Utility function to extract and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Custom hook to edit an existing item type.
 *
 * This hook:
 * - Sends a PATCH request to update the item type based on ID.
 * - Invalidates the cached 'itemTypes' query for the organization.
 * - Displays success or error notifications via the provided alert function.
 * - Optionally redirects the user after success.
 *
 * @param {string} organization - Used to scope cache invalidation to this organization.
 * @param {object} history - React Router history object for programmatic navigation.
 * @param {string} redirectTo - URL path to redirect to after successful edit.
 * @param {Function} displayAlert - Function to show success or error alerts.
 * @returns {object} - Mutation object returned by useMutation.
 */
export const useEditItemTypeMutation = (
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
     * Mutation function to send a PATCH request for editing item type.
     *
     * @param {object} itemTypeData - Object containing item type data to update. Must include an `id`.
     * @returns {Promise<object>} - The updated item type data returned from the server.
     */
    async (itemTypeData) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}shipment/item_type/${itemTypeData.id}`, // API endpoint with dynamic ID
        itemTypeData,
      );
      return response.data;
    },
    {
      /**
       * Callback executed after a successful mutation.
       * - Invalidates the 'itemTypes' query cache for the specified organization.
       * - Displays a success alert.
       * - Navigates to a specified path if `history` and `redirectTo` are provided.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['itemTypes', organization],
        });
        displayAlert('success', 'Item type successfully edited!');
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
        getErrorMessage(section, error, 'edit item type', displayAlert);
      },
    },
  );
};
