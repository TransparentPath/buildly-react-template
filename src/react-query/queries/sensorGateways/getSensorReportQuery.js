import { httpService } from '@modules/http/http.service';

export const getSensorReportQuery = async (id, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}sensors/sensor_report/?shipment_ids=${id}`,
    );
    return response.data;
  } catch (error) {
    displayAlert('error', "Couldn't load sensor reports due to some error!");
    return [];
  }
};
