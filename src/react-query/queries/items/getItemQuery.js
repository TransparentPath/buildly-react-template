// Importing the HTTP service utility to perform API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to handle and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches item records associated with a specific organization from the backend API.
 *
 * @param {string} organization - The UUID of the organization for which items need to be fetched.
 * @param {function} displayAlert - A callback function used to display error alerts to the user if the request fails.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of items.
 *                             Returns an empty array if the request fails.
 */
export const getItemQuery = async (organization, displayAlert, section) => {
  try {
    // Sending a GET request to fetch items data for a specific organization
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}shipment/item/?organization_uuid=${organization}`, // API endpoint with query parameter for organization UUID
    );
    // Return the response data (items data) if the request is successful
    return response.data;
  } catch (error) {
    // If an error occurs, handle it by displaying a user-friendly error message
    getErrorMessage(section, error, 'load items data', displayAlert);
    // Return an empty array to ensure consistent return type on failure
    return [];
  }
};
