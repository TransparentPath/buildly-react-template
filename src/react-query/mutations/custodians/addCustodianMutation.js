// Import necessary modules and utilities
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for mutation and query client
import { httpService } from '@modules/http/http.service'; // Custom HTTP service to make API requests
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for error handling
import i18n from '../../../i18n/index';

/**
 * Custom hook to add a new custodian to the system.
 * This involves creating contact data, creating an organization if needed,
 * and then creating the custodian associated with the provided data.
 *
 * @param {Object} organization - The organization to which the custodian is being added
 * @param {Function} history - React Router history for navigation
 * @param {string} redirectTo - The URL to redirect to after successful creation
 * @param {Function} displayAlert - Callback to display success/error messages
 *
 * @returns {Object} - React Query mutation object for adding a custodian
 */
export const useAddCustodianMutation = (
  organization,
  history,
  redirectTo,
  displayAlert,
  section,
) => {
  // Access React Query's query client to invalidate queries after the mutation
  const queryClient = useQueryClient();

  return useMutation(
    /**
     * Mutation function to add a custodian by sending a POST request.
     *
     * @param {Array} arrayData - An array containing custodian and contact data
     * @returns {Object} - The response data from the server after the custodian is added
     */
    async (arrayData) => {
      const [custodianData, contactData] = arrayData;
      // Create the contact data first
      const contactResponse = await httpService.makeRequest(
        'post',
        `${window.env.API_URL}custodian/contact/`,
        contactData,
      );
      if (contactResponse && contactResponse.data) {
        // If contact data is created successfully, get its URL
        const contactInfo = contactResponse.data.url;
        // Add the contact information to the custodian data
        let custodianPayload = {
          ...custodianData,
          contact_data: [contactInfo],
        };
        // If no organization is provided, create one
        if (!custodianData.custody_org_uuid) {
          const orgResponse = await httpService.makeRequest(
            'post',
            `${window.env.API_URL}organization/`,
            { name: custodianPayload.name, organization_type: 1 },
          );
          if (orgResponse && orgResponse.data) {
            // If organization is created successfully, associate it with the custodian
            custodianPayload = {
              ...custodianPayload,
              custody_org_uuid: orgResponse.data.organization_uuid,
            };
          }
        }
        // Finally, create the custodian
        const response = await httpService.makeRequest(
          'post',
          `${window.env.API_URL}custodian/custodian/`,
          custodianPayload,
        );
        return response.data;
      }
      // Return an empty array if contact creation failed
      return [];
    },
    {
      /**
       * Callback to handle success after custodian creation.
       * This will invalidate the relevant queries and display a success message.
       */
      onSuccess: async () => {
        // Invalidate queries to update the data in the cache
        await queryClient.invalidateQueries({
          queryKey: ['custodians', organization],
        });
        await queryClient.invalidateQueries({
          queryKey: ['contact', organization],
        });
        // Display a success message to notify the user
        displayAlert(
          'success',
          i18n.t('api.successMessages.Successfully added custodian. Please ensure your organization admin assigns an organization to this custodian.'),
        );
        // Redirect the user if necessary
        if (history && redirectTo) {
          history.push(redirectTo);
        }
      },
      /**
       * Callback to handle errors during the mutation.
       * This will display an error message using the utility function.
       *
       * @param {Object} error - The error returned by the failed mutation request
       */
      onError: (error) => {
        getErrorMessage(section, error, 'create custodian', displayAlert);
      },
    },
  );
};
