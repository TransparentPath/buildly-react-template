// Importing the HTTP service module to make API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function for displaying formatted error messages
import { getErrorMessage } from '@utils/utilMethods';
// Importing Lodash for utility functions like filtering and checking string values
import _ from 'lodash';

/**
 * Fetches gateway (tracker) data for a specific organization.
 * It filters out any gateway that includes 'ICLP' in its name,
 * which is likely reserved for internal or special-use devices.
 *
 * @param {string} organization - UUID of the organization for which to fetch gateways.
 * @param {function} displayAlert - A function used to show an error alert message if the request fails.
 * @returns {Promise<Array>} - Returns a filtered array of gateway objects or an empty array on failure.
 */
export const getGatewayQuery = async (organization, displayAlert) => {
  try {
    // Sending a GET request to retrieve gateways associated with a specific organization
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}sensors/gateway/?organization_uuid=${organization}`,
    );
    // Filtering out gateways that have 'ICLP' in their name
    const data = _.filter(
      response.data,
      (gateway) => !_.includes(gateway.name, 'ICLP'),
    );
    // Returning the cleaned list of gateways
    return data;
  } catch (error) {
    // Showing an alert if the API request fails
    getErrorMessage(error, 'load trackers data', displayAlert);
    // Returning an empty array so that UI logic doesn’t break on failure
    return [];
  }
};
