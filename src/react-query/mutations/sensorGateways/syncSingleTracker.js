import { useMutation, useQueryClient } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useSyncSingleTrackerMutation = (displayAlert) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (gatewayData) => {
      const response = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}sensors/sync_single_tracker/`,
        gatewayData,
      );
      const updatedData = await httpService.makeRequest(
        'get',
        `${window.env.API_URL}sensors/gateway/?gateway_uuid=${gatewayData.gateway_uuid}`,
      );
      return updatedData.data;
    },
    {
      onError: () => {
        displayAlert('error', 'Tracker not found!');
      },
    },
  );
};
