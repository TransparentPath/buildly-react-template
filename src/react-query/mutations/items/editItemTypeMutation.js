import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useEditItemTypeMutation = (organization, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (itemTypeData) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}shipment/item_type/${itemTypeData.id}`,
        itemTypeData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['itemTypes', organization],
        });
        displayAlert('success', 'Item type successfully edited!');
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      onError: (error) => {
        getErrorMessage(error, 'edit item type', displayAlert);
      },
    },
  );
};
