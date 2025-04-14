import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useDeleteItemMutation = (organization, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (itemId) => {
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}shipment/item/${itemId}`,
      );
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['items', organization],
        });
        displayAlert('success', 'Item deleted successfully!');
      },
      onError: (error) => {
        getErrorMessage(error, 'delete item', displayAlert);
      },
    },
  );
};
