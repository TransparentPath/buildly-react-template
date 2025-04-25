// Importing the HTTP service for making API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to handle and display error messages
import { getErrorMessage } from '@utils/utilMethods';
// Importing Lodash for utility functions like `map`, `uniqBy`, etc.
import _ from 'lodash';

/**
 * Fetches a list of countries and their corresponding currencies from an external API.
 *
 * @param {function} displayAlert - A function used to display error alerts in case of request failure.
 * @returns {Promise<Array>} - Returns an array of objects containing country ISO3 code and its currency, or an empty array if the request fails.
 */
export const getCurrenciesQuery = async (displayAlert) => {
  try {
    // Make an API request to fetch countries and their currencies
    const response = await httpService.makeRequest(
      'get',
      'https://countriesnow.space/api/v0.1/countries/currency',
    );
    // Check if the response contains the necessary data
    if (response && response.data && response.data.data) {
      // Map the response data to an array of objects with country ISO3 code and currency
      const currencies = _.uniqBy(_.map(
        response.data.data, (curr) => ({ country: curr.iso3, currency: curr.currency }),
      ), 'country');
      return currencies; // Return the formatted list of currencies
    }
    // Return an empty array if no valid data was found
    return [];
  } catch (error) {
    // If an error occurs, show an alert and return an empty array
    getErrorMessage(error, 'load currencies data', displayAlert);
    return [];
  }
};
