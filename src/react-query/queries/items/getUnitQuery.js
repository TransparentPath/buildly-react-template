// Importing the HTTP service utility for making API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to handle and show formatted error messages to the user
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches unit of measurement records associated with a specific organization from the backend API.
 *
 * @param {string} organization - The UUID of the organization for which units of measurement are to be fetched.
 * @param {function} displayAlert - A function to show error alerts to the user when an API request fails.
 * @returns {Promise<Array>} - Resolves to an array of unit records if successful.
 *                             Returns an empty array in case of an error.
 */
export const getUnitQuery = async (organization, displayAlert) => {
  try {
    // Performing a GET request to fetch unit of measure data for the given organization
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}shipment/unit_of_measure/?organization_uuid=${organization}`, // API endpoint with query string for organization UUID
    );
    // Returning the unit data received from the API response
    return response.data;
  } catch (error) {
    // Handling errors: Displaying a user-friendly alert if the request fails
    getErrorMessage(error, 'load unit of measurements data', displayAlert);
    // Returning an empty array to maintain consistent return format even on failure
    return [];
  }
};
