// Import necessary modules and utilities
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks
import { httpService } from '@modules/http/http.service'; // Custom HTTP request service
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle errors

/**
 * Custom hook to delete a consortium.
 *
 * This hook sends a DELETE request to remove a consortium, invalidates any relevant queries
 * to ensure the UI reflects the latest data, and then handles success and error responses.
 *
 * @param {Function} displayAlert - Callback function to show success or error messages
 *
 * @returns {Object} - React Query mutation object, which can be used to trigger the delete consortium mutation
 */
export const useDeleteConsortiumMutation = (displayAlert, section) => {
  // Access React Query's query client to invalidate queries after mutation
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function to delete an existing consortium by sending a DELETE request.
     *
     * @param {string} consortiumId - The ID of the consortium to be deleted
     */
    async (consortiumId) => {
      // Send a DELETE request to remove the consortium by its ID
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}consortium/${consortiumId}`,
      );
    },
    {
      /**
       * Callback to handle successful mutation.
       * This will invalidate related queries to ensure the UI is up-to-date,
       * and display a success message to the user.
       */
      onSuccess: async () => {
        // Invalidate the cached 'consortiums' query to ensure fresh data after the mutation
        await queryClient.invalidateQueries({
          queryKey: ['consortiums'],
        });
        // Display a success alert to notify the user of the successful consortium deletion
        displayAlert('success', 'Consortium deleted successfully!');
      },
      /**
       * Callback to handle errors during the mutation.
       * This will display a formatted error message to the user.
       *
       * @param {Object} error - The error returned by the failed mutation request
       */
      onError: (error) => {
        // Call the utility function to get a user-friendly error message and display it
        getErrorMessage(section, error, 'delete consortium', displayAlert);
      },
    },
  );
};
