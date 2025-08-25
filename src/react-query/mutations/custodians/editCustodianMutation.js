// Import necessary hooks and services
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for error handling
import i18n from '../../../i18n/index';

/**
 * Custom hook for editing custodian and its contact information.
 *
 * @param {string} organization - The organization context for cache invalidation
 * @param {Object} history - The history object for navigation after mutation
 * @param {string} redirectTo - The path to redirect to after success
 * @param {Function} displayAlert - Function to show success or error alerts
 *
 * @returns {Object} - React Query mutation object for editing custodian
 */
export const useEditCustodianMutation = (
  organization,
  history,
  redirectTo,
  displayAlert,
  section,
) => {
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * The mutation function to send PATCH requests to edit custodian and contact.
     *
     * @param {Array} arrayData - Array containing custodian data and contact data
     * @returns {Object} - The updated custodian data
     */
    async (arrayData) => {
      const [custodianData, contactData] = arrayData;
      // Update the contact data if present
      if (contactData) {
        await httpService.makeRequest(
          'patch', // HTTP PATCH method for partial updates
          `${window.env.API_URL}custodian/contact/${contactData.id}`, // API endpoint for editing the contact
          contactData, // The contact data to update
        );
      }
      // Update the custodian data
      const custodianResponse = await httpService.makeRequest(
        'patch', // HTTP PATCH method for partial updates
        `${window.env.API_URL}custodian/custodian/${custodianData.id}`, // API endpoint for editing the custodian
        custodianData, // The custodian data to update
      );
      return custodianResponse;
    },
    {
      /**
       * Callback executed after the mutation is successful.
       * This will invalidate the relevant queries to refresh data in the cache.
       */
      onSuccess: async () => {
        // Invalidate 'custodians' query and 'contact' query for the given organization
        await queryClient.invalidateQueries({
          queryKey: ['custodians', organization],
        });
        await queryClient.invalidateQueries({
          queryKey: ['contact', organization],
        });
        // Show success message
        displayAlert('success', i18n.t('api.successMessages.Custodian successfully edited!'));
        // Navigate to the redirectTo path if provided
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      /**
       * Callback executed if an error occurs during the mutation.
       * It handles errors and displays an appropriate message.
       *
       * @param {Object} error - The error returned from the mutation
       */
      onError: (error) => {
        // Call utility function to handle and display the error message
        getErrorMessage(section, error, 'edit custodian', displayAlert);
      },
    },
  );
};
