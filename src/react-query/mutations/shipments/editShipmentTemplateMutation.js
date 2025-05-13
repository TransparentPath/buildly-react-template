// Import necessary hooks and utilities
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for mutation and cache
import { httpService } from '@modules/http/http.service'; // Custom HTTP request service
import { getErrorMessage } from '@utils/utilMethods'; // Utility to format and display error messages

/**
 * Custom React hook to handle editing a shipment template.
 *
 * This hook performs a PATCH request to update the details of a shipment template.
 * It also handles success and error notifications, and refreshes the relevant cache.
 *
 * @param {string} organization - Organization identifier used for cache invalidation.
 * @param {Function} displayAlert - Callback to show success or error alerts to the user.
 *
 * @returns {Object} - A React Query mutation object including the mutate function.
 */
export const useEditShipmentTemplateMutation = (
  organization,
  displayAlert,
) => {
  // Initialize React Query's query client to manage and invalidate cached queries
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function to send a PATCH request for editing the shipment template.
     *
     * @param {Object} shipmentTemplateData - The data payload for the shipment template update.
     * @returns {Object} - The response data after the template has been updated.
     */
    async (shipmentTemplateData) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}shipment/shipment_template/${shipmentTemplateData.id}/`,
        shipmentTemplateData,
      );
      return response.data;
    },
    {
      /**
       * Called when the mutation is successful.
       * - Invalidates the shipment template query to refresh the data.
       * - Displays a success alert with the name of the updated template.
       *
       * @param {Object} res - The response data returned by the mutation.
       */
      onSuccess: async (res) => {
        await queryClient.invalidateQueries({
          queryKey: ['shipmentTemplates', organization],
        });
        displayAlert('success', `Successfully edited template ${res.name}`);
      },
      /**
       * Called if the mutation fails.
       * - Displays an error message via `getErrorMessage`.
       *
       * @param {Object} error - The error object from the failed mutation.
       */
      onError: (error) => {
        getErrorMessage(error, 'edit shipment template', displayAlert);
      },
    },
  );
};
