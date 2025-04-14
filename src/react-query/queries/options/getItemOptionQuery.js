import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getItemOptionQuery = async (displayAlert) => {
  try {
    const response = await httpService.makeOptionsRequest(
      'options',
      `${window.env.API_URL}shipment/item/`,
      true,
    );
    const data = response.json();
    return data;
  } catch (error) {
    getErrorMessage(error, 'load item options data', displayAlert);
    return [];
  }
};
