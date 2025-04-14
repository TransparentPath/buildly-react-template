import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';
import _ from 'lodash';

export const getCurrenciesQuery = async (displayAlert) => {
  try {
    const response = await httpService.makeRequest(
      'get',
      'https://countriesnow.space/api/v0.1/countries/currency',
    );
    if (response && response.data && response.data.data) {
      const currencies = _.uniqBy(_.map(
        response.data.data, (curr) => ({ country: curr.iso3, currency: curr.currency }),
      ), 'country');
      return currencies;
    }
    return [];
  } catch (error) {
    getErrorMessage(error, 'load currencies data', displayAlert);
    return [];
  }
};
