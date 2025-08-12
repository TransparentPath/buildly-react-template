// Importing necessary dependencies
import { useMutation, useQueryClient } from 'react-query'; // `useMutation` hook from React Query to handle mutations (API requests)
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle and display error messages
import i18n from '../../../i18n/index';

/**
 * Custom hook to delete an existing shipment template.
 * This hook handles the process of sending a request to delete a shipment template by its ID.
 *
 * @param {string} organization - The organization ID used for cache management and querying the shipment templates.
 * @param {Function} displayAlert - A function used to display alerts to the user (e.g., success or error messages).
 * @returns {Object} The mutation object, which includes the mutate function for triggering the mutation.
 */
export const useDeleteShipmentTemplateMutation = (section, organization, displayAlert) => {
  const queryClient = useQueryClient(); // React Query's queryClient to manage cache invalidation and query refetching

  return useMutation(
    /**
     * The mutation function that performs the API request to delete a shipment template by its ID.
     * It sends a DELETE request to the server to remove the shipment template from the database.
     *
     * @param {string} shipmentTemplateId - The ID of the shipment template to delete.
     * @returns {Promise} - The response from the API indicating the deletion process.
     */
    async (shipmentTemplateId) => {
      await httpService.makeRequest(
        'delete', // HTTP method (DELETE)
        `${window.env.API_URL}shipment/shipment_template/${shipmentTemplateId}/`, // API endpoint to delete the shipment template by ID
      );
    },
    // Mutation configuration object
    {
      /**
       * onSuccess callback: This function is triggered when the mutation (API request) succeeds.
       * It performs the following actions:
       *  - Invalidates the cache for shipment templates to ensure the data is fresh after deletion.
       *  - Displays a success alert to notify the user that the template was deleted successfully.
       */
      onSuccess: async () => {
        // Invalidate the query to refresh the shipment templates data for the given organization
        await queryClient.invalidateQueries({
          queryKey: ['shipmentTemplates', organization], // Query key for shipment templates related to the organization
        });
        // Display a success alert to inform the user about the successful deletion
        displayAlert('success', i18n.t('api.successMessages.Successfully deleted template'));
      },
      /**
       * onError callback: This function is triggered when the mutation fails.
       * It handles the error by extracting the error message and displaying it to the user.
       *
       * @param {Error} error - The error object containing the failure details.
       */
      onError: (error) => {
        // Use the utility function to extract and display an error message
        getErrorMessage(section, error, 'delete shipment template', displayAlert);
      },
    },
  );
};
