// Importing the HTTP service for making API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to show formatted error messages
import { getErrorMessage } from '@utils/utilMethods';
// Importing Lodash for utility operations like filtering and string manipulation
import _ from 'lodash';

/**
 * Fetches all available gateway types, excluding those whose name is 'ICLP'.
 * The 'ICLP' name is likely used for internal or special-use types that should not
 * appear in the user interface.
 *
 * @param {function} displayAlert - A function to display error messages if the request fails.
 * @returns {Promise<Array>} - Returns a filtered array of gateway type objects,
 *                             or an empty array on failure.
 */
export const getGatewayTypeQuery = async (displayAlert, section) => {
  try {
    // Sending a GET request to fetch all available gateway types
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}sensors/gateway_type`,
    );
    // Filtering out gateway types that have the name 'ICLP', ignoring case
    const data = _.filter(
      response.data,
      (gatewayType) => _.toLower(gatewayType.name) !== 'iclp',
    );
    // Returning the filtered list of gateway types
    return data;
  } catch (error) {
    // If an error occurs during the request, display an alert message
    getErrorMessage(section, error, 'load tracker types data', displayAlert);
    // Returning an empty array to prevent UI from breaking due to an error
    return [];
  }
};
