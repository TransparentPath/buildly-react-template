import { httpService } from '@modules/http/http.service';

export const getSensorAlertQuery = async (id, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}sensors/sensor_report_alert/?shipment_ids=${id}`,
    );
    return response.data;
  } catch (error) {
    displayAlert('error', "Couldn't load sensor alerts due to some error!");
    return [];
  }
};
