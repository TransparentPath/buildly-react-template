import React from 'react';
import moment from 'moment-timezone';
import _ from 'lodash';
import {
  AccessTime as AccessTimeIcon, Warning as WarningIcon,
} from '@mui/icons-material';
import {
  TempIcon,
  HumidIcon,
  LightIcon,
  BatteryIcon,
  PressureIcon,
  TiltIcon,
  ShockIcon,
} from '../components/Icons/Icons';
import { numberWithCommas } from './utilMethods';
import { Typography } from '@mui/material';

const showValue = (value, timezone, dateFormat, timeFormat) => (
  value && value !== '-'
    ? moment(value).tz(timezone).format(`${dateFormat} ${timeFormat}`)
    : value
);

export const ALERTS_REPORT_TOOLTIP = 'Shipment Alerts till current time';
export const CONSORTIUM_TOOLTIP = 'Consortium(s) available in this Organization';
export const CUSTODIAN_TYPE_TOOLTIP = 'Custodian Type(s) available in the system';
export const DASHBOARD_DELAY_TOOLTIP = 'Shipments which are delayed';
export const DASHBOARD_MAP_TOOLTIP = 'Start and end locations of custodians which have current custody of the shipments that are currently enroute.';
export const DASHBOARD_RECALL_TOOLTIP = 'Shipments which are either recalled or have violations such as temperature, humidity and delay';
export const GATEWAY_TYPE_TOOLTIP = 'Gateway Type(s) available in the system';
export const ITEM_TYPE_TOOLTIP = 'Item Type(s) available in the system';
export const MAPPING_TOOLTIP = 'Mapping Custodian to Organization(s)';
export const ORG_SETTINGS_TOOLTIP = 'Setting(s) for the Organization';
export const ORGANIZATION_TYPE_TOOLTIP = 'Organization Type(s) available in the system';
export const PRODUCT_TOOLTIP = 'Product(s) available in the system';
export const PRODUCT_TYPE_TOOLTIP = 'Product Type(s) available in the system';
export const SENSOR_TYPE_TOOLTIP = 'Sensor Type(s) available in the system';
export const SHIPMENT_OVERVIEW_TOOL_TIP = 'Select a shipment to view reporting data';

export const getColumns = (timezone, dateFormat, timeFormat) => ([
  {
    name: 'name',
    label: 'Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'create_date',
    label: 'Created At',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => showValue(value, timezone, dateFormat, timeFormat),
    },
  },
  {
    name: 'edit_date',
    label: 'Last Edited At',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => showValue(value, timezone, dateFormat, timeFormat),
    },
  },
]);

export const getProductColumns = (timezone, uomw, dateFormat, timeFormat) => ([
  {
    name: 'name',
    label: 'Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'description',
    label: 'Description',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'value',
    label: 'Value',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => Number(value).toFixed(1),
    },
  },
  {
    name: 'gross_weight',
    label: 'Gross Weight',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => Number(value).toFixed(0),
    },
  },
  {
    name: 'name',
    label: 'Unit of Measure',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: () => uomw,
    },
  },
  {
    name: 'create_date',
    label: 'Created At',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => showValue(value, timezone, dateFormat, timeFormat),
    },
  },
  {
    name: 'edit_date',
    label: 'Last Edited At',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => showValue(value, timezone, dateFormat, timeFormat),
    },
  },
]);

export const getMappingOrg = (allOrgs) => ([
  {
    name: 'name',
    label: 'Custodian Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'custody_org_uuid',
    label: 'Mapped Organization',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => {
        let returnValue = '-';
        if (value) {
          const org = _.find(allOrgs, { organization_uuid: value });
          if (org) {
            returnValue = org.name;
          }
        }
        return returnValue;
      },
    },
  },
]);

export const getConsortiumColumns = (timezone, dateFormat, timeFormat) => ([
  {
    name: 'name',
    label: 'Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'create_date',
    label: 'Created At',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        value && value !== '-'
          ? moment(value).tz(timezone).format(`${dateFormat} ${timeFormat}`)
          : value
      ),
    },
  },
  {
    name: 'edit_date',
    label: 'Last Edited At',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        value && value !== '-'
          ? moment(value).tz(timezone).format(`${dateFormat} ${timeFormat}`)
          : value
      ),
    },
  },
]);

