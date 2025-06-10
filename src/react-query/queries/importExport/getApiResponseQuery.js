// Importing the HTTP service utility to perform API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to handle and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches data from a specified API endpoint, with custom headers, using a GET request.
 *
 * @param {string} url - The API endpoint URL to which the GET request should be sent.
 * @param {object} header - An object containing custom headers to be sent with the GET request.
 * @param {function} displayAlert - A callback function used to show error alerts to the user if the request fails.
 * @returns {Promise<any>} - Returns a promise that resolves to the response from the API.
 *                             If the request fails, returns an empty array.
 */
export const getApiResponseQuery = async (url, header, displayAlert, section) => {
  try {
    // Sending a GET request to the specified URL with custom headers
    const response = await httpService.makeRequest(
      'get', // HTTP method
      url, // API endpoint URL passed as an argument
      null, // No body for GET request
      null, // No query parameters
      null, // No additional options
      null, // No custom configuration
      header, // Custom headers passed as an argument
    );
    // Return the response data if the request is successful
    return response;
  } catch (error) {
    // If an error occurs, display a descriptive error message using the utility function
    getErrorMessage(section, error, 'load API response data', displayAlert);
    // Return an empty array to ensure a consistent return type when the request fails
    return [];
  }
};
