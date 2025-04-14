import { useMutation } from 'react-query';
import _ from 'lodash';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useWhatsappChargesMutation = (displayAlert) => useMutation(
  async (whatsappChargesData) => {
    const response = await httpService.makeRequestWithoutHeaders(
      'post',
      window.env.WHATSAPP_CHARGES_URL,
      whatsappChargesData,
    );
    return response.data;
  },
  {
    onError: (error) => {
      getErrorMessage(error, 'fetch Whatsapp charges', displayAlert);
    },
  },
);
