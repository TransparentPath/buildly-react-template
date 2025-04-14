import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getApiResponseQuery = async (url, header, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      url,
      null,
      null,
      null,
      null,
      header,
    );
    return response;
  } catch (error) {
    getErrorMessage(error, 'load API response data', displayAlert);
    return [];
  }
};
