// Importing the HTTP service for making API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to handle and display error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches sensor report data for a given list of shipment IDs.
 * The function can optionally limit the number of reports retrieved using the `count` parameter.
 *
 * @param {string} shipmentIds - A string containing the shipment IDs for which sensor reports are to be fetched.
 * @param {number} [count] - The number of reports to fetch. If omitted, all reports are retrieved.
 * @param {function} displayAlert - A function used to display error alerts in case of request failure.
 * @returns {Promise<Array>} - Returns an array of sensor reports data or an empty array if the request fails.
 */
export const getSensorReportQuery = async (shipmentIds, count, displayAlert, section) => {
  try {
    let response;
    // If a count is provided, include it in the API request to limit the number of reports
    if (count) {
      response = await httpService.makeRequest(
        'get',
        `${window.env.API_URL}sensors/sensor_report/?shipment_id=${shipmentIds}&report_count=${count}`,
      );
    } else {
      // If no count is provided, fetch all reports for the given shipment IDs
      response = await httpService.makeRequest(
        'get',
        `${window.env.API_URL}sensors/sensor_report/?shipment_id=${shipmentIds}`,
      );
    }
    // Return the data fetched from the API response
    return response.data;
  } catch (error) {
    // If the request fails, show an error alert with the relevant message
    getErrorMessage(section, error, 'load sensor reports data', displayAlert);
    // Return an empty array as a fallback in case of an error
    return [];
  }
};
