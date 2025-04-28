// Importing the HTTP service utility to make API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to format and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches product records associated with a specific organization from the backend API.
 *
 * @param {string} organization - The UUID of the organization whose products need to be retrieved.
 * @param {function} displayAlert - A callback function to show an alert message if an error occurs.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of products.
 *                             Returns an empty array in case of an error.
 */
export const getProductQuery = async (organization, displayAlert) => {
  try {
    // Sending a GET request to the 'product' endpoint with the organization UUID as a query parameter
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}shipment/product?organization_uuid=${organization}`, // API URL with query string
    );
    // Return the products data if the request is successful
    return response.data;
  } catch (error) {
    // On failure, display an error message using a reusable utility
    getErrorMessage(error, 'load products data', displayAlert);
    // Return an empty array to keep the return value consistent
    return [];
  }
};