export const custodianColumns = [
  {
    name: 'name',
    label: 'Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'location',
    label: 'Location',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'custodian_glns',
    label: 'GLN',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => value || '-',
    },
  },
];

export const getUniqueContactInfo = (rowItem, contactInfo) => {
  let obj = '';
  _.forEach(contactInfo, (info) => {
    if (rowItem.contact_data[0] === info.url) {
      obj = info;
    }
  });
  return obj;
};

export const getCustodianFormattedRow = (data, contactInfo, custodyData) => {
  if (data && data.length && contactInfo && contactInfo.length) {
    let customizedRow = [];
    _.forEach(data, (rowItem) => {
      const contactInfoItem = getUniqueContactInfo(rowItem, contactInfo);
      const location = `${contactInfoItem.address1
        && `${contactInfoItem.address1},`
      } ${contactInfoItem.address2
        && `${contactInfoItem.address2},`
      } ${contactInfoItem.city
        && `${contactInfoItem.city},`
      } ${contactInfoItem.state
        && `${contactInfoItem.state},`
      } ${contactInfoItem.country
        && `${contactInfoItem.country},`
      } ${contactInfoItem.postal_code
        && `${contactInfoItem.postal_code}`
      }`;
      const editedData = { ...rowItem, location };
      customizedRow = [...customizedRow, editedData];
    });

    return _.orderBy(
      customizedRow,
      ['name'],
      ['asc'],
    );
  }
  return data;
};

export const recallColumns = [
  {
    name: 'name',
    label: 'Shipment Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
    },
  },
  {
    name: 'itemNo',
    label: 'Affected Items',
    options: {
      sort: true,
      sortThirdClickReset: true,
    },
  },
  {
    name: 'custodian_name',
    label: 'Current Custodians',
    options: {
      sort: true,
      sortThirdClickReset: true,
    },
  },
];

export const delayColumns = [
  {
    name: 'name',
    label: 'Shipment Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
    },
  },
  {
    name: 'delay',
    label: 'Delay(hrs)',
    options: {
      sort: true,
      sortThirdClickReset: true,
    },
  },
  {
    name: 'itemNo',
    label: 'Items',
    options: {
      sort: true,
      sortThirdClickReset: true,
    },
  },
  {
    name: 'risk',
    label: 'Revenue Risk',
    options: {
      sort: true,
      sortThirdClickReset: true,
      customBodyRender: (value) => (
        value && value !== '-'
          ? `$${numberWithCommas(value)}`
          : value
      ),
    },
  },
  {
    name: 'custodian',
    label: 'Current Custodians',
    options: {
      sort: true,
      sortThirdClickReset: true,
    },
  },
];

export const getFormattedCustodyRows = (custodyData, custodianData) => {
  let customizedRows = [];
  let counter = 2;
  if (custodyData && custodianData) {
    const custodyLength = custodyData.length;
    _.forEach(custodyData, (custody) => {
      const editedCustody = custody;
      if (!custody.load_id) {
        if (custody.first_custody) {
          editedCustody.load_id = 1;
        } else if (custody.last_custody) {
          editedCustody.load_id = custodyLength;
        } else {
          editedCustody.load_id = counter;
          counter += 1;
        }
      }

      _.forEach(custodianData, (custodian) => {
        if (custody.custodian[0] === custodian.url) {
          editedCustody.custodian_name = custodian.name;
          editedCustody.custodian_data = custodian;
        }
      });

      customizedRows = [...customizedRows, editedCustody];
    });
  }

  return _.orderBy(
    customizedRows,
    ['custodian_name'],
    ['asc'],
  );
};

