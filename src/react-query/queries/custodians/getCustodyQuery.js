// Importing the HTTP service utility to make API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to handle and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches custody records associated with specific shipment IDs from the backend API.
 *
 * @param {Array|string} shipmentIds - The shipment IDs for which custody data needs to be fetched.
 * @param {function} displayAlert - A callback function used to show error alerts to the user if the request fails.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of custody records.
 *                             If the request fails, it returns an empty array.
 */
export const getCustodyQuery = async (shipmentIds, displayAlert, section) => {
  try {
    // Sending a GET request to the API with the shipment IDs as query parameters
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}custodian/custody/?shipment_id=${shipmentIds}`, // API endpoint with shipment IDs as query parameter
    );
    // Returning the response data (custody records) if the request is successful
    return response.data;
  } catch (error) {
    // If the request fails, extract and display a user-friendly error message using the utility function
    getErrorMessage(section, error, 'load custodies data', displayAlert);
    // Return an empty array to ensure consistent data type even when the request fails
    return [];
  }
};
