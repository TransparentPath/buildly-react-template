// Import necessary modules and utilities
import { useMutation } from 'react-query'; // Hook to perform and manage async mutations
import { httpService } from '@modules/http/http.service'; // Custom HTTP utility for API requests
import { routes } from '@routes/routesConstants'; // Route constants used for navigation
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle error formatting and display

/**
 * Custom hook to request a password reset by sending an email to the user.
 * Typically used when a user submits their email to reset a forgotten password.
 *
 * @param {function} displayAlert - Function to show success or error messages to the user
 * @param {function} setError - Function to manually set form-level errors (e.g., for email field)
 * @param {object} history - React Router history object, used to navigate after successful email submission
 *
 * @returns {object} - A mutation object from React Query with `mutate`, `isLoading`, etc.
 */
export const useResetPasswordMutation = (
  displayAlert,
  setError,
  history,
  section,
) => useMutation(
  /**
   * Mutation function to send the reset password email.
   *
   * @param {object} resetData - Payload containing the user's email (e.g., { email: "user@example.com" })
   * @returns {object} - API response from the backend
   */
  async (resetData) => {
    const response = await httpService.makeRequest(
      'post', // HTTP method
      `${window.env.API_URL}coreuser/reset_password/`, // API endpoint to send reset email
      resetData, // Payload containing the email
    );
    return response.data; // Return response to be used in onSuccess
  },
  {
    /**
     * Called when the reset email request is successful.
     *
     * @param {object} data - Response from the backend (e.g., { detail: "...", count: 1 })
     * @param {object} variables - The original resetData (e.g., contains email)
     */
    onSuccess: async (data, variables) => {
      if (data && data.count > 0) {
        // If the backend confirms at least 1 user received the email
        if (history) {
          // Navigate to the email verification screen, passing the email in route state
          history.push({
            pathname: routes.VERIFICATION,
            state: { email: variables.email },
          });
        } else {
          // If no navigation, just show a success alert
          displayAlert('success', data.detail);
        }
      } else {
        // If count is 0 (i.e., no user found), set form error for the email field
        setError({
          email: {
            error: true,
            message: 'Email not registered. Re-enter correct email. Otherwise, contact support@transparentpath.com',
          },
        });
      }
    },
    /**
     * Called if the request fails (e.g., network error, invalid email).
     *
     * @param {object} error - Error object from the failed request
     */
    onError: (error) => {
      getErrorMessage(section, error, 'send the email', displayAlert); // Show user-friendly error message
    },
  },
);
