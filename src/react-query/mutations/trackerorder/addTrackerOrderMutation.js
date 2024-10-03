import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useAddTrackerOrderMutation = (history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (trackerOrderData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}shipment/tracker_order/`,
        trackerOrderData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['trackerOrders'],
        });
        displayAlert('success', 'Successfully added tracker order');
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      onError: () => {
        displayAlert('error', 'Error in creating tracker order');
      },
    },
  );
};
