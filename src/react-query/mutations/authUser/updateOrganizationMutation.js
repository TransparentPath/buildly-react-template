// Import React Query's mutation hook and query client
import { useMutation, useQueryClient } from 'react-query';
// Import custom HTTP request and OAuth utility services
import { httpService } from '@modules/http/http.service';
import { oauthService } from '@modules/oauth/oauth.service';
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Custom hook to update organization settings.
 *
 * This hook sends a PATCH request with updated organization data, and then refreshes the
 * current user's session and core user data from the server to ensure consistency after update.
 *
 * @param {Function} discardFormData - Callback to reset or clear form data after successful update
 * @param {Function} displayAlert - Callback to show success or error messages to the user
 *
 * @returns {Object} - React Query mutation object (e.g., mutate, isLoading, etc.)
 */
export const useUpdateOrganizationMutation = (discardFormData, displayAlert) => {
  // Access the query client to invalidate or refetch related data after mutation
  const queryClient = useQueryClient();
  return useMutation(
    /**
     * Mutation function to send updated organization data to the backend.
     *
     * @param {Object} organizationData - The updated organization object, must include `organization_uuid`
     * @returns {Object} - The response data from the backend after update
     */
    async (organizationData) => {
      // Send PATCH request to update the organization
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}organization/${organizationData.organization_uuid}/`,
        organizationData,
      );
      // Refresh and update current OAuth user profile
      const user = await httpService.makeRequest(
        'get',
        `${window.env.API_URL}coreuser/me/`,
      );
      oauthService.setOauthUser(user);
      // Refresh and update the current core user context
      const coreuser = await httpService.makeRequest(
        'get',
        `${window.env.API_URL}coreuser/`,
      );
      oauthService.setCurrentCoreUser(coreuser, user);
      return response.data;
    },
    {
      /**
       * Callback executed after a successful mutation.
       * It refreshes related queries, shows a success message, and resets the form.
       */
      onSuccess: async () => {
        // Invalidate cached organization queries to ensure UI updates with fresh data
        await queryClient.invalidateQueries({
          queryKey: ['organizations'],
        });
        // Show success message to user
        displayAlert('success', 'Organization settings successfully updated!');
        // Discard form data (e.g., close modal or clear input fields)
        discardFormData();
      },
      /**
       * Callback executed when the mutation fails.
       * Displays a formatted error message to the user.
       *
       * @param {Object} error - Error object returned from the failed request
       */
      onError: (error) => {
        getErrorMessage(error, 'update organization settings', displayAlert);
      },
    },
  );
};
