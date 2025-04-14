import { httpService } from '@modules/http/http.service';
import { getErrorMessage } from '@utils/utilMethods';

export const getVersionNotesQuery = async (versionNumber, displayAlert) => {
  try {
    const response = await httpService.makeRequestWithoutHeaders(
      'get',
      window.env.VERSION_NOTES,
    );
    return response.data;
  } catch (error) {
    getErrorMessage(error, 'load version notes data', displayAlert);
    return [];
  }
};
