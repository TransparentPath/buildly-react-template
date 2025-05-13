/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */

// React and third-party imports
import React, { useState, useRef, useEffect } from 'react';
import _ from 'lodash';
import html2canvas from 'html2canvas';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  List,
  ListItem,
  Typography,
  useTheme,
} from '@mui/material';

// Component and utility imports
import '../ReportingStyles.css';
import Loader from '@components/Loader/Loader';
import FormModal from '@components/Modal/FormModal';
import GraphComponent from '@components/GraphComponent/GraphComponent';
import { getUser } from '@context/User.context';
import { getIcon, REPORT_TYPES } from '@utils/constants';
import { isDesktop } from '@utils/mediaQuery';
import ReportGraph from './ReportGraph';

// Main component for generating and downloading shipment reports
const GenerateReport = ({
  open, // Boolean state to control visibility of the modal
  setOpen, // Setter function for `open`
  tableRef, // Ref to the table component
  mapRef, // Ref to the map component
  tempGraphRef, // Ref to temperature graph
  humGraphRef, // Ref to humidity graph
  shockGraphRef, // Ref to shock graph
  lightGraphRef, // Ref to light graph
  batteryGraphRef, // Ref to battery graph
  alertsTableRef, // Ref to alerts table
  downloadCSV, // Function to trigger CSV download
  downloadExcel, // Function to trigger Excel download
  reportPDFDownloadMutation, // Mutation function to upload base64 images for PDF generation
  selectedShipment, // Current selected shipment object
}) => {
  const user = getUser(); // Get current user info
  const theme = useTheme(); // Access MUI theme object
  const [openConfirmModal, setConfirmModal] = useState(false); // Confirmation modal state
  const [isLoading, setLoading] = useState(false); // Loading indicator state

  // Format selection state
  const [selectedFormats, setSelectedFormats] = useState({
    csv: false,
    excel: false,
    pdf: false,
  });

  // Discard form data and close modals
  const discardFormData = () => {
    setSelectedFormats({ csv: false, excel: false, pdf: false });
    setConfirmModal(false);
    setOpen(false);
  };

  // Handle closing of the form modal with or without selected formats
  const closeFormModal = () => {
    if (selectedFormats.csv || selectedFormats.excel || selectedFormats.pdf) {
      setConfirmModal(true);
    } else {
      setConfirmModal(false);
    }
    setOpen(false);
  };

  // Update selected formats based on user input
  const handleFormatChange = (event) => {
    setSelectedFormats({
      ...selectedFormats,
      [event.target.name]: event.target.checked,
    });
  };

  // Capture screenshot of a referenced DOM element
  const captureScreenshot = async (ref) => {
    if (ref.current) {
      try {
        const canvas = await html2canvas(ref.current, { useCORS: true });
        return canvas.toDataURL('image/png'); // Return base64 image data
      } catch (error) {
        console.error('Error capturing screenshot:', error);
      }
    }
    return null;
  };

  // Generate a PDF report by capturing screenshots of visual components
  const generatePdfReport = async (event) => {
    event.preventDefault();
    setLoading(true);
    const base64DataArray = [];

    // Capture images from each ref and push valid screenshots to array
    try {
      const dataUrl1 = await captureScreenshot(tableRef);
      const dataUrl2 = await captureScreenshot(mapRef);
      const dataUrl3 = await captureScreenshot(tempGraphRef);
      const dataUrl4 = await captureScreenshot(humGraphRef);
      const dataUrl5 = await captureScreenshot(shockGraphRef);
      const dataUrl6 = await captureScreenshot(lightGraphRef);
      const dataUrl7 = await captureScreenshot(batteryGraphRef);
      const dataUrl8 = await captureScreenshot(alertsTableRef);
      if (dataUrl1) base64DataArray.push(dataUrl1);
      if (dataUrl2) base64DataArray.push(dataUrl2);
      if (dataUrl3) base64DataArray.push(dataUrl3);
      if (dataUrl4) base64DataArray.push(dataUrl4);
      if (dataUrl5) base64DataArray.push(dataUrl5);
      if (dataUrl6) base64DataArray.push(dataUrl6);
      if (dataUrl7) base64DataArray.push(dataUrl7);
      if (dataUrl8) base64DataArray.push(dataUrl8);
    } catch (error) {
      console.error(error);
    }

    // Build payload and trigger PDF generation
    const apiData = {
      shipment_name: selectedShipment.name,
      shipment_id: selectedShipment.id,
      user_email: user.email,
      images_data: base64DataArray,
    };

    reportPDFDownloadMutation(apiData); // Send data to server

    // Reset modal and format selection
    setSelectedFormats({ csv: false, excel: false, pdf: false });
    setLoading(false);
    setOpen(false);
  };

  // Download CSV, Excel, and/or PDF files based on selection
  const downloadFiles = async (event) => {
    event.preventDefault();
    if (selectedFormats.csv) await downloadCSV();
    if (selectedFormats.excel) await downloadExcel();

    // Download pre-generated PDF if available
    if (selectedFormats.pdf && selectedShipment.report_download_url) {
      const link = document.createElement('a');
      link.href = selectedShipment.report_download_url;
      link.target = '_blank';
      link.download = `${selectedShipment.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setOpen(false);
    setSelectedFormats({ csv: false, excel: false, pdf: false });
  };

  return (
    <div>
      <FormModal
        open={open}
        handleClose={closeFormModal}
        title="Insights Report"
        openConfirmModal={openConfirmModal}
        setConfirmModal={setConfirmModal}
        handleConfirmModal={discardFormData}
      >
        {isLoading && <Loader open={isLoading} />}

        <form className="generateReportFormContainer" noValidate>
          {/* Header text */}
          <Grid container spacing={isDesktop() ? 2 : 0}>
            <Grid className="itemInputWithTooltip" item xs={12}>
              <Typography fontSize={18} fontWeight="500">
                Choose option(s) for which you want to download:
              </Typography>
            </Grid>
          </Grid>

          {/* Checkboxes for selecting file formats */}
          <Grid container spacing={isDesktop() ? 2 : 0}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormGroup>
                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={selectedFormats.csv}
                        onChange={handleFormatChange}
                        name="csv"
                      />
                    )}
                    label="CSV File"
                  />
                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={selectedFormats.excel}
                        onChange={handleFormatChange}
                        name="excel"
                      />
                    )}
                    label="Excel File"
                  />
                  {/* Show PDF option only if report download URL exists */}
                  {!_.isEmpty(selectedShipment) && !_.isEmpty(selectedShipment.report_download_url) && (
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={selectedFormats.pdf}
                          onChange={handleFormatChange}
                          name="pdf"
                        />
                      )}
                      label="PDF File"
                    />
                  )}
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>

          {/* Action buttons: Generate PDF, Download Files, Cancel */}
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={3}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className="generateReportButton"
                onClick={generatePdfReport}
              >
                Generate PDF Report
              </Button>
            </Grid>
            {!_.isEmpty(selectedShipment) && (
              <Grid item xs={12} sm={3}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className="generateReportButton"
                  onClick={downloadFiles}
                  disabled={
                    !(selectedFormats.csv || selectedFormats.excel || selectedFormats.pdf)
                  }
                >
                  Download
                </Button>
              </Grid>
            )}
            <Grid item xs={12} sm={3}>
              <Button
                type="button"
                fullWidth
                variant="outlined"
                color="primary"
                className="generateReportButton"
                onClick={discardFormData}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </FormModal>
    </div>
  );
};

export default GenerateReport;
