/**
 * ReportingDetailTable Component
 *
 * A comprehensive table component that displays detailed information about shipment tracking,
 * including temperature, humidity, shock, and light measurements during transit and storage.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.selectedShipment - Currently selected shipment data
 * @param {Array} props.allGatewayData - Array of all gateway tracking devices
 * @param {string} props.timeZone - Current timezone for date/time display
 * @param {Array} props.sensorAlertData - Array of sensor alerts during shipment
 * @param {Object} props.theme - Theme object for styling
 * @param {Array} props.unitOfMeasure - Array of measurement units configuration
 * @param {Array} props.sensorReportData - Array of sensor measurement reports
 * @param {Array} props.itemData - Array of shipped items data
 * @param {Array} props.itemTypesData - Array of available item types
 * @param {Object} props.sensorProcessedData - Processed sensor data with calculated metrics
 * @param {React.Ref} ref - Forwarded ref for DOM access
 */

/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, forwardRef } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import { Grid, Typography } from '@mui/material';
import { getUser } from '@context/User.context';
import { getIconWithCount, tempUnit } from '@utils/constants';
import { dateDifference, formatDate } from '@utils/utilMethods';
import { isMobile } from '@utils/mediaQuery';
import '../ReportingStyles.css';
import { useTranslation } from 'react-i18next';

