// Import necessary modules and utilities
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for mutation and query client
import { httpService } from '@modules/http/http.service'; // Custom HTTP service to make API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for error handling

/**
 * Custom hook to edit an existing core user.
 *
 * This hook sends a PATCH request to update the details of an existing user,
 * invalidates the relevant queries to reflect the updated user data, and handles
 * both success and error responses.
 *
 * @param {Function} displayAlert - Callback function to show success or error messages
 *
 * @returns {Object} - React Query mutation object, which can be used to trigger the edit user mutation
 */
export const useEditCoreuserMutation = (displayAlert, section) => {
  // Access React Query's query client to invalidate queries after the mutation
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function to edit a core user by sending a PATCH request.
     *
     * @param {Object} coreuserData - Data containing the user ID and updated details of the user
     * @returns {Object} - The response data from the server after the update
     */
    async (coreuserData) => {
      // Send a PATCH request to update the user by the provided user ID and data
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}coreuser/${coreuserData.id}/`,
        coreuserData,
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
        // Display a success alert to notify the user of the successful edit
        displayAlert('success', 'User successfully edited!');
      },
      /**
       * Callback to handle errors during the mutation.
       * This will display a formatted error message to the user.
       *
       * @param {Object} error - The error returned by the failed mutation request
       */
      onError: (error) => {
        // Call the utility function to get a user-friendly error message and display it
        getErrorMessage(section, error, 'edit user', displayAlert);
      },
    },
  );
};
