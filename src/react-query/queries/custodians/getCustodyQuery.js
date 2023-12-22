import { httpService } from '@modules/http/http.service';
import _ from 'lodash';

export const getCustodyQuery = async (shipmentData, displayAlert) => {
  try {
    const uuids = _.toString(_.without(_.map(shipmentData, 'shipment_uuid'), null));
    const encodedUUIDs = encodeURIComponent(uuids);
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}custodian/custody/?shipment_id=${encodedUUIDs}`,
    );
    return response.data;
  } catch (error) {
    displayAlert('error', "Couldn't load custodies due to some error!");
    return [];
  }
};