const ReportingDetailTable = forwardRef((props, ref) => {
  const {
    selectedShipment,
    allGatewayData,
    timeZone,
    sensorAlertData,
    theme,
    unitOfMeasure,
    sensorReportData,
    itemData,
    itemTypesData,
    sensorProcessedData,
  } = props;

  // Get user language preference for localization
  const userLanguage = getUser().user_language;

  const { t } = useTranslation();

  // Extract measurement units from configuration
  const tempDisplayUnit = tempUnit(_.find(unitOfMeasure, (unit) => _.isEqual(_.toLower(unit.unit_of_measure_for), 'temperature')));
  const tempMeasure = !_.isEmpty(unitOfMeasure) && _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature')).unit_of_measure;
  const dateFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
    ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
    : '';
  const timeFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
    ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
    : '';

  const getThresholdValue = (arr) => (Array.isArray(arr) && arr.length > 0
    ? _.get(_.orderBy(arr, ['set_at'], ['desc'])[0], 'value', null)
    : null);

  // Extract threshold values for various measurements
  const maxTempThreshold = selectedShipment && getThresholdValue(selectedShipment.max_excursion_temp);
  const minTempThreshold = selectedShipment && getThresholdValue(selectedShipment.min_excursion_temp);
  const maxHumThreshold = selectedShipment && getThresholdValue(selectedShipment.max_excursion_humidity);
  const minHumThreshold = selectedShipment && getThresholdValue(selectedShipment.min_excursion_humidity);
  const maxShockThreshold = selectedShipment && getThresholdValue(selectedShipment.shock_threshold);
  const maxLightThreshold = selectedShipment && getThresholdValue(selectedShipment.light_threshold);

  // State management for various tracking metrics
  const [trackerActivationDate, setTrackerActivationDate] = useState();
  const [updatedTransitAlerts, setUpdatedTransitAlerts] = useState([]);
  const [updatedStorageAlerts, setUpdatedStorageAlerts] = useState([]);
  const [originCustodianName, setOriginCustodianName] = useState();
  const [originCustodianLocation, setOriginCustodianLocation] = useState();
  const [destinationCustodianName, setDestinationCustodianName] = useState();
  const [destinationCustodianLocation, setDestinationCustodianLocation] = useState();
  const [maxTransitTempEntry, setMaxTransitTempEntry] = useState();
  const [minTransitTempEntry, setMinTransitTempEntry] = useState();
  const [maxStorageTempEntry, setMaxStorageTempEntry] = useState();
  const [minStorageTempEntry, setMinStorageTempEntry] = useState();
  const [maxTransitHumEntry, setMaxTransitHumEntry] = useState();
  const [minTransitHumEntry, setMinTransitHumEntry] = useState();
  const [maxStorageHumEntry, setMaxStorageHumEntry] = useState();
  const [minStorageHumEntry, setMinStorageHumEntry] = useState();
  const [maxShockEntry, setMaxShockEntry] = useState();
  const [maxLightEntry, setMaxLightEntry] = useState();
  const [intermediateCustodians, setIntermediateCustodians] = useState();
  const [items, setItems] = useState();
  const isMobileDevice = isMobile();

  /**
   * Effect to initialize shipment tracking data when a shipment is selected
   * Sets up basic shipment information including custodians and locations
   */
  useEffect(() => {
    if (!_.isEmpty(selectedShipment)) {
      const selectedTracker = _.find(allGatewayData, (item) => item?.name === selectedShipment?.tracker);
      const trackerDate = selectedTracker?.activation_date || selectedShipment?.create_date;
      const trackerActiveDate = trackerDate
        ? formatDate(trackerDate, timeZone, `${dateFormat} ${timeFormat} z`)
        : 'N/A';
      const firstCustody = _.find(selectedShipment?.custody_info, { first_custody: true });
      const origin = firstCustody?.custodian_name || 'N/A';
      const originCustodianUrl = firstCustody?.custodian_data?.contact_data?.[0] || '';
      const originLoc = _.find(selectedShipment?.contact_info, { url: originCustodianUrl }) || null;
      const lastCustody = _.find(selectedShipment?.custody_info, { last_custody: true });
      const destination = lastCustody?.custodian_name || 'N/A';
      const destinationCustodianUrl = lastCustody?.custodian_data?.contact_data?.[0] || '';
      const destinationLoc = _.find(selectedShipment?.contact_info, { url: destinationCustodianUrl }) || null;
      const custodians = _.chain(selectedShipment?.custody_info || [])
        .filter((item) => item?.first_custody !== true && item?.last_custody !== true)
        .sortBy('load_id')
        .value();
      setTrackerActivationDate(trackerActiveDate);
      setOriginCustodianName(origin);
      setOriginCustodianLocation(originLoc);
      setDestinationCustodianName(destination);
      setDestinationCustodianLocation(destinationLoc);
      setIntermediateCustodians(custodians);
    }
  }, [selectedShipment, allGatewayData]);

  /**
   * Effect to process sensor alerts and categorize them into transit and storage alerts
   * Handles alert processing and classification based on timing and type
   */
  useEffect(() => {
    if (!_.isEmpty(sensorAlertData) && !_.isEmpty(selectedShipment)) {
      // Filter alerts into transit and storage periods
      const transitAlerts = _.filter(sensorAlertData, (alert) => {
        const createDate = moment(alert.create_date).unix();
        return (
          createDate >= (moment(selectedShipment.actual_time_of_departure).unix())
          && createDate <= (moment(selectedShipment.actual_time_of_arrival).unix())
        );
      });
      const storageAlerts = _.filter(sensorAlertData, (alert) => {
        const createDate = moment(alert.create_date).unix();
        return !(
          createDate >= (moment(selectedShipment.actual_time_of_departure).unix())
          && createDate <= (moment(selectedShipment.actual_time_of_arrival).unix())
        );
      });

      // Process alerts removing recovered ones
      const transitWithoutRecoveredAlerts = !_.isEmpty(transitAlerts) && _.filter(transitAlerts, (alert) => _.isEqual(alert.recovered_alert_id, null));
      const storageWithoutRecoveredAlerts = !_.isEmpty(storageAlerts) && _.filter(storageAlerts, (alert) => _.isEqual(alert.recovered_alert_id, null));

      // Initialize processed alert arrays
      let processedTransitAlerts = [];
      let processedStorageAlerts = [];

      // Process transit alerts
      _.forEach(transitWithoutRecoveredAlerts, (alert) => {
        let color = '';
        let title = '';
        if (_.includes(alert.alert_type, 'max') || _.includes(alert.alert_type, 'shock') || _.includes(alert.alert_type, 'light')) {
          color = theme.palette.error.main;
          title = t('reportingDetail.alert.titleMax', { param: _.capitalize(alert.parameter_type) });
        }
        if (_.includes(alert.alert_type, 'min')) {
          color = theme.palette.info.main;
          title = t('reportingDetail.alert.titleMin', { param: _.capitalize(alert.parameter_type) });
        }
        const alertObj = { id: alert.parameter_type, color, title };
        const objFound = _.find(processedTransitAlerts, (obj) => obj.title === alertObj.title);
        if (!_.isEmpty(objFound)) {
          objFound.count += 1;
        } else {
          alertObj.count = 1;
          processedTransitAlerts = [...processedTransitAlerts, alertObj];
        }
      });

      // Process storage alerts
      _.forEach(storageWithoutRecoveredAlerts, (alert) => {
        let color = '';
        let title = '';
        if (_.includes(alert.alert_type, 'max') || _.includes(alert.alert_type, 'shock') || _.includes(alert.alert_type, 'light')) {
          color = theme.palette.error.main;
          title = t('reportingDetail.alert.titleMax', { param: _.capitalize(alert.parameter_type) });
        }
        if (_.includes(alert.alert_type, 'min')) {
          color = theme.palette.info.main;
          title = t('reportingDetail.alert.titleMin', { param: _.capitalize(alert.parameter_type) });
        }
        const alertObj = { id: alert.parameter_type, color, title };
        const objFound = _.find(processedStorageAlerts, (obj) => obj.title === alertObj.title);
        if (!_.isEmpty(objFound)) {
          objFound.count += 1;
          _.remove(processedStorageAlerts, (obj) => obj.title === objFound.title);
          processedStorageAlerts = [...processedStorageAlerts, objFound];
        } else {
          alertObj.count = 1;
          processedStorageAlerts = [...processedStorageAlerts, alertObj];
        }
      });

      setUpdatedTransitAlerts(processedTransitAlerts);
      setUpdatedStorageAlerts(processedStorageAlerts);
    }
  }, [sensorAlertData, selectedShipment]);

  /**
   * Effect to process sensor report data and calculate various metrics
   * Handles temperature, humidity, shock, and light measurements
   */
  useEffect(() => {
    if (!_.isEmpty(sensorReportData) && !_.isEmpty(selectedShipment)) {
      // Filter reports into transit and storage periods
      const transitReports = _.filter(sensorReportData, (report) => {
        const activationDate = moment(report.activation_date).unix();
        return (
          activationDate >= (moment(selectedShipment.actual_time_of_departure).unix())
          && activationDate <= (moment(selectedShipment.actual_time_of_arrival).unix())
        );
      });
      const storageReports = _.filter(sensorReportData, (report) => {
        const activationDate = moment(report.activation_date).unix();
        return (
          activationDate >= (moment(selectedShipment.actual_time_of_arrival).unix())
          && activationDate <= (moment(selectedShipment.actual_time_of_completion).unix())
        );
      });

      // Initialize measurement variables
      let transitReportMaxTempEntry = null;
      let transitReportMinTempEntry = null;
      let storageReportMaxTempEntry = null;
      let storageReportMinTempEntry = null;
      let transitReportMaxHumEntry = null;
      let transitReportMinHumEntry = null;
      let storageReportMaxHumEntry = null;
      let storageReportMinHumEntry = null;
      let reportMaxShockEntry = null;
      let reportMaxLightEntry = null;

      // Process transit reports
      if (!_.isEmpty(transitReports)) {
        const transitHumEntries = _.map(transitReports, (tr) => tr.report_entry && tr.report_entry.report_humidity);
        const transitTempEntries = _.isEqual(_.toLower(tempMeasure), 'fahrenheit')
          ? _.map(transitReports, (tr) => tr.report_entry && tr.report_entry.report_temp_fah)
          : _.map(transitReports, (tr) => tr.report_entry && tr.report_entry.report_temp_cel);

        transitReportMaxTempEntry = _.max(transitTempEntries);
        transitReportMinTempEntry = _.min(transitTempEntries);
        transitReportMaxHumEntry = _.max(transitHumEntries);
        transitReportMinHumEntry = _.min(transitHumEntries);
      }

      // Process storage reports
      if (!_.isEmpty(storageReports)) {
        const storageHumEntries = _.map(storageReports, (tr) => tr.report_entry && tr.report_entry.report_humidity);
        const storageTempEntries = _.isEqual(_.toLower(tempMeasure), 'fahrenheit')
          ? _.map(storageReports, (tr) => tr.report_entry && tr.report_entry.report_temp_fah)
          : _.map(storageReports, (tr) => tr.report_entry && tr.report_entry.report_temp_cel);

        storageReportMaxTempEntry = _.max(storageTempEntries);
        storageReportMinTempEntry = _.min(storageTempEntries);
        storageReportMaxHumEntry = _.max(storageHumEntries);
        storageReportMinHumEntry = _.min(storageHumEntries);
      }

      // Process overall reports for shock and light
      if (!_.isEmpty(sensorReportData)) {
        const reportShockEntries = _.map(sensorReportData, (tr) => tr.report_entry && tr.report_entry.report_shock);
        const reportLightEntries = _.map(sensorReportData, (tr) => tr.report_entry && tr.report_entry.report_light);
        reportMaxShockEntry = _.max(reportShockEntries);
        reportMaxLightEntry = _.max(reportLightEntries);

        if (reportMaxShockEntry) {
          reportMaxShockEntry = reportMaxShockEntry.toFixed(2);
        }
        if (reportMaxLightEntry) {
          reportMaxLightEntry = reportMaxLightEntry.toFixed(2);
        }
      }

      // Update state with processed data
      setMaxTransitTempEntry(transitReportMaxTempEntry);
      setMinTransitTempEntry(transitReportMinTempEntry);
      setMaxStorageTempEntry(storageReportMaxTempEntry);
      setMinStorageTempEntry(storageReportMinTempEntry);
      setMaxTransitHumEntry(transitReportMaxHumEntry);
      setMinTransitHumEntry(transitReportMinHumEntry);
      setMaxStorageHumEntry(storageReportMaxHumEntry);
      setMinStorageHumEntry(storageReportMinHumEntry);
      setMaxShockEntry(reportMaxShockEntry);
      setMaxLightEntry(reportMaxLightEntry);
    }
  }, [sensorReportData, selectedShipment]);

  /**
   * Effect to process item data when shipment or items change
   */
  useEffect(() => {
    if (selectedShipment && !_.isEmpty(itemData)) {
      const selectedItems = itemData.filter((obj) => selectedShipment.items.includes(obj.url));
      setItems(selectedItems);
    }
  }, [selectedShipment, itemData]);

  /**
   * Formats temperature values for display, including threshold differences
   * @param {number} temperature - Temperature value to format
   * @returns {string} Formatted temperature string
   */
  const displayTempValues = (temperature) => {
    let returnValue = `${temperature} ${tempDisplayUnit}`;
    if (_.gt(temperature, maxTempThreshold) || _.lt(temperature, minTempThreshold)) {
      const limitTemp = _.gt(temperature, maxTempThreshold) ? maxTempThreshold : minTempThreshold;
      const tempDifference = (temperature - limitTemp).toFixed(2);
      const sign = tempDifference > 0 ? '+' : '';
      returnValue = `${returnValue} (${sign}${tempDifference} ${tempDisplayUnit})`;
    }

    return returnValue;
  };

  /**
   * Determines the appropriate CSS class based on measurement values and thresholds
   * @param {number} value - Measurement value
   * @param {string} limitType - Type of measurement (temp, hum, shock, light)
   * @returns {string} CSS class name
   */
  const displayTextColor = (value, limitType) => {
    let returnClass = 'reportingGreenText';

    // Temp check
    if (_.isEqual(limitType, 'temp')) {
      if (value && _.gt(value, maxTempThreshold)) {
        returnClass = 'reportingRedText';
      }
      if (value && _.lt(value, minTempThreshold)) {
        returnClass = 'reportingInfoText';
      }
    }

    // Hum check
    if (_.isEqual(limitType, 'hum')) {
      if (value && _.gt(value, maxHumThreshold)) {
        returnClass = 'reportingRedText';
      }
      if (value && _.lt(value, minHumThreshold)) {
        returnClass = 'reportingInfoText';
      }
    }

    // shock check
    if (_.isEqual(limitType, 'shock')) {
      if (value && _.gt(value, maxShockThreshold)) {
        returnClass = 'reportingRedText';
      }
    }

    // light check
    if (_.isEqual(limitType, 'light')) {
      if (value && _.gt(value, maxLightThreshold)) {
        returnClass = 'reportingRedText';
      }
    }

    return returnClass;
  };

  /**
   * Converts seconds to a formatted time string with days, hours, and minutes
   * @param {string} title - Title for the time display
   * @param {number} value - Time in seconds
   * @param {string} spanClass - CSS class for styling
   * @returns {JSX.Element} Formatted time display component
   */
  const convertSecondsToFormattedTime = (title, value, spanClass) => {
    let seconds = value;
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= (24 * 3600);
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    const transitTimestamp1 = moment(selectedShipment.actual_time_of_departure);
    const transitTimestamp2 = moment(selectedShipment.actual_time_of_arrival);
    const transitPercentage = (value / ((transitTimestamp2 - transitTimestamp1) / 1000)) * 100;
    const storageTimestamp2 = moment(selectedShipment.actual_time_of_completion || selectedShipment.edit_date);
    const storagePercentage = (value / ((storageTimestamp2 - transitTimestamp2) / 1000)) * 100;

    return (
      <Typography fontWeight={700}>
        {`${title}: `}
        <span style={{ fontWeight: 500 }} className={spanClass}>
          {`${days} ${t('reportingDetail.time.days')}, ${hours} ${t('reportingDetail.time.hoursAbbrev')}, ${minutes} ${t('reportingDetail.time.minutesAbbrev')} `}
          {_.includes(title, 'Storage')
            ? `(${value ? storagePercentage.toFixed(2) : 0}% ${t('reportingDetail.time.ofPostTransitStorage')}`
            : `(${value ? transitPercentage.toFixed(2) : 0}% ${t('reportingDetail.time.ofTransit')})`}
        </span>
        <span style={{ fontWeight: 500 }} className={spanClass}>
          {`${days} ${t('reportingDetail.time.days')}, ${hours} ${t('reportingDetail.time.hoursAbbrev')}, ${minutes} ${t('reportingDetail.time.minutesAbbrev')} `}
          {_.includes(title, t('reportingDetail.time.postWithinTemp')) || _.includes(title, t('reportingDetail.time.postOutsideTemp'))
            ? `(${(storagePercentage || 0).toFixed(2)}% ${t('reportingDetail.time.ofPostTransitStorage')})`
            : `(${(transitPercentage || 0).toFixed(2)}% ${t('reportingDetail.time.ofTransit')})`}
        </span>
      </Typography>
    );
  };

  /**
   * Creates a formatted text display component
   * @param {string} title - Display title
   * @param {string} value - Display value
   * @param {string} spanClass - CSS class for styling
   * @returns {JSX.Element} Formatted text display component
   */
  const displayItemText = (title, value, spanClass) => (
    <Typography fontWeight={700}>
      {`${title}: `}
      {_.includes(value, null) || _.includes(value, undefined)
        ? <span style={{ fontWeight: 400 }}>N/A</span>
        : <span style={{ fontWeight: spanClass ? 500 : 400 }} className={`${!!spanClass && spanClass}`}>{value}</span>}
    </Typography>
  );

  /**
   * Formats threshold data array for display
   * @param {Array} array - Array of threshold values
   * @param {string} unit - Unit of measurement
   * @returns {string} Formatted threshold string
   */
  const displayThresholdData = (array, unit) => {
    const sortedArray = _.orderBy(array, ['set_at'], ['asc']);
    return sortedArray.map((item) => `${item.value} ${unit}`).join(', ');
  };

  // Component render
  return (
    <div ref={ref}>
      {!_.isEmpty(selectedShipment) && (
        <Grid container className="reportingDetailTableContainer">
          {/* Table header with shipment name and tracker info */}
          <Grid container className="reportingDetailTableHeader">
            <Grid item xs={6} sm={4} md={3} id="itemText">
              {displayItemText(t('reportingDetail.header.shipmentName'), selectedShipment.name, null)}
            </Grid>
            {!isMobileDevice && <Grid item sm={4} md={6} />}
            <Grid item xs={6} sm={4} md={3} id="itemText">
              <Typography fontWeight={700}>
                {t('reportingDetail.header.trackerId')}
                {' '}
                <span style={{ fontWeight: 400 }}>{selectedShipment.tracker}</span>
                {' '}
                {t('reportingDetail.header.transmissionAbbrev')}
                {' '}
                <span style={{ fontWeight: 400 }}>{`${selectedShipment.transmission_time} ${t('reportingDetail.header.minutesAbbrev')}`}</span>
                {' '}
                {t('reportingDetail.header.measurementAbbrev')}
                {' '}
                <span style={{ fontWeight: 400 }}>{`${selectedShipment.measurement_time} ${t('reportingDetail.header.minutesAbbrev')}`}</span>
              </Typography>
              {displayItemText(t('reportingDetail.header.activated'), trackerActivationDate)}
            </Grid>
          </Grid>

          {/* Shipment status and excursions */}
          <Grid container className="reportingDetailTableBody">
            <Grid item xs={6} md={3} id="itemText">
              {displayItemText(t('reportingDetail.status.shipmentStatus'), selectedShipment.status, null)}
            </Grid>
            <Grid item xs={6} md={3} id="itemText">
              {displayItemText(t('reportingDetail.status.preTransit'), t('reportingDetail.status.none'))}
            </Grid>
            <Grid item xs={6} md={3} display="flex" flexWrap="wrap" id="itemText">
              <Typography fontWeight={700} marginRight={1}>
                {t('reportingDetail.status.transitExcursions')}
              </Typography>
              <span style={{ fontWeight: 400, display: 'flex', flexWrap: 'wrap' }}>
                {!_.isEmpty(updatedTransitAlerts)
                  ? _.map(updatedTransitAlerts, (item, idx) => (
                    <span key={`icon-${idx}-${item.id}`} style={{ display: 'flex' }}>
                      {getIconWithCount(item, t)}
                      {_.isEqual(idx, _.size(updatedTransitAlerts) - 1) ? ' ' : ', '}
                    </span>
                  ))
                  : t('reportingDetail.status.none')}
              </span>
            </Grid>
            <Grid item xs={6} md={3} display="flex" flexWrap="wrap" id="itemText">
              <Typography fontWeight={700} marginRight={1}>
                {t('reportingDetail.status.postTransit')}
              </Typography>
              <span style={{ fontWeight: 400, display: 'flex', flexWrap: 'wrap' }}>
                {!_.isEmpty(updatedStorageAlerts)
                  ? _.map(updatedStorageAlerts, (item, idx) => (
                    <span key={`icon-${idx}-${item.id}`} style={{ display: 'flex' }}>
                      {getIconWithCount(item, t)}
                      {_.isEqual(idx, _.size(updatedStorageAlerts) - 1) ? ' ' : ', '}
                    </span>
                  ))
                  : t('reportingDetail.status.none')}
              </span>
            </Grid>
          </Grid>

          {/* Origin custodian information */}
          <Grid container className="reportingDetailTableBody">
            <Grid item xs={6} sm={4} md={3} id="itemText">
              {displayItemText(t('reportingDetail.origin.custodian'), originCustodianName, null)}
            </Grid>
            {!isMobileDevice && <Grid item sm={4} md={6} />}
            <Grid item xs={6} sm={4} md={3} id="itemText" fontWeight="700">
              {!_.isEmpty(originCustodianLocation) ? displayItemText(t('reportingDetail.origin.location'), `${originCustodianLocation.address1}, ${originCustodianLocation.city}, ${originCustodianLocation.state}, ${originCustodianLocation.country}, ${originCustodianLocation.postal_code}`) : t('reportingDetail.origin.location')}
            </Grid>
          </Grid>

          {/* Destination custodian information */}
          <Grid container className="reportingDetailTableBody">
            <Grid item xs={6} sm={4} md={3} id="itemText">
              {displayItemText(t('reportingDetail.destination.custodian'), destinationCustodianName, null)}
            </Grid>
            {!isMobileDevice && <Grid item sm={4} md={6} />}
            <Grid item xs={6} sm={4} md={3} id="itemText" fontWeight="700">
              {!_.isEmpty(destinationCustodianLocation) ? displayItemText(t('reportingDetail.destination.location'), `${destinationCustodianLocation.address1}, ${destinationCustodianLocation.city}, ${destinationCustodianLocation.state}, ${destinationCustodianLocation.country}, ${destinationCustodianLocation.postal_code}`) : t('reportingDetail.destination.location')}
            </Grid>
          </Grid>

          {/* Timestamps */}
          <Grid container className="reportingDetailTableBody">
            <Grid item xs={6} md={3} id="itemText">
              {displayItemText(t('reportingDetail.timestamps.departure'), `${formatDate((selectedShipment.actual_time_of_departure || selectedShipment.estimated_time_of_departure), timeZone, `${dateFormat} ${timeFormat} z`)} ${selectedShipment.actual_time_of_departure ? t('reportingDetail.timestamps.actual') : t('reportingDetail.timestamps.estimated')}`)}
            </Grid>
            <Grid item xs={6} md={3} id="itemText">
              {displayItemText(t('reportingDetail.timestamps.arrivalLast'), `${formatDate((selectedShipment.actual_time_of_arrival || selectedShipment.estimated_time_of_arrival), timeZone, `${dateFormat} ${timeFormat} z`)} ${selectedShipment.actual_time_of_arrival ? t('reportingDetail.timestamps.actual') : t('reportingDetail.timestamps.estimated')}`)}
            </Grid>
            <Grid item xs={6} md={3} id="itemText">
              {displayItemText(t('reportingDetail.timestamps.end'), formatDate((selectedShipment.actual_time_of_completion || selectedShipment.edit_date), timeZone, `${dateFormat} ${timeFormat} z`))}
            </Grid>
            <Grid item xs={6} md={3} id="itemText">
              {displayItemText(t('reportingDetail.timestamps.total'), dateDifference(selectedShipment.create_date, selectedShipment.actual_time_of_completion || selectedShipment.edit_date))}
            </Grid>
          </Grid>

          {/* Temp thresholds + durations */}
          <Grid container className="reportingDetailTableBody">
            <Grid item xs={6} md={3} id="itemText">
              {displayItemText(t('reportingDetail.thresholds.maxTemp'), `${displayThresholdData(selectedShipment.max_excursion_temp, tempDisplayUnit)}`)}
            </Grid>
            <Grid item xs={6} md={3} id="itemText">
              {displayItemText(t('reportingDetail.time.transit'), dateDifference(selectedShipment.actual_time_of_departure, selectedShipment.actual_time_of_arrival))}
            </Grid>
            <Grid item xs={6} md={3} id="itemText">
              {displayItemText(t('reportingDetail.time.postTransitStorage'), dateDifference(selectedShipment.actual_time_of_arrival, selectedShipment.actual_time_of_completion || selectedShipment.edit_date))}
            </Grid>
            <Grid item xs={6} md={3} id="itemText">
              {displayItemText(t('reportingDetail.thresholds.minTemp'), `${displayThresholdData(selectedShipment.min_excursion_temp, tempDisplayUnit)}`)}
            </Grid>
          </Grid>

          {/* Temperature measurements */}
          <Grid container className="reportingDetailTableBody">
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {displayItemText(t('reportingDetail.temps.transitMax'), displayTempValues(maxTransitTempEntry), displayTextColor(maxTransitTempEntry, 'temp'))}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {displayItemText(t('reportingDetail.temps.transitMin'), displayTempValues(minTransitTempEntry), displayTextColor(minTransitTempEntry, 'temp'))}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {displayItemText(t('reportingDetail.temps.postMax'), displayTempValues(maxStorageTempEntry), displayTextColor(maxStorageTempEntry, 'temp'))}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {displayItemText(t('reportingDetail.temps.postMin'), displayTempValues(minStorageTempEntry), displayTextColor(minStorageTempEntry, 'temp'))}
            </Grid>
          </Grid>

          {/* Temperature range times */}
          <Grid container className="reportingDetailTableBody">
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {!_.isEmpty(sensorProcessedData) ? convertSecondsToFormattedTime(t('reportingDetail.time.transitWithinTemp'), sensorProcessedData.transit_within_temperature, 'reportingGreenText') : `${t('reportingDetail.time.transitWithinTemp')}: 'N/A'`}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {!_.isEmpty(sensorProcessedData) ? convertSecondsToFormattedTime(t('reportingDetail.time.transitOutsideTemp'), sensorProcessedData.transit_outside_temperature, 'reportingRedText') : `${t('reportingDetail.time.transitOutsideTemp')}: 'N/A'`}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {!_.isEmpty(sensorProcessedData) ? convertSecondsToFormattedTime(t('reportingDetail.time.postWithinTemp'), sensorProcessedData.post_within_temperature, 'reportingGreenText') : `${t('reportingDetail.time.postWithinTemp')}: 'N/A'`}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {!_.isEmpty(sensorProcessedData) ? convertSecondsToFormattedTime(t('reportingDetail.time.postOutsideTemp'), sensorProcessedData.post_outside_temperature, 'reportingRedText') : `${t('reportingDetail.time.postOutsideTemp')}: 'N/A'`}
            </Grid>
          </Grid>

          {/* Humidity thresholds */}
          <Grid container className="reportingDetailTableBody">
            <Grid item xs={6} sm={4} md={3} id="itemText">
              {displayItemText(t('reportingDetail.thresholds.maxHum'), `${displayThresholdData(selectedShipment.max_excursion_humidity, '%')}`)}
            </Grid>
            {!isMobileDevice && <Grid item xs={0} sm={4} md={6} />}
            <Grid item xs={6} sm={4} md={3} id="itemText">
              {displayItemText(t('reportingDetail.thresholds.minHum'), `${displayThresholdData(selectedShipment.min_excursion_humidity, '%')}`)}
            </Grid>
          </Grid>

          {/* Humidity measurements */}
          <Grid container className="reportingDetailTableBody">
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {displayItemText(t('reportingDetail.humidity.transitMax'), `${maxTransitHumEntry}%`, displayTextColor(maxTransitHumEntry, 'hum'))}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {displayItemText(t('reportingDetail.humidity.transitMin'), `${minTransitHumEntry}%`, displayTextColor(minTransitHumEntry, 'hum'))}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {displayItemText(t('reportingDetail.humidity.postMax'), `${maxStorageHumEntry}%`, displayTextColor(maxStorageHumEntry, 'hum'))}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {displayItemText(t('reportingDetail.humidity.postMin'), `${minStorageHumEntry}%`, displayTextColor(minStorageHumEntry, 'hum'))}
            </Grid>
          </Grid>

          {/* Humidity range times */}
          <Grid container className="reportingDetailTableBody">
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {!_.isEmpty(sensorProcessedData) ? convertSecondsToFormattedTime(t('reportingDetail.time.transitWithinHum'), sensorProcessedData.transit_within_humidity, 'reportingGreenText') : `${t('reportingDetail.time.transitWithinHum')}: 'N/A'`}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {!_.isEmpty(sensorProcessedData) ? convertSecondsToFormattedTime(t('reportingDetail.time.transitOutsideHum'), sensorProcessedData.transit_outside_humidity, 'reportingRedText') : `${t('reportingDetail.time.transitOutsideHum')}: 'N/A'`}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {!_.isEmpty(sensorProcessedData) ? convertSecondsToFormattedTime(t('reportingDetail.time.postWithinHum'), sensorProcessedData.post_within_humidity, 'reportingGreenText') : `${t('reportingDetail.time.postWithinHum')}: 'N/A'`}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {!_.isEmpty(sensorProcessedData) ? convertSecondsToFormattedTime(t('reportingDetail.time.postOutsideHum'), sensorProcessedData.post_outside_humidity, 'reportingRedText') : `${t('reportingDetail.time.postOutsideHum')}: 'N/A'`}
            </Grid>
          </Grid>

          {/* Shock and light measurements */}
          <Grid container className="reportingDetailTableBody">
            <Grid item xs={6} md={3} id="itemText">
              {displayItemText(t('reportingDetail.shockLight.thresholdShock'), `${displayThresholdData(selectedShipment.shock_threshold, 'G')}`)}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {displayItemText(t('reportingDetail.shockLight.maxShock'), `${maxShockEntry} G`, displayTextColor(maxShockEntry, 'shock'))}
            </Grid>
            <Grid item xs={6} md={3} id="itemText">
              {displayItemText(t('reportingDetail.shockLight.thresholdLight'), `${displayThresholdData(selectedShipment.light_threshold, 'LUX')}`)}
            </Grid>
            <Grid item xs={6} md={3} id="itemText" fontWeight="700">
              {displayItemText(t('reportingDetail.shockLight.maxLight'), `${maxLightEntry} LUX`, displayTextColor(maxLightEntry, 'light'))}
            </Grid>
          </Grid>

          {/* Intermediate custodians */}
          {!_.isEmpty(intermediateCustodians) && (
            <Grid container className="reportingDetailTableBody">
              {_.map(intermediateCustodians, (item, index) => {
                const { custodian_name, custodian_data: { custodian_type } } = item;
                let custodianRole;
                if (_.includes(custodian_type, '1')) {
                  custodianRole = t('reportingDetail.custody.roles.shipper');
                } else if (_.includes(custodian_type, '2')) {
                  custodianRole = t('reportingDetail.custody.roles.logisticsProvider');
                } else if (_.includes(custodian_type, '3')) {
                  custodianRole = t('reportingDetail.custody.roles.warehouse');
                } else if (_.includes(custodian_type, '4')) {
                  custodianRole = t('reportingDetail.custody.roles.receiver');
                }
                return (
                  <Grid key={`${item}-${index}`} item xs={6} md={3} id="itemText">
                    {displayItemText(t('reportingDetail.custody.intermediate', { n: index + 1, role: custodianRole }), custodian_name, null)}
                  </Grid>
                );
              })}
              {!isMobileDevice && (
                <Grid
                  item
                  xs={0}
                  md={_.size(intermediateCustodians) % 4 === 1
                    ? 9
                    : _.size(intermediateCustodians) % 4 === 2
                      ? 6
                      : _.size(intermediateCustodians) % 4 === 3
                        ? 3
                        : 0}
                />
              )}
            </Grid>
          )}

          {/* Items information */}
          {!_.isEmpty(items) && !_.isEmpty(itemTypesData) && (
            _.map(items, (item, index) => (
              <Grid key={`${item}-${index}`} container className="reportingDetailTableBody">
                <Grid item xs={6} md={3} id="itemText">
                  {displayItemText(t('reportingDetail.items.itemName'), item.name, null)}
                </Grid>
                <Grid item xs={6} md={3} id="itemText">
                  {displayItemText(t('reportingDetail.items.unitsCount'), item.number_of_units)}
                </Grid>
                <Grid item xs={6} md={3} id="itemText">
                  {displayItemText(t('reportingDetail.items.itemType'), itemTypesData.filter((it) => it.url === item.item_type)[0].name)}
                </Grid>
                <Grid item xs={6} md={3} id="itemText">
                  {displayItemText(t('reportingDetail.items.grossWeight'), `${item.gross_weight} ${t('reportingDetail.items.pounds')}`)}
                </Grid>
              </Grid>
            ))
          )}
        </Grid>
      )}
      {
        _.isEmpty(selectedShipment) && (
          <Typography
            variant="h6"
            align="left"
            margin={2}
            marginBottom={3}
          >
            {t('reportingDetail.selectPrompt')}
          </Typography>
        )
      }
    </div>
  );
});

export default ReportingDetailTable;
