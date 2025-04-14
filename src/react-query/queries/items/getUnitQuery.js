import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getUnitQuery = async (organization, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}shipment/unit_of_measure/?organization_uuid=${organization}`,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load unit of measurements data', displayAlert);
    return [];
  }
};
