import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getOrganizationTypeQuery = async (displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}organization_type/`,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load organization types data', displayAlert);
    return [];
  }
};
