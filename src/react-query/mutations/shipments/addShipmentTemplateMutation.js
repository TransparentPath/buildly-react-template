// Importing necessary dependencies
import { useMutation, useQueryClient } from 'react-query'; // `useMutation` hook from React Query to handle mutations (API requests)
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle and display error messages
import i18n from '../../../i18n/index';

/**
 * Custom hook to add a new shipment template.
 * This hook handles the process of sending a request to create a new shipment template.
 *
 * @param {string} organization - The organization ID used for cache management and querying the shipment templates.
 * @param {Function} displayAlert - A function used to display alerts to the user (e.g., success or error messages).
 * @returns {Object} The mutation object, which includes the mutate function for triggering the mutation.
 */
export const useAddShipmentTemplateMutation = (organization, displayAlert, section) => {
  const queryClient = useQueryClient(); // React Query's queryClient to manage cache invalidation and query refetching

  return useMutation(
    /**
     * The mutation function that performs the API request to create a new shipment template.
     * It sends a POST request with the template data to the server to create a new shipment template.
     *
     * @param {Object} shipmentTemplateData - The data used to create a new shipment template, including the template details.
     * @returns {Promise} - The response from the API, which contains the created shipment template data.
     */
    async (shipmentTemplateData) => {
      const response = await httpService.makeRequest(
        'post', // HTTP method (POST)
        `${window.env.API_URL}shipment/shipment_template/`, // API endpoint to create a new shipment template
        shipmentTemplateData, // Shipment template data to be sent in the request body
      );
      return response.data; // Return the response data which contains the created template details
    },
    // Mutation configuration object
    {
      /**
       * onSuccess callback: This function is triggered when the mutation (API request) succeeds.
       * It performs the following actions:
       *  - Invalidates the cache for shipment templates to ensure the data is fresh.
       *  - Displays a success alert to notify the user that the template was added successfully.
       *
       * @param {Object} res - The response data from the API, which contains the created shipment template.
       */
      onSuccess: async (res) => {
        // Invalidate the query to refresh the shipment templates data for the given organization
        await queryClient.invalidateQueries({
          queryKey: ['shipmentTemplates', organization], // Query key for shipment templates related to the organization
        });
        // Display a success alert with the name of the created template
        displayAlert('success', `${i18n.t('api.successMessages.Successfully added template')} ${res.name}`);
      },
      /**
       * onError callback: This function is triggered when the mutation fails.
       * It handles the error by extracting the error message and displaying it to the user.
       *
       * @param {Error} error - The error object containing the failure details.
       */
      onError: (error) => {
        // Use the utility function to extract and display an error message
        getErrorMessage(section, error, 'create shipment template', displayAlert);
      },
    },
  );
};
