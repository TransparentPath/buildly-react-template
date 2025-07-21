// React and third-party imports
import React, { useEffect, useState } from 'react';
import _, { isArray } from 'lodash'; // Lodash utility library for sorting, finding, etc.
import moment from 'moment-timezone'; // Moment for date/time formatting and sorting
import {
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material'; // MUI UI components
import { CloudDownload as DownloadIcon } from '@mui/icons-material'; // Icon for download

// Custom components and constants
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper'; // Custom table wrapper
import { SENSOR_REPORT_COLUMNS } from '@utils/constants'; // Sensor column definitions
import '../ReportingStyles.css'; // Custom styles
import { useTranslation } from 'react-i18next';

// Main SensorReport component to render a sensor data table and handle sorting, highlighting, and exporting
const SensorReport = ({
  sensorReport, // Array of sensor report data
  shipmentName, // Name of the current shipment (used in title)
  selectedShipment, // Full shipment object (used to build column definitions)
  selectedMarker, // Currently selected map marker (used to highlight row)
  unitOfMeasure, // Unit of measure (passed to column definitions)
  timezone, // Timezone info (could be used for formatting)
  downloadCSV, // Handler for downloading CSV
  downloadExcel, // Handler for downloading Excel
}) => {
  // Local state to manage data rows and selection
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // For download options menu
  const { t } = useTranslation(); // Translation hook for internationalization

  // When sensorReport changes, sort it by timestamp descending and update rows
  useEffect(() => {
    const sortedData = _.orderBy(
      sensorReport,
      (item) => moment(item.timestamp), // Parse timestamp
      ['desc'], // Descending order
    );
    setRows(sortedData);
  }, [sensorReport]);

  // When a marker is selected, highlight the corresponding row in the table
  useEffect(() => {
    if (selectedMarker) {
      const highlightIndex = _.findIndex(rows, {
        lat: selectedMarker.lat,
        lng: selectedMarker.lng,
      });
      setSelected([highlightIndex]); // Highlight matching row
    } else {
      setSelected([]); // Clear highlight when no marker is selected
    }
  }, [selectedMarker]);

  // Custom sort function for columns (mostly timestamp or length-based)
  const customSort = (data, colIndex, order, meta) => {
    // If sorting by timestamp column
    if (colIndex === 1) {
      return _.orderBy(
        data,
        (item) => moment(item.data[colIndex]),
        [order],
      );
    }
    // Default sort for other columns (by string length here)
    return data.sort((a, b) => (a.data[colIndex].length < b.data[colIndex].length
      ? -1
      : 1
    ) * (order === 'desc' ? 1 : -1));
  };

  // Open download options menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close download options menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid className="reportingSensorRoot" container spacing={2}>
      <Grid item xs={12}>
        {/* Title section */}
        <div className="reportingSensorTooltip">
          <Typography
            className="reportingSensorReportTitle"
            variant="h5"
          >
            {shipmentName ? (
              <>
                <span>Sensor Report - Shipment: </span>
                <span className="notranslate">{shipmentName}</span>
              </>
            ) : 'Sensor Report'}
          </Typography>
        </div>

        {/* Main data table for sensor report */}
        <DataTableWrapper
          noSpace // Custom prop to reduce padding/margin
          hideAddButton // Hides the default add button
          filename="SensorReportData" // Export filename
          rows={rows} // Row data for the table
          columns={SENSOR_REPORT_COLUMNS(unitOfMeasure, selectedShipment, t)} // Columns configured with UOM and shipment info
          selectable={{
            rows: 'multiple', // Allow multiple row selection
            rowsHeader: false, // No selection checkbox in header
            rowsHideCheckboxes: true, // Hide checkboxes for selection
          }}
          selected={selected} // Highlighted rows (based on selectedMarker)
          customSort={customSort} // Custom sort logic
          extraOptions={{
            // Custom toolbar shown above the table
            customToolbar: () => (
              <>
                <Typography variant="caption" className="reportingSensorTableTitle">
                  <span style={{ fontStyle: 'italic', fontWeight: '700' }}>bold/italic alerts</span>
                  {' '}
                  indicates alerts outside of selected transmission
                </Typography>

                {/* Download icon with menu options */}
                <Tooltip title={t('download_option')} placement="bottom">
                  <IconButton className="reportingSensorTableExcelDownload" onClick={handleMenuOpen}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>

                {/* Menu with CSV/Excel download options */}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem
                    onClick={() => {
                      downloadCSV(); // Trigger CSV download
                      handleMenuClose(); // Close menu
                    }}
                  >
                    Download CSV
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      downloadExcel(); // Trigger Excel download
                      handleMenuClose(); // Close menu
                    }}
                  >
                    Download Excel
                  </MenuItem>
                </Menu>
              </>
            ),
          }}
          className="reportingSensorDataTable"
          shouldUseAllColumns // Display all available columns
        />
      </Grid>
    </Grid>
  );
};

// Export component to be used elsewhere
export default SensorReport;
