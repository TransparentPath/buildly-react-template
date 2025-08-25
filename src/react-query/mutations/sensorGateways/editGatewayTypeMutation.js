import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for mutations and cache management
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle and extract error messages
import i18n from '../../../i18n/index';

/**
 * Custom hook to edit a gateway type.
 *
 * @param {Object} history - The history object used for navigation after the mutation.
 * @param {string} redirectTo - The route to redirect to after a successful mutation.
 * @param {Function} displayAlert - Function to display success/error alerts to the user.
 * @returns {Object} - The mutation object returned by `useMutation`.
 */
export const useEditGatewayTypeMutation = (history, redirectTo, displayAlert, section) => {
  const queryClient = useQueryClient(); // React Query hook for managing query cache

  return useMutation(
    /**
     * Mutation function that sends a PATCH request to edit the gateway type.
     *
     * @param {Object} gatewayTypeData - The data of the gateway type to be edited.
     * @returns {Promise} - The response data from the PATCH request.
     */
    async (gatewayTypeData) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}sensors/gateway_type/${gatewayTypeData.id}`,
        gatewayTypeData,
      );
      return response.data;
    },
    {
      /**
       * onSuccess callback invoked when the mutation is successful.
       * - Invalidates the cache for 'gatewayTypes' to refresh the list of gateway types.
       * - Displays a success alert using the `displayAlert` function.
       * - Optionally redirects to a specified route.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['gatewayTypes'], // Invalidates the query to ensure the data is updated
        });
        displayAlert('success', i18n.t('api.successMessages.Tracker type successfully edited!'));
        if (history && redirectTo) {
          history.push(redirectTo); // Redirects to the specified route if provided
        }
      },
      /**
       * onError callback invoked when the mutation fails.
       * - Displays an error message using `getErrorMessage` utility function.
       *
       * @param {Error} error - The error object returned from the failed mutation.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'edit tracker type', displayAlert); // Display error message
      },
    },
  );
};
