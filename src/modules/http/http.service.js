// Import the oauthService which provides methods to retrieve authentication tokens (JWT or Access Tokens)
import { oauthService } from '../oauth/oauth.service';
// Import a custom request utility that likely wraps a library like Axios for making HTTP requests
import request from './main';

/**
 * Sends a configured HTTP request using the custom `request` utility.
 *
 * @param {string} method - HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @param {string} url - The API endpoint to send the request to (e.g., '/contacts').
 * @param {any=} body - Optional payload to be sent with the request.
 * @param {boolean=} useJwt - Flag indicating whether to use JWT (`true`) or Bearer token (`false`).
 * @param {string=} contentType - Optional content type for the request. (Commented out for GCP support).
 * @param {string=} responseType - Optional response type (e.g., 'blob', 'json', etc.).
 * @param {Object=} requestHeader - Optional custom headers to include in the request.
 *
 * @returns {Promise} - A promise resolving to the server response or an error.
 */
function makeRequest(method, url, body, useJwt, contentType, responseType, requestHeader) {
  let token;
  let tokenType;
  // Determine which token type to use
  if (useJwt) {
    tokenType = 'JWT'; // Use JWT if `useJwt` is true
    token = oauthService.getJwtToken();
  } else {
    tokenType = 'Bearer'; // Default to Bearer token
    token = oauthService.getAccessToken();
  }
  // Set default headers with Authorization
  let headers = {
    Authorization: `${tokenType} ${token}`,
    // 'Content-Type': contentType || 'application/json',
    // (Commented out to avoid issues with Google Cloud Platform file uploads or other content types)
  };
  // Only set 'Content-Type' if the request method is not GET or OPTIONS
  if (method !== 'GET' && method !== 'get' && method !== 'OPTIONS' && method !== 'options') {
    headers['Content-Type'] = 'application/json'; // Default content type for POST/PUT/DELETE
  }
  // Merge custom headers if provided
  if (requestHeader) {
    headers = {
      ...headers,
      requestHeader, // Custom header gets merged in (e.g., 'x-custom-header')
    };
  }
  // Compose the request options for the `request` utility
  const options = {
    method, // HTTP method
    data: body, // Payload body
    headers, // Authorization + optional headers
    returnPromise: true, // Ensure the request returns a Promise
    responseType: responseType || null, // Optional response type
  };
  // Execute the request and return the response promise
  return request(url, options);
}

/**
 * Sends a pre-flight OPTIONS request to an API endpoint using native `fetch`.
 * This is typically used for CORS or token exchange scenarios.
 *
 * @param {string} method - HTTP method, generally 'OPTIONS'.
 * @param {string} url - API endpoint.
 * @param {boolean} useJwt - Whether to include JWT in the Authorization header.
 *
 * @returns {Promise} - A promise resolving to the server response.
 */
function makeOptionsRequest(method, url, useJwt) {
  let token;
  let tokenType;
  // Use JWT if requested
  if (useJwt) {
    tokenType = 'JWT';
    token = oauthService.getJwtToken();
  }
  // Set Authorization header with the JWT
  const headers = {
    Authorization: `${tokenType} ${token}`,
  };
  // Optionally send metadata (like issuer info) in the body
  const body = {
    jwt_iss: 'Buildly', // Custom issuer (can be used for identity verification)
  };
  // Set up options for native fetch request
  const options = {
    method,
    headers,
    returnPromise: true, // Not native to fetch, but possibly used in consuming code
  };
  // Send the request using fetch
  return fetch(url, options);
}

/**
 * Sends an HTTP request **without any headers**.
 * Useful for unauthenticated endpoints or when headers must be excluded (e.g., public APIs).
 *
 * @param {string} method - HTTP method.
 * @param {string} url - API endpoint.
 * @param {any} body - Request payload.
 *
 * @returns {Promise} - A promise resolving to the server response.
 */
function makeRequestWithoutHeaders(method, url, body) {
  const options = {
    method, // HTTP method
    data: body, // Payload body
    headers: null, // Explicitly no headers
    returnPromise: true,
    responseType: null, // Use default response type
  };
  return request(url, options);
}

function makeMultipartRequest(method, url, formData) {
  const tokenType = 'Bearer';
  const token = oauthService.getAccessToken();

  const headers = {
    Authorization: `${tokenType} ${token}`,
  };

  const options = {
    method,
    data: formData,
    headers,
    returnPromise: true,
    responseType: null,
  };

  return request(url, options);
}

// Export an `httpService` object with all three methods
// This allows importing and using like: httpService.makeRequest(...)
export const httpService = {
  makeRequest,
  makeOptionsRequest,
  makeRequestWithoutHeaders,
  makeMultipartRequest,
};
