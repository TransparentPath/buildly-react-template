import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { oauthService } from '@modules/oauth/oauth.service';

export const useUpdateUserMutation = (
  history,
  displayAlert,
) => useMutation(
  async (updateUserData) => {
    await httpService.makeRequest(
      'patch',
      `${window.env.API_URL}coreuser/${updateUserData.id}/update_profile/`,
      updateUserData,
    );
    await httpService.makeRequest(
      'patch',
      `${window.env.API_URL}organization/${updateUserData.organization_uuid}/`,
      { name: updateUserData.organization_name },
    );
    const user = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/me/`,
    );
    oauthService.setOauthUser(user);
    const coreuser = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/`,
    );
    oauthService.setCurrentCoreUser(coreuser, user);
  },
  {
    onSuccess: () => {
      if (history) {
        const route = window.location.pathname;
        history.push('/');
        history.push(route);
      } else {
        displayAlert('success', 'Account details successfully updated');
      }
    },
  },
  {
    onError: () => {
      displayAlert('error', 'Unable to update user details');
    },
  },
);
