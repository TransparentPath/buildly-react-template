import moment from 'moment-timezone';

export const DATE_DISPLAY_CHOICES = [
  { label: moment().format('MMM DD, YYYY'), value: 'MMM DD, YYYY' },
  { label: moment().format('DD MMM, YYYY'), value: 'DD MMM, YYYY' },
  { label: moment().format('MM/DD/YYYY'), value: 'MM/DD/YYYY' },
  { label: moment().format('DD/MM/YYYY'), value: 'DD/MM/YYYY' },
];

export const TIME_DISPLAY_CHOICES = [
  { label: '12 Hour clock', value: 'hh:mm:ss A' },
  { label: '24 Hour clock', value: 'HH:mm:ss' },
];

export const UOM_DISTANCE_CHOICES = ['Miles', 'Kilometers'];

export const UOM_TEMPERATURE_CHOICES = ['Fahrenheit', 'Celsius'];

export const UOM_WEIGHT_CHOICES = ['Pounds', 'Kilograms'];

export const TIVE_GATEWAY_TIMES = [
  { value: 5, label: '5 Minutes', short_label: '5 Min.' },
  { value: 10, label: '10 Minutes', short_label: '10 Min.' },
  { value: 20, label: '20 Minutes', short_label: '20 Min.' },
  { value: 30, label: '30 Minutes', short_label: '30 Min.' },
  { value: 60, label: '1 Hour', short_label: '1 Hr.' },
  { value: 120, label: '2 Hours', short_label: '2 Hrs.' },
  { value: 360, label: '6 Hours', short_label: '6 Hrs.' },
  { value: 720, label: '12 Hours', short_label: '12 Hrs.' },
];

export const CREATE_SHIPMENT_STATUS = [
  { value: 'Planned', label: 'Planned' },
  { value: 'En route', label: 'En route' },
  { value: 'Arrived', label: 'Arrived' },
];

export const USER_SHIPMENT_STATUS = [
  { value: 'Planned', label: 'Planned' },
  { value: 'En route', label: 'En route' },
  { value: 'Arrived', label: 'Arrived' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export const ADMIN_SHIPMENT_STATUS = [
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Damaged', label: 'Damaged' },
  { value: 'Battery Depleted', label: 'Battery Depleted' },
];

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh-CN', label: 'Chinese' },
  { value: 'pt', label: 'Portuguese (Brazil)' },
];
