// Importing the HTTP service utility to perform API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to extract and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches contact records for a specific organization from the backend API.
 *
 * @param {string} organization - The UUID of the organization for which contacts should be fetched.
 * @param {function} displayAlert - A callback function used to display error messages to the user if the request fails.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of contact records.
 *                             Returns an empty array if the request fails.
 */
export const getContactQuery = async (organization, displayAlert) => {
  try {
    // Making a GET request to fetch contacts filtered by organization UUID
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}custodian/contact/?organization_uuid=${organization}`, // API endpoint with query param for organization UUID
    );
    // Return the response data on successful request
    return response.data;
  } catch (error) {
    // If an error occurs, show a descriptive error message using the utility function
    getErrorMessage(error, 'load contacts data', displayAlert);
    // Return an empty array to maintain consistency in return type
    return [];
  }
};
