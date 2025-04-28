// Importing necessary dependencies
import { useMutation } from 'react-query'; // React Query's `useMutation` hook for handling mutations
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to extract and display error messages

/**
 * Custom hook to fetch new trackers (gateways) from the API.
 *
 * @param {Function} displayAlert - Function to display success, info, or error alerts to the user.
 * @returns {Object} The mutation object, including the mutate function for triggering the request.
 */
export const useFetchNewGatewayMutation = (displayAlert) => useMutation(
  /**
   * The mutation function that performs the API request to fetch new trackers.
   *
   * @param {Object} newGatewayData - The data used to request new trackers (e.g., filter parameters).
   * @returns {Promise} - The response data from the API request, which includes the list of new trackers.
   */
  async (newGatewayData) => {
    // Sending a POST request to the API to fetch new trackers.
    const response = await httpService.makeRequest(
      'post', // HTTP method (POST)
      `${window.env.API_URL}sensors/fetch_new_trackers/`, // API endpoint
      newGatewayData, // Data passed with the request (newGatewayData)
    );
    // Return the response data, which should contain information about the new trackers
    return response.data;
  },
  // Mutation configuration object
  {
    /**
     * onSuccess callback: This function is called when the mutation succeeds.
     *
     * - It checks if there are any new trackers available and shows the appropriate message.
     * - If new trackers are found, a success alert is displayed.
     * - If no new trackers are found, an info alert is displayed.
     *
     * @param {Object} data - The data returned from the API after a successful mutation.
     */
    onSuccess: async (data) => {
      // Check if the response contains any new trackers
      if (data.new_trackers && data.new_trackers.length > 0) {
        // Display success alert if new trackers are available
        displayAlert('success', 'Successfully fetched new trackers');
      } else {
        // Display an informational alert if no new trackers are found
        displayAlert('info', 'No new trackers available to fetch');
      }
    },
    /**
     * onError callback: This function is called if the mutation fails.
     *
     * - It uses the `getErrorMessage` function to process and display an error message to the user.
     * - The error message might be related to issues in the API request, or server issues.
     *
     * @param {Error} error - The error object returned when the mutation fails.
     */
    onError: (error) => {
      // Display a generic error message using the utility function
      getErrorMessage(error, 'fetch trackers', displayAlert);
    },
  },
);
