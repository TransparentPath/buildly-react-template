import moment from 'moment-timezone';

/**
 * List of supported date display formats.
 * Each object includes:
 * - `label`: How the date looks when formatted.
 * - `value`: The format string used by Moment.js.
 */
export const DATE_DISPLAY_CHOICES = [
  { label: moment().format('MMM DD, YYYY'), value: 'MMM DD, YYYY' }, // e.g., Apr 15, 2025
  { label: moment().format('DD MMM, YYYY'), value: 'DD MMM, YYYY' }, // e.g., 15 Apr, 2025
  { label: moment().format('MM/DD/YYYY'), value: 'MM/DD/YYYY' }, // e.g., 04/15/2025
  { label: moment().format('DD/MM/YYYY'), value: 'DD/MM/YYYY' }, // e.g., 15/04/2025
];

/**
 * List of supported time display formats.
 * Used to toggle between 12-hour and 24-hour clocks.
 */
export const TIME_DISPLAY_CHOICES = [
  { label: '12 Hour clock', value: 'hh:mm:ss A' }, // e.g., 03:30:00 PM
  { label: '24 Hour clock', value: 'HH:mm:ss' }, // e.g., 15:30:00
];

/**
 * Units of measurement (UOM) for distance.
 */
export const UOM_DISTANCE_CHOICES = ['Miles', 'Kilometers'];

/**
 * Units of measurement (UOM) for temperature.
 */
export const UOM_TEMPERATURE_CHOICES = ['Fahrenheit', 'Celsius'];

/**
 * Units of measurement (UOM) for weight.
 */
export const UOM_WEIGHT_CHOICES = ['Pounds', 'Kilograms'];

/**
 * Available gateway ping intervals used for configuring time-based tracking.
 * Each object includes:
 * - `value`: Time in minutes.
 * - `label`: Full readable label.
 * - `short_label`: Abbreviated label for compact display.
 */
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

/**
 * Shipment statuses available during shipment creation.
 */
export const CREATE_SHIPMENT_STATUS = [
  { value: 'Planned', label: 'Planned' },
  { value: 'En route', label: 'En route' },
  { value: 'Arrived', label: 'Arrived' },
];

/**
 * Shipment statuses visible to end users.
 */
export const USER_SHIPMENT_STATUS = [
  { value: 'Planned', label: 'Planned' },
  { value: 'En route', label: 'En route' },
  { value: 'Arrived', label: 'Arrived' },
  { value: 'Cancelled', label: 'Cancelled' },
];

/**
 * Shipment statuses managed by administrators.
 */
export const ADMIN_SHIPMENT_STATUS = [
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Damaged', label: 'Damaged' },
  { value: 'Battery Depleted', label: 'Battery Depleted' },
];

/**
 * Shipment statuses used to identify incomplete or still-progressing shipments.
 */
export const INCOMPLETED_SHIPMENT_STATUS = [
  { value: 'Planned', label: 'Planned' },
  { value: 'En route', label: 'En route' },
  { value: 'Arrived', label: 'Arrived' },
  { value: 'Completed', label: 'Completed' },
];

/**
 * Supported interface languages for the application.
 * Used for localization/internationalization (i18n).
 */
export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Portuguese (Brazil)' },
  { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'ja', label: 'Japanese' },
  { value: 'it', label: 'Italian' },
  { value: 'ar', label: 'Arabic' },
];

/**
 * Possible gateway actions that can be triggered from the UI.
 * These represent system-level operations on gateways/devices.
 */
export const GATEWAY_ACTIONS = [
  { value: 'Change Status', label: 'Change Status' },
  { value: 'Remove Tracker', label: 'Remove Tracker' },
  { value: 'Assign Shipper', label: 'Assign Shipper' },
];

/**
 * Supported order types related to hardware devices (Solo 5G models).
 */
export const ORDER_TYPES = [
  { value: 'Tive Non Lithium Solo 5G', label: 'Tive Non Lithium Solo 5G' },
  { value: 'Tive Lithium Solo 5G', label: 'Tive Lithium Solo 5G' },
];

/**
 * Static list of months for use in date pickers, filters, or reporting interfaces.
 */
export const MONTHS = [
  { value: 'January', label: 'January' },
  { value: 'February', label: 'February' },
  { value: 'March', label: 'March' },
  { value: 'April', label: 'April' },
  { value: 'May', label: 'May' },
  { value: 'June', label: 'June' },
  { value: 'July', label: 'July' },
  { value: 'August', label: 'August' },
  { value: 'September', label: 'September' },
  { value: 'October', label: 'October' },
  { value: 'November', label: 'November' },
  { value: 'December', label: 'December' },
];
