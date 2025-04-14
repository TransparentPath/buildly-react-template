import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useUploadBulkCustodianMutation = (organization, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (formData) => {
      const uploadResponse = await httpService.makeRequest(
        'post',
        `${window.env.CUSTODIAN_URL}upload_bulk_custodians/`,
        formData,
        null,
        'multipart/form-data',
      );
      return uploadResponse.data;
    },
    {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({
          queryKey: ['custodians', organization],
        });
        await queryClient.invalidateQueries({
          queryKey: ['contact', organization],
        });
        displayAlert('success', data.message);
      },
      onError: (error) => {
        getErrorMessage(error, 'upload bulk custodian', displayAlert);
      },
    },
  );
};
