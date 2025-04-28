// Import necessary hooks and services
import { useMutation } from 'react-query'; // React Query hook for mutation (async operations)
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import _ from 'lodash'; // Lodash utility library (not used in this code directly)
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle errors

/**
 * Custom hook for adding API setup data based on different table names.
 *
 * @param {Function} displayAlert - Function to show success or error alerts
 *
 * @returns {Object} - React Query mutation object for adding API setup
 */
export const useAddApiSetupMutation = (displayAlert) => useMutation(
  /**
   * The mutation function for adding API setup data.
   *
   * @param {Object} data - The setup data with a table name and other necessary properties
   * @returns {Object} - The response data from the API request
   */
  async (data) => {
    let endPoint;
    // Determine the endpoint based on the table name
    switch (data.table_name) {
      case 'item':
      case 'product':
        endPoint = 'shipment/third_party_api_import/'; // For 'item' and 'product'
        break;
      case 'gateway':
        endPoint = 'sensors/third_party_api_import/'; // For 'gateway'
        break;
      default:
        break;
    }
    // Make the API request to the respective endpoint
    const response = await httpService.makeRequest(
      'post', // HTTP POST method
      `${window.env.API_URL}${endPoint}`, // Construct the URL for the API request
      data, // Pass the setup data in the body of the request
    );
    return response.data;
  },
  {
    /**
     * Callback executed after the mutation is successful.
     * Displays the success alert with the status received from the response.
     *
     * @param {Object} res - The response data from the API request
     */
    onSuccess: async (res) => {
      displayAlert('success', res.status); // Display success message
    },
    /**
     * Callback executed if an error occurs during the mutation.
     * Handles the error and displays an appropriate error message.
     *
     * @param {Object} error - The error returned from the mutation
     */
    onError: (error) => {
      getErrorMessage(error, 'setup API', displayAlert); // Call utility function to handle error
    },
  },
);
