// Import the function used for OAuth2 password grant authentication
import authenticateWithCredentials from './main';
// Import lodash for utility functions like filtering and conversions
import _ from 'lodash';

/**
 * Retrieves the current access token from localStorage.
 * @returns {string|null} access_token if present, otherwise null
 */
const getAccessToken = () => {
  let accessToken = null;
  const tokenObj = JSON.parse(localStorage.getItem('token'));
  if (tokenObj) {
    accessToken = tokenObj.access_token;
  }
  return accessToken;
};

/**
 * Retrieves the current JWT token from localStorage.
 * JWT may be used instead of access_token for certain secure endpoints.
 * @returns {string|null} access_token_jwt if present, otherwise null
 */
const getJwtToken = () => {
  let jwtToken = null;
  const tokenObj = JSON.parse(localStorage.getItem('token'));
  if (tokenObj) {
    jwtToken = tokenObj.access_token_jwt;
  }
  return jwtToken;
};

/**
 * Retrieves the OAuth user object from localStorage.
 * @returns {object|null} OAuth user object if available, otherwise null
 */
const getOauthUser = () => {
  const oauthUser = (
    JSON.parse(localStorage.getItem('oauthUser'))
    || null
  );
  return oauthUser;
};

/**
 * Authenticates a user using the OAuth2 Password Grant flow.
 * Requires a valid username and password combination.
 *
 * @param {{username: string; password: string}} credentials - User's login credentials
 * @returns {Promise} A promise that resolves with the authentication response
 */
const authenticateWithPasswordFlow = (credentials) => {
  const oauthOptions = {
    clientId: window.env.OAUTH_CLIENT_ID, // Client ID configured for the app
    tokenUrl: window.env.OAUTH_TOKEN_URL, // URL to fetch OAuth token from
    returnPromise: true, // Ensure the request returns a promise
  };
  return authenticateWithCredentials(credentials, oauthOptions);
};

/**
 * Saves the authenticated OAuth user to localStorage.
 * This is usually the user profile returned from the server.
 *
 * @param {object} oauthUser - User object to persist
 * @returns {object|null} The stored user object or null
 */
const setOauthUser = (oauthUser) => {
  localStorage.setItem('oauthUser', JSON.stringify(oauthUser));
  return (oauthUser || null);
};

/**
 * Stores the currently authenticated core user in localStorage.
 * Filters the user list and saves the matching user by ID.
 *
 * @param {object} user - Object containing a list of users (`user.data`)
 * @param {object} coreuser - The selected core user object to match and store
 */
const setCurrentCoreUser = (user, coreuser) => {
  const currentUser = _.filter(
    user.data,
    (data) => data.id === coreuser.data.id,
  );
  localStorage.setItem(
    'currentUser',
    JSON.stringify(currentUser[0]),
  );
};

/**
 * Stores the OAuth token in localStorage and calculates the token expiration.
 * Also saves metadata like token expiration timestamp and when it was stored.
 *
 * @param {object} token - The full token response from the server
 */
const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem('token', JSON.stringify(token));
    if (token.expires_in) {
      // Multiply expiration time by configured session timeout
      const expiresMilliSec = token.expires_in * window.env.session_timeout;
      const now = new Date();
      const expiresAt = now.getTime() + expiresMilliSec;
      // Save expiration and timestamp data for later validation
      localStorage.setItem('expires_at', _.toString(expiresAt));
      localStorage.setItem('token_stored_at', _.toString(now));
    }
  }
};

/**
 * Checks whether the access token is still valid.
 * Compares the current time to the stored expiration time.
 *
 * @returns {boolean} True if token is present and not expired, else false
 */
const hasValidAccessToken = () => {
  if (getAccessToken()) {
    const expiresAt = localStorage.getItem('expires_at');
    const now = new Date();
    if (expiresAt && parseInt(expiresAt, 10) < now.getTime()) {
      return false;
    }
    return true;
  }
  return false;
};

/**
 * Logs out the user by clearing all stored tokens and user-related data.
 * This function ensures all traces of user session are removed.
 */
const logout = () => {
  if (getAccessToken()) {
    localStorage.removeItem('token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('token_stored_at');
    localStorage.removeItem('oauthUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('alertGrp');
    localStorage.removeItem('pushPreference');
    localStorage.removeItem('halfwayOrder');
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          if (cacheName.startsWith('workbox-precache')) {
            caches.delete(cacheName); // ✅ always call as method of caches
          }
        });
      });
    }
  }
};

// Exporting the OAuth service as an object containing all auth-related utilities
export const oauthService = {
  authenticateWithPasswordFlow,
  getOauthUser,
  setOauthUser,
  hasValidAccessToken,
  getAccessToken,
  setAccessToken,
  getJwtToken,
  logout,
  setCurrentCoreUser,
};
