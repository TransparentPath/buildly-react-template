import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getAllConsortiumQuery = async (displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}consortium/`,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load consortiums data', displayAlert);
    return [];
  }
};
