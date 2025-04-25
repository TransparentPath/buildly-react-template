import { Observable } from 'rxjs'; // Import the Observable class from RxJS to support reactive programming and cancellation
import axios from 'axios'; // Import Axios, a promise-based HTTP client for the browser and Node.js
import axiosCancel from 'axios-cancel'; // Import a library that extends Axios to support request cancellation using request IDs

// Apply axiosCancel to the default Axios instance
// This adds `.cancel(requestId)` method to axios for manually cancelling requests
axiosCancel(axios);

// Define a list of allowed HTTP methods
// Used for validation to prevent unsupported methods
const ACCEPTED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Sends an HTTP request using Axios, with optional Observable support for cancellation.
 *
 * @param {string} url - The URL endpoint of the HTTP request.
 * @param {Object} options - Configuration object for the request:
 *   - {string} method: HTTP method (GET, POST, etc.)
 *   - {any} data: Request body/payload
 *   - {Object=} headers: Custom headers for the request
 *   - {boolean=} returnPromise: Whether to return a promise (true) or Observable (false)
 *   - {string=} responseType: Expected response format ('json', 'blob', etc.)
 *
 * @returns {Promise|Observable} A promise or observable depending on the `returnPromise` flag
 */
const request = (url, options) => {
  const {
    method, // HTTP method like GET, POST, PUT, etc.
    data, // Payload to be sent in the request (for POST/PUT)
    headers, // Optional headers object
    returnPromise, // If true, return a Promise; otherwise, return an Observable
    responseType, // Optional: expected type of the response (e.g., 'json', 'blob')
  } = options;

  // Validate that a URL is provided
  if (!url) {
    throw new Error('No path has been provided');
  }

  // Ensure the options object is valid and contains an accepted HTTP method
  if (options && typeof options === 'object') {
    if (ACCEPTED_METHODS.indexOf(method.toUpperCase()) === -1) {
      throw new Error(`Invalid method, method must be ${ACCEPTED_METHODS.join(', ')}`);
    }
  }

  let result;

  // Generate a unique request ID for cancellation
  const requestId = `${Math.random()}-xhr-id`;

  // Track whether the request has completed or not
  let completed = false;

  // Create a configuration object for the Axios request
  const config = {
    url, // Endpoint URL
    data, // Request payload
    method, // HTTP method
    headers, // Custom headers
    responseType, // Response data type
    requestId, // Custom request ID for tracking and cancelling
  };

  // If returnPromise is true, use Axios directly and return a Promise
  if (returnPromise) {
    result = axios.request(config);
  } else {
    // Otherwise, return an RxJS Observable for reactive handling with cancel support
    result = Observable.create((observer) => {
      axios.request(config)
        .then((response) => {
          // Emit the successful response
          observer.next(response);
          completed = true;
          // Complete the observable stream
          observer.complete();
        }).catch((error) => {
          // Emit the error if the request fails
          observer.error(error);
          completed = true;
        });

      // Teardown logic (called when Observable is unsubscribed)
      return () => {
        // If request hasn't completed, cancel it using axios.cancel and the requestId
        if (completed === false) {
          axios.cancel(requestId);
          completed = true;
        }
      };
    });
  }

  // Return either a Promise or Observable depending on `returnPromise`
  return result;
};

// Export the request function as the default export
export default request;
