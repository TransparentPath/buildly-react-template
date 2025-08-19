// Import necessary hooks and services
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks
import { httpService } from '@modules/http/http.service'; // Custom HTTP service to make API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for error handling
import i18n from '../../../i18n/index';

/**
 * Custom hook for deleting a custodian type.
 *
 * @param {Function} displayAlert - A function to show success or error messages
 *
 * @returns {Object} - React Query mutation object for deleting a custodian type
 */
export const useDeleteCustodianTypeMutation = (displayAlert, section) => {
  // Create a query client to manage cache and invalidate queries
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * The mutation function to send a DELETE request to remove a custodian type.
     *
     * @param {string} custodianTypeId - The ID of the custodian type to delete
     * @returns {undefined} - No return value
     */
    async (custodianTypeId) => {
      await httpService.makeRequest(
        'delete', // HTTP DELETE method
        `${window.env.API_URL}custodian/custodian_type/${custodianTypeId}`, // API endpoint for deleting the custodian type
      );
    },
    {
      /**
       * Callback executed after the mutation is successful.
       * This invalidates the relevant queries to refresh the data.
       */
      onSuccess: async () => {
        // Invalidate the 'custodianTypes' query to refresh the list of custodian types
        await queryClient.invalidateQueries({
          queryKey: ['custodianTypes'],
        });
        // Display a success alert
        displayAlert('success', i18n.t('api.successMessages.Custodian type deleted successfully!'));
      },
      /**
       * Callback executed if an error occurs during the mutation.
       * This handles errors by displaying an appropriate message.
       *
       * @param {Object} error - The error from the mutation request
       */
      onError: (error) => {
        // Call utility function to get the error message and display it
        getErrorMessage(section, error, 'delete custodian type', displayAlert);
      },
    },
  );
};
