// Importing the HTTP service utility to make API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility method to extract and display a user-friendly error message
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches all consortium records from the backend API.
 *
 * @param {function} displayAlert - A callback function used to show error alerts to the user if the request fails.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of consortiums.
 *                             Returns an empty array if the request fails.
 */
export const getAllConsortiumQuery = async (displayAlert, section) => {
  try {
    // Sending a GET request to fetch all consortiums
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}consortium/`, // Full API endpoint URL using environment variable
    );
    // Return the data from the successful response
    return response.data;
  } catch (error) {
    // If the request fails, handle and display the error using the utility method
    getErrorMessage(section, error, 'load consortiums data', displayAlert);
    // Return an empty array to gracefully handle the failure
    return [];
  }
};
