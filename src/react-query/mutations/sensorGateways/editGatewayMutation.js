/* eslint-disable no-else-return */
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for handling mutations and cache management
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for extracting error messages from API responses

/**
 * Custom hook for editing a gateway or multiple gateways.
 *
 * This hook:
 * - Handles the mutation to edit a single gateway or multiple gateways.
 * - If multiple gateways are passed, it sends PATCH requests for each one concurrently.
 * - Invalidates the cache for the gateway list after a successful mutation.
 * - Displays success or error alerts depending on the mutation outcome.
 *
 * @param {string} organization - The organization to fetch gateways for.
 * @param {Object} history - The history object to handle page redirects after a successful edit.
 * @param {string} redirectTo - The route to redirect to after a successful edit.
 * @param {Function} displayAlert - Function to display success or error alerts to the user.
 * @returns {Object} - The mutation object returned by `useMutation`, containing the mutation function and status.
 */
export const useEditGatewayMutation = (
  organization,
  history,
  redirectTo,
  displayAlert,
  section,
) => {
  const queryClient = useQueryClient(); // React Query hook for cache management

  return useMutation(
    /**
     * The mutation function to send PATCH requests to edit the gateway or gateways.
     *
     * It supports editing either a single gateway or multiple gateways at once.
     *
     * @param {Object|Array} gatewayData - Either a single gateway object or an array of gateway objects.
     * @returns {Promise} - A promise resolving to the data of the edited gateway(s).
     * @throws {Error} - If the data format is not valid (neither an object nor an array).
     */
    async (gatewayData) => {
      if (Array.isArray(gatewayData)) {
        // If it's an array of gateways, handle them in parallel using Promise.all
        const responses = await Promise.all(
          gatewayData.map((gateway) => httpService.makeRequest(
            'patch',
            `${window.env.API_URL}sensors/gateway/${gateway.id}`,
            gateway,
          )),
        );
        return responses.map((response) => response.data);
      } else if (typeof gatewayData === 'object' && gatewayData !== null) {
        // If it's a single gateway object, send the request for it
        const response = await httpService.makeRequest(
          'patch',
          `${window.env.API_URL}sensors/gateway/${gatewayData.id}`,
          gatewayData,
        );
        return response.data;
      } else {
        // If the data is neither an array nor an object, throw an error
        throw new Error('Invalid gateway data format');
      }
    },
    {
      /**
       * onSuccess callback invoked when the mutation succeeds.
       * - Invalidates the cache for gateway data to ensure the list is refreshed.
       * - Displays a success message using `displayAlert`.
       * - Optionally redirects the user using `history.push`.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['gateways', organization], // Invalidates the 'gateways' cache for the specified organization
        });
        displayAlert('success', 'Tracker(s) successfully edited!');
        if (history && redirectTo) {
          history.push(redirectTo); // Redirects if a route is provided
        }
      },
      /**
       * onError callback invoked when the mutation fails.
       * - Displays an error message using `getErrorMessage` utility.
       *
       * @param {Error} error - The error object returned from the mutation failure.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'edit tracker(s)', displayAlert); // Display error message
      },
    },
  );
};
