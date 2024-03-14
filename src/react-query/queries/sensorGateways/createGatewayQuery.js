import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const createGatewayQuery = async (displayAlert, setRefreshClicked) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}sensors/gateway/create_gateway/`,
    );
    if (response && response.status === 200) {
      displayAlert('success', response.data.status);
    }
    setRefreshClicked(false);
    return response;
  } catch (error) {
    displayAlert('error', "Couldn't load all gateways due to some error!");
    return [];
  }
};
