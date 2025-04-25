// Import required modules and utilities
import { useMutation } from 'react-query'; // React Query's mutation hook for handling async POST/PUT/DELETE operations
import { httpService } from '@modules/http/http.service'; // HTTP service module to make API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility to handle and display error messages

/**
 * Custom hook to confirm and finalize password reset.
 *
 * This hook is typically used after the user submits their new password from the reset password form.
 *
 * @param {object} history - React Router's history object used for redirecting after success
 * @param {string} redirectTo - Route to redirect to after successful password reset (e.g., login page)
 * @param {function} displayAlert - Function to display success or error alerts to the user
 *
 * @returns {object} - React Query mutation object (`mutate`, `isLoading`, `data`, etc.)
 */
export const useResetPasswordConfirmMutation = (
  history,
  redirectTo,
  displayAlert,
) => useMutation(
  /**
   * Mutation function that submits the new password and validates the reset token and UID.
   *
   * @param {object} resetConfirmData - Object containing new password, UID, and token
   * @returns {object} - Response data from the backend
   */
  async (resetConfirmData) => {
    const response = await httpService.makeRequest(
      'post', // HTTP method
      `${window.env.API_URL}coreuser/reset_password_confirm/`, // API endpoint for confirming password reset
      resetConfirmData, // Payload including new password, token, and uid
    );
    return response.data; // Return response for use in `onSuccess`
  },
  {
    /**
     * Called when the password reset is successful.
     *
     * @param {object} data - Response data from the backend
     */
    onSuccess: async (data) => {
      displayAlert('success', data.detail); // Show a success message (e.g., "Your password has been reset successfully.")
      history.push(redirectTo); // Redirect the user (typically to the login page)
    },
    /**
     * Called if the password reset request fails.
     *
     * @param {object} error - Error object returned by the server
     */
    onError: (error) => {
      getErrorMessage(error, 'reset the password', displayAlert); // Show a user-friendly error message
    },
  },
);
