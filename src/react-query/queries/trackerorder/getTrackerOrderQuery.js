// Import the httpService for making API requests
import { httpService } from '@modules/http/http.service';
// Import the getErrorMessage utility for handling errors
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches the tracker order data for a specific organization.
 *
 * This function makes an API request to retrieve tracker orders based on the provided
 * organization UUID. It handles any errors that occur during the request and displays
 * an appropriate error message using the `getErrorMessage` utility.
 *
 * @param {string} organization_uuid - The UUID of the organization whose tracker orders are to be fetched.
 * @param {function} displayAlert - A function to display alert messages in case of errors.
 *
 * @returns {Array} - The data of the tracker orders if the request is successful; an empty array if an error occurs.
 */
export const getTrackerOrderQuery = async (organization_uuid, displayAlert) => {
  try {
    // Attempt to make the API request to fetch tracker orders for the given organization UUID
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}shipment/tracker_order/?organization_uuid=${organization_uuid}`, // Construct the API URL with the organization_uuid as a query parameter
    );
    // Return the data from the response (assuming it's in the 'data' property)
    return response.data;
  } catch (error) {
    // If an error occurs during the API request, catch it and display an error message
    // 'getErrorMessage' is a utility function that handles the error and displays a relevant message
    getErrorMessage(error, 'load tracker orders data', displayAlert);
    // Return an empty array as a fallback in case of an error
    return [];
  }
};
