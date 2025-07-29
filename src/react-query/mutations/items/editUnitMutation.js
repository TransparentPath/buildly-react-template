// Import necessary hooks and services
import { useMutation, useQueryClient } from 'react-query';
// Import custom HTTP service for making requests
import { httpService } from '@modules/http/http.service';
// Utility function to handle and display error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Custom hook to edit an existing unit of measure.
 *
 * This hook:
 * - Sends a PATCH request to update a unit of measure based on its ID.
 * - Invalidates the cached 'unit' query for the given organization to ensure fresh data.
 * - Displays success or error notifications via the provided alert function.
 *
 * @param {string} organization - The organization identifier, used for query cache invalidation.
 * @param {Function} displayAlert - Function to display success or error alerts.
 * @returns {object} - Mutation object returned by useMutation.
 */
export const useEditUnitMutation = (organization, displayAlert, section) => {
  // Get query client instance to manage query cache
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * The mutation function that sends a PATCH request to edit a unit of measure.
     *
     * @param {object} unitData - The unit of measure data to update, which must include the `id`.
     * @returns {Promise<object>} - The updated unit of measure data from the server response.
     */
    async (unitData) => {
      const response = await httpService.makeRequest(
        'patch', // HTTP method
        `${window.env.API_URL}shipment/unit_of_measure/${unitData.id}`, // API endpoint with dynamic ID
        unitData, // Data to update
      );
      return response.data; // Return the response data
    },
    {
      /**
       * onSuccess callback is called after the mutation succeeds.
       * - It invalidates the 'unit' query cache for the organization to ensure fresh data.
       * - Displays a success message via the `displayAlert` function.
       *
       * @param {object} data - The data returned from the mutation response (updated unit of measure).
       */
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({
          queryKey: ['unit', organization], // Invalidates the unit cache for the given organization
        });
        displayAlert('success', 'Unit of measure successfully edited!'); // Show success alert
      },
      /**
       * onError callback is called when the mutation fails.
       * - It calls the `getErrorMessage` function to handle error and display a user-friendly message.
       *
       * @param {any} error - The error thrown by the mutation.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'edit unit of measure', displayAlert); // Show error alert
      },
    },
  );
};
