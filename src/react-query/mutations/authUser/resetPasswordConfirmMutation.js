import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useResetPasswordConfirmMutation = (
  history,
  redirectTo,
  displayAlert,
) => useMutation(
  async (resetConfirmData) => {
    const response = await httpService.makeRequest(
      'post',
      `${window.env.API_URL}coreuser/reset_password_confirm/`,
      resetConfirmData,
    );
    return response.data;
  },
  {
    onSuccess: async (data) => {
      displayAlert('success', data.detail);
      history.push(redirectTo);
    },
    onError: (error) => {
      getErrorMessage(error, 'reset the password', displayAlert);
    },
  },
);
