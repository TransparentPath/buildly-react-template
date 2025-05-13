// Import necessary modules and utilities
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for mutation and query client
import { httpService } from '@modules/http/http.service'; // Custom HTTP service to make API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for error handling

/**
 * Custom hook to delete an existing user (core user).
 *
 * This hook sends a DELETE request to remove a user by their ID, invalidates relevant queries
 * to ensure the UI reflects the latest data, and handles both success and error responses.
 *
 * @param {Function} displayAlert - Callback function to show success or error messages
 *
 * @returns {Object} - React Query mutation object, which can be used to trigger the delete core user mutation
 */
export const useDeleteCoreuserMutation = (displayAlert) => {
  // Access React Query's query client to invalidate queries after the mutation
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function to delete a user by sending a DELETE request.
     *
     * @param {Object} coreuserData - Data containing the user ID of the user to be deleted
     * @returns {Object} - The response data from the server confirming the deletion
     */
    async (coreuserData) => {
      // Send a DELETE request to remove the user by the provided user ID
      const response = await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}coreuser/${coreuserData.id}/`,
      );
      return response.data;
    },
    {
      /**
       * Callback to handle successful mutation.
       * This will invalidate the 'users' query to refresh the user list after the mutation,
       * and display a success message to the user.
       */
      onSuccess: async () => {
        // Invalidate the cached 'users' query to refresh the user list
        await queryClient.invalidateQueries({
          queryKey: ['users'],
        });
        // Display a success alert to notify the user of the successful user deletion
        displayAlert('success', 'User successfully deleted!');
      },
      /**
       * Callback to handle errors during the mutation.
       * This will display a formatted error message to the user.
       *
       * @param {Object} error - The error returned by the failed mutation request
       */
      onError: (error) => {
        // Call the utility function to get a user-friendly error message and display it
        getErrorMessage(error, 'delete user', displayAlert);
      },
    },
  );
};
