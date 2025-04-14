import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getCustodianTypeQuery = async (displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}custodian/custodian_type/`,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load custodian types data', displayAlert);
    return [];
  }
};
