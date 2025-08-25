// Import necessary hooks and utilities
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for handling mutations and managing cache
import { httpService } from '@modules/http/http.service'; // Custom service for HTTP requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to format and display error messages
import i18n from '../../../i18n/index';

/**
 * Custom hook to delete an organization type using a mutation.
 *
 * @param {function} displayAlert - Function to show an alert or notification to the user (e.g., for success or error messages)
 *
 * @returns {object} - The mutation object from useMutation, providing methods like mutate, status, data, etc.
 */
export const useDeleteOrganizationTypeMutation = (displayAlert, section) => {
  // Get the React Query client instance to manage cache and query invalidation
  const queryClient = useQueryClient();

  return useMutation(
    // Mutation function that sends a DELETE request to remove the specified organization type
    async (organizationTypeId) => {
      await httpService.makeRequest(
        'delete', // HTTP method
        `${window.env.API_URL}organization_type/${organizationTypeId}`, // Endpoint with the organization type ID
      );
    },
    {
      // Called when the mutation completes successfully
      onSuccess: async () => {
        // Invalidate the cache for the 'organizationTypes' query to trigger a refetch with updated data
        await queryClient.invalidateQueries({
          queryKey: ['organizationTypes'], // Query key corresponding to the list of organization types
        });
        // Show a success alert to inform the user
        displayAlert('success', i18n.t('api.successMessages.Organization type deleted successfully!'));
      },
      // Called when the mutation fails with an error
      onError: (error) => {
        // Display a formatted error message using the provided utility
        getErrorMessage(section, error, 'delete organization type', displayAlert);
      },
    },
  );
};
