// Import React Query hooks and custom utilities
import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';
import i18n from '../../../i18n/index';

/**
 * Custom hook to create new tracker orders.
 *
 * @param {object} history - React Router history object for redirection.
 * @param {string} redirectTo - The path to redirect to after successful creation.
 * @param {function} displayAlert - Function to show success or error alerts.
 * @param {function} setCart - Function to reset the cart (usually state setter).
 *
 * @returns {object} - The mutation object from useMutation (e.g., mutate, status, etc.).
 */
export const useAddTrackerOrderMutation = (history, redirectTo, displayAlert, setCart, section) => {
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function to send POST requests to create multiple tracker orders.
     *
     * @param {Array} trackerOrderData - List of order payloads to submit.
     * @returns {Array} - List of response data from each successful POST request.
     */
    async (trackerOrderData) => {
      const responses = await Promise.all(
        trackerOrderData.map((tod) => httpService.makeRequest(
          'post',
          `${window.env.SHIPMENT_URL}tracker_order/`,
          tod,
        )),
      );
      return responses.map((response) => response.data);
    },
    {
      /**
       * On successful creation of tracker orders:
       * - Invalidate the 'trackerOrders' query to refresh the list.
       * - Reset the cart state to empty.
       * - Display a success alert.
       * - Redirect if `history` and `redirectTo` are provided.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['trackerOrders'],
        });
        setCart([]); // Clear the cart UI state
        displayAlert('success', i18n.t('api.successMessages.Successfully added tracker order(s)'));
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      /**
       * Handle any error that occurs during the mutation.
       * - Format and display an error message using `getErrorMessage`.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'create tracker order', displayAlert);
      },
    },
  );
};