export const getFormattedShipmentRow = (
  shipmentData,
  custodianData,
  itemData,
  custodyData,
  aggregateReportData,
) => {
  let shipmentList = [];
  let custodyRows = [];
  if (
    custodyData
    && custodianData
    && custodyData.length
    && custodianData.length
  ) {
    custodyRows = getFormattedCustodyRows(custodyData, custodianData);
  }

  _.forEach(shipmentData, (shipment) => {
    const editedShipment = shipment;
    let itemName = '';
    let custodyInfo = [];
    let custodianName = '';
    let aggregateReportInfo = [];

    if (custodyRows.length > 0) {
      _.forEach(custodyRows, (custody) => {
        if (
          custody.shipment_id === shipment.shipment_uuid
          && custody.has_current_custody
        ) {
          custodianName = custodianName
            ? `${custodianName}, ${custody.custodian_data.name}`
            : custody.custodian_data.name;
          custodyInfo = [...custodyInfo, custody];
        }
      });
    }
    editedShipment.custodian_name = custodianName;
    editedShipment.custody_info = custodyInfo;

    if (
      aggregateReportData
      && aggregateReportData.length > 0
    ) {
      _.forEach(aggregateReportData, (report) => {
        if (report.shipment_id === shipment.partner_shipment_id) {
          aggregateReportInfo = [
            ...aggregateReportInfo,
            report,
          ];
        }
      });
    }

    editedShipment.sensor_report = aggregateReportInfo;

    if (
      itemData
      && shipment.items
      && shipment.items.length
    ) {
      _.forEach(itemData, (item) => {
        if (_.indexOf(shipment.items, item.url) !== -1) {
          itemName = `${itemName + item.name}, `;
          editedShipment.itemNo = itemName;
        }
      });
    }

    shipmentList = [...shipmentList, editedShipment];
  });
  return shipmentList;
};

export const itemColumns = (currUnit) => ([
  {
    name: 'name',
    label: 'Item Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'number_of_units',
    label: '# of Units',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'item_type_value',
    label: 'Item Type',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'value',
    label: 'Value',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        value && value !== '-'
          ? `${numberWithCommas(value)} ${currUnit}`
          : value
      ),
    },
  },
  {
    name: 'gross_weight',
    label: 'Gross Weight',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        value && value !== '-'
          ? `${numberWithCommas(value)}`
          : value
      ),
    },
  },
  {
    name: 'unitMeasure',
    label: 'Unit of Measure',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
]);

export const getItemFormattedRow = (data, itemTypeList, unitOfMeasure) => {
  if (data && itemTypeList) {
    let formattedData = [];
    const uomw = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'weight')) || '';
    const uom = uomw ? uomw.unit_of_measure : '';

    _.forEach(data, (element) => {
      let editedData = element;
      _.forEach(itemTypeList, (type) => {
        if (type.url === element.item_type) {
          editedData = {
            ...editedData,
            item_type_value: type.name,
            unitMeasure: uom,
          };
        }
      });
      formattedData = [...formattedData, editedData];
    });

    return _.orderBy(
      formattedData,
      (dataRow) => moment(dataRow.create_date),
      ['asc'],
    );
  }
  return data;
};

export const SHIPMENT_OVERVIEW_COLUMNS = [
  {
    name: 'name',
    label: 'Shipment Name',
  },
  {
    name: 'status',
    label: 'Shipment Status',
  },
  {
    name: 'estimated_time_of_departure',
    label: 'Estimated Pickup Time',
  },
  {
    name: 'actual_time_of_departure',
    label: 'Actual Pickup Time',
  },
  {
    name: 'estimated_time_of_arrival',
    label: 'Estimated Arrival Time',
  },
  {
    name: 'actual_time_of_arrival',
    label: 'Actual Arrival Time',
  },
  {
    name: 'had_alert',
    label: 'Had Alerts(s)',
  },
  {
    name: 'custodian_name',
    label: 'Custodian Name',
  },
  {
    name: 'custody_info',
    label: 'Custody Details',
  },
];

export const getIcon = (item, color) => {
  switch (item.id) {
    case 'temperature':
    case 'probe':
      return <TempIcon color={color} name={item.name} />;

    case 'light':
      return <LightIcon color={color} name={item.name} />;

    case 'shock':
      return <ShockIcon color={color} name={item.name} />;

    case 'tilt':
      return <TiltIcon color={color} name={item.name} />;

    case 'humidity':
      return <HumidIcon color={color} name={item.name} />;

    case 'battery':
      return <BatteryIcon color={color} name={item.name} />;

    case 'pressure':
      return <PressureIcon color={color} name={item.name} />;

    case 'time':
      return <AccessTimeIcon />;

    default:
      return null;
  }
};

