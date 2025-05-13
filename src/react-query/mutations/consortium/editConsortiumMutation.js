// Import necessary modules and utilities
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks
import { httpService } from '@modules/http/http.service'; // Custom HTTP request service
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle errors

/**
 * Custom hook to edit an existing consortium.
 *
 * This hook sends a PATCH request to update the details of an existing consortium, invalidates any relevant queries
 * to ensure the UI reflects the latest data, and then handles success and error responses.
 *
 * @param {Object} history - React Router's history object for navigation after success
 * @param {string} redirectTo - The route to navigate to after successfully editing the consortium
 * @param {Function} displayAlert - Callback function to show success or error messages
 *
 * @returns {Object} - React Query mutation object, which can be used to trigger the edit consortium mutation
 */
export const useEditConsortiumMutation = (history, redirectTo, displayAlert) => {
  // Access React Query's query client to invalidate queries after mutation
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function to edit an existing consortium by sending a PATCH request.
     *
     * @param {Object} consortiumData - The updated data for the consortium
     * @returns {Object} - The response data from the server (updated consortium)
     */
    async (consortiumData) => {
      // Send a PATCH request to update the consortium with the provided consortium UUID
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}consortium/${consortiumData.consortium_uuid}/`,
        consortiumData,
      );
      return response.data;
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
        // Display a success alert to notify the user of the successful consortium update
        displayAlert('success', 'Successfully edited consortium');
        // Redirect the user to the specified route if provided
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      /**
       * Callback to handle errors during the mutation.
       * This will display a formatted error message to the user.
       *
       * @param {Object} error - The error returned by the failed mutation request
       */
      onError: (error) => {
        // Call the utility function to get a user-friendly error message and display it
        getErrorMessage(error, 'edit consortium', displayAlert);
      },
    },
  );
};
