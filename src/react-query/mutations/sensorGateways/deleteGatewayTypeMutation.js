import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for handling mutations and cache management
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for extracting error messages from API responses

/**
 * Custom hook for deleting a gateway type (tracker type).
 *
 * This hook:
 * - Sends a DELETE request to remove a specified gateway type by ID.
 * - On success, it invalidates the 'gatewayTypes' cache to refresh the list of gateway types.
 * - Displays a success or error alert depending on the result of the mutation.
 *
 * @param {Function} displayAlert - Function to display success or error alerts to the user.
 * @returns {object} - Mutation object returned by `useMutation` containing the mutation function and status.
 */
export const useDeleteGatewayTypeMutation = (displayAlert, section) => {
  const queryClient = useQueryClient(); // React Query hook for cache management

  return useMutation(
    /**
     * The mutation function that sends the DELETE request to remove a gateway type.
     *
     * @param {string} gatewayTypeId - The ID of the gateway type to be deleted.
     * @returns {Promise} - The result of the API call.
     */
    async (gatewayTypeId) => {
      // Sending the DELETE request to remove the gateway type by ID
      await httpService.makeRequest(
        'delete', // HTTP method (DELETE for removing a resource)
        `${window.env.API_URL}sensors/gateway_type/${gatewayTypeId}`, // API endpoint for deleting a gateway type
      );
    },
    {
      /**
       * onSuccess callback invoked when the mutation succeeds.
       * - Invalidates the cache for gateway types to ensure the list is refreshed.
       * - Displays a success message using the `displayAlert` function.
       */
      onSuccess: async () => {
        // Invalidating the cache for gateway types to ensure the list is up-to-date
        await queryClient.invalidateQueries({
          queryKey: ['gatewayTypes'], // Invalidate queries related to gateway types
        });
        // Displaying a success message
        displayAlert('success', 'Tracker type deleted successfully!');
      },
      /**
       * onError callback invoked when the mutation fails.
       * - Displays an error message using the `getErrorMessage` utility function.
       *
       * @param {Error} error - The error object returned from the mutation failure.
       */
      onError: (error) => {
        // Displaying an error message if the mutation fails
        getErrorMessage(section, error, 'delete tracker type', displayAlert);
      },
    },
  );
};
