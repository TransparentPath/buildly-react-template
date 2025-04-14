import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useAddItemTypeMutation = (organization, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (itemTypeData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}shipment/item_type/`,
        itemTypeData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['itemTypes', organization],
        });
        displayAlert('success', 'Successfully added item type');
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      onError: (error) => {
        getErrorMessage(error, 'create item type', displayAlert);
      },
    },
  );
};
