import moment from 'moment-timezone';
import _ from 'lodash';

const showValue = (value, timezone) => (
  value && value !== '-'
    ? moment(value).tz(timezone).format('MMM DD YYYY, h:mm a')
    : value
);

export const ORG_SETTINGS_TOOLTIP = 'Setting(s) for the Organization';

export const CUSTODIAN_TYPE_TOOLTIP = 'Custodian Type(s) available in the system';

export const GATEWAY_TYPE_TOOLTIP = 'Gateway Type(s) available in the system';

export const ITEM_TYPE_TOOLTIP = 'Item Type(s) available in the system';

export const ORGANIZATION_TYPE_TOOLTIP = 'Organization Type(s) available in the system';

export const PRODUCT_TOOLTIP = 'Product(s) available in the system';

export const PRODUCT_TYPE_TOOLTIP = 'Product Type(s) available in the system';

export const SENSOR_TYPE_TOOLTIP = 'Sensor Type(s) available in the system';

export const getColumns = (timezone) => ([
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
      customBodyRender: (value) => showValue(value, timezone),
    },
  },
  {
    name: 'edit_date',
    label: 'Last Edited At',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => showValue(value, timezone),
    },
  },
]);

export const getProductColumns = (timezone) => ([
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
    name: 'unit_of_measure',
    label: 'Unit of Measure',
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
      customBodyRender: (value) => showValue(value, timezone),
    },
  },
  {
    name: 'edit_date',
    label: 'Last Edited At',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => showValue(value, timezone),
    },
  },
]);
