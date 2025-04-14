import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getAllOrganizationQuery = async (displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}organization/`,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load organizations data', displayAlert);
    return [];
  }
};
