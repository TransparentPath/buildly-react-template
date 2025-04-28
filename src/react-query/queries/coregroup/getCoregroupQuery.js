// Importing the HTTP service utility to make API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility method that extracts and displays a user-friendly error message
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches all core group records from the backend API.
 *
 * @param {function} displayAlert - A callback function used to show error alerts to the user if the request fails.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of core groups.
 *                             If the request fails, returns an empty array.
 */
export const getCoregroupQuery = async (displayAlert) => {
  try {
    // Sending a GET request to the API endpoint to retrieve core group data
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}coregroups/`, // Full API endpoint URL built using environment variable
    );
    // Returning the response data upon successful retrieval
    return response.data;
  } catch (error) {
    // If there's an error, extract and display a descriptive error message using the utility method
    getErrorMessage(error, 'load core groups data', displayAlert);
    // Return an empty array to ensure consistent return type on failure
    return [];
  }
};
