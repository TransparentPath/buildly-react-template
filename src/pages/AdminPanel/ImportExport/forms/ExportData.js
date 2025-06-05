import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  Grid,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import Loader from '@components/Loader/Loader'; // Import the Loader component to show loading state
import { isDesktop2 } from '@utils/mediaQuery'; // Utility to check if the view is desktop-sized
import { useQuery, useQueryClient } from 'react-query'; // Hooks for fetching and caching data
import { getExportDataQuery } from '@react-query/queries/importExport/getExportDataQuery'; // Query function to fetch export data
import useAlert from '@hooks/useAlert'; // Custom hook for displaying alerts
import '../../AdminPanelStyles.css';

/**
 * ExportData component provides a form that allows users to select the data type
 * (e.g., items or products) and export it in a CSV format.
 */
const ExportData = () => {
  // State hooks for managing form selections and ready state for initiating the export
  const [exportTable, setExportTable] = useState(''); // Tracks selected data table (Items or Products)
  const [exportType, setExportType] = useState(''); // Tracks selected export file format (CSV)
  const [ready, setReady] = useState(false); // Flag to trigger the export process once all selections are made

  const { displayAlert } = useAlert(); // Alert function for displaying notifications
  const queryClient = useQueryClient(); // React Query client to manage cache

  // Fetch export data based on selected table and export type using useQuery hook
  const { data: exportData, isLoading: isLoadingExportData } = useQuery(
    ['exportData'], // Query key for caching purposes
    () => getExportDataQuery(exportTable, exportType, displayAlert, 'Import export'), // Function to fetch data
    {
      enabled: ready, // Only run the query if ready is true (i.e., when the user is ready to export)
      refetchOnWindowFocus: false, // Disable refetching when the window is focused
    },
  );

  // Reset ready state on component mount
  useEffect(() => {
    setReady(false);
  }, []);

  // Effect to handle file export once the export data is fetched
  useEffect(() => {
    if (exportData && ready) {
      const fileName = `${_.startCase(exportTable)} ${new Date().toLocaleDateString()}.${exportType}` || `export.${exportType}`;
      // Generate file name with the table name and current date

      // Create a Blob for the export data (CSV format)
      const blob = new Blob([exportData], { type: 'text/csv;charset=utf-8;' });

      // Handle file download across browsers
      if (navigator.msSaveBlob) { // IE 10+ handling
        navigator.msSaveBlob(blob, fileName);
      } else {
        const link = document.createElement('a');
        if (link.download !== undefined) { // Check if download attribute is supported
          const url = URL.createObjectURL(blob); // Create a URL for the Blob
          link.setAttribute('href', url);
          link.setAttribute('download', fileName); // Set the file name for the download
          link.style.visibility = 'hidden'; // Hide the link
          document.body.appendChild(link);
          link.click(); // Trigger the download
          document.body.removeChild(link); // Clean up the link element
        }
      }

      // Reset ready state and invalidate the export data cache
      setReady(false);
      queryClient.invalidateQueries({
        queryKey: ['exportData'], // Invalidate the cache for export data after download
      });
    }
  }, [exportData, ready]); // Only run this effect when exportData or ready changes

  /**
   * Handles the form submission event, triggers the data export process.
   * @param {Event} event The form submission event.
   */
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    setReady(true); // Set ready to true to initiate the export process
  };

  return (
    <div>
      {/* Show loader while export data is being fetched */}
      {isLoadingExportData && <Loader open={isLoadingExportData} />}

      {/* Form for selecting export options */}
      <form
        className="adminPanelFormRoot"
        noValidate
        onSubmit={handleSubmit} // Handle the form submission with custom handler
      >
        {/* Grid layout for the form */}
        <Grid container spacing={isDesktop2() ? 2 : 0}>

          {/* Dropdown for selecting the data table to export (e.g., Items or Products) */}
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              required
              id="exportTable"
              label="Data to export"
              select
              value={exportTable} // Set value to the current state of exportTable
              onChange={(e) => setExportTable(e.target.value)} // Update exportTable state on selection change
            >
              <MenuItem value="">--------</MenuItem>
              <MenuItem value="item">Items</MenuItem>
              <MenuItem value="product">Products</MenuItem>
            </TextField>
          </Grid>

          {/* Dropdown for selecting export type (e.g., CSV) */}
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              required
              id="exportType"
              label="Export As"
              select
              value={exportType} // Set value to the current state of exportType
              onChange={(e) => setExportType(e.target.value)} // Update exportType state on selection change
            >
              <MenuItem value="">--------</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </TextField>
          </Grid>

          {/* Submit button to initiate the export */}
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={7} sm={6} md={4}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className="adminPanelSubmit"
                disabled={isLoadingExportData || !exportTable || !exportType} // Disable the button if data is loading or required fields are empty
              >
                Export
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default ExportData;
