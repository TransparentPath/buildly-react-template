import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useEditCoregroupMutation = (displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (coregroupData) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}coregroups/${coregroupData.id}/`,
        coregroupData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['coregroups'],
        });
        displayAlert('success', 'User group successfully edited!');
      },
      onError: (error) => {
        getErrorMessage(error, 'edit user group', displayAlert);
      },
    },
  );
};
