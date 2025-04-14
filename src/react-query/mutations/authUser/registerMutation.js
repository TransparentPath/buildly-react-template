import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useRegisterMutation = (
  history,
  redirectTo,
  displayAlert,
) => useMutation(
  async (registerData) => {
    const response = await httpService.makeRequest(
      'post',
      `${window.env.API_URL}coreuser/`,
      registerData,
    );
    return response;
  },
  {
    onSuccess: async () => {
      displayAlert('success', 'Registration was successful');
      history.push(redirectTo);
    },
    onError: (error) => {
      getErrorMessage(error, 'register', displayAlert);
    },
  },
);
