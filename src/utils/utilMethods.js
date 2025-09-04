import _ from 'lodash';
import moment from 'moment-timezone';
import i18n from '../i18n/index';

/**
 * Checks whether the given user is a Global Admin.
 * A Global Admin is someone whose group is marked as `is_global`
 * and has all permissions set to `true`.
 *
 * @param {Object} userData - User data containing core_groups.
 * @returns {boolean} - True if user is a Global Admin, false otherwise.
 */
export const checkForGlobalAdmin = (userData) => {
  let isGlobalAdmin = false;
  if (userData && userData.core_groups) {
    userData.core_groups.forEach((group) => {
      if (
        group.is_global
        && Object.keys(group.permissions).every(
          (permission) => group.permissions[permission] === true,
        )
      ) {
        isGlobalAdmin = true;
      }
    });
  }
  return isGlobalAdmin;
};

/**
 * Checks whether the given user is an Organization-level Admin.
 * This means `is_org_level` is true, `is_global` is false,
 * and all permissions are set to true.
 *
 * @param {Object} userData - User data containing core_groups.
 * @returns {boolean} - True if user is an Org Admin, false otherwise.
 */
export const checkForAdmin = (userData) => {
  let isAdmin = false;
  if (userData && userData.core_groups) {
    userData.core_groups.forEach((group) => {
      if (
        group.is_org_level
        && !group.is_global
        && Object.keys(group.permissions).every(
          (permission) => group.permissions[permission] === true,
        )
      ) {
        isAdmin = true;
      }
    });
  }
  return isAdmin;
};

/**
 * Retrieves the options value for a specific field name.
 *
 * @param {Object} options - A dictionary of field options.
 * @param {string} fieldName - The field name whose options are needed.
 * @returns {any} - The value of the field's options, or null if not found.
 */
export const setOptionsData = (options, fieldName) => {
  let result = null;
  const optionKeys = Object.keys(options);
  if (optionKeys.includes(fieldName)) {
    result = options[fieldName];
  }
  return result;
};

/**
 * Converts distance between kilometers and miles.
 *
 * @param {string} currentUom - The current unit of measure (e.g., 'miles' or 'kilometers').
 * @param {number} radius - The distance value to convert.
 * @returns {number} - The converted distance.
 */
export const uomDistanceUpdate = (currentUom, radius) => {
  let convertedRadius = 0;
  switch (true) {
    case _.toLower(currentUom) === 'kilometers':
      convertedRadius = radius / 0.62137;
      break;

    case _.toLower(currentUom) === 'miles':
      convertedRadius = radius * 0.62137;
      break;

    default:
      convertedRadius = radius;
      break;
  }

  return convertedRadius;
};

/**
 * Extracts the country from an address string.
 * Assumes country is the last segment in the address after the final comma.
 *
 * @param {string} address - A full address string.
 * @returns {string|null} - The extracted country, or null if not found.
 */
export const extractCountry = (address) => {
  const countryRegex = /(?:^|,)\s*([A-Za-z\s]+)$/;
  const matches = address.match(countryRegex);
  if (matches && matches[1]) {
    return matches[1].trim();
  }
  return null;
};

/**
 * Formats a date according to the given time zone and format.
 *
 * @param {string|Date} value - The date to format.
 * @param {string} timeZone - Target timezone (e.g., 'America/New_York').
 * @param {string} displayFormat - Moment.js format string.
 * @returns {string} - Formatted date string.
 */
export const formatDate = (value, timeZone, displayFormat) => moment(value).tz(timeZone).format(displayFormat);

/**
 * Gets the short time zone abbreviation for a date.
 *
 * @param {string|Date} value - The date to convert.
 * @param {string} timeZone - Target time zone.
 * @returns {string} - Timezone abbreviation (e.g., 'PST', 'EST').
 */
export const getTimezone = (value, timeZone) => moment.tz(value, timeZone).format('z');

/**
 * Calculates the difference between two dates and returns a human-readable string.
 *
 * @param {string|Date} initialDate - Start date.
 * @param {string|Date} finalDate - End date.
 * @returns {string} - Difference in format like "5 days, 4 hrs., 30 min."
 */
export const dateDifference = (initialDate, finalDate, t) => {
  const date1 = moment(initialDate);
  const date2 = moment(finalDate);
  const diff = date2.diff(date1);
  const duration = moment.duration(diff);
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const dateString = `${days} ${t('reportingDetail.time.days')}, ${hours} ${t('reportingDetail.time.hoursAbbrev')}, ${minutes} ${t('reportingDetail.time.minutesAbbrev')}.`;
  return dateString;
};

/**
 * Calculates bounding box lat/lng values around a given point for a radius in miles.
 *
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @param {number} miles - Radius in miles.
 * @returns {Object} - An object with min/max lat/lng bounds.
 */
export const calculateLatLngBounds = (lat, lng, miles) => {
  const milesToLatDegree = miles / 69;
  const maxLat = lat + milesToLatDegree;
  const minLat = lat - milesToLatDegree;
  const milesToLngDegree = miles / (69 * Math.cos(lat * (Math.PI / 180)));
  const maxLng = lng + milesToLngDegree;
  const minLng = lng - milesToLngDegree;
  return {
    maxLat,
    minLat,
    maxLng,
    minLng,
  };
};

/**
 * Constructs and displays a user-friendly error message from an API error response.
 *
 * @param {Object} error - The error object, typically from an Axios catch block.
 * @param {string} message - Context message to include (e.g., 'fetch data').
 * @param {function} displayAlert - Callback function to show an alert (e.g., toast).
 */
export const getErrorMessage = (section, error, message, displayAlert) => {
  let errorMessage = `${i18n.t('api.unable')} ${i18n.t(`api.messages.${message}`)}`;
  let errorCode = '';

  if (error.response) {
    const { status, data } = error.response;
    errorCode = status;
    if (data?.message) {
      errorMessage = data.message;
    }
  }

  // Build message based on presence of valid error code
  const fullMessage = !_.isEmpty(errorCode.toString())
    ? `${i18n.t(`api.sections.${section}`)} ${i18n.t('api.section')}: ${errorMessage}. ${i18n.t('api.error')}: ${errorCode}`
    : `${i18n.t(`api.sections.${section}`)} ${i18n.t('api.section')}: ${errorMessage}`;

  displayAlert('error', fullMessage);
};
