// Importing the HTTP service utility to make HTTP requests to the backend API
import { httpService } from '@modules/http/http.service';
// Importing a utility function that extracts and displays user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches custodian records associated with a specific organization from the backend API.
 *
 * @param {string} organization - The UUID of the organization for which custodians need to be retrieved.
 * @param {function} displayAlert - A callback function used to show an error alert to the user if the request fails.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of custodians.
 *                             If the API call fails, returns an empty array.
 */
export const getCustodianQuery = async (organization, displayAlert, section) => {
  try {
    // Sending a GET request to the backend API to fetch custodians linked to the given organization UUID
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}custodian/custodian/?organization_uuid=${organization}`, // API endpoint with organization filter
    );
    // Return the list of custodians from the response data if the request is successful
    return response.data;
  } catch (error) {
    // Handle the error gracefully by displaying a user-friendly message
    getErrorMessage(section, error, 'load custodians data', displayAlert);
    // Return an empty array to maintain a consistent return type in case of failure
    return [];
  }
};
