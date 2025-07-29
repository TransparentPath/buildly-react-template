// Importing the HTTP service for making API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to handle and display error messages
import { getErrorMessage } from '@utils/utilMethods';
// Importing Lodash for utility functions like `map`, `join`, `filter`, etc.
import _ from 'lodash';

/**
 * Fetches a list of shipments for a specific organization with optional filtering by status or shipment ID.
 *
 * @param {string} organization - The UUID of the organization to filter shipments by.
 * @param {string} status - The status of the shipment (optional) to filter by (e.g., "Planned", "En route").
 * @param {function} displayAlert - A function used to display error alerts in case of request failure.
 * @param {string|null} shipmentId - Optional. The shipment ID to filter a specific shipment (if provided).
 * @returns {Promise<Array>} - Returns an array of shipment objects or an empty array if the request fails or no data is found.
 */
export const getShipmentsQuery = async (organization, status, displayAlert, section, shipmentId = null) => {
  try {
    // Initialize query parameters with organization UUID
    let query_params = `?organization_uuid=${organization}`;
    // Fetch consortium data based on organization UUID
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}consortium/?organization_uuid=${organization}`,
    );
    // Retrieve the consortium UUIDs and add them to the query parameters
    const consortium_uuid = _.join(
      _.map(response.data, 'consortium_uuid'),
      ',',
    );
    if (consortium_uuid) {
      query_params = query_params.concat(`&consortium_uuid=${consortium_uuid}`);
    }
    // If a specific shipment ID is provided, fetch shipment details
    if (shipmentId) {
      const shipmentResponse = await httpService.makeRequest(
        'get',
        `${window.env.API_URL}shipment/shipment/?partner_shipment_id=${shipmentId}`,
      );
      // If the shipment status is 'Planned', 'En route', or 'Arrived', filter the results accordingly
      query_params = query_params.concat(
        _.includes(['Planned', 'En route', 'Arrived'], shipmentResponse.data[0].status)
          ? '&status=Planned,En route,Arrived'
          : `&status=${shipmentResponse.data[0].status}`,
      );
    } else if (status) {
      // If status is provided, filter by the given status
      query_params = query_params.concat(`&status=${status}`);
    }
    // Fetch the shipments based on the constructed query parameters
    const shipmentResponse = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}shipment/shipment/${query_params}`,
    );
    // If shipments are found, filter out those with platform name 'ICLP'
    if (shipmentResponse && shipmentResponse.data) {
      const shipments = _.filter(
        shipmentResponse.data,
        (shipment) => _.toLower(shipment.platform_name) !== 'iclp',
      );
      return shipments;
    }
    // Return an empty array if no shipments are found
    return [];
  } catch (error) {
    // If an error occurs, show an alert and return an empty array
    getErrorMessage(section, error, 'load shipments data', displayAlert);
    return [];
  }
};
