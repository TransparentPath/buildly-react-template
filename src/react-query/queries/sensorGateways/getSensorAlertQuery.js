import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const getSensorAlertQuery = async (shipmentData, displayAlert) => {
  try {
    const partnerIds = _.toString(_.without(_.map(shipmentData, 'partner_shipment_id'), null));
    const encodedPartnerIds = encodeURIComponent(partnerIds);
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}sensors/sensor_report_alert/?shipment_ids=${encodedPartnerIds}`,
    );
    return response.data;
  } catch (error) {
    displayAlert('error', "Couldn't load sensor alerts due to some error!");
    return [];
  }
};
