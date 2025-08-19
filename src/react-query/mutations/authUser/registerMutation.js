// Import necessary dependencies
import { useMutation } from 'react-query'; // React Query hook for managing mutations (like form submissions)
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for displaying user-friendly error messages
import i18n from '../../../i18n/index';

/**
 * Custom hook to handle user registration logic.
 *
 * @param {object} history - React Router's history object, used for navigation after successful registration
 * @param {string} redirectTo - The path to redirect the user to after a successful registration
 * @param {function} displayAlert - Function to display success or error messages to the user
 *
 * @returns {object} - Mutation object with methods and state (e.g. `mutate`, `isLoading`, `error`, etc.)
 */
export const useRegisterMutation = (
  history,
  redirectTo,
  displayAlert,
  section,
) => useMutation(
  /**
   * Mutation function to send registration data to the backend.
   *
   * @param {object} registerData - Object containing registration form data (e.g. name, email, password, etc.)
   * @returns {object} - Full API response from the server
   */
  async (registerData) => {
    const response = await httpService.makeRequest(
      'post', // HTTP method
      `${window.env.API_URL}coreuser/`, // Endpoint for user registration
      registerData, // Registration form data payload
    );
    return response; // Return full response to be available via mutation's `data`
  },
  {
    /**
     * Called when the mutation completes successfully.
     * - Displays a success message.
     * - Redirects the user to a different route (e.g. login page or dashboard).
     */
    onSuccess: async () => {
      displayAlert('success', i18n.t('api.successMessages.Registration was successful')); // Show success alert
      history.push(redirectTo); // Redirect user to the specified route
    },
    /**
     * Called when the mutation encounters an error (e.g. validation failure, server error).
     * - Displays a user-friendly error message.
     *
     * @param {object} error - Error object returned from the failed request
     */
    onError: (error) => {
      getErrorMessage(section, error, 'register', displayAlert); // Show formatted error alert
    },
  },
);
