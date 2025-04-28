import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for handling mutations and cache management
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for extracting error messages from API responses

/**
 * Custom hook for editing a recipient address.
 *
 * This hook:
 * - Sends a PATCH request to update an existing recipient address.
 * - On success, it invalidates the 'recipientAddresses' cache to ensure the list is refreshed.
 * - Displays a success or error alert depending on the result of the mutation.
 *
 * @param {object} history - The history object for navigation (used to redirect after successful update).
 * @param {string} redirectTo - The route to redirect to after successful update.
 * @param {Function} displayAlert - Function to display success or error alerts to the user.
 * @returns {object} - Mutation object returned by `useMutation` containing the mutation function and status.
 */
export const useEditRecipientAddressMutation = (history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient(); // React Query hook for cache management

  return useMutation(
    /**
     * The mutation function that sends the PATCH request to update the recipient address.
     *
     * @param {object} recipientAddressData - The data for the recipient address to be updated.
     * @returns {Promise} - The result of the API call.
     */
    async (recipientAddressData) => {
      // Sending the PATCH request to update the recipient address with the provided data
      const response = await httpService.makeRequest(
        'patch', // HTTP method (PATCH for updating data)
        `${window.env.API_URL}shipment/recipient_address/${recipientAddressData.id}`, // API endpoint for editing recipient address
        recipientAddressData, // Data to be updated
      );
      return response.data;
    },
    {
      /**
       * onSuccess callback invoked when the mutation succeeds.
       * - Invalidates the cache for recipient addresses to refresh the data.
       * - Displays a success message using the `displayAlert` function.
       * - Redirects the user to the specified route (if provided).
       */
      onSuccess: async () => {
        // Invalidating the cache for recipient addresses to ensure the list is up-to-date
        await queryClient.invalidateQueries({
          queryKey: ['recipientAddresses'],
        });
        // Displaying a success message
        displayAlert('success', 'Recipient address successfully edited!');
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
        getErrorMessage(error, 'edit recipient address', displayAlert);
      },
    },
  );
};
