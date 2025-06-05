// Importing the HTTP service utility to make API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility method that extracts and displays a user-friendly error message
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches all organization type records from the backend API.
 *
 * @param {function} displayAlert - A callback function used to show error alerts to the user if the request fails.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of organization types. Returns an empty array if the request fails.
 */
export const getOrganizationTypeQuery = async (displayAlert, section) => {
  try {
    // Sending a GET request to the API endpoint for retrieving all organization types
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}organization_type/`, // Full API URL (constructed using environment variable)
    );
    // If the request is successful, return the data received from the server
    return response.data;
  } catch (error) {
    // If there's an error during the request, use the utility method to handle and display the error
    getErrorMessage(section, error, 'load organization types data', displayAlert);
    // Return an empty array to ensure the calling function receives a consistent data type
    return [];
  }
};
