// Importing the HTTP service module to make API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function for displaying error messages in a user-friendly way
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches processed sensor data based on shipment details such as shipment ID, departure, arrival, and completion times.
 * This data is likely related to processed reports for a specific shipment and its sensor data during various stages of transportation.
 *
 * @param {Object} selectedShipment - An object containing shipment details, including:
 *    - partner_shipment_id: The unique ID for the shipment.
 *    - actual_time_of_departure: The actual departure time of the shipment.
 *    - actual_time_of_arrival: The actual arrival time of the shipment.
 *    - actual_time_of_completion: The actual completion time for the shipment.
 * @param {function} displayAlert - A function used to show error messages if the request fails.
 * @returns {Promise<Array>} - Returns the processed sensor data or an empty array on failure.
 */
export const getSensorProcessedDataQuery = async (selectedShipment, displayAlert) => {
  try {
    // Sending a GET request to fetch processed sensor data for the specific shipment
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}sensors/processed_report_display_data?shipment_id=${selectedShipment.partner_shipment_id}&shipment_enroute_datetime=${selectedShipment.actual_time_of_departure}&shipment_arrival_datetime=${selectedShipment.actual_time_of_arrival}&shipment_complete_datetime=${selectedShipment.actual_time_of_completion}`,
    );
    // Returning the fetched processed data from the response
    return response.data;
  } catch (error) {
    // If the request fails, display an error alert message
    getErrorMessage(error, 'load sensor processed data', displayAlert);
    // Returning an empty array as a fallback to avoid UI breaking
    return [];
  }
};
