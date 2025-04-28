import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for data fetching and mutation
import _ from 'lodash'; // Utility library for handling data manipulations (not currently used in this snippet)
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle and display error messages

/**
 * Custom hook to initiate a PDF report generation and handle its download.
 *
 * This hook:
 * - Sends a POST request to generate a PDF report based on the provided filter data.
 * - Notifies the user that the report is being processed and when it's ready for download.
 * - Invalidates the 'shipments' query to refresh shipment data after the report generation.
 * - Displays success or error notifications via the provided alert function.
 *
 * @param {object} shipmentFilter - Filter object for the shipment data.
 * @param {string} locShipmentID - Shipment ID for the specific shipment location.
 * @param {string} organization - Organization identifier to be used for cache invalidation.
 * @param {Function} displayAlert - Function to display success, error, or informational alerts.
 * @returns {object} - Mutation object returned by useMutation.
 */
export const useReportPDFDownloadMutation = (
  shipmentFilter,
  locShipmentID,
  organization,
  displayAlert,
) => {
  // Get query client instance to manage query cache
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * The mutation function to generate and download the PDF report.
     *
     * @param {object} reportPDFData - The data to be sent in the request body to generate the PDF report.
     * @returns {Promise<object>} - The server's response data, containing the result of the report generation.
     */
    async (reportPDFData) => {
      // Notify the user that the report generation is in progress
      displayAlert('info', 'PDF Report (Processing may take several minutes)');
      // Make the POST request to the report generation endpoint
      const response = await httpService.makeRequestWithoutHeaders(
        'post', // HTTP method
        window.env.EMAIL_REPORT_URL, // API endpoint URL to generate the report
        reportPDFData, // Data to generate the report (e.g., shipment filters, parameters)
      );
      // Return the server's response, which should contain the result of the report generation
      return response.data;
    },
    {
      /**
       * onSuccess callback is invoked when the mutation succeeds.
       * - Displays a success message that the report is ready for download.
       * - Invalidates the 'shipments' query for the given filter, shipment ID, and organization.
       *
       * @param {object} data - The data returned from the mutation response (should contain report data or status).
       */
      onSuccess: async () => {
        // Show a success message when the report is ready for download
        displayAlert('success', 'You can now download the report');
        // Invalidate the 'shipments' query to refresh shipment data and ensure the UI shows the latest info
        await queryClient.invalidateQueries({
          queryKey: ['shipments', shipmentFilter, locShipmentID, organization],
        });
      },
      /**
       * onError callback is invoked when the mutation fails.
       * - Handles the error and displays an appropriate error message.
       *
       * @param {any} error - The error object returned from the mutation failure.
       */
      onError: (error) => {
        // Use the utility function to handle error and display the error message
        getErrorMessage(error, 'create report', displayAlert);
      },
    },
  );
};
