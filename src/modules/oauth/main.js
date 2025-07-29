// Import the custom HTTP request utility used to send network requests.
// This is likely a wrapper over Axios that supports both Promises and Observables.
import request from '@modules/http/main';

/**
 * Authenticates a user using the OAuth2 Password Grant flow.
 *
 * This method is typically used when the user provides their username and password directly
 * (not recommended for public clients or production unless it's a trusted first-party app).
 *
 * @param {Object} credentials - An object containing user login information.
 *   @param {string} credentials.username - The username or email of the user.
 *   @param {string} credentials.password - The user's password.
 *
 * @param {Object} options - An object containing OAuth-specific configuration.
 *   @param {string} options.clientId - The OAuth client ID issued by the authentication server.
 *   @param {string} options.tokenUrl - The full URL to the OAuth token endpoint.
 *   @param {boolean} options.returnPromise - Whether to return a Promise (true) or an Observable (false).
 *
 * @returns {Promise|Observable} - Returns a response (Promise or Observable) with the token data or error.
 */
const authenticateWithCredentials = (credentials, options) => {
  // Destructure user credentials
  const { username, password } = credentials;

  // Destructure OAuth options
  const { clientId, tokenUrl, returnPromise } = options;

  // Create a new FormData object to encode request body as `application/x-www-form-urlencoded`
  const oauthData = new FormData();
  oauthData.set('grant_type', 'password'); // Set grant type to 'password' for this flow
  oauthData.set('username', username); // Set the username in the form data
  oauthData.set('password', password); // Set the password in the form data
  oauthData.set('client_id', clientId); // Set the client ID for the application making the request

  // Prepare options for the HTTP client
  const httpClientOptions = {
    method: 'POST', // HTTP method must be POST for token requests
    data: oauthData, // Send the form data in the request body
    returnPromise, // Flag to determine if we return a Promise or Observable
  };

  // Send the request using the `request` function with the specified token endpoint and config
  return request(tokenUrl, httpClientOptions);
};

// Export the function for use in authentication workflows
export default authenticateWithCredentials;
