import { useMutation } from 'react-query';
import { httpService } from '@modules/http/http.service';

export const useReportPDFDownloadMutation = (setGenerateReportLoading, displayAlert) => useMutation(
  async (reportPDFData) => {
    const response = await httpService.makePostRequestWithoutHeaders(
      'post',
      window.env.EMAIL_REPORT_URL,
      reportPDFData,
    );
    return response.data;
  },
  {
    onSuccess: () => {
      displayAlert('success', 'You can now download the report');
      setGenerateReportLoading(false);
    },
  },
  {
    onError: () => {
      displayAlert('error', 'Error in creating report');
    },
  },
);
