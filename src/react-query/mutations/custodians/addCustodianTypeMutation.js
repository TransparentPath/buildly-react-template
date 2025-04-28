// Import necessary hooks and services
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks
import { httpService } from '@modules/http/http.service'; // Custom HTTP service to make API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for error handling

/**
 * Custom hook for adding a new custodian type.
 *
 * @param {Function} history - React Router's history for navigation
 * @param {string} redirectTo - The path to redirect to after a successful mutation
 * @param {Function} displayAlert - A function for displaying alerts (success or error)
 *
 * @returns {Object} - React Query mutation object for adding a custodian type
 */
export const useAddCustodianTypeMutation = (history, redirectTo, displayAlert) => {
  // Create a query client to manage cache and invalidate queries
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * The mutation function to send a POST request and add a new custodian type.
     *
     * @param {Object} custodianTypeData - The data for the new custodian type
     * @returns {Object} - The response data after creating the custodian type
     */
    async (custodianTypeData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}custodian/custodian_type/`, // API endpoint to create custodian type
        custodianTypeData, // Data for the new custodian type
      );
      return response.data;
    },
    {
      /**
       * Callback executed after the mutation is successful.
       * This invalidates the relevant queries and redirects the user if necessary.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['custodianTypes'], // Invalidate the 'custodianTypes' query to refresh the data
        });
        // Display a success alert
        displayAlert('success', 'Successfully added custodian type');
        // Redirect the user to the specified path if history and redirectTo are provided
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      /**
       * Callback executed if an error occurs during the mutation.
       * This handles errors by displaying an appropriate message.
       *
       * @param {Object} error - The error from the mutation request
       */
      onError: (error) => {
        getErrorMessage(error, 'create custodian type', displayAlert);
      },
    },
  );
};
