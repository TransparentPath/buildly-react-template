import moment from 'moment-timezone';
import _ from 'lodash';

export const gatewayColumns = (timezone) => ([
  {
    name: 'name',
    label: 'Gateway Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'gateway_type_value',
    label: 'Type',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => _.upperCase(value),
    },
  },
  {
    name: 'last_known_battery_level',
    label: 'Battery',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'gateway_status',
    label: 'Status',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        value && value !== '-'
          ? _.capitalize(value)
          : value
      ),
    },
  },
  {
    name: 'shipment',
    label: 'Shipments',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'activation_date',
    label: 'Activation',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        value && value !== '-'
          ? moment(value).tz(timezone).format('MM/DD/yyyy')
          : value
      ),
    },
  },
]);

export const getFormattedRow = (data, itemTypeList, shipmentData) => {
  if (
    data
    && itemTypeList
  ) {
    let formattedData = [];
    _.forEach(data, (element) => {
      let edited = { ...element, shipment: [] };
      _.forEach(itemTypeList, (type) => {
        if (type.url === element.gateway_type) {
          edited = {
            ...edited,
            gateway_type_value: type.name,
          };
        }
      });
      if (shipmentData && shipmentData.length) {
        _.forEach(shipmentData, (shipment) => {
          if (
            element.shipment_ids
            && element.shipment_ids.includes(shipment.partner_shipment_id)
          ) {
            edited = {
              ...edited,
              shipment: [
                ...edited.shipment,
                shipment.name,
              ],
            };
          }
        });
      }
      if (edited.shipment.length === 0) {
        edited.shipment = '-';
      }
      formattedData = [...formattedData, edited];
    });

    return _.orderBy(
      formattedData,
      (rowData) => moment(rowData.create_date),
      ['asc'],
    );
  }
  return data;
};

export const sensorsColumns = (timezone) => ([
  {
    name: 'name',
    label: 'Sensor Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'sensor_type_value',
    label: 'Type',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => _.upperCase(value),
    },
  },
  {
    name: 'activation_date',
    label: 'Activated',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        value && value !== '-'
          ? moment(value).tz(timezone).format('MM/DD/yyyy')
          : value
      ),
    },
  },
  {
    name: 'associated_gateway',
    label: 'Associated Gateway',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
]);

export const getFormattedSensorRow = (data, sensorTypeList, gatewayData) => {
  if (data && sensorTypeList) {
    let formattedData = [];
    _.forEach(data, (element) => {
      let edited = element;
      _.forEach(sensorTypeList, (type) => {
        if (type.url === element.sensor_type) {
          edited = {
            ...edited,
            sensor_type_value: type.name,
          };
        }
      });
      if (gatewayData && gatewayData.length) {
        _.forEach(gatewayData, (gateway) => {
          if (gateway.url === element.gateway) {
            edited = {
              ...edited,
              associated_gateway: gateway.name,
            };
          }
        });
      }
      formattedData = [...formattedData, edited];
    });

    return _.orderBy(
      formattedData,
      (dataRow) => moment(dataRow.create_date),
      ['asc'],
    );
  }
  return data;
};

export const GATEWAY_STATUS = [
  { value: 'available', name: 'Available' },
  { value: 'unavailable', name: 'Unavailable' },
  { value: 'assigned', name: 'Assigned' },
  { value: 'in-transit', name: 'In-transit' },
];

export const getAvailableGateways = (
  data,
  gateway_type,
  gatewayTypeList,
  shipmentData,
) => {
  const gatewayData = getFormattedRow(data, gatewayTypeList, shipmentData);
  return (
    _.orderBy(gatewayData, ['name'], ['asc'])
    && _.filter(gatewayData, (gateway) => gateway.gateway_status === 'available'
      && gateway.gateway_type_value.toLowerCase().includes(gateway_type))
  );
};
