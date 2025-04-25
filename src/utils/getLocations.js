import Geocode from 'react-geocode';
import _ from 'lodash';

/**
 * Converts an array of address strings into an array of latitude and longitude strings using the Google Geocoding API.
 *
 * Functionality:
 * 1. Sets up the Geocoding API key and language configuration.
 * 2. Iterates through the given list of addresses (`carrierLocations`) and calls the API to get the coordinates for each.
 * 3. Parses the response to extract `latitude` and `longitude`.
 * 4. Returns an array of formatted strings like "lat,lng".
 *
 * Example Input:
 *   ['New York, NY', 'San Francisco, CA']
 *
 * Example Output:
 *   ['40.7127753,-74.0059728', '37.7749295,-122.4194155']
 *
 * @param {string[]} carrierLocations - Array of address strings to be converted to lat/lng coordinates.
 * @returns {Promise<string[]>} - Promise resolving to an array of latitude and longitude strings.
 */
const getLocations = async (carrierLocations) => {
  // Set the Google Geocoding API key from environment variables
  Geocode.setApiKey(window.env.GEO_CODE_API);
  // Set the language to English for the geocoding responses
  Geocode.setLanguage('en');
  // Perform parallel requests to the Geocoding API for each address in the list
  const reponses = await Promise.all(_.map(carrierLocations, async (loc) => (
    // eslint-disable-next-line no-return-await
    await Geocode.fromAddress(loc)
  )));
  // Extract latitude and longitude from each API response and format it as "lat,lng"
  const locations = _.map(reponses, (res) => {
    const { lat, lng } = res.results[0].geometry.location;
    return `${lat},${lng}`;
  });

  // Return the final array of coordinate strings
  return locations;
};

export default getLocations;
