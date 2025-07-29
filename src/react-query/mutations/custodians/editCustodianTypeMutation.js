// Import necessary hooks and services
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for mutation and cache handling
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for error handling

/**
 * Custom hook for editing a custodian type.
 *
 * @param {Object} history - The history object for navigation after mutation
 * @param {string} redirectTo - The path to redirect to after success
 * @param {Function} displayAlert - Function to show success or error alerts
 *
 * @returns {Object} - React Query mutation object for editing custodian type
 */
export const useEditCustodianTypeMutation = (history, redirectTo, displayAlert, section) => {
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * The mutation function to send PATCH request to edit custodian type.
     *
     * @param {Object} custodianTypeData - The data to update the custodian type
     * @returns {Object} - The updated custodian type data
     */
    async (custodianTypeData) => {
      const response = await httpService.makeRequest(
        'patch', // HTTP PATCH method for partial updates
        `${window.env.API_URL}custodian/custodian_type/${custodianTypeData.id}`, // API endpoint for editing custodian type
        custodianTypeData, // The custodian type data to update
      );
      return response.data;
    },
    {
      /**
       * Callback executed after the mutation is successful.
       * This will invalidate the relevant queries to refresh data in the cache.
       */
      onSuccess: async () => {
        // Invalidate 'custodianTypes' query to refresh the data in the cache
        await queryClient.invalidateQueries({
          queryKey: ['custodianTypes'],
        });
        // Show success message
        displayAlert('success', 'Custodian type successfully edited!');
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
        getErrorMessage(section, error, 'edit custodian type', displayAlert);
      },
    },
  );
};
