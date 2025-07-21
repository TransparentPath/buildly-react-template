/* eslint-disable no-param-reassign */
import React, {
  useEffect, useState, useRef, forwardRef,
} from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import {
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getAlertsReportColumns } from '@utils/constants';
import '../ReportingStyles.css';
import { getTimezone } from '@utils/utilMethods';
import { useTranslation } from 'react-i18next';

// AlertsReport is a component that receives props for displaying a report of alerts with shipment details
const AlertsReport = forwardRef((props, ref) => {
  // Destructure props for easier access to the data
  const {
    sensorReport, alerts, shipmentName, timezone, unitOfMeasure, shouldScroll,
  } = props;

  const { t } = useTranslation();

  // Access the theme object for style properties
  const theme = useTheme();

  // State to manage the alert rows that will be displayed in the table
  const [rows, setRows] = useState([]);

  // Ref to manage the scroll position for smooth scrolling behavior
  const scrollRef = useRef(null);

  // Extract the date and time formats based on the unitOfMeasure prop
  const dateFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
    ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
    : '';
  const timeFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
    ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
    : '';

  // Handle scrolling if 'shouldScroll' prop is true
  if (shouldScroll && scrollRef.current) {
    window.scrollTo({
      top: scrollRef.current.offsetTop - 50, // Scroll to the top of the report with an offset
      behavior: 'smooth', // Smooth scroll animation
    });
  }

  // useEffect hook that runs when the 'alerts' prop is updated
  useEffect(() => {
    if (alerts) {
      let editedAlerts = []; // Array to store edited alerts

      // Filter out any alerts related to 'location' parameter type
      const filteredData = _.filter(
        alerts,
        (alert) => alert.parameter_type !== 'location',
      );

      // Process each alert to add more information and format it
      _.forEach(filteredData, (alert) => {
        let alertObj = {}; // Object to store alert details like color and title
        let location = 'N/A'; // Default location value
        let latitude = 'N/A'; // Default latitude value
        let longitude = 'N/A'; // Default longitude value

        // Handle recovered alerts
        if (alert.recovered_alert_id !== null) {
          alertObj = { id: alert.parameter_type, color: 'green', title: `${_.capitalize(alert.parameter_type)} Excursion Recovered` };
        } else if (alert) {
          // Handle different types of alert based on alert_type
          switch (true) {
            case _.includes(_.toLower(alert.alert_type), 'max'):
            case _.includes(_.toLower(alert.alert_type), 'shock'):
            case _.includes(_.toLower(alert.alert_type), 'light'):
              alertObj = { id: alert.parameter_type, color: theme.palette.error.main, title: `Maximum ${_.capitalize(alert.parameter_type)} Excursion` };
              break;

            case _.includes(_.toLower(alert.alert_type), 'min'):
              alertObj = { id: alert.parameter_type, color: theme.palette.info.main, title: `Minimum ${_.capitalize(alert.parameter_type)} Excursion` };
              break;

            default:
              break;
          }
        }

        // If the alert has a valid create_date, format it and check the sensor report for location and coordinates
        if (alert.create_date && alert.create_date !== '-') {
          const dt = moment(alert.create_date).tz(timezone).format(`${dateFormat} ${timeFormat}`);
          const report = _.find(sensorReport, { timestamp: dt });
          if (!_.isEmpty(report) && !_.isEqual(report.location, null) && !_.isEqual(report.location, undefined) && !_.isEqual(report.location, 'Error retrieving address')) {
            location = report.location; // Assign location from the sensor report
          }
          if (!_.isEmpty(report) && !_.isEqual(report.lat, null)) {
            latitude = report.lat; // Assign latitude from the sensor report
          }
          if (!_.isEmpty(report) && !_.isEqual(report.lng, null)) {
            longitude = report.lng; // Assign longitude from the sensor report
          }
        }

        // Add the alert details along with location and coordinates to the alerts array
        editedAlerts = [...editedAlerts, {
          ...alert, alertObj, location, latitude, longitude,
        }];
      });

      // Sort alerts by the creation date in descending order
      const sortedData = _.orderBy(
        editedAlerts,
        (item) => moment(item.create_date),
        ['desc'],
      );

      // Update the state with the sorted alerts
      setRows(sortedData);
    }
  }, [alerts]); // Re-run the effect when the 'alerts' prop changes

  // Function to build the CSV file content from the columns and rows data
  const buildCSV = (columns, data) => {
    const escapeCSV = (text) => `"${text}"`; // Function to escape text for CSV format

    // Generate the CSV header based on column labels, adjusting for date/time format
    const csvHeader = columns.map((col) => {
      if (col.label === 'Date/Time stamp') {
        const timeArray = _.split(timeFormat, ' '); // Split time format to check for 12-hour or 24-hour
        const timePeriod = _.size(timeArray) === 1 ? '24-hour' : '12-hour'; // Determine time period
        const formattedLabel = `${col.label} (${getTimezone(new Date(), timezone)}) (${dateFormat} ${timePeriod})`; // Format the label
        return escapeCSV(formattedLabel); // Escape and return the formatted label
      }
      return escapeCSV(col.label); // Escape and return other column labels
    }).join(',');

    // Generate the CSV body based on the data and columns
    const csvBody = data.map(({ data: row }) => row.map((cell, index) => {
      const column = columns[index];
      if (column.label === 'Date/Time stamp' && !_.isEmpty(cell)) {
        // Format the date/time field based on timezone
        return escapeCSV(moment(cell).tz(timezone).format(`${dateFormat} ${timeFormat}`));
      }
      if (!row.location || row.location === 'Error retrieving address') {
        row.location = 'N/A'; // If location is invalid, set it to 'N/A'
      }
      if (row.location === 'N/A') {
        row.lat = 'N/A'; // Set latitude to 'N/A' if location is 'N/A'
        row.lng = 'N/A'; // Set longitude to 'N/A' if location is 'N/A'
      }
      if (!_.isEmpty(cell) && !_.isEmpty(cell.title)) {
        return escapeCSV(cell.title); // If the cell has a title, use it
      }
      return escapeCSV(cell); // Otherwise, use the cell value
    }).join(',')).join('\n');

    // Combine the header and body to form the complete CSV data
    return `${csvHeader}\n${csvBody}`;
  };

  // Return the JSX to render the AlertsReport component
  return (
    <Grid className="reportingAlertRoot" container spacing={2} ref={scrollRef}>
      <Grid item xs={12} ref={ref}>
        <div className="reportingAlertTooltip">
          <Typography className="reportingAlertTitle" variant="h5">
            {/* Render the shipment name in the title if provided */}
            {shipmentName ? (
              <>
                <span>Alerts Report - Shipment: </span>
                <span className="notranslate">{shipmentName}</span>
              </>
            ) : 'Alerts Report'}
          </Typography>
        </div>
        {/* Render the DataTableWrapper component with the alert data and CSV export functionality */}
        <DataTableWrapper
          className="reportingAlertDataTable"
          noSpace
          hideAddButton
          filename="ShipmentAlerts" // Filename for the exported CSV file
          rows={rows} // The alert rows to display in the table
          columns={getAlertsReportColumns(
            sensorReport,
            timezone,
            dateFormat,
            timeFormat,
            t,
          )}
          extraOptions={{
            onDownload: (buildHead, buildBody, columns, data) => buildCSV(columns, data), // Trigger the CSV download
          }}
        />
      </Grid>
    </Grid>
  );
});

export default AlertsReport;