export const getShipmentOverview = (
  shipmentData,
  custodianData,
  custodyData,
  aggregateReportData,
  alertsData,
  contactData,
  timezone,
  unitOfMeasure,
) => {
  let shipmentList = [];
  let custodyRows = [];
  if (
    custodyData
    && custodianData
    && custodyData.length
    && custodianData.length
  ) {
    custodyRows = getFormattedCustodyRows(custodyData, custodianData);
  }

  _.forEach(shipmentData, (shipment) => {
    const editedShipment = shipment;
    let custodyInfo = [];
    let custodianName = '';
    let aggregateReportInfo = [];
    let contactInfo = [];
    let temperatureData = [];
    let lightData = [];
    let shockData = [];
    let tiltData = [];
    let humidityData = [];
    let batteryData = [];
    let pressureData = [];
    let probeData = [];
    let markersToSet = [];
    editedShipment.sensor_report = [];
    const dateFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure;
    const timeFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure;

    const alerts = _.filter(
      alertsData,
      (alert) => alert.parameter_type !== 'location' && alert.shipment_id === shipment.partner_shipment_id,
    );

    if (custodyRows.length > 0) {
      _.forEach(custodyRows, (custody) => {
        const editedCustody = custody;
        if (custody.shipment_id === shipment.shipment_uuid && custody.custodian_data) {
          custodianName = custodianName
            ? `${custodianName}, ${custody.custodian_data.name}`
            : custody.custodian_data.name;
          _.forEach(contactData, (contact) => {
            const editedContact = contact;
            if (custody.custodian_data.contact_data[0] === contact.url) {
              editedContact.name = [
                contact.first_name,
                contact.middle_name,
                contact.last_name,
              ].join(' ');
              editedContact.address = [
                contact.address1,
                contact.address2,
                contact.city,
                contact.postal_code,
                contact.state,
                contact.country,
              ].join('\n');
              contactInfo = [...contactInfo, editedContact];
            }
          });
          if (custody.has_current_custody) {
            editedCustody.custody_type = 'Current';
          } else if (custody.first_custody) {
            editedCustody.custody_type = 'First';
          } else if (custody.last_custody) {
            editedCustody.custody_type = 'Last';
          } else {
            editedCustody.custody_type = 'NA';
          }
          custodyInfo = [...custodyInfo, editedCustody];
        }
      });
    }
    editedShipment.custodian_name = custodianName;
    editedShipment.custody_info = custodyInfo;
    editedShipment.contact_info = contactInfo;

    if (
      aggregateReportData
      && aggregateReportData.length > 0
    ) {
      let counter = 0;
      _.forEach(aggregateReportData, (report) => {
        if (
          report.shipment_id === shipment.partner_shipment_id
          && report.report_entries.length > 0
        ) {
          _.forEach(report.report_entries, (report_entry) => {
            try {
              counter += 1;
              let marker = {};
              const temperature = _.toLower(tempUnit) === 'fahrenheit'
                ? report_entry.report_temp_fah
                : _.round(report_entry.report_temp_cel, 2).toFixed(2);
              const probe = _.toLower(tempUnit) === 'fahrenheit'
                ? report_entry.report_probe_fah
                : _.round(report_entry.report_temp_cel, 2).toFixed(2);
              let dateTime = '';
              let alert_status = '-';
              if ('report_timestamp' in report_entry) {
                if (report_entry.report_timestamp !== null) {
                  dateTime = moment(report_entry.report_timestamp)
                    .tz(timezone).format(`${dateFormat} ${timeFormat}`);
                }
              } else if ('report_location' in report_entry) {
                dateTime = moment(
                  report_entry.report_location.timeOfPosition,
                ).tz(timezone).format(`${dateFormat} ${timeFormat}`);
              }

              _.forEach(alerts, (alert) => {
                const alertTime = moment(alert.create_date).tz(timezone).format(`${dateFormat} ${timeFormat}`);
                if (alertTime === dateTime) {
                  if (alert.recovered_alert_id !== null) {
                    alert_status = 'RECOVERED';
                  } else {
                    alert_status = 'YES';
                  }
                }
              });
              // For a valid (latitude, longitude) pair: -90<=X<=+90 and -180<=Y<=180
              if (report_entry.report_location !== null
                && report_entry.report_latitude !== null
                && report_entry.report_longitude !== null) {
                const latitude = report_entry.report_latitude
                  || report_entry.report_location.latitude;
                const longitude = report_entry.report_longitude
                  || report_entry.report_location.longitude;
                if (
                  (latitude >= -90
                    && latitude <= 90)
                  && (longitude >= -180
                    && longitude <= 180)
                  && dateTime !== ''
                ) {
                  marker = {
                    lat: latitude,
                    lng: longitude,
                    location: report_entry.report_location,
                    label: 'Clustered',
                    temperature,
                    light: report_entry.report_light,
                    shock: report_entry.report_shock,
                    tilt: report_entry.report_tilt,
                    humidity: report_entry.report_humidity,
                    battery: report_entry.report_battery,
                    pressure: report_entry.report_pressure,
                    probe,
                    color: 'green',
                    timestamp: dateTime,
                    alert_status,
                  };
                  // Considered use case: If a shipment stays at some
                  // position for long, other value changes can be
                  // critical
                  const markerFound = _.find(markersToSet, {
                    lat: marker.lat,
                    lng: marker.lng,
                  });

                  if (!markerFound) {
                    markersToSet = [...markersToSet, marker];
                  }
                }
              } else {
                marker = {
                  lat: '*',
                  lng: '*',
                  location: 'N/A',
                  label: 'Clustered',
                  temperature,
                  light: report_entry.report_light,
                  shock: report_entry.report_shock,
                  tilt: report_entry.report_tilt,
                  humidity: report_entry.report_humidity,
                  battery: report_entry.report_battery,
                  pressure: report_entry.report_pressure,
                  probe,
                  color: 'green',
                  timestamp: dateTime,
                  alert_status,
                };
              }
              aggregateReportInfo = [
                ...aggregateReportInfo,
                marker,
              ];

              const graphPoint = _.find(temperatureData, {
                x: dateTime,
              });
              if (!graphPoint) {
                temperatureData = [
                  ...temperatureData,
                  {
                    x: dateTime,
                    y: temperature,
                  },
                ];
                lightData = [
                  ...lightData,
                  {
                    x: dateTime,
                    y: report_entry.report_light,
                  },
                ];
                shockData = [
                  ...shockData,
                  {
                    x: dateTime,
                    y: report_entry.report_shock,
                  },
                ];
                tiltData = [
                  ...tiltData,
                  {
                    x: dateTime,
                    y: report_entry.report_tilt,
                  },
                ];
                humidityData = [
                  ...humidityData,
                  {
                    x: dateTime,
                    y: report_entry.report_humidity,
                  },
                ];
                batteryData = [
                  ...batteryData,
                  {
                    x: dateTime,
                    y: report_entry.report_battery,
                  },
                ];
                pressureData = [
                  ...pressureData,
                  {
                    x: dateTime,
                    y: report_entry.report_pressure,
                  },
                ];
                probeData = [
                  ...probeData,
                  {
                    x: dateTime,
                    y: probe,
                  },
                ];
              }
            } catch (e) {
              // eslint-disable-next-line no-console
              console.log(e);
            }
          });
        }
      });
    }

    editedShipment.sensor_report = aggregateReportInfo;
    editedShipment.markers_to_set = _.orderBy(
      markersToSet,
      (item) => moment(item.timestamp),
      ['asc'],
    );
    editedShipment.temperature = temperatureData;
    editedShipment.light = lightData;
    editedShipment.shock = shockData;
    editedShipment.tilt = tiltData;
    editedShipment.humidity = humidityData;
    editedShipment.battery = batteryData;
    editedShipment.pressure = pressureData;
    editedShipment.probe = probeData;

    shipmentList = [...shipmentList, editedShipment];
  });

  return _.orderBy(
    shipmentList,
    (shipment) => moment(shipment.estimated_time_of_departure)
      && moment(shipment.create_date),
    ['desc'],
  );
};

