import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getCoregroupQuery = async (displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}coregroups/`,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load core groups data', displayAlert);
    return [];
  }
};
