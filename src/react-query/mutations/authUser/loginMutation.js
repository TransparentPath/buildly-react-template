// Import required dependencies
import { useMutation } from 'react-query'; // React Query hook to perform mutations
import { httpService } from '@modules/http/http.service'; // Custom service to handle HTTP requests
import { oauthService } from '@modules/oauth/oauth.service'; // OAuth service to manage authentication and token storage
import { getErrorMessage } from '@utils/utilMethods'; // Utility to extract and display user-friendly error messages

/**
 * Custom hook to perform user login via OAuth password flow.
 *
 * @param {object} history - React Router's history object, used to redirect after successful login
 * @param {string} redirectTo - Path to navigate to after a successful login
 * @param {function} displayAlert - Function to show error messages or other alerts to the user
 * @param {function} timezone - Function to set or update the user's timezone after login
 *
 * @returns {object} - The mutation object from useMutation, including `mutate`, `isLoading`, `data`, and `error`
 */
export const useLoginMutation = (
  history,
  redirectTo,
  displayAlert,
  timezone,
) => useMutation(
  /**
   * Mutation function to handle the login process using OAuth password grant.
   *
   * @param {object} loginData - Object containing user credentials (e.g., username and password)
   * @returns {object} - Authenticated user data
   */
  async (loginData) => {
    // Authenticate user and retrieve token
    const token = await oauthService.authenticateWithPasswordFlow(loginData);
    // Store the access token for future requests
    oauthService.setAccessToken(token.data);
    // Fetch the current authenticated user's profile
    const user = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/me/`,
    );
    // Store OAuth user information, possibly for global state or session context
    oauthService.setOauthUser(user, { loginData });
    // Fetch additional user-related data (e.g., core user list or details)
    const coreuser = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/`,
    );
    // Store core user info for later use in the app
    oauthService.setCurrentCoreUser(coreuser, user);
    return user; // Return the user object as the result of the mutation
  },
  {
    /**
     * Called when login is successful.
     *
     * @param {object} data - The user data returned from the login process
     */
    onSuccess: async (data) => {
      // Update the timezone using the user's stored timezone
      await timezone(data.data.user_timezone);
      // Redirect the user to the desired route after login
      history.push(redirectTo);
    },
  },
  {
    /**
     * Called when login fails due to an error (e.g., bad credentials, server issue).
     *
     * @param {object} error - The error object thrown during the login attempt
     */
    onError: (error) => {
      getErrorMessage(error, 'sign in', displayAlert); // Display a user-friendly error message
    },
  },
);
