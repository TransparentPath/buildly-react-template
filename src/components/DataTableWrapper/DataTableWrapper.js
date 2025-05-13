/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import MUIDataTable from 'mui-datatables'; // MUI Data Table library for advanced data table UI
// MUI Components
import {
  Grid,
  Button,
  IconButton,
  Box,
  Typography,
  TextField,
} from '@mui/material';
// MUI Icons
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import Loader from '../Loader/Loader'; // Reusable loader and confirmation modal
import ConfirmModal from '../Modal/ConfirmModal';
import { getUser } from '@context/User.context'; // Context and utility functions for user role validation
import { checkForAdmin, checkForGlobalAdmin } from '@utils/utilMethods';
import './DataTableWrapperStyles.css'; // Custom styles

const DataTableWrapper = ({
  loading, // Flag to show/hide loader
  rows, // Table row data
  columns, // Table columns (excluding edit/delete)
  filename, // Filename for CSV download
  addButtonHeading, // Text for the add button
  onAddButtonClick, // Handler when add button is clicked
  children, // Additional components to render below the table
  editAction, // Function to invoke on edit action
  deleteAction, // Function to invoke on delete action
  openDeleteModal, // Boolean to control delete confirmation modal visibility
  setDeleteModal, // Setter for delete modal state
  handleDeleteModal, // Handler to confirm delete
  deleteModalTitle, // Title of delete confirmation modal
  tableHeight, // Optional table body height
  tableHeader, // Optional heading above the table
  hideAddButton, // Flag to hide the add button
  selectable, // Row selection config object
  selected, // Pre-selected row indexes
  customSort, // Custom sorting function
  customTheme, // If true, disables default table styles
  noSpace, // If true, removes vertical spacing
  noOptionsIcon, // If true, hides toolbar options (search, filter, etc.)
  extraOptions, // Extra options to extend MUI DataTable config
  className, // Custom class for table styling
  shouldUseAllColumns, // If true, disables column selection during CSV download
  downloadTemplateButton, // If true, shows the download template button
  uploadDataButton, // If true, shows the upload data button
  downloadTemplateHref, // URL for template download
  onUploadData, // Handler for uploaded data file
  downloadTemplateHeading, // Text label for download template button
  uploadDataHeading, // Text label for upload data button
  onRowSelectionChange, // Callback when row selection changes
  customIconButtonRight, // Custom JSX to render extra buttons
  isShipmentTable, // Flag to indicate if the table is for shipments
}) => {
  const user = getUser(); // Fetch current user
  const isAdmin = checkForAdmin(user) || checkForGlobalAdmin(user); // Check if user has admin rights

  let finalColumns = [];

  // Conditionally add edit column if user is admin and `editAction` is provided
  if (editAction && isAdmin) {
    finalColumns = [
      ...finalColumns,
      {
        name: 'Edit',
        options: {
          filter: false,
          sort: false,
          empty: true,
          customBodyRenderLite: (dataIndex) => (
            <IconButton
              className="dataTableIconButton"
              onClick={() => editAction(rows[dataIndex])}
            >
              <EditIcon />
            </IconButton>
          ),
        },
      },
    ];
  }

  // Conditionally add delete column if user is admin and `deleteAction` is provided
  if (deleteAction && isAdmin) {
    finalColumns = [
      ...finalColumns,
      {
        name: 'Delete',
        options: {
          filter: false,
          sort: false,
          empty: true,
          customBodyRenderLite: (dataIndex) => (
            <IconButton
              className="dataTableIconButton"
              onClick={() => deleteAction(rows[dataIndex])}
            >
              <DeleteIcon />
            </IconButton>
          ),
        },
      },
    ];
  }

  // Combine base columns with edit/delete columns
  finalColumns = [...finalColumns, ...columns];

  // MUI Data Table options and features
  const options = {
    download: shouldUseAllColumns ? false : !noOptionsIcon,
    print: !noOptionsIcon,
    search: !noOptionsIcon,
    viewColumns: !noOptionsIcon,
    filter: !noOptionsIcon,
    filterType: 'multiselect',
    responsive: 'standard',
    pagination: true,
    jumpToPage: true,
    tableBodyHeight: tableHeight || '',
    selectableRows: selectable && selectable.rows ? selectable.rows : 'none',
    selectToolbarPlacement: 'none',
    selectableRowsHeader: selectable && selectable.rowsHeader
      ? selectable.rowsHeader
      : true,
    selectableRowsHideCheckboxes: selectable && selectable.rowsHideCheckboxes
      ? selectable.rowsHideCheckboxes
      : false,
    rowsSelected: selected || [],
    onRowSelectionChange,
    rowsPerPageOptions: [5, 10, 15],
    downloadOptions: {
      filename: `${noOptionsIcon ? 'nothing' : filename}.csv`,
      separator: ',',
      filterOptions: {
        useDisplayedColumnsOnly: !shouldUseAllColumns,
      },
    },
    textLabels: {
      body: {
        noMatch: 'No data to display',
      },
      pagination: {
        jumpToPage: 'Go To Page',
      },
    },
    // Conditional row styling
    setRowProps: (row, dataIndex, rowIndex) => !customTheme && { className: 'dataTableBody' },
    customSort,
    ...extraOptions, // Spread any additional custom options
  };

  return (
    <Box mt={noSpace ? 0 : 5} mb={noSpace ? 0 : 5}>
      {/* Show loader while loading */}
      {loading && <Loader open={loading} />}
      <div>
        {/* Top button area: Add / Download / Upload */}
        <Grid container mb={3} mt={2}>
          {/* Add Button: Only visible for admins */}
          {!hideAddButton && isAdmin && (
            <Grid item xs={12} sm={4}>
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={onAddButtonClick}
              >
                <AddIcon />
                {` ${addButtonHeading}`}
              </Button>
            </Grid>
          )}
          {/* Download & Upload Section */}
          <Grid item xs={12} sm={8}>
            <Grid container flex className="dataTableDownloadUploadFlex">
              {isAdmin && customIconButtonRight}
              {/* Download Template Button */}
              {downloadTemplateButton && isAdmin && (
                <Grid item>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    href={downloadTemplateHref}
                  >
                    <DownloadIcon />
                    {` ${downloadTemplateHeading}`}
                  </Button>
                </Grid>
              )}
              {/* Upload Data Button */}
              {uploadDataButton && isAdmin && (
                <Grid item>
                  <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<UploadIcon />}
                    id="dataTableUploadButton"
                  >
                    {uploadDataHeading}
                    <input
                      type="file"
                      className="dataTableUploadInput"
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      onClick={(e) => {
                        e.target.value = null; // Clear previous file
                      }}
                      onChange={(event) => onUploadData(event.target.files[0])}
                    />
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
        {/* Optional header above table */}
        {tableHeader && (
          <Typography className="dataTableDashboardHeading" variant="h4">
            {tableHeader}
          </Typography>
        )}
        {/* Main Table Grid */}
        <Grid className={`${isShipmentTable ? 'shipmentDataTable' : !customTheme ? 'dataTable' : ''}`} container spacing={2}>
          <Grid item xs={12}>
            <MUIDataTable
              data={rows}
              columns={finalColumns}
              options={options}
              className={className}
            />
          </Grid>
        </Grid>
        {/* Any additional children rendered below table */}
        {children}
      </div>
      {/* Confirmation Modal for Delete Action */}
      {deleteAction && isAdmin && (
        <ConfirmModal
          open={openDeleteModal}
          setOpen={setDeleteModal}
          submitAction={handleDeleteModal}
          title={deleteModalTitle}
          submitText="Delete"
        />
      )}
    </Box>
  );
};

export default DataTableWrapper;
