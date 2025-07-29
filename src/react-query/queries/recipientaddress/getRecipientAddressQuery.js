// Importing the HTTP service module used to make API requests
import { httpService } from '@modules/http/http.service';
// Importing utility function to parse and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches recipient address data for a specific organization.
 * This is typically used to populate dropdowns or forms with address information related to shipments.
 *
 * @param {string} organization_uuid - The UUID of the organization whose recipient addresses are to be fetched.
 * @param {function} displayAlert - A function to show an alert message if the request fails.
 * @returns {Promise<Array|Object>} - Returns recipient address data as an array or object depending on the API,
 *                                    or an empty array if the request fails.
 */
export const getRecipientAddressQuery = async (organization_uuid, displayAlert, section) => {
  try {
    // Making a GET request to fetch recipient addresses filtered by organization UUID
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}shipment/recipient_address/?organization_uuid=${organization_uuid}`,
    );
    // Returning the actual data from the response
    return response.data;
  } catch (error) {
    // Showing a user-friendly alert if an error occurs during the request
    getErrorMessage(section, error, 'load recipient addresses data', displayAlert);
    // Returning an empty array to gracefully handle errors in the calling code
    return [];
  }
};
