// Importing the HTTP service utility to perform API calls
import { httpService } from '@modules/http/http.service';
// Importing a utility function to show user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches HTTP OPTIONS metadata for the "item" endpoint.
 * This is typically used to dynamically render form fields, validations,
 * and understand what operations are supported by the endpoint.
 *
 * @param {function} displayAlert - A function to display error messages if the request fails.
 * @returns {Promise<Object|Array>} - Resolves to an object containing field metadata and other OPTIONS details,
 *                                    or an empty array in case of error.
 */
export const getItemOptionQuery = async (displayAlert, section) => {
  try {
    // Making an OPTIONS request to the item endpoint.
    // The third parameter (true) likely indicates inclusion of headers (e.g., authorization)
    const response = await httpService.makeOptionsRequest(
      'options',
      `${window.env.API_URL}shipment/item/`,
      true,
    );
    // Properly awaiting the parsed JSON body of the response
    const data = await response.json();
    // Returning the parsed metadata for use in forms or UI
    return data;
  } catch (error) {
    // Handling and showing errors using a helper method
    getErrorMessage(section, error, 'load item options data', displayAlert);
    // Fallback to an empty array to prevent UI crashes
    return [];
  }
};
