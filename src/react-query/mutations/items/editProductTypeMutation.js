// Import necessary hooks and services
import { useMutation, useQueryClient } from 'react-query';
// Import custom HTTP service for making requests
import { httpService } from '@modules/http/http.service';
// Utility function to handle and display error messages
import { getErrorMessage } from '@utils/utilMethods';

/**
 * Custom hook to edit an existing product type.
 *
 * This hook:
 * - Sends a PATCH request to update a product type based on its ID.
 * - Invalidates the cached 'productTypes' query for the given organization to ensure fresh data.
 * - Displays success or error notifications via the provided alert function.
 * - Optionally redirects the user to a different route after a successful update.
 *
 * @param {string} organization - The organization identifier, used for query cache invalidation.
 * @param {object} history - React Router history object for programmatic navigation.
 * @param {string} redirectTo - URL path to redirect to after successful edit.
 * @param {Function} displayAlert - Function to display success or error alerts.
 * @returns {object} - Mutation object returned by useMutation.
 */
export const useEditProductTypeMutation = (
  organization,
  history,
  redirectTo,
  displayAlert,
) => {
  // Get query client instance to manage query cache
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * The mutation function that sends a PATCH request to edit a product type.
     *
     * @param {object} productTypeData - The product type data to update, which must include the `id`.
     * @returns {Promise<object>} - The updated product type data from the server response.
     */
    async (productTypeData) => {
      const response = await httpService.makeRequest(
        'patch', // HTTP method
        `${window.env.API_URL}shipment/product_type/${productTypeData.id}`, // API endpoint, with dynamic ID
        productTypeData, // Data to update
      );
      return response.data; // Return the response data
    },
    {
      /**
       * onSuccess callback is called after the mutation succeeds.
       * - It invalidates the 'productTypes' query cache for the organization to ensure fresh data.
       * - Displays a success message via the `displayAlert` function.
       * - Optionally redirects to a new URL if both `history` and `redirectTo` are provided.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['productTypes', organization], // Invalidates the product types cache for the given organization
        });
        displayAlert('success', 'Product type successfully edited!'); // Show success alert
        if (history && redirectTo) {
          history.push(redirectTo); // Redirect to the specified path
        }
      },
      /**
       * onError callback is called when the mutation fails.
       * - It calls the `getErrorMessage` function to handle error and display a user-friendly message.
       *
       * @param {any} error - The error thrown by the mutation.
       */
      onError: (error) => {
        getErrorMessage(error, 'edit product type', displayAlert); // Show error alert
      },
    },
  );
};
