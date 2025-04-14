import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useDeleteCustodianTypeMutation = (displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (custodianTypeId) => {
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}custodian/custodian_type/${custodianTypeId}`,
      );
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['custodianTypes'],
        });
        displayAlert('success', 'Custodian type deleted successfully!');
      },
      onError: (error) => {
        getErrorMessage(error, 'delete custodian type', displayAlert);
      },
    },
  );
};
