import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';
import _ from 'lodash';

export const getSensorAlertQuery = async (shipmentIds, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}sensors/sensor_report_alert/?shipment_ids=${shipmentIds}`,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load sensor alerts data', displayAlert);
    return [];
  }
};
