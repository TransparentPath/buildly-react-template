import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useUploadBulkCustodianMutation = (organization, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (file) => {
      const formData = new FormData();
      formData.append('bulk_data_file', file);
      formData.append('organization_uuid', organization);
      const uploadResponse = await httpService.makeMultipartRequest(
        'post',
        `${window.env.CUSTODIAN_URL}upload_bulk_custodians/`,
        formData,
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
      onError: (data) => {
        displayAlert('error', data.message);
      },
    },
  );
};
