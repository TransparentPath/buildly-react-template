// Importing the HTTP service utility to make API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to extract and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches item type records associated with a specific organization from the backend API.
 *
 * @param {string} organization - The UUID of the organization whose item types are to be fetched.
 * @param {function} displayAlert - A callback function to show error messages to the user if the request fails.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of item types.
 *                             Returns an empty array in case of a request failure.
 */
export const getItemTypeQuery = async (organization, displayAlert, section) => {
  try {
    // Sending a GET request to the API with the organization UUID as a query parameter
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}shipment/item_type/?organization_uuid=${organization}`, // API endpoint to fetch item types
    );
    // Returning the item types data from the API response
    return response.data;
  } catch (error) {
    // If an error occurs during the request, display an alert with a descriptive error message
    getErrorMessage(section, error, 'load item types data', displayAlert);
    // Return an empty array to gracefully handle request failures
    return [];
  }
};
