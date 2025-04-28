// Importing the HTTP service for making API requests
import { httpService } from '@modules/http/http.service';
// Importing the utility function for displaying user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';
// Importing Lodash for utility operations like filtering and checking string contents
import _ from 'lodash';

/**
 * Fetches all available gateways (trackers) from the backend, excluding any
 * that have 'ICLP' in their name. This might be used to filter out test or
 * internal-use gateways from the UI.
 *
 * @param {function} displayAlert - A function to display error messages if the request fails.
 * @returns {Promise<Array>} - An array of filtered gateway objects, or an empty array on failure.
 */
export const getAllGatewayQuery = async (displayAlert) => {
  try {
    // Making a GET request to fetch all gateway (tracker) entries
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}sensors/gateway/`,
    );
    // Filtering out gateways whose name includes the string 'ICLP'
    const data = _.filter(
      response.data,
      (gateway) => !_.includes(gateway.name, 'ICLP'),
    );
    // Returning the filtered list
    return data;
  } catch (error) {
    // If an error occurs, display a formatted alert
    getErrorMessage(error, 'load all trackers data', displayAlert);
    // Return an empty array to ensure calling code can safely handle failures
    return [];
  }
};
