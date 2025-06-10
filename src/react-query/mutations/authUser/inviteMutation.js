// Import necessary hooks and utilities
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for mutation handling and cache control
import { httpService } from '@modules/http/http.service'; // Custom HTTP service abstraction
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle and display error messages

/**
 * Custom hook to invite users and create a new organization.
 *
 * @param {function} discardFormData - Callback function to reset or discard form data after a successful request
 * @param {function} displayAlert - Function to show user alerts for success or error feedback
 *
 * @returns {object} - The mutation object from useMutation with mutate, status, error, and other properties
 */
export const useInviteMutation = (discardFormData, displayAlert, section) => {
  // Get React Query's query client instance to manage cache
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function that sends a POST request to the invite endpoint.
     *
     * @param {object} inviteData - Payload containing invite and organization creation details
     * @returns {object} - Full response object from the API
     */
    async (inviteData) => {
      const response = await httpService.makeRequest(
        'post', // HTTP method
        `${window.env.API_URL}coreuser/invite/`, // API endpoint for user invitation and organization creation
        inviteData, // Request payload
      );
      return response; // Return full response for downstream access if needed
    },
    {
      /**
       * Called when the mutation completes successfully.
       * - Invalidates cached queries related to organizations and groups.
       * - Notifies the user of success.
       * - Clears the form via `discardFormData`.
       */
      onSuccess: async () => {
        // Invalidate organizations query to refresh the data with the newly created org
        await queryClient.invalidateQueries({
          queryKey: ['organizations'],
        });
        // Invalidate groups query to refresh user group data
        await queryClient.invalidateQueries({
          queryKey: ['coregroup'],
        });
        // Display a success alert to the user
        displayAlert('success', 'Invitations sent and organization created successfully');
        // Reset the form or clear data as needed
        discardFormData();
      },
      /**
       * Called when the mutation fails with an error.
       * - Uses utility to extract and display a readable error message.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'send invite or create organization', displayAlert);
      },
    },
  );
};
