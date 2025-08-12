import { useMutation, useQueryClient } from 'react-query'; // React Query hook for handling mutations (async actions like POST, PATCH, DELETE)
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for extracting error messages from API responses
import i18n from '../../../i18n/index';

/**
 * Custom hook for deleting a recipient address.
 *
 * This hook:
 * - Sends a DELETE request to remove a recipient address by its ID.
 * - On success, it invalidates the 'recipientAddresses' cache to ensure the list is refreshed.
 * - Displays an alert upon success or failure.
 *
 * @param {Function} displayAlert - Function to display success or error alerts to the user.
 * @returns {object} - Mutation object returned by `useMutation` containing the mutation function and status.
 */
export const useDeleteRecipientAddressMutation = (displayAlert, section) => {
  const queryClient = useQueryClient(); // React Query hook for cache management

  return useMutation(
    /**
     * The mutation function that sends the DELETE request to remove the recipient address.
     *
     * @param {string} recipientAddressId - The ID of the recipient address to be deleted.
     * @returns {Promise} - The result of the API call.
     */
    async (recipientAddressId) => {
      // Sending the DELETE request to the server to remove the recipient address
      await httpService.makeRequest(
        'delete', // HTTP method (DELETE for removing data)
        `${window.env.API_URL}shipment/recipient_address/${recipientAddressId}`, // API endpoint for deleting recipient address
      );
    },
    {
      /**
       * onSuccess callback invoked when the mutation succeeds.
       * - Invalidates the cache for recipient addresses to refresh the data.
       * - Displays a success message using the `displayAlert` function.
       */
      onSuccess: async () => {
        // Invalidating the cache for recipient addresses to ensure the list is up-to-date
        await queryClient.invalidateQueries({
          queryKey: ['recipientAddresses'],
        });
        // Displaying a success message
        displayAlert('success', i18n.t('api.successMessages.Recipient address deleted successfully!'));
      },
      /**
       * onError callback invoked when the mutation fails.
       * - Displays an error message using the `getErrorMessage` utility function.
       *
       * @param {Error} error - The error object returned from the mutation failure.
       */
      onError: (error) => {
        // Displaying an error message if the mutation fails
        getErrorMessage(section, error, 'delete recipient address', displayAlert);
      },
    },
  );
};
