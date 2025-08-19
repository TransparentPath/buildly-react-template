// Import necessary hooks and utilities
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for handling mutations and caching
import { httpService } from '@modules/http/http.service'; // Custom HTTP service abstraction for API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility for formatting and displaying error messages
import i18n from '../../../i18n/index';

/**
 * Custom hook to edit an existing organization type using a PATCH request.
 *
 * @param {object} history - React Router's history object, used for redirecting after success
 * @param {string} redirectTo - The path to redirect the user to after a successful update
 * @param {function} displayAlert - Function to display success or error messages to the user
 *
 * @returns {object} - The mutation object from useMutation (with methods like mutate, isLoading, etc.)
 */
export const useEditOrganizationTypeMutation = (history, redirectTo, displayAlert, section) => {
  // Get the query client instance for cache management
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function: Sends a PATCH request to update the organization type.
     *
     * @param {object} organizationTypeData - The updated data for the organization type, must include `id`
     * @returns {object} - The response data from the server
     */
    async (organizationTypeData) => {
      const response = await httpService.makeRequest(
        'patch', // HTTP method to partially update the resource
        `${window.env.API_URL}organization_type/${organizationTypeData.id}/`, // API endpoint with the organization type ID
        organizationTypeData, // Payload containing updated fields
      );
      return response.data; // Return response to be available in the mutation's `data`
    },
    {
      /**
       * Callback triggered on successful mutation.
       * - Invalidates cache to fetch updated organization type list.
       * - Displays a success message.
       * - Redirects user if routing information is provided.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['organizationTypes'], // Refetch organization types list to reflect updates
        });
        displayAlert('success', i18n.t('api.successMessages.Organization type successfully edited!'));
        if (history && redirectTo) {
          history.push(redirectTo); // Navigate to the specified route
        }
      },
      /**
       * Callback triggered if the mutation fails.
       * - Uses a utility to extract and display a meaningful error message.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'edit organization type', displayAlert);
      },
    },
  );
};
