// Importing necessary dependencies
import { useMutation, useQueryClient } from 'react-query'; // `useMutation` hook from React Query for handling mutations (API requests)
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import _ from 'lodash'; // Lodash utility library for working with arrays, objects, and other data types
import { getLocations } from '@utils/getLocations'; // Utility function for fetching location details
import { getErrorMessage } from '@utils/utilMethods'; // Utility function for extracting and displaying error messages

/**
 * Custom hook to add a shipment.
 * This hook handles the process of creating a shipment, uploading associated files,
 * managing custody (ownership) information, and updating the shipment details.
 *
 * @param {string} organization - The organization ID used to manage data and query caches.
 * @param {Object} history - The history object used for redirection after the operation is successful.
 * @param {string} redirectTo - The route to redirect to after a successful shipment creation.
 * @param {Function} displayAlert - Function used to display alerts (success, error, etc.) to the user.
 * @returns {Object} The mutation object, including the mutate function for triggering the request.
 */
export const useAddShipmentMutation = (organization, history, redirectTo, displayAlert, section) => {
  const queryClient = useQueryClient(); // React Query's queryClient to manage cache invalidation and query refetching

  return useMutation(
    /**
     * The mutation function that performs the API request to add a new shipment.
     * It handles several operations like creating the shipment, uploading files,
     * managing custody, and updating gateway settings.
     *
     * @param {Object} shipmentData - The data used to create a new shipment, including custody, files, and carriers.
     * @returns {Promise} - The response from the API that includes the shipment details.
     */
    async (shipmentData) => {
      // Destructuring the input data to get relevant details
      const {
        start_custody, end_custody, files, carriers, updateGateway, isWarehouse,
      } = shipmentData;
      let shipmentPayload = shipmentData.shipment; // Shipment details
      let uploadFile = null; // Variable to store the file data for uploading
      // Creating the shipment by making a POST request to the API
      let data = await httpService.makeRequest(
        'post', // HTTP method (POST)
        `${window.env.API_URL}shipment/shipment/`, // API endpoint for creating a new shipment
        shipmentPayload, // Shipment data to be sent in the request body
      );
      // Checking if the shipment creation is successful
      if (data && data.data) {
        // If there are files to upload, iterate through them and upload each file
        if (!_.isEmpty(files)) {
          const responses = await Promise.all(_.map(files, async (file) => {
            uploadFile = new FormData();
            uploadFile.append('file', file, file.name);
            uploadFile.append('shipment_uuid', data.data.shipment_uuid);
            const uploadResponse = await httpService.makeMultipartRequest(
              'post',
              `${window.env.API_URL}shipment/upload_file/`,
              uploadFile,
            );
            return uploadResponse;
          }));
          // Updating the shipment payload with the uploaded files' details (file names and AWS URLs)
          shipmentPayload = {
            ...data.data,
            uploaded_pdf: _.map(files, 'name'),
            uploaded_pdf_link: _.map(_.flatMap(_.map(responses, 'data')), 'aws url'),
          };
          // Updating the shipment with the file upload information
          data = await httpService.makeRequest(
            'patch', // HTTP method (PATCH)
            `${window.env.API_URL}shipment/shipment/${data.data.id}/`, // API endpoint to update the shipment
            shipmentPayload, // Updated shipment data with file details
          );
        }
        // Preparing the custody (ownership) details for the start and end of the shipment
        let startCustody = {
          ...start_custody,
          start_of_custody_location: start_custody.location,
          end_of_custody_location: end_custody.location,
        };
        const endCustody = {
          ...end_custody,
          start_of_custody_location: end_custody.location,
          end_of_custody_location: end_custody.location,
        };
        // Fetching the location details for the carriers
        let locations = [];
        if (!_.isEmpty(carriers)) {
          locations = await getLocations(_.map(carriers, 'location')); // Getting locations for each carrier
          const first_custody = _.first(locations); // Taking the first location for the start custody
          startCustody = {
            ...startCustody,
            end_of_custody_location: first_custody, // Assigning the first location as the end custody location
          };
        }
        // Creating the start custody record (ownership) for the shipment
        await httpService.makeRequest(
          'post', // HTTP method (POST)
          `${window.env.API_URL}custodian/custody/`, // API endpoint for creating a custody record
          {
            ...startCustody,
            shipment_id: data.data.shipment_uuid,
            shipment: data.data.id,
          },
        );
        // If there are carriers, create the custody records for each carrier
        if (!_.isEmpty(carriers)) {
          await Promise.all(_.map(carriers, async (carrier, index) => (
            // Creating a custody record for each carrier
            // eslint-disable-next-line no-return-await
            await httpService.makeRequest(
              'post', // HTTP method (POST)
              `${window.env.API_URL}custodian/custody/`, // API endpoint for creating a custody record
              {
                ...carrier,
                start_of_custody_location: locations[index], // Starting custody location for the carrier
                end_of_custody_location: _.lt(index + 1, _.size(locations)) // Ending custody location for the carrier
                  ? locations[index + 1] // Next location in the list if available
                  : end_custody.location, // If no next location, use the end custody location
                shipment_id: data.data.shipment_uuid,
                shipment: data.data.id,
              },
            ))));
        }
        // Creating the end custody record for the shipment
        await httpService.makeRequest(
          'post', // HTTP method (POST)
          `${window.env.API_URL}custodian/custody/`, // API endpoint for creating a custody record
          {
            ...endCustody,
            shipment_id: data.data.shipment_uuid,
            shipment: data.data.id,
          },
        );
        // If a gateway needs to be updated, initiate the update process
        if (updateGateway) {
          shipmentPayload = {
            ...data.data,
            gateway_ids: [updateGateway.gateway_uuid], // Assigning the gateway to the shipment
            gateway_imei: [_.toString(updateGateway.imei_number)], // Assigning the gateway IMEI number to the shipment
          };
          // Updating the shipment with the new gateway details
          const shipment = await httpService.makeRequest(
            'patch', // HTTP method (PATCH)
            `${window.env.API_URL}shipment/shipment/${data.data.id}/`, // API endpoint to update the shipment
            shipmentPayload, // Shipment payload with the updated gateway details
          );
          if (shipment && shipment.data) {
            // Preparing payload to update the gateway
            const gatewayPayload = {
              ...updateGateway,
              gateway_status: 'assigned', // Marking the gateway as 'assigned'
              shipment_ids: shipment.data.partner_shipment_id
                ? [shipment.data.partner_shipment_id]
                : [], // Associating the shipment with the gateway
            };
            // Preparing payload to configure the gateway
            const configureGatewayPayload = {
              platform_type: shipment.data.platform_name,
              gateway: updateGateway.imei_number, // Gateway IMEI number
              transmission_interval: _.isEqual(_.toLower(shipment.data.status), 'planned') || (_.isEqual(_.toLower(shipment.data.status), 'arrived') && !isWarehouse) ? 5 : shipment.data.transmission_time, // Transmission interval for the gateway
              measurement_interval: _.isEqual(_.toLower(shipment.data.status), 'planned') || (_.isEqual(_.toLower(shipment.data.status), 'arrived') && !isWarehouse) ? 5 : shipment.data.measurement_time, // Measurement interval for the gateway
            };
            // Updating the gateway with the new details
            await httpService.makeRequest(
              'patch', // HTTP method (PATCH)
              `${window.env.API_URL}sensors/gateway/${gatewayPayload.id}`, // API endpoint to update the gateway
              gatewayPayload, // Gateway details to be updated
            );
            // Configuring the gateway with the new settings
            await httpService.makeRequest(
              'post', // HTTP method (POST)
              `${window.env.API_URL}sensors/configure_gateway/`, // API endpoint for configuring the gateway
              configureGatewayPayload, // Configuration payload for the gateway
            );
          }
        }
      }
    },
    // Mutation configuration object
    {
      /**
       * onSuccess callback: This function is triggered when the mutation (API request) succeeds.
       * It performs the following:
       *  - Invalidates the necessary queries to ensure the data is fresh.
       *  - Displays a success alert to notify the user.
       *  - Redirects the user to the specified route after the operation.
       *
       * @returns {Promise} - Resolves once cache invalidation is done.
       */
      onSuccess: async () => {
        // If redirection is required, navigate to the specified route
        if (history && redirectTo) {
          history.push(redirectTo);
        }
        await queryClient.invalidateQueries({
          queryKey: ['shipments'], // Invalidate shipments query to refresh data
        });
        await queryClient.invalidateQueries({
          queryKey: ['allGateways'], // Invalidate all gateways query to refresh data
        });
        await queryClient.invalidateQueries({
          queryKey: ['custodians'], // Invalidate custodians query to refresh data
        });
        // Display a success alert
        displayAlert('success', 'Successfully added shipment');
      },
      /**
       * onError callback: This function is triggered when the mutation fails.
       * It handles the error by extracting the error message and displaying it to the user.
       *
       * @param {Error} error - The error object containing the failure details.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'create shipment', displayAlert); // Display error message using the utility function
      },
    },
  );
};
