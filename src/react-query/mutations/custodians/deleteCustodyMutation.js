// Import necessary hooks and services
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for error handling

/**
 * Custom hook for deleting a custody type.
 *
 * @param {Function} displayAlert - A function for displaying success or error messages
 *
 * @returns {Object} - React Query mutation object for deleting a custody type
 */
export const useDeleteCustodyMutation = (displayAlert) => {
  // Create a query client to manage cache and invalidate queries
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * The mutation function to send a DELETE request to remove a custody type.
     *
     * @param {string} custodyTypeId - The ID of the custody type to delete
     * @returns {undefined} - No return value
     */
    async (custodyTypeId) => {
      await httpService.makeRequest(
        'delete', // HTTP DELETE method
        `${window.env.API_URL}custodian/custody/${custodyTypeId}`, // API endpoint for deleting the custody type
      );
    },
    {
      /**
       * Callback executed after the mutation is successful.
       * This invalidates the relevant queries to refresh the data.
       */
      onSuccess: async () => {
        // Invalidate the 'custodies' query to refresh the list of custody types
        await queryClient.invalidateQueries({
          queryKey: ['custodies'],
        });
        // Display a success alert
        displayAlert('success', 'Custody deleted successfully!');
      },
      /**
       * Callback executed if an error occurs during the mutation.
       * This handles errors by displaying an appropriate message.
       *
       * @param {Object} error - The error from the mutation request
       */
      onError: (error) => {
        // Call utility function to get the error message and display it
        getErrorMessage(error, 'delete custody', displayAlert);
      },
    },
  );
};
