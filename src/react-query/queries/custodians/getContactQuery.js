import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getContactQuery = async (organization, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}custodian/contact/?organization_uuid=${organization}`,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load contacts data', displayAlert);
    return [];
  }
};
