import { useMutation, useQueryClient } from 'react-query'; // React Query hook for handling mutations (async actions like POST, PATCH, DELETE)
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import i18n from '../../../i18n/index';

/**
 * Custom hook for adding a recipient address.
 *
 * This hook:
 * - Sends a POST request to add a new recipient address.
 * - On success, it invalidates the 'recipientAddresses' cache to ensure the list is refreshed.
 * - Displays an alert upon success or failure.
 * - Optionally redirects the user after a successful operation.
 *
 * @param {object} history - History object for navigation (usually from react-router).
 * @param {string} redirectTo - The route to redirect to after the address is successfully added.
 * @param {Function} displayAlert - Function to display success or error alerts to the user.
 * @returns {object} - Mutation object returned by `useMutation` containing the mutation function and status.
 */
export const useAddRecipientAddressMutation = (history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient(); // React Query hook for cache management

  return useMutation(
    /**
     * The mutation function that sends the POST request to add the recipient address.
     *
     * @param {object} recipientAddressData - The recipient address data to be submitted to the API.
     * @returns {Promise<object>} - The server's response, typically containing details of the created recipient address.
     */
    async (recipientAddressData) => {
      // Sending the request to the server to add the recipient address
      const response = await httpService.makeRequest(
        'post', // HTTP method (POST for adding data)
        `${window.env.API_URL}shipment/recipient_address/`, // API endpoint for adding recipient address
        recipientAddressData, // The data to be sent in the request body
      );
      // Returning the data from the server's response (the created recipient address)
      return response.data;
    },
    {
      /**
       * onSuccess callback invoked when the mutation succeeds.
       * - Invalidates the cache for recipient addresses to ensure the list is up-to-date.
       * - Displays a success message using the `displayAlert` function.
       * - Redirects to the specified route if `history` and `redirectTo` are provided.
       */
      onSuccess: async () => {
        // Invalidating the cache for recipient addresses to refresh the data
        await queryClient.invalidateQueries({
          queryKey: ['recipientAddresses'],
        });
        // Displaying a success message
        displayAlert('success', i18n.t('api.successMessages.Successfully added recipient address'));
        // Redirecting to the specified route if provided
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      /**
       * onError callback invoked when the mutation fails.
       * - Displays a custom error message indicating the recipient might already exist.
       *
       * @param {Error} error - The error object returned from the mutation failure.
       * @param {object} variables - The data sent in the mutation request (used to reference the recipient name).
       */
      onError: (error, variables) => {
        // Displaying an error message if the recipient already exists
        displayAlert('error', i18n.t('recipientExists', { name: variables.name }));
      },
    },
  );
};
