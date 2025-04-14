import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useDeleteRecipientAddressMutation = (displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (recipientAddressId) => {
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}shipment/recipient_address/${recipientAddressId}`,
      );
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['recipientAddresses'],
        });
        displayAlert('success', 'Recipient address deleted successfully!');
      },
      onError: (error) => {
        getErrorMessage(error, 'delete recipient address', displayAlert);
      },
    },
  );
};
