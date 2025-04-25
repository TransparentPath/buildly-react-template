// Importing the HTTP service utility to make API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to handle and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches export data based on the table and file type for export from the backend API.
 *
 * @param {string} exportTable - The name of the table to export data from (e.g., 'item', 'product').
 * @param {string} exportType - The type of export file (e.g., 'csv', 'xlsx').
 * @param {function} displayAlert - A callback function used to show error alerts to the user if the request fails.
 * @returns {Promise<Object|Array>} - Returns the exported data from the API if successful.
 *                                    Returns an empty array if the request fails or if no valid table is specified.
 */
export const getExportDataQuery = async (exportTable, exportType, displayAlert) => {
  // Initialize the endpoint variable to be set based on the table to export
  let endPoint;
  // Determine the correct API endpoint based on the table to export
  switch (exportTable) {
    case 'item':
    case 'product':
      // For item and product tables, use the 'shipment/file_export/' endpoint
      endPoint = 'shipment/file_export/';
      break;
    // Uncomment and complete for other cases, like 'gateway', if needed
    // case 'gateway':
    //   endPoint = 'sensors/file_export/';
    //   break;
    default:
      // If the table type doesn't match, leave the endpoint undefined
      break;
  }

  try {
    // Sending a GET request to fetch export data with the table name and export type as query parameters
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}${endPoint}?model=${exportTable}&file_type=${exportType}`, // Constructed API URL with query parameters
    );
    // Return the response data (exported file details) if the request is successful
    return response.data;
  } catch (error) {
    // If an error occurs, handle and display a descriptive error message
    getErrorMessage(error, 'export data', displayAlert);
    // Return an empty array to ensure the application can handle failure gracefully
    return [];
  }
};