export const tempUnit = (uomt) => {
  let unit = '';
  if (uomt) {
    if (_.toLower(uomt.unit_of_measure) === 'fahrenheit') {
      unit = '\u00b0F';
    } else if (_.toLower(uomt.unit_of_measure) === 'celsius') {
      unit = '\u00b0C';
    }
  }

  return unit;
};

export const REPORT_TYPES = (unitOfMeasure) => ([
  { id: 'temperature', name: 'Temperature', unit: tempUnit(_.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature'))) },
  { id: 'light', name: 'Light', unit: 'LUX' },
  { id: 'shock', name: 'Shock', unit: 'G' },
  { id: 'tilt', name: 'Tilt', unit: 'deg' },
  { id: 'humidity', name: 'Humidity', unit: '%' },
  { id: 'battery', name: 'Battery', unit: '%' },
  { id: 'pressure', name: 'Pressure', unit: 'Pa' },
  { id: 'probe', name: 'Probe Temperature', unit: tempUnit(_.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature'))) },
]);

export const SENSOR_REPORT_COLUMNS = (unitOfMeasure, timezone) => ([
  {
    name: 'alert_status',
    label: 'ALERT STATUS',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customHeadLabelRender: () => <WarningIcon />,
    },
  },
  {
    name: 'timestamp',
    label: 'DATE-TIME',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => {
        const dateFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
          ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
          : '';
        const timeFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
          ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
          : '';

        return (
          value && value !== '-'
            ? moment(value).tz(timezone).format(`${dateFormat} ${timeFormat}`)
            : value
        );
      },
    },
  },
  {
    name: 'location',
    label: 'Location',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      setCellProps: () => ({ style: { maxWidth: '300px', wordWrap: 'break-word' } }),
    },
  },
  {
    name: 'temperature',
    label: `TEMP ${tempUnit(_.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature')))}`,
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (_.toNumber(value) ? _.round(value, 2).toFixed(2) : 'N/A'),
    },
  },
  {
    name: 'humidity',
    label: 'HUM %',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (_.toNumber(value) ? _.round(value, 2).toFixed(2) : 'N/A'),
    },
  },
  {
    name: 'light',
    label: 'LIGHT (LUX)',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (_.toNumber(value) ? _.round(value, 2).toFixed(2) : 'N/A'),
    },
  },
  {
    name: 'shock',
    label: 'SHOCK (G)',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (_.toNumber(value) ? _.round(value, 2).toFixed(2) : 'N/A'),
    },
  },
  {
    name: 'tilt',
    label: 'TILT (deg)',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      display: false,
      customBodyRender: (value) => (_.toNumber(value) ? _.round(value, 2).toFixed(2) : 'N/A'),
    },
  },
  {
    name: 'pressure',
    label: 'PRESS (Pa)',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      display: false,
      customBodyRender: (value) => (_.toNumber(value) ? _.round(value, 2).toFixed(2) : 'N/A'),
    },
  },
  {
    name: 'battery',
    label: 'BATTERY',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      display: false,
      customBodyRender: (value) => (_.toNumber(value) ? value : 'N/A'),
    },
  },
  {
    name: 'probe',
    label: `PROBE TEMP ${tempUnit(_.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature')))}`,
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      display: false,
      customBodyRender: (value) => (_.toNumber(value) ? _.round(value, 2).toFixed(2) : 'N/A'),
    },
  },
]);

