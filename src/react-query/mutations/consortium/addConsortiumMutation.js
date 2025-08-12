// Import necessary modules and utilities
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks
import { httpService } from '@modules/http/http.service'; // Custom HTTP request service
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle errors
import i18n from '../../../i18n/index';

/**
 * Custom hook to add a consortium.
 *
 * This hook sends a POST request to create a new consortium, invalidates any relevant queries
 * to ensure the UI reflects the latest data, and then handles success and error responses.
 *
 * @param {Object} history - React Router's history object for navigation after success
 * @param {string} redirectTo - The route to navigate to after successfully adding the consortium
 * @param {Function} displayAlert - Callback function to show success or error messages
 *
 * @returns {Object} - React Query mutation object, which can be used to trigger the add consortium mutation
 */
export const useAddConsortiumMutation = (history, redirectTo, displayAlert, section) => {
  // Access React Query's query client to invalidate queries after mutation
  const queryClient = useQueryClient();
  return useMutation(
    /**
     * Mutation function to create a new consortium by sending a POST request.
     *
     * @param {Object} consortiumData - The data for the new consortium
     * @returns {Object} - The response data from the server (created consortium)
     */
    async (consortiumData) => {
      // Send a POST request to create the consortium
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}consortium/`,
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
        // Display a success alert to notify the user of the successful consortium creation
        displayAlert('success', i18n.t('api.successMessages.Successfully added consortium'));
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
        getErrorMessage(section, error, 'create consortium', displayAlert);
      },
    },
  );
};
