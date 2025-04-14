import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useAddProductMutation = (organization, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (productData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}shipment/product/`,
        productData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['products', organization],
        });
        displayAlert('success', 'Successfully added product');
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      onError: (error) => {
        getErrorMessage(error, 'create product', displayAlert);
      },
    },
  );
};
