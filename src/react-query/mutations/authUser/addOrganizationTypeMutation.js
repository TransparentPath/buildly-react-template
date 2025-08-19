// Import necessary hooks and utilities
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for performing and managing server state mutations
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility to extract and display readable error messages
import i18n from '../../../i18n/index';

/**
 * Custom hook to perform a mutation for adding a new organization type.
 *
 * @param {object} history - React Router's history object used for navigation after mutation
 * @param {string} redirectTo - The route path to redirect to after a successful mutation
 * @param {function} displayAlert - Function to show a notification/alert to the user (e.g., success or error)
 *
 * @returns {object} - The mutation object from useMutation, containing methods like mutate, status, data, etc.
 */
export const useAddOrganizationTypeMutation = (history, redirectTo, displayAlert, section) => {
  // Get the QueryClient instance to manage and invalidate cache
  const queryClient = useQueryClient();

  return useMutation(
    // Mutation function that performs the POST request to add a new organization type
    async (organizationTypeData) => {
      const response = await httpService.makeRequest(
        'post', // HTTP method
        `${window.env.API_URL}organization_type/`, // API endpoint to create a new organization type
        organizationTypeData, // Payload containing the organization type details
      );
      return response.data; // Return the response data to be available in mutation's `data` property
    },
    {
      // Callback triggered when the mutation is successful
      onSuccess: async () => {
        // Invalidate the query cache for organization types to ensure fresh data is fetched
        await queryClient.invalidateQueries({
          queryKey: ['organizationTypes'], // Query key associated with the organization types list
        });
        // Show a success alert to the user
        displayAlert('success', i18n.t('api.successMessages.Successfully added organization type'));
        // Redirect the user to a new route if history and redirectTo are provided
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      // Callback triggered when the mutation encounters an error
      onError: (error) => {
        // Display an appropriate error message to the user
        getErrorMessage(section, error, 'create organization type', displayAlert);
      },
    },
  );
};
