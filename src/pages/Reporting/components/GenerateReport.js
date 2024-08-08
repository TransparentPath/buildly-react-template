/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import React, { useState, useRef } from 'react';
import _ from 'lodash';
import FormModal from '@components/Modal/FormModal';
import GraphComponent from '@components/GraphComponent/GraphComponent';
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
} from '@mui/material';
import '../ReportingStyles.css';
import { getIcon, REPORT_TYPES } from '@utils/constants';
import { isDesktop } from '@utils/mediaQuery';
import ReportGraph from './ReportGraph';
import html2canvas from 'html2canvas';

const GenerateReport = ({
  open,
  setOpen,
  tableRef,
  tempGraphRef,
  humGraphRef,
  shockGraphRef,
  lightGraphRef,
  batteryGraphRef,
  isGenerateReportLoading,
  setGenerateReportLoading,
  downloadCSV,
  downloadExcel,
  reportPDFDownloadMutation,
  selectedShipment,
}) => {
  const [openConfirmModal, setConfirmModal] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState({
    csv: false,
    excel: false,
    pdf: false,
  });

  const discardFormData = () => {
    setSelectedFormats({
      csv: false,
      excel: false,
      pdf: false,
    });
    setConfirmModal(false);
    setOpen(false);
  };

  const closeFormModal = () => {
    if (selectedFormats.csv || selectedFormats.excel || selectedFormats.pdf) {
      setConfirmModal(true);
    } else {
      setConfirmModal(false);
    }
    setOpen(false);
  };

  const handleFormatChange = (event) => {
    setSelectedFormats({
      ...selectedFormats,
      [event.target.name]: event.target.checked,
    });
  };

  async function captureScreenshot(ref) {
    try {
      if (ref.current) {
        const canvas = await html2canvas(ref.current, {
          width: 100,
          height: 100,
          scale: 1,
        });
        return canvas.toDataURL();
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGenerateReportLoading(true);
    if (_.isEqual(selectedFormats.csv, true)) {
      setOpen(false);
      downloadCSV();
    }
    if (_.isEqual(selectedFormats.excel, true)) {
      setOpen(false);
      downloadExcel();
    }
    if (_.isEqual(selectedFormats.pdf, true)) {
      const base64DataArray = [];
      try {
        const canvas1 = await html2canvas(tableRef.current);
        const canvas2 = await html2canvas(tempGraphRef.current);
        const canvas3 = await html2canvas(humGraphRef.current);
        const canvas4 = await html2canvas(shockGraphRef.current);
        const canvas5 = await html2canvas(lightGraphRef.current);
        const canvas6 = await html2canvas(batteryGraphRef.current);
        setOpen(false);
        const dataUrl1 = await canvas1.toDataURL();
        if (dataUrl1) base64DataArray.push(dataUrl1);
        const dataUrl2 = await canvas2.toDataURL();
        if (dataUrl2) base64DataArray.push(dataUrl2);
        const dataUrl3 = await canvas3.toDataURL();
        if (dataUrl3) base64DataArray.push(dataUrl3);
        const dataUrl4 = await canvas4.toDataURL();
        if (dataUrl4) base64DataArray.push(dataUrl4);
        const dataUrl5 = await canvas5.toDataURL();
        if (dataUrl5) base64DataArray.push(dataUrl5);
        const dataUrl6 = await canvas6.toDataURL();
        if (dataUrl6) base64DataArray.push(dataUrl6);
        console.log(base64DataArray);
      } catch (error) {
        setOpen(false);
        console.log(error);
      }
      const apiData = {
        shipment_name: selectedShipment.name,
        user_email: 'tanmay@buildly.io',
        images_data: base64DataArray,
      };
      reportPDFDownloadMutation(apiData);
    }
    setSelectedFormats({
      csv: false,
      excel: false,
      pdf: false,
    });
    setGenerateReportLoading(false);
  };

  return (
    <div>
      <FormModal
        open={open}
        handleClose={closeFormModal}
        title="Generate Report"
        openConfirmModal={openConfirmModal}
        setConfirmModal={setConfirmModal}
        handleConfirmModal={discardFormData}
      >
        <form
          className="generateReportFormContainer"
          noValidate
          onSubmit={handleSubmit}
        >
          <Grid container spacing={isDesktop() ? 2 : 0}>
            <Grid className="itemInputWithTooltip" item xs={12}>
              <Typography fontSize={18} fontWeight="500">Choose option(s) for which you want to download:</Typography>
            </Grid>
          </Grid>
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
                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={selectedFormats.pdf}
                        onChange={handleFormatChange}
                        name="pdf"
                      />
                    )}
                    label="PDF report (sent via email)"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className="generateReportButton"
                disabled={(!selectedFormats.csv && !selectedFormats.excel && !selectedFormats.pdf) || isGenerateReportLoading}
              >
                Generate
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
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
