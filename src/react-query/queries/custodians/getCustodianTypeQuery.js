// Importing the HTTP service utility to make API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function that extracts and displays user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches custodian type records from the backend API.
 *
 * @param {function} displayAlert - A callback function used to display error messages to the user if the request fails.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of custodian types.
 *                             Returns an empty array if the request fails.
 */
export const getCustodianTypeQuery = async (displayAlert) => {
  try {
    // Sending a GET request to fetch custodian type data from the API
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}custodian/custodian_type/`, // API endpoint to fetch custodian types
    );
    // Return the response data if the request is successful
    return response.data;
  } catch (error) {
    // If there's an error, handle it by displaying a descriptive error message to the user
    getErrorMessage(error, 'load custodian types data', displayAlert);
    // Return an empty array to ensure the app continues functioning properly even if the request fails
    return [];
  }
};
