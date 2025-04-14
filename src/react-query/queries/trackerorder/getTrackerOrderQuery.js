import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getTrackerOrderQuery = async (organization_uuid, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}shipment/tracker_order/?organization_uuid=${organization_uuid}`,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load tracker orders data', displayAlert);
    return [];
  }
};
