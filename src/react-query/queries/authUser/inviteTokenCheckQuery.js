// Importing the HTTP service utility to make API requests
import { httpService } from '@modules/http/http.service';

/**
 * Checks the validity of an invitation token by making a GET request to the backend API.
 *
 * @param {string} token - The invitation token to be validated.
 * @param {function} displayAlert - A callback function used to show error alerts to the user if the token is invalid or the request fails.
 * @returns {Promise<Object|Array>} - Returns the token validation response data from the API if successful.
 *                                    Returns an empty array if the token is invalid or the request fails.
 */
export const inviteTokenCheckQuery = async (token, displayAlert) => {
  try {
    // Constructing the request URL with the token query parameter
    const response = await httpService.makeRequest(
      'get', // HTTP method
      `${window.env.API_URL}coreuser/invite_check/?token=${token}`, // API endpoint for checking the invite token
    );
    // Return the response data if the request is successful
    return response.data;
  } catch (error) {
    // If an error occurs (e.g., token is invalid or expired), show an alert to the user
    displayAlert('error', 'Invite token expired or invalid!');
    // Return an empty array to indicate failure and maintain consistent return type
    return [];
  }
};
