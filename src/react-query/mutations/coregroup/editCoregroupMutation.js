// Import necessary modules and utilities
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for mutation and query client
import { httpService } from '@modules/http/http.service'; // Custom HTTP service to make API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for error handling

/**
 * Custom hook to edit an existing core group (user group).
 *
 * This hook sends a PATCH request to update the details of a core group, invalidates relevant queries
 * to ensure the UI reflects the latest data, and handles both success and error responses.
 *
 * @param {Function} displayAlert - Callback function to show success or error messages
 *
 * @returns {Object} - React Query mutation object, which can be used to trigger the edit core group mutation
 */
export const useEditCoregroupMutation = (displayAlert, section) => {
  // Access React Query's query client to invalidate queries after the mutation
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function to edit an existing core group by sending a PATCH request.
     *
     * @param {Object} coregroupData - The updated data for the core group (user group)
     * @returns {Object} - The response data from the server (updated core group)
     */
    async (coregroupData) => {
      // Send a PATCH request to update the core group with the provided core group ID
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}coregroups/${coregroupData.id}/`,
        coregroupData,
      );
      return response.data;
    },
    {
      /**
       * Callback to handle successful mutation.
       * This will invalidate the 'coregroups' query to ensure fresh data after the mutation,
       * and display a success message to the user.
       */
      onSuccess: async () => {
        // Invalidate the cached 'coregroups' query to refresh the core group list
        await queryClient.invalidateQueries({
          queryKey: ['coregroups'],
        });
        // Display a success alert to notify the user of the successful core group update
        displayAlert('success', 'User group successfully edited!');
      },
      /**
       * Callback to handle errors during the mutation.
       * This will display a formatted error message to the user.
       *
       * @param {Object} error - The error returned by the failed mutation request
       */
      onError: (error) => {
        // Call the utility function to get a user-friendly error message and display it
        getErrorMessage(section, error, 'edit user group', displayAlert);
      },
    },
  );
};
