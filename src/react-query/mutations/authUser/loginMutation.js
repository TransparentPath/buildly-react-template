import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { oauthService } from '@modules/oauth/oauth.service';

export const useLoginMutation = (
  history,
  redirectTo,
  displayAlert,
  timezone,
) => useMutation(
  async (loginData) => {
    const token = await oauthService.authenticateWithPasswordFlow(loginData);
    oauthService.setAccessToken(token.data);
    const user = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/me/`,
    );
    oauthService.setOauthUser(user, { loginData });
    const coreuser = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/`,
    );
    oauthService.setCurrentCoreUser(coreuser, user);
    return user;
  },
  {
    onSuccess: async (data) => {
      await timezone(data.data.user_timezone);
      httpService.makeRequest(
        'post',
        `${window.env.API_URL}sensors/sync_trackers/`,
        {
          organization_uuid: data.data.organization.organization_uuid,
          platform_type: 'Tive',
        },
      );
      history.push(redirectTo);
    },
  },
  {
    onError: () => {
      displayAlert('error', 'Sign in failed');
    },
  },
);
