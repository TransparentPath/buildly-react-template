import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for managing mutation and query invalidation
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function to handle errors

/**
 * Custom hook for adding a new item to a shipment.
 *
 * @param {Object} organization - The organization associated with the item
 * @param {Object} history - The history object to navigate programmatically
 * @param {String} redirectTo - The path to redirect after successful item creation
 * @param {Function} displayAlert - Function to display success or error alerts
 *
 * @returns {Object} - React Query mutation object for adding an item
 */
export const useAddItemMutation = (
  organization,
  history,
  redirectTo,
  displayAlert,
  section,
) => {
  const queryClient = useQueryClient(); // Initialize React Query client for cache management

  return useMutation(
    /**
     * The mutation function for creating a new item.
     *
     * @param {Object} itemData - The data for the new item to be added
     * @returns {Object} - The response data from the API request
     */
    async (itemData) => {
      const response = await httpService.makeRequest(
        'post', // HTTP method is POST for creating a new resource
        `${window.env.API_URL}shipment/item/`, // Endpoint to create a new item in the shipment
        itemData, // The data for the new item (passed to the API request)
      );
      return response.data; // Return the response data (typically the created item)
    },
    {
      /**
       * Callback function after successful mutation.
       * Invalidates the relevant queries to update the data.
       * Displays a success message and redirects if needed.
       *
       * @param {Object} res - The response data from the API request
       */
      onSuccess: async () => {
        // Invalidate queries related to items in the organization to ensure fresh data
        await queryClient.invalidateQueries({
          queryKey: ['items', organization],
        });
        // Display success alert with a message
        displayAlert('success', 'Successfully added item');
        // Redirect to the specified path after successful creation
        if (history && redirectTo) {
          history.push(redirectTo); // Use history to navigate programmatically
        }
      },
      /**
       * Callback function to handle errors that occur during the mutation.
       * Displays an error message.
       *
       * @param {Object} error - The error object returned by the mutation
       */
      onError: (error) => {
        getErrorMessage(section, error, 'create item', displayAlert); // Handle and display the error message
      },
    },
  );
};
