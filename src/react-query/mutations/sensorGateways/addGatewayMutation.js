import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for handling mutations and cache management
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for extracting error messages from API responses

/**
 * Custom hook for adding a new gateway (tracker).
 *
 * This hook:
 * - Sends a POST request to create a new gateway.
 * - On success, it invalidates the 'gateways' cache to refresh the list of gateways.
 * - Displays a success or error alert depending on the result of the mutation.
 *
 * @param {string} organization - The organization to which the gateway is being added (used for cache invalidation).
 * @param {object} history - The history object for navigation (used to redirect after successful addition).
 * @param {string} redirectTo - The route to redirect to after successful addition.
 * @param {Function} displayAlert - Function to display success or error alerts to the user.
 * @returns {object} - Mutation object returned by `useMutation` containing the mutation function and status.
 */
export const useAddGatewayMutation = (
  organization,
  history,
  redirectTo,
  displayAlert,
) => {
  const queryClient = useQueryClient(); // React Query hook for cache management

  return useMutation(
    /**
     * The mutation function that sends the POST request to create a new gateway.
     *
     * @param {object} gatewayData - The data for the gateway to be created.
     * @returns {Promise} - The result of the API call.
     */
    async (gatewayData) => {
      // Sending the POST request to create the new gateway with the provided data
      const response = await httpService.makeRequest(
        'post', // HTTP method (POST for creating a new resource)
        `${window.env.API_URL}sensors/gateway/`, // API endpoint for adding a gateway
        gatewayData, // Data for the new gateway
      );
      return response.data;
    },
    {
      /**
       * onSuccess callback invoked when the mutation succeeds.
       * - Invalidates the cache for gateways to ensure the list is refreshed.
       * - Displays a success message using the `displayAlert` function.
       * - Redirects the user to the specified route (if provided).
       */
      onSuccess: async () => {
        // Invalidating the cache for gateways to ensure the list is up-to-date
        await queryClient.invalidateQueries({
          queryKey: ['gateways', organization], // Invalidate queries related to gateways for the specific organization
        });
        // Displaying a success message
        displayAlert('success', 'Successfully added tracker');
        // Redirecting the user if both `history` and `redirectTo` are provided
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      /**
       * onError callback invoked when the mutation fails.
       * - Displays an error message using the `getErrorMessage` utility function.
       *
       * @param {Error} error - The error object returned from the mutation failure.
       */
      onError: (error) => {
        // Displaying an error message if the mutation fails
        getErrorMessage(error, 'create tracker', displayAlert);
      },
    },
  );
};
