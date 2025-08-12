import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';
import i18n from '../../../i18n/index';

/**
 * Custom hook to edit an existing tracker order.
 *
 * @param {string} org_uuid - UUID of the organization to scope the query invalidation.
 * @param {function} displayAlert - Function to display user alerts (e.g., success or error).
 *
 * @returns {object} - Mutation object (e.g., mutate, isLoading, isSuccess, etc.).
 */
export const useEditTrackerOrderMutation = (org_uuid, displayAlert, section) => {
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Performs the PATCH request to update a tracker order.
     *
     * @param {object} trackerOrderData - The updated tracker order data (must include `id`).
     * @returns {object} - The updated tracker order response data.
     */
    async (trackerOrderData) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}shipment/tracker_order/${trackerOrderData.id}/`,
        trackerOrderData,
      );
      return response.data;
    },
    {
      /**
       * On success:
       * - Invalidate the tracker orders query for this org.
       * - Show a success alert.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['trackerOrders', org_uuid],
        });
        displayAlert('success', i18n.t('api.successMessages.Tracker order successfully edited!'));
      },
      /**
       * On error:
       * - Show a formatted error message.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'edit tracker order', displayAlert);
      },
    },
  );
};