export const getAlertsReportColumns = (aggregateReport, timezone, dateFormat, timeFormat) => ([
  // {
  //   name: 'id',
  //   label: 'Alert ID',
  //   options: {
  // sort: true,
  // sortThirdClickReset: true,
  //   },
  // },
  {
    name: 'parameter_type',
    label: 'Condition',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        value && value !== '-'
          ? _.capitalize(value)
          : '-'
      ),
    },
  },
  {
    name: 'parameter_value',
    label: 'Value',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => {
        let formattedValue = '';
        if (value && _.includes(value, ' F/') && _.includes(value, ' C')) {
          const [val1, val2] = _.split(value, ' F/');
          const [temp, unit] = _.split(val2, ' ');
          formattedValue = `${val1} F/${_.round(Number(temp), 2).toFixed(2)} ${unit}`;
        } else {
          formattedValue = value || '-';
        }

        return formattedValue;
      },
    },
  },
  {
    name: 'alert_type',
    label: 'Alert Message',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => {
        let returnValue = value;
        if (value && value !== '-') {
          switch (value) {
            case 'min-warning':
              returnValue = 'Minimum Warning';
              break;

            case 'min-excursion':
              returnValue = 'Minimum Excursion';
              break;

            case 'max-warning':
              returnValue = 'Maximum Excursion';
              break;

            case 'max-excursion':
              returnValue = 'Maximum Excursion';
              break;

            default:
              break;
          }
        }
        return returnValue;
      },
    },
  },
  {
    name: 'recovered_alert_id',
    label: 'Recovered',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (value ? 'YES' : 'NO'),
    },
  },
  // {
  //   name: 'recovered_alert_id',
  //   label: 'Recovered Alert ID',
  //   options: {
  // sort: true,
  // sortThirdClickReset: true,
  // filter: true,
  // customBodyRender: (value) => (value || '-'),
  //   },
  // },
  {
    name: 'create_date',
    label: 'Location',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => {
        let location = '';
        if (value && value !== '-') {
          const dt = moment(value).tz(timezone).format(`${dateFormat} ${timeFormat}`);
          const report = _.find(aggregateReport, { timestamp: dt });
          if (report) {
            location = report.location;
          }
        }

        return location;
      },
      setCellProps: () => ({ style: { maxWidth: '300px', wordWrap: 'break-word' } }),
    },
  },
  {
    name: 'create_date',
    label: 'Date/Time stamp',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        value && value !== '-'
          ? moment(value).tz(timezone).format(`${dateFormat} ${timeFormat}`)
          : value
      ),
    },
  },
]);

