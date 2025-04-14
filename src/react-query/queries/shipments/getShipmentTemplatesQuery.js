import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getShipmentTemplatesQuery = async (organization, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}shipment/shipment_template/?organization_uuid=${organization}`,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load shipment template(s) data', displayAlert);
    return [];
  }
};
