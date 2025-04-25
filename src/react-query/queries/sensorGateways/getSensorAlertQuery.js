// Importing the HTTP service to make API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to display error messages in a user-friendly manner
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches sensor alert data for a given list of shipment IDs.
 * This data might include alerts related to sensor reports for shipments, used for monitoring or troubleshooting.
 *
 * @param {string} shipmentIds - A string of shipment IDs for which to retrieve sensor alerts.
 * @param {function} displayAlert - A function used to display error messages if the request fails.
 * @returns {Promise<Array>} - Returns an array of sensor alert objects or an empty array on failure.
 */
export const getSensorAlertQuery = async (shipmentIds, displayAlert) => {
  try {
    // Sending a GET request to fetch sensor alert data for the given shipment IDs
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}sensors/sensor_report_alert/?shipment_ids=${shipmentIds}`,
    );
    // Returning the data received from the API
    return response.data;
  } catch (error) {
    // If the request fails, display an alert with a user-friendly error message
    getErrorMessage(error, 'load sensor alerts data', displayAlert);
    // Return an empty array to prevent UI errors or crashes on failure
    return [];
  }
};
