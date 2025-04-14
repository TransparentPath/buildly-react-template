import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useDeleteShipmentTemplateMutation = (organization, displayAlert) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (shipmentTemplateId) => {
      await httpService.makeRequest(
        'delete',
        `${window.env.API_URL}shipment/shipment_template/${shipmentTemplateId}/`,
      );
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['shipmentTemplates', organization],
        });
        displayAlert('success', 'Successfully deleted template');
      },
      onError: (error) => {
        getErrorMessage(error, 'delete shipment template', displayAlert);
      },
    },
  );
};
