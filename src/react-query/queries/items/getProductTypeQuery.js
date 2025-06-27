// Importing the HTTP service utility to perform backend API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to generate and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches product type records associated with a specific organization from the backend API.
 *
 * @param {string} organization - The UUID of the organization whose product types are to be fetched.
 * @param {function} displayAlert - A callback function used to display an alert if the request fails.
 * @returns {Promise<Array>} - Resolves to an array of product types if the request succeeds.
 *                             Returns an empty array in case of an error.
 */
export const getProductTypeQuery = async (organization, displayAlert, section) => {
  try {
    // Sending a GET request to fetch product types for the given organization
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}shipment/product_type/?organization_uuid=${organization}`, // API endpoint with query parameter
    );
    // If the request is successful, return the fetched data
    return response.data;
  } catch (error) {
    // Handle any error by displaying a custom error message
    getErrorMessage(section, error, 'load product types data', displayAlert);
    // Return an empty array so the calling component can safely handle the failure
    return [];
  }
};
