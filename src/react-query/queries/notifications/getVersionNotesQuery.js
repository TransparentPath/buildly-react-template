// Importing the HTTP service utility used to perform API requests
import { httpService } from '@modules/http/http.service';
// Importing a utility function to extract and display user-friendly error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Fetches version notes for a specific application version from a static URL (likely a JSON or markdown file).
 *
 * @param {string} versionNumber - The version number for which to retrieve version notes (currently unused in this function).
 * @param {function} displayAlert - A function to display error alerts if the request fails.
 * @returns {Promise<Array|Object>} - Resolves to the content of the version notes.
 *                                    Returns an empty array in case of a failure.
 */
export const getVersionNotesQuery = async (versionNumber, displayAlert) => {
  try {
    // Performing a GET request to the VERSION_NOTES static URL.
    // This request doesn't require any custom headers.
    const response = await httpService.makeRequestWithoutHeaders(
      'get', // HTTP method
      window.env.VERSION_NOTES, // Static endpoint for version notes (likely environment-configured)
    );
    // Returning the version notes data from the response
    return response.data;
  } catch (error) {
    // Displaying a user-friendly error message if something goes wrong
    getErrorMessage(error, 'load version notes data', displayAlert);
    // Return an empty array to ensure the consuming logic doesn't break
    return [];
  }
};
