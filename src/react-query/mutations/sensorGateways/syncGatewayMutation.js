// Importing necessary dependencies
import { useMutation, useQueryClient } from 'react-query'; // `useMutation` hook from React Query for handling mutations
import { httpService } from '@modules/http/http.service'; // Custom HTTP service to make API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle error messages
import i18n from '../../../i18n/index';

/**
 * Custom hook to synchronize (sync) gateways (trackers) with the API.
 *
 * @param {string} organization - The ID or name of the organization, used to identify and manage data in queries.
 * @param {Function} displayAlert - Function to display success, info, or error alerts to the user.
 * @returns {Object} The mutation object, including the mutate function for triggering the request.
 */
export const useSyncGatewayMutation = (
  organization, // The organization ID or name used to manage query state
  displayAlert, // Function to show success, info, or error alerts to the user
  section, // Optional section identifier for categorizing alerts or errors
) => {
  const queryClient = useQueryClient(); // React Query's queryClient to manage cache invalidation

  return useMutation(
    /**
     * The mutation function that performs the API request to sync trackers (gateways).
     *
     * @param {Object} syncGatewayData - The data used to sync the trackers, such as identifiers and sync parameters.
     * @returns {Promise} - The response data from the API, which will include the sync status or result.
     */
    async (syncGatewayData) => {
      // Sending a POST request to the API to sync the trackers
      const response = await httpService.makeRequest(
        'post', // HTTP method (POST)
        `${window.env.API_URL}sensors/sync_trackers/`, // API endpoint for syncing gateways
        syncGatewayData, // Data passed with the request (syncGatewayData)
      );
      // Return the response data, which will typically include success/failure status
      return response.data;
    },
    // Mutation configuration object
    {
      /**
       * onSuccess callback: This function is executed when the mutation (API request) is successful.
       *
       * - It invalidates the query cache for the `gateways` query associated with the given `organization`.
       * - This triggers a refetch of the `gateways` data to ensure it is up to date after the sync operation.
       * - Displays a success alert to notify the user that the trackers have been synced.
       *
       * @returns {Promise} - The promise returned from the cache invalidation.
       */
      onSuccess: async () => {
        // Invalidating the query cache to refetch gateways for the specified organization
        await queryClient.invalidateQueries({
          queryKey: ['gateways', organization], // Identifies the query for gateways and the organization context
        });
        // Displaying a success message indicating that the trackers have been synced successfully
        displayAlert('success', i18n.t('api.successMessages.Successfully synced trackers'));
      },
      /**
       * onError callback: This function is executed when the mutation (API request) fails.
       *
       * - It uses the `getErrorMessage` function to handle and display an error message to the user.
       * - The error might be due to issues like network problems or invalid API responses.
       *
       * @param {Error} error - The error object returned when the mutation fails.
       */
      onError: (error) => {
        // Displaying an error message using the utility function `getErrorMessage`
        getErrorMessage(section, error, 'sync trackers', displayAlert);
      },
    },
  );
};
