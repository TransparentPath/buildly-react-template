// Importing the HTTP service utility for making HTTP requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to format and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches HTTP OPTIONS metadata for the 'gateway' endpoint, typically used to determine available methods,
 * allowed fields, validation rules, and other metadata needed for forms or dynamic UI rendering.
 *
 * @param {function} displayAlert - A callback function for displaying error alerts if the request fails.
 * @returns {Promise<Object|Array>} - Resolves to the parsed OPTIONS metadata response.
 *                                    Returns an empty array in case of an error.
 */
export const getGatewayOptionQuery = async (displayAlert, section) => {
  try {
    // Making an OPTIONS request to the 'gateway' API endpoint.
    // The third parameter (true) might indicate custom behavior like adding auth headers.
    const response = await httpService.makeOptionsRequest(
      'options',
      `${window.env.API_URL}sensors/gateway/`,
      true,
    );
    // Parsing the response body as JSON (manually handled here)
    const data = response.json();
    // Returning the parsed metadata
    return data;
  } catch (error) {
    // Handling any errors by showing a user-friendly alert message
    getErrorMessage(section, error, 'load gateway options data', displayAlert);
    // Returning an empty array for consistent return structure
    return [];
  }
};
