import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useDeleteCoreuserMutation = (displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (coreuserData) => {
      const response = await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}coreuser/${coreuserData.id}/`,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['users'],
        });
        displayAlert('success', 'User successfully deleted!');
      },
      onError: (error) => {
        getErrorMessage(error, 'delete user', displayAlert);
      },
    },
  );
};
