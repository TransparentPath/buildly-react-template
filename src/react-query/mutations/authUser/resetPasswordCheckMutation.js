// Import necessary modules and utilities
import { useMutation } from 'react-query'; // Hook for performing mutations (e.g., POST requests)
import { httpService } from '@modules/http/http.service'; // Centralized HTTP request utility
import { getErrorMessage } from '@utils/utilMethods'; // Helper to extract and display meaningful error messages

/**
 * Custom hook to verify the password reset token and user ID.
 *
 * This is typically used after the user clicks a password reset link from their email,
 * and we need to validate the link before proceeding to the actual password reset form.
 *
 * @param {object} history - React Router's history object, used for programmatic navigation
 * @param {string} resetRedirectTo - Base route to navigate to the password reset form (e.g., '/reset-password')
 * @param {string} loginRedirectTo - Fallback route to redirect to login if the token is invalid
 * @param {function} displayAlert - Function used to show alert messages to the user
 *
 * @returns {object} - Mutation object from `useMutation` with `mutate`, `isLoading`, `data`, `error`, etc.
 */
export const useResetPasswordCheckMutation = (
  history,
  resetRedirectTo,
  loginRedirectTo,
  displayAlert,
  section,
) => useMutation(
  /**
   * Mutation function to validate reset token and user ID.
   *
   * @param {object} checkData - Object containing the token and uid from the reset email
   * @returns {object} - Response data from the server
   */
  async (checkData) => {
    const response = await httpService.makeRequest(
      'post', // HTTP method
      `${window.env.API_URL}coreuser/reset_password_check/`, // Endpoint to validate reset link
      checkData, // Payload containing uid and token
    );
    // If the check is successful, redirect to the actual reset password form with uid and token in the URL
    if (response.data && response.data.success) {
      history.push(`${resetRedirectTo}/${response.data.uid}/${response.data.token}/`);
    } else {
      // If the response indicates failure (e.g., expired or invalid token), show error and redirect to login
      displayAlert('error', 'Invalid ID or token. Try resending the link to your email');
      history.push(loginRedirectTo);
    }
    return response.data; // Return the server response for further use if needed
  },
  {
    /**
     * Error handler for when the request fails (e.g., network error or server error).
     *
     * @param {object} error - Error object from the failed API request
     */
    onError: (error) => {
      getErrorMessage(section, error, 'reset the password', displayAlert); // Show formatted error message
    },
  },
);
