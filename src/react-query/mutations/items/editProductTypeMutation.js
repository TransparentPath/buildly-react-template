import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useEditProductTypeMutation = (organization, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (productTypeData) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}shipment/product_type/${productTypeData.id}`,
        productTypeData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['productTypes', organization],
        });
        displayAlert('success', 'Product type successfully edited!');
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      onError: (error) => {
        getErrorMessage(error, 'edit product type', displayAlert);
      },
    },
  );
};
