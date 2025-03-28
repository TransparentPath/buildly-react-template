import _ from 'lodash';
import moment from 'moment-timezone';

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

export const setOptionsData = (options, fieldName) => {
  let result = null;
  const optionKeys = Object.keys(options);
  if (optionKeys.includes(fieldName)) {
    result = options[fieldName];
  }
  return result;
};

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

export const extractCountry = (address) => {
  const countryRegex = /(?:^|,)\s*([A-Za-z\s]+)$/;
  const matches = address.match(countryRegex);
  if (matches && matches[1]) {
    return matches[1].trim();
  }
  return null;
};

export const formatDate = (value, timeZone, displayFormat) => moment(value).tz(timeZone).format(displayFormat);

export const getTimezone = (value, timeZone) => moment.tz(value, timeZone).format('z');

export const dateDifference = (initialDate, finalDate) => {
  const date1 = moment(initialDate);
  const date2 = moment(finalDate);
  const diff = date2.diff(date1);
  const duration = moment.duration(diff);
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const dateString = `${days} days, ${hours} hrs., ${minutes} min.`;
  return dateString;
};

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

export const getTranslatedLanguage = () => {
  const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
  const value = !_.isEmpty(match) ? decodeURIComponent(match[2]) : null;
  const parts = !_.isEmpty(value) && value.split('/');
  return !_.isEmpty(parts) && parts[_.size(parts) - 1];
};
