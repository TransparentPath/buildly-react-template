import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getGatewayOptionQuery = async (displayAlert) => {
  try {
    const response = await httpService.makeOptionsRequest(
      'options',
      `${window.env.API_URL}sensors/gateway/`,
      true,
    );
    const data = response.json();
    return data;
  } catch (error) {
    getErrorMessage(error, 'load gateway options data', displayAlert);
    return [];
  }
};
