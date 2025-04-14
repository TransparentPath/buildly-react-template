import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getProductOptionQuery = async (displayAlert) => {
  try {
    const response = await httpService.makeOptionsRequest(
      'options',
      `${window.env.API_URL}shipment/product/`,
      true,
    );
    const data = response.json();
    return data;
  } catch (error) {
    getErrorMessage(error, 'load product options data', displayAlert);
    return [];
  }
};
