// Importing the HTTP service utility to make API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility method to extract and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches all core user records from the backend API.
 *
 * @param {function} displayAlert - A callback function used to display an error message to the user in case of request failure.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of core users.
 *                             Returns an empty array if the request fails.
 */
export const getCoreuserQuery = async (displayAlert) => {
  try {
    // Making a GET request to fetch core user data from the API
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}coreuser/`, // API endpoint URL built using environment variable
    );
    // If the request is successful, return the data from the response
    return response.data;
  } catch (error) {
    // If an error occurs, extract and display a friendly error message using the utility
    getErrorMessage(error, 'load core users data', displayAlert);
    // Return an empty array to allow the app to handle failure gracefully
    return [];
  }
};
