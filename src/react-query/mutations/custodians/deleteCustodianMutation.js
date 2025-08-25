// Import necessary hooks and services
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks
import { httpService } from '@modules/http/http.service'; // Custom HTTP service to make API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for error handling
import i18n from '../../../i18n/index';

/**
 * Custom hook for deleting a custodian and its associated contact.
 *
 * @param {string} organization - The organization for which the custodian data is stored
 * @param {Function} displayAlert - A function for displaying success or error alerts
 *
 * @returns {Object} - React Query mutation object for deleting a custodian
 */
export const useDeleteCustodianMutation = (organization, displayAlert, section) => {
  // Create a query client to manage cache and invalidate queries
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * The mutation function to send DELETE requests and delete a custodian and its contact.
     *
     * @param {Array} dataArray - Array containing custodian ID and contact ID
     * @returns {undefined} - No return value
     */
    async (dataArray) => {
      const [custodianId, contactId] = dataArray;
      // Send DELETE request to remove the custodian
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}custodian/custodian/${custodianId}`, // API endpoint for deleting the custodian
      );
      // Send DELETE request to remove the contact data for the custodian
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}custodian/contact/${contactId}`, // API endpoint for deleting the contact data
      );
    },
    {
      /**
       * Callback executed after the mutation is successful.
       * This invalidates the relevant queries to ensure data is updated.
       */
      onSuccess: async () => {
        // Invalidate the 'custodians' query to refresh the data
        await queryClient.invalidateQueries({
          queryKey: ['custodians', organization],
        });
        // Invalidate the 'contact' query to refresh the data
        await queryClient.invalidateQueries({
          queryKey: ['contact', organization],
        });
        // Display a success alert
        displayAlert('success', i18n.t('api.successMessages.Custodian deleted successfully!'));
      },
      /**
       * Callback executed if an error occurs during the mutation.
       * This handles errors by displaying an appropriate message.
       *
       * @param {Object} error - The error from the mutation request
       */
      onError: (error) => {
        // Call utility function to get the error message and display it
        getErrorMessage(section, error, 'delete custodian', displayAlert);
      },
    },
  );
};
