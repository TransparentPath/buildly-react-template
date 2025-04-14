import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useAddCustodianTypeMutation = (history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (custodianTypeData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}custodian/custodian_type/`,
        custodianTypeData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['custodianTypes'],
        });
        displayAlert('success', 'Successfully added custodian type');
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      onError: (error) => {
        getErrorMessage(error, 'create custodian type', displayAlert);
      },
    },
  );
};
