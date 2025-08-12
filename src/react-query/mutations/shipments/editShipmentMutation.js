// Import necessary dependencies
import { useMutation, useQueryClient } from 'react-query'; // React Query hooks for managing mutation and cache
import { httpService } from '@modules/http/http.service'; // Custom HTTP service for making API requests
import _ from 'lodash'; // Lodash utility library for data manipulation
import { getLocations } from '@utils/getLocations'; // Utility to get locations for carriers
import { getErrorMessage } from '@utils/utilMethods'; // Utility to handle and display error messages
import i18n from '../../../i18n/index';

/**
 * Custom hook for editing an existing shipment.
 * This hook manages the mutation process to update the shipment details, upload files, delete files,
 * and update related custody and gateway data.
 *
 * @param {string} organization - The organization ID used for cache management and querying the shipments.
 * @param {Object} history - React Router's history object used for programmatic navigation.
 * @param {string} redirectTo - The path to navigate to after successful mutation.
 * @param {Function} displayAlert - A function used to display success or error alerts.
 * @returns {Object} The mutation object, which includes the mutate function for triggering the mutation.
 */
export const useEditShipmentMutation = (organization, history, redirectTo, displayAlert, section) => {
  const queryClient = useQueryClient(); // React Query's queryClient for managing cache and refetching data

  return useMutation(
    /**
     * The mutation function that handles the logic for editing a shipment.
     * It processes the files to upload, delete, updates custody and gateway info,
     * and sends PATCH requests to update the shipment data.
     *
     * @param {Object} shipmentData - The data to update the shipment, including custody details, files, carriers, and gateway.
     * @returns {Promise} - The response data from the API after updating the shipment.
     */
    async (shipmentData) => {
      // Destructure the shipment data to extract individual parts like custody, files, carriers, etc.
      const {
        start_custody, end_custody, files, carriers, updateGateway, deleteFiles, isWarehouse,
      } = shipmentData;
      let shipmentPayload = shipmentData.shipment; // Initialize shipment payload with the provided shipment data
      let uploadFile = null;
      // If there are files to upload, process and upload them.
      if (!_.isEmpty(files)) {
        const responses = await Promise.all(_.map(files, async (file) => {
          uploadFile = new FormData();
          uploadFile.append('file', file, file.name);
          uploadFile.append('shipment_uuid', shipmentPayload.shipment_uuid);
          const uploadResponse = await httpService.makeMultipartRequest(
            'post',
            `${window.env.API_URL}shipment/upload_file/`,
            uploadFile,
          );
          return uploadResponse;
        }));
        // Update the shipmentPayload with the uploaded file details.
        shipmentPayload = {
          ...shipmentPayload,
          uploaded_pdf: shipmentPayload.uploaded_pdf
            ? [...shipmentPayload.uploaded_pdf, ..._.map(files, 'name')]
            : _.map(files, 'name'),
          uploaded_pdf_link: shipmentPayload.uploaded_pdf_link
            ? [...shipmentPayload.uploaded_pdf_link, ..._.map(_.flatMap(_.map(responses, 'data')), 'aws url')]
            : _.map(_.flatMap(_.map(responses, 'data')), 'aws url'),
        };
      }
      // If there are files to delete, process and delete them.
      if (!_.isEmpty(deleteFiles)) {
        await Promise.all(_.map(deleteFiles, async (file) => {
          await httpService.makeRequest(
            'post',
            `${window.env.API_URL}shipment/delete_file/`,
            { filename: file, shipment_uuid: shipmentPayload.shipment_uuid },
          );
        }));
      }
      // If there's a gateway to update, add it to the shipment payload.
      if (!_.isEmpty(updateGateway)) {
        shipmentPayload = {
          ...shipmentPayload,
          gateway_ids: [updateGateway.gateway_uuid],
          gateway_imei: [_.toString(updateGateway.imei_number)],
        };
      }
      // Send a PATCH request to update the shipment data.
      const data = await httpService.makeRequest(
        'patch',
        `${window.env.API_URL}shipment/shipment/${shipmentPayload.id}/`,
        shipmentPayload,
      );
      // If the shipment update is successful, update custody data for start, carriers, and end.
      if (data && data.data) {
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
        // Get carrier locations and update custody data for each carrier.
        let locations = [];
        if (!_.isEmpty(carriers)) {
          locations = await getLocations(_.map(carriers, 'location'));
          const first_custody = _.first(locations);
          startCustody = {
            ...startCustody,
            end_of_custody_location: first_custody,
          };
        }
        // Update or create start custody.
        if (startCustody.id) {
          await httpService.makeRequest(
            'patch',
            `${window.env.API_URL}custodian/custody/${startCustody.id}/`,
            startCustody,
          );
        } else {
          await httpService.makeRequest(
            'post',
            `${window.env.API_URL}custodian/custody/`,
            {
              ...startCustody,
              shipment_id: data.data.shipment_uuid,
              shipment: data.data.id,
            },
          );
        }
        // Update or create custody for each carrier.
        if (!_.isEmpty(carriers)) {
          await Promise.all(
            _.map(carriers, async (carrier, index) => {
              if (carrier.id) {
                const custodyPayload = {
                  ...carrier,
                  start_of_custody_location: locations[index],
                  end_of_custody_location: _.lt(index + 1, _.size(locations))
                    ? locations[index + 1]
                    : endCustody.start_of_custody_location,
                };
                // Update custody if it exists, otherwise create a new custody record.
                // eslint-disable-next-line no-return-await
                return await httpService.makeRequest(
                  'patch',
                  `${window.env.API_URL}custodian/custody/${custodyPayload.id}/`,
                  custodyPayload,
                );
              }
              // eslint-disable-next-line no-return-await
              return await httpService.makeRequest(
                'post',
                `${window.env.API_URL}custodian/custody/`,
                {
                  ...carrier,
                  start_of_custody_location: locations[index],
                  end_of_custody_location: _.lt(index + 1, _.size(locations))
                    ? locations[index + 1]
                    : end_custody.location,
                  shipment_id: data.data.shipment_uuid,
                  shipment: data.data.id,
                },
              );
            }),
          );
        }
        // Update or create end custody.
        if (endCustody.id) {
          await httpService.makeRequest(
            'patch',
            `${window.env.API_URL}custodian/custody/${endCustody.id}/`,
            endCustody,
          );
        } else {
          await httpService.makeRequest(
            'post',
            `${window.env.API_URL}custodian/custody/`,
            {
              ...endCustody,
              shipment_id: data.data.shipment_uuid,
              shipment: data.data.id,
            },
          );
        }
        // If there's a gateway to update, configure it accordingly.
        if (!_.isEmpty(updateGateway)) {
          let gateway_status = '';
          let shipment_ids = [];
          let { battery_alert_level } = updateGateway;
          switch (data.data.status) {
            case 'Completed':
              gateway_status = updateGateway.gateway_status;
              shipment_ids = updateGateway.shipment_ids;
              battery_alert_level = updateGateway.battery_alert_level;
              break;
            case 'Cancelled':
            case 'Damaged':
            case 'Battery Depleted':
              gateway_status = 'unavailable';
              shipment_ids = [];
              battery_alert_level = 0;
              break;
            case 'Planned':
            case 'En route':
              gateway_status = 'assigned';
              shipment_ids = data.data.partner_shipment_id ? [data.data.partner_shipment_id] : [];
              break;
            default:
              break;
          }
          const gatewayPayload = {
            ...updateGateway,
            gateway_status,
            shipment_ids,
            battery_alert_level,
          };
          await httpService.makeRequest(
            'patch',
            `${window.env.API_URL}sensors/gateway/${gatewayPayload.id}`,
            gatewayPayload,
          );
          if (_.includes(['planned', 'en route', 'arrived'], _.toLower(data.data.status))) {
            const configurePayload = {
              platform_type: data.data.platform_name,
              gateway: updateGateway.imei_number,
              transmission_interval: _.isEqual(_.toLower(data.data.status), 'planned') || (_.isEqual(_.toLower(data.data.status), 'arrived') && !isWarehouse) ? 5 : data.data.transmission_time,
              measurement_interval: _.isEqual(_.toLower(data.data.status), 'planned') || (_.isEqual(_.toLower(data.data.status), 'arrived') && !isWarehouse) ? 5 : data.data.measurement_time,
            };
            await httpService.makeRequest(
              'post',
              `${window.env.API_URL}sensors/configure_gateway/`,
              configurePayload,
            );
          }
        }
      }
    },
    // Mutation configuration: onSuccess and onError callbacks
    {
      /**
       * onSuccess callback: This is triggered when the mutation succeeds.
       * - Invalidates relevant queries to refresh the cache.
       * - Displays a success alert to the user.
       * - Optionally redirects the user to a new route.
       */
      onSuccess: async () => {
        if (history && redirectTo) {
          history.push(redirectTo);
        }
        await queryClient.invalidateQueries({
          queryKey: ['shipments'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['allGateways'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['gateways'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['custodians'],
        });
        displayAlert('success', i18n.t('api.successMessages.Successfully edited shipment'));
      },
      /**
       * onError callback: This is triggered when the mutation fails.
       * - Displays the error message to the user.
       */
      onError: (error) => {
        getErrorMessage(section, error, 'edit shipment', displayAlert);
      },
    },
  );
};
