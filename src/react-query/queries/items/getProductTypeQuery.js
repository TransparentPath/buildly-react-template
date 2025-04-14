import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getProductTypeQuery = async (organization, displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      `${window.env.API_URL}shipment/product_type/?organization_uuid=${organization}`,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load product types data', displayAlert);
    return [];
  }
};
