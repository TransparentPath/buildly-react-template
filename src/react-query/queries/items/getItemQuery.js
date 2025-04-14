import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getItemQuery = async (organization, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}shipment/item/?organization_uuid=${organization}`,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load items data', displayAlert);
    return [];
  }
};
