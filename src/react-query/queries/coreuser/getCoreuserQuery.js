import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getCoreuserQuery = async (displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coreuser/`,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load core users data', displayAlert);
    return [];
  }
};
