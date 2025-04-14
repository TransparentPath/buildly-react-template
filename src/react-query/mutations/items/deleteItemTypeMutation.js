import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useDeleteItemTypeMutation = (organization, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (itemTypeId) => {
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}shipment/item_type/${itemTypeId}`,
      );
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['itemTypes', organization],
        });
        displayAlert('success', 'Item type deleted successfully!');
      },
      onError: (error) => {
        getErrorMessage(error, 'delete item type', displayAlert);
      },
    },
  );
};
