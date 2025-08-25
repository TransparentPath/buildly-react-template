// Import necessary modules and utilities
import { useMutation } from 'react-query'; // React Query hook for mutations
import { httpService } from '@modules/http/http.service'; // Custom HTTP request service
import { oauthService } from '@modules/oauth/oauth.service'; // OAuth service for user session management
import { getErrorMessage } from '@utils/utilMethods'; // Utility to format and display errors
import i18n from '../../../i18n/index';
/**
 * Custom hook to update user profile and organization details.
 *
 * This hook sends PATCH requests to update the user's profile and their organization's name.
 * It also refreshes the current user data and organization data to ensure the latest information is in sync.
 *
 * @param {Object} history - React Router's history object for navigation after success
 * @param {Function} displayAlert - Callback function to show success or error messages
 *
 * @returns {Object} - React Query mutation object, which can be used to trigger the update
 */
export const useUpdateUserMutation = (
  history,
  displayAlert,
  section,
) => useMutation(
  /**
   * The mutation function to update user profile and organization details.
   *
   * @param {Object} updateUserData - Contains updated user and organization information
   * @returns {Object} - The data submitted for the update (e.g., user profile and organization)
   */
  async (updateUserData) => {
    // Send PATCH request to update the user profile with the provided data
    await httpService.makeRequest(
      'patch',
      `${window.env.API_URL}coreuser/${updateUserData.id}/update_profile/`,
      updateUserData,
    );
    // Send PATCH request to update the organization name associated with the user
    await httpService.makeRequest(
      'patch',
      `${window.env.API_URL}organization/${updateUserData.organization_uuid}/`,
      { name: updateUserData.organization_name },
    );
    // Fetch the latest current user data and update OAuth user session
    const user = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/me/`,
    );
    oauthService.setOauthUser(user);
    // Fetch the latest core user data to ensure synchronization across the app
    const coreuser = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/`,
    );
    oauthService.setCurrentCoreUser(coreuser, user);
    return updateUserData; // Return updated user data for any further actions if needed
  },
  {
    /**
     * Callback to handle success after mutation completes.
     *
     * @param {Object} data - The data returned from the mutation (updated user data)
     */
    onSuccess: (data) => {
      // If the user's language is changed, alert and reload the page to apply the changes
      if (history) {
        // Redirect user to the home page and then back to the current route
        const route = window.location.pathname;
        history.push('/');
        history.push(route);
      } else {
        // If no history object is available, just display a success message
        displayAlert('success', i18n.t('api.successMessages.Account details successfully updated'));
      }
    },
    /**
     * Callback to handle errors during the mutation request.
     *
     * @param {Object} error - The error object returned by the failed request
     */
    onError: (error) => {
      // Use a utility function to handle and display error messages to the user
      getErrorMessage(section, error, 'update user details', displayAlert);
    },
  },
);