export const gatewayColumns = (timezone, dateFormat) => ([
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
      customBodyRender: (value) => (
        value && value !== '-' ? _.join(value, ',') : value
      ),
    },
  },
  {
    name: 'custodian',
    label: 'Custodian',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        value && value !== '-' ? _.join(value, ',') : value
      ),
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
          ? moment(value).tz(timezone).format(`${dateFormat}`)
          : value
      ),
    },
  },
]);

export const getGatewayFormattedRow = (data, gatewayTypeList, shipmentData, custodianData) => {
  if (
    data
    && gatewayTypeList
  ) {
    let formattedData = [];
    _.forEach(data, (element) => {
      if (!element) return;
      let edited = { ...element, shipment: [], custodian: [] };
      _.forEach(gatewayTypeList, (type) => {
        if (type.url === element.gateway_type) {
          edited = {
            ...edited,
            gateway_type_value: type.name,
          };
        }
      });
      if (shipmentData && shipmentData.length) {
        _.forEach(shipmentData, (shipment) => {
          if (shipment.partner_shipment_id !== null && !_.isEmpty(element.shipment_ids)
            && element.shipment_ids.includes(shipment.id.toString())
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
      if (custodianData && custodianData.length) {
        _.forEach(custodianData, (custodian) => {
          if (element.custodian_uuid && element.custodian_uuid === custodian.custodian_uuid) {
            edited = {
              ...edited,
              custodian: [
                ...edited.custodian,
                custodian.name,
              ],
            };
          }
        });
      }
      if (edited.shipment.length === 0) {
        edited.shipment = '-';
      }
      if (edited.custodian.length === 0) {
        edited.custodian = '-';
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

export const sensorsColumns = (timezone, dateFormat) => ([
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
          ? moment(value).tz(timezone).format(`${dateFormat}`)
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

export const getSensorFormattedRow = (data, sensorTypeList, gatewayData) => {
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

export const shipmentColumns = (timezone, dateFormat) => ([
  {
    name: 'name',
    label: 'Shipment Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
    customBodyRender: (value) => (
      <Typography sx={{ whiteSpace: 'nowrap' }}>
        {value}
      </Typography>
    ),
  },
  {
    name: 'status',
    label: 'Status',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'estimated_time_of_departure',
    label: 'Depart',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        value && value !== '-'
          ? moment(value).tz(timezone)
            .format(`${dateFormat}`)
          : value
      ),
    },
  },
  {
    name: 'origin',
    label: 'Origin',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
    customBodyRender: (value) => (
      <Typography sx={{ whiteSpace: 'nowrap' }}>
        {value}
      </Typography>
    ),
  },
  {
    name: 'estimated_time_of_arrival',
    label: 'Arrive',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        value && value !== '-'
          ? moment(value).tz(timezone)
            .format(`${dateFormat}`)
          : value
      ),
    },
  },
  {
    name: 'destination',
    label: 'Destination',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
    customBodyRender: (value) => (
      <Typography sx={{ whiteSpace: 'nowrap' }}>
        {value}
      </Typography>
    ),
  },
  {
    name: 'alerts',
    label: 'Alerts',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        !_.isEmpty(value)
          ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {_.map(value, (item, idx) => (
                <div key={`icon-${idx}-${item.id}`}>
                  {getIcon(item)}
                  {' '}
                </div>
              ))}
            </div>
          ) : ''
      ),
    },
  },
  {
    name: 'itemNames',
    label: 'Items',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        <Typography sx={{ whiteSpace: 'nowrap' }}>
          {value}
        </Typography>
      ),
    },
  },
  {
    name: 'tracker',
    label: 'Tracker',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => (
        <Typography sx={{ whiteSpace: 'nowrap' }}>
          {value}
        </Typography>
      ),
    },
  },
]);

export const getShipmentFormattedRow = (
  shipmentData,
  custodianData,
  custodyData,
  itemData,
  gatewayData,
  allAlerts,
) => {
  let shipmentList = [];
  let custodyRows = [];

  if (!_.isEmpty(custodyData) && !_.isEmpty(custodianData)) {
    custodyRows = getFormattedCustodyRows(custodyData, custodianData);
  }

  _.forEach(shipmentData, (shipment) => {
    const editedShipment = shipment;
    let firstCustody = null;
    let lastCustody = null;
    let origin = null;
    let destination = null;

    if (!_.isEmpty(custodyRows)) {
      // From list of custodians attached to the shipment find the first custody for the shipment
      // First custody can be
      // 1. A custody whose first_custody is set to True
      // 2. The custody attached very first to the shipment
      const custodies = _.orderBy(_.filter(custodyRows,
        { shipment_id: editedShipment.shipment_uuid }), 'create_date', 'asc');

      [firstCustody] = _.filter(custodies, { first_custody: true });
      if (firstCustody === undefined) {
        origin = 'N/A';
      } else {
        origin = firstCustody.custodian_name;
      }

      [lastCustody] = _.filter(custodies, { last_custody: true });
      if (lastCustody === undefined) {
        destination = 'N/A';
      } else {
        destination = lastCustody.custodian_name;
      }
    }
    editedShipment.origin = origin;
    editedShipment.destination = destination;

    switch (_.lowerCase(shipment.status)) {
      case 'planned':
      case 'enroute':
        editedShipment.type = 'Active';
        break;

      case 'completed':
        editedShipment.type = 'Completed';
        break;

      case 'cancelled':
        editedShipment.type = 'Cancelled';
        break;

      default:
        break;
    }

    if (!_.isEmpty(itemData)) {
      const items = _.filter(itemData, (item) => _.includes(editedShipment.items, item.url));
      editedShipment.itemNames = _.toString(_.join(_.map(items, 'name'), ','));
    }

    if (!_.isEmpty(gatewayData)) {
      const gateways = _.filter(gatewayData, (gateway) => (
        _.includes(editedShipment.gateway_imei, _.toString(gateway.imei_number))
      ));
      editedShipment.tracker = (!_.isEmpty(gateways) && _.toString(_.join(_.map(gateways, 'name'), ','))) || 'N/A';
    }

    if (editedShipment.had_alert) {
      const recovered = _.map(allAlerts, 'recovered_alert_id');
      const filteredAlerts = _.filter(allAlerts, (alert) => (
        alert.shipment_id === editedShipment.partner_shipment_id
        && !_.includes(recovered, _.toString(alert.id))
        && !alert.recovered_alert_id
      ));

      editedShipment.alerts = _.map(filteredAlerts, (alert) => ({ id: alert.parameter_type }));
    }

    shipmentList = [...shipmentList, editedShipment];
  });

  return _.orderBy(
    shipmentList,
    (shipment) => moment(shipment.estimated_time_of_departure)
      && moment(shipment.create_date),
    ['desc'],
  );
};
