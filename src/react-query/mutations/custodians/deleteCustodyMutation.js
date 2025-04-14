import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useDeleteCustodyMutation = (displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (custodyTypeId) => {
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}custodian/custody/${custodyTypeId}`,
      );
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['custodies'],
        });
        displayAlert('success', 'Custody deleted successfully!');
      },
      onError: (error) => {
        getErrorMessage(error, 'delete custody', displayAlert);
      },
    },
  );
};
