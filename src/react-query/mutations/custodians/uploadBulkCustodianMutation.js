// Import necessary hooks and services
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for mutation and cache handling
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for error handling

/**
 * Custom hook for uploading bulk custodians data.
 *
 * @param {string} organization - The organization ID to associate custodians with
 * @param {Function} displayAlert - Function to show success or error alerts
 *
 * @returns {Object} - React Query mutation object for uploading bulk custodians
 */
export const useUploadBulkCustodianMutation = (organization, displayAlert, section) => {
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * The mutation function for uploading bulk custodian data.
     *
     * @param {FormData} formData - The FormData containing the bulk custodian file
     * @returns {Object} - The response data from the upload request
     */
    async (formData) => {
      const uploadResponse = await httpService.makeMultipartRequest(
        'post', // HTTP POST method for uploading data
        `${window.env.CUSTODIAN_URL}upload_bulk_custodians/`, // API endpoint for uploading bulk custodians
        formData, // The form data containing the bulk custodian file
      );
      return uploadResponse.data;
    },
    {
      /**
       * Callback executed after the mutation is successful.
       * This will invalidate relevant queries to refresh data in the cache.
       *
       * @param {Object} data - The response data from the upload request
       */
      onSuccess: async (data) => {
        // Invalidate relevant queries to ensure the latest data is fetched
        await queryClient.invalidateQueries({
          queryKey: ['custodians', organization],
        });
        await queryClient.invalidateQueries({
          queryKey: ['contact', organization],
        });
        // Display success message from the response
        displayAlert('success', data.message);
      },
      /**
       * Callback executed if an error occurs during the mutation.
       * It handles errors and displays an appropriate message.
       *
       * @param {Object} error - The error returned from the mutation
       */
      onError: (error) => {
        // Call utility function to handle and display the error message
        getErrorMessage(section, error, 'upload bulk custodian', displayAlert);
      },
    },
  );
};
