import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useEditCoreuserMutation = (displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (coreuserData) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}coreuser/${coreuserData.id}/`,
        coreuserData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['users'],
        });
        displayAlert('success', 'User successfully edited!');
      },
      onError: (error) => {
        getErrorMessage(error, 'edit user', displayAlert);
      },
    },
  );
};
