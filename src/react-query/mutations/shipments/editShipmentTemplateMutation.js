import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const useEditShipmentTemplateMutation = (
  organization,
  displayAlert,
) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (shipmentTemplateData) => {
      const response = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}shipment/shipment_template/${shipmentTemplateData.id}/`,
        shipmentTemplateData,
      );
      return response.data;
    },
    {
      onSuccess: async (res) => {
        await queryClient.invalidateQueries({
          queryKey: ['shipmentTemplates', organization],
        });
        displayAlert('success', `Successfully edited template ${res.name}`);
      },
      onError: (error) => {
        getErrorMessage(error, 'edit shipment template', displayAlert);
      },
    },
  );
};
