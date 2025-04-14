import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useEditItemMutation = (
  organization,
  history,
  redirectTo,
  displayAlert,
) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (itemData) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}shipment/item/${itemData.id}`,
        itemData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['items', organization],
        });
        displayAlert('success', 'Item successfully edited!');
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      onError: (error) => {
        getErrorMessage(error, 'edit item', displayAlert);
      },
    },
  );
};
