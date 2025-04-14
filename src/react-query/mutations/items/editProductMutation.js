import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useEditProductMutation = (organization, history, redirectTo, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (productData) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}shipment/product/${productData.id}`,
        productData,
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['products', organization],
        });
        displayAlert('success', 'Product successfully edited!');
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      onError: (error) => {
        getErrorMessage(error, 'edit product', displayAlert);
      },
    },
  );
};
