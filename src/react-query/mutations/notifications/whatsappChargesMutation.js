import { useMutation } from 'react-query'; // React Query hook for handling mutations (async actions like POST, PATCH, DELETE)
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle and display error messages

/**
 * Custom hook for submitting data related to Whatsapp charges.
 *
 * This hook:
 * - Sends a POST request to the Whatsapp charges endpoint to submit the provided data.
 * - Displays an error message if the mutation fails.
 * - It does not automatically handle success notifications, so you can add a custom `onSuccess` handler if needed.
 *
 * @param {Function} displayAlert - Function to display success or error alerts to the user.
 * @returns {object} - Mutation object returned by `useMutation` containing the mutation function and status.
 */
export const useWhatsappChargesMutation = (displayAlert, section) => useMutation(
  /**
   * The mutation function that sends the POST request for Whatsapp charges.
   *
   * @param {object} whatsappChargesData - The data to be submitted to the API (e.g., charges for Whatsapp service).
   * @returns {Promise<object>} - The server's response, which typically contains a success message or result of the charge submission.
   */
  async (whatsappChargesData) => {
    // Sending the request to the server to submit Whatsapp charges data
    const response = await httpService.makeRequestWithoutHeaders(
      'post', // HTTP method (POST for submitting data)
      window.env.WHATSAPP_CHARGES_URL, // The endpoint URL for Whatsapp charges
      whatsappChargesData, // The data to be sent in the request body
    );
    // Returning the data from the server's response (could be a success message or confirmation)
    return response.data;
  },
  {
    /**
     * onError callback invoked when the mutation fails.
     * - Displays an error message using the `getErrorMessage` utility.
     *
     * @param {any} error - The error object returned from the mutation failure (contains details of the error).
     */
    onError: (error) => {
      // Calling the utility function to display a user-friendly error message
      getErrorMessage(section, error, 'fetch Whatsapp charges', displayAlert);
    },
  },
);
