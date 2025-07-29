// Import required hooks and utilities from react-query and project modules
import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Custom hook to handle the creation of a new item type via API.
 *
 * This hook wraps `react-query`'s useMutation to:
 * - Send a POST request to create a new item type.
 * - Show a success message and navigate to a different page if needed.
 * - Invalidate relevant cached queries to ensure the UI reflects the latest data.
 * - Show a user-friendly error if the request fails.
 *
 * @param {string} organization - UUID or identifier for the organization, used in query keys.
 * @param {object} history - React Router history object for programmatic navigation.
 * @param {string} redirectTo - Route to navigate to after successful mutation.
 * @param {function} displayAlert - Function to display success or error notifications to the user.
 *
 * @returns {object} mutation - The mutation object from react-query with methods like `mutate`.
 */
export const useAddItemTypeMutation = (organization, history, redirectTo, displayAlert, section) => {
  // Access the react-query query client to manually invalidate or refetch queries.
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function to send item type data to the backend.
     *
     * @param {object} itemTypeData - Payload for the new item type (e.g., name, description).
     * @returns {Promise<any>} - The response data from the API.
     */
    async (itemTypeData) => {
      // Send POST request to create a new item type
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}shipment/item_type/`, // API endpoint
        itemTypeData, // Request body
      );
      return response.data;
    },
    {
      /**
       * Called when the mutation is successful.
       * - Invalidates the cached `itemTypes` query to ensure fresh data is fetched.
       * - Displays a success message to the user.
       * - Navigates to another route if `history` and `redirectTo` are provided.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['itemTypes', organization], // Invalidate itemTypes query specific to the organization
        });
        // Notify the user that the item type was added successfully
        displayAlert('success', 'Successfully added item type');
        // Redirect the user if routing info is provided
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      /**
       * Called when the mutation fails.
       * - Extracts and displays a friendly error message using the utility function.
       *
       * @param {any} error - The error thrown during mutation.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'create item type', displayAlert);
      },
    },
  );
};
