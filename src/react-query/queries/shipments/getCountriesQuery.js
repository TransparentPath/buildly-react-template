// Importing the HTTP service for making API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to handle and display error messages
import { getErrorMessage } from '@utils/utilMethods';
// Importing Lodash for utility functions like `forEach`, `includes`, `toLower`, etc.
import _ from 'lodash';

/**
 * Fetches a list of countries along with their states from an external API.
 * It excludes certain countries based on political and other criteria.
 *
 * @param {function} displayAlert - A function used to display error alerts in case of request failure.
 * @returns {Promise<Array>} - Returns an array of countries with their states or an empty array if the request fails.
 */
export const getCountriesQuery = async (displayAlert, section) => {
  try {
    // Make an API request to fetch countries and their states
    const response = await httpService.makeRequest(
      'get',
      'https://countriesnow.space/api/v0.1/countries/states',
    );
    // Check if the response contains data
    if (response && response.data && response.data.data) {
      let countries = [];
      // Iterate through each country in the response data
      _.forEach(response.data.data, (country) => {
        let countryName = country.name;
        // Map specific country names to preferred names
        const countryNameMapping = {
          'Bahamas The': 'Bahamas',
          'Gambia The': 'Gambia',
        };
        // Check if the country name needs to be mapped to a different name
        if (countryNameMapping[countryName]) {
          countryName = countryNameMapping[countryName];
        }
        // Filter out certain countries based on a predefined list (e.g., political exclusions)
        if (
          !_.includes(
            ['cuba', 'iran', 'north korea', 'russia', 'syria', 'venezuela'],
            _.toLower(countryName), // Convert country name to lowercase for case-insensitive comparison
          )
        ) {
          // Add the country and its sorted states to the countries array
          countries = [
            ...countries,
            {
              country: countryName,
              iso3: country.iso3,
              states: _.sortBy(_.without(_.uniq(country.states), [''])), // Remove empty states and sort them
            },
          ];
        }
      });
      // Ensure the list of countries is unique based on the country name
      countries = _.uniqBy(countries, 'country');
      // Return the formatted list of countries
      return countries;
    }
    // Return an empty array if no valid data was found
    return [];
  } catch (error) {
    // If the request fails, show an error alert with the relevant message
    getErrorMessage(section, error, 'load countries and related states data', displayAlert);
    // Return an empty array as a fallback in case of an error
    return [];
  }
};
