// Import necessary hooks and services
import { useMutation } from 'react-query'; // React Query hook for mutation (async operations)
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import _ from 'lodash'; // Lodash utility library (used for string capitalization)
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle errors

/**
 * Custom hook for uploading data from a file for a specific model.
 *
 * @param {String} model - The model type (e.g., 'item', 'product')
 * @param {Function} displayAlert - Function to show success or error alerts
 *
 * @returns {Object} - React Query mutation object for uploading data from a file
 */
export const useAddFromFileMutation = (model, displayAlert) => useMutation(
  /**
   * The mutation function for uploading data from a file based on the model type.
   *
   * @param {FormData} data - The form data (including the file) to upload
   * @returns {Object} - The response data from the API request
   */
  async (data) => {
    let endPoint;
    // Determine the endpoint based on the model type
    switch (model) {
      case 'item':
      case 'product':
        endPoint = 'shipment/file_upload/'; // For 'item' and 'product', use the shipment endpoint
        break;
      // case 'gateway':
      //   endPoint = 'sensors/file_upload/'; // Potential future case for gateway
      //   break;
      default:
        break;
    }
    // Make the API request to the respective endpoint
    const response = await httpService.makeRequest(
      'post', // HTTP POST method
      `${window.env.API_URL}${endPoint}`, // Construct the URL for the API request
      data, // Pass the FormData (including file) in the body of the request
      null, // No additional headers needed
      'multipart/form-data', // Set the content type to 'multipart/form-data' for file uploads
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
      displayAlert('success', res.status); // Display success message with the response status
    },
    /**
     * Callback executed if an error occurs during the mutation.
     * Handles the error and displays an appropriate error message.
     *
     * @param {Object} error - The error returned from the mutation
     */
    onError: (error) => {
      getErrorMessage(error, `import ${_.capitalize(model)}`, displayAlert); // Handle error and display message
    },
  },
);
