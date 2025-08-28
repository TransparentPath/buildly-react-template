import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import _ from 'lodash';
import {
  Button,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { PhonelinkErase as RemoveDevicesIcon } from '@mui/icons-material';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import Loader from '@components/Loader/Loader';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery';
import { getAllGatewayQuery } from '@react-query/queries/sensorGateways/getAllGatewayQuery';
import { useFetchNewGatewayMutation } from '@react-query/mutations/sensorGateways/fetchNewGatewayMutation';
import { useEditGatewayMutation } from '@react-query/mutations/sensorGateways/editGatewayMutation';
import { allDevicesColumns } from '@utils/constants';
import OrganizationSelector from '@components/OrganizationSelector/OrganizationSelector';
import { getGatewayTypeQuery } from 'react-query/queries/sensorGateways/getGatewayTypeQuery';

// The Configuration component renders the configuration section for device management
const Configuration = (props) => {
  const { t } = useTranslation();

  // Initial setup: Retrieve user info and organization details
  const user = getUser();
  const org_name = user.organization.name;
  const org_uuid = user.organization.organization_uuid;

  // State hooks for managing the UI and data
  const [availableRows, setAvailableRows] = useState([]); // Holds the list of available/unavailable gateways/devices
  const [assignedRows, setAssignedRows] = useState([]); // Holds the list of assigned gateways/devices
  const [selectedRows, setSelectedRows] = useState([]); // Holds selected rows from the table
  const [selectedAvailableRowsIndex, setSelectedAvailableRowsIndex] = useState([]); // Holds indices of selected available/unavailable rows
  const [organization, setOrganization] = useState(org_name); // Currently selected organization
  const [mainMenuOpen, setMainMenuOpen] = useState(false); // Controls the menu open/close state
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null); // Anchors the submenu position

  // Hook for displaying alert
  const { displayAlert } = useAlert();

  // Queries to fetch data
  const { data: orgData, isLoading: isLoadingOrgs } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert, 'All Devices'),
    { refetchOnWindowFocus: false },
  );

  const { data: allGatewayData, isLoading: isLoadingAllGateway } = useQuery(
    ['allGateways'],
    () => getAllGatewayQuery(displayAlert, 'All Devices'),
    { refetchOnWindowFocus: false },
  );

  const { data: allGatewayTypesData, isLoading: isLoadingAllGatewayTypes } = useQuery(
    ['allGatewayTypes'],
    () => getGatewayTypeQuery(displayAlert, 'All Devices'),
    { refetchOnWindowFocus: false },
  );

  // Mutations for handling new and edited gateway data
  const { mutate: fetchNewGatewayMutation, isLoading: isFetchingNewGateway } = useFetchNewGatewayMutation(displayAlert, 'All Devices');
  const { mutate: editGatewayMutation, isLoading: isEditingGateway } = useEditGatewayMutation(org_uuid, null, null, displayAlert, 'All Devices');

  // Segregate gateways based on their status
  useEffect(() => {
    if (!_.isEmpty(allGatewayData)) {
      const modifiedData = _.map(allGatewayData, (gateway) => ({
        ...gateway,
        _type: _.find(allGatewayTypesData, { url: gateway.gateway_type })?.name || 'N/A',
        _organization: _.find(orgData, { organization_uuid: gateway.organization_uuid })?.name || 'Unassigned',
      }));
      setAvailableRows(_.filter(modifiedData, (gt) => _.includes(['available', 'unavailable'], _.toLower(gt.gateway_status))));
      setAssignedRows(_.filter(modifiedData, (gt) => _.isEqual(_.toLower(gt.gateway_status), 'assigned')));
    }
  }, [allGatewayData, allGatewayTypesData, orgData]);

  // Function to fetch new gateways on our platform
  const fetchNewGateways = () => {
    fetchNewGatewayMutation({
      platform_type: 'Tive',
      is_new: true,
    });
  };

  // Function to handle the selection of rows in the data table
  const handleSelectedTrackers = (allRows) => {
    const selectedFilteredRows = _.map(allRows, (item) => availableRows[item.dataIndex]);
    setSelectedRows(selectedFilteredRows); // Set selected rows data
    setSelectedAvailableRowsIndex(_.map(allRows, (item) => item.dataIndex)); // Set selected available/unavilable rows indices
  };

  // Function to handle the removal of selected devices
  const handleRemoveDevices = () => {
    const updatedRows = _.map(selectedRows, (row) => ({
      ...row,
      organization_uuid: null, // remove organization
      is_new: false, // Mark rows as no longer new
    }));

    editGatewayMutation(updatedRows); // Call the mutation to edit gateways

    setSelectedRows([]); // Clear selected rows
    setSelectedAvailableRowsIndex([]); // Clear selected available rows indices
  };

  // Function to handle the change of the selected organization
  const handleOrganizationChange = (e) => {
    const organization_name = e.target ? e.target.value : e;
    setOrganization(!_.isEmpty(organization_name) ? organization_name : org_name); // Set the selected organization
    setMainMenuOpen(false); // Close the main menu
    setSubmenuAnchorEl(null); // Close the submenu
  };

  // Function to submit the selected rows and update gateway data
  const handleSubmit = () => {
    const { organization_uuid } = _.filter(orgData, (o) => _.isEqual(o.name, organization))[0]; // Find the UUID of the selected organization
    const updatedRows = _.map(selectedRows, (row) => ({
      ...row,
      organization_uuid, // Add organization UUID to each row
      is_new: false, // Mark rows as no longer new
    }));

    editGatewayMutation(updatedRows); // Call the mutation to edit gateways

    setSelectedRows([]); // Clear selected rows
    setSelectedAvailableRowsIndex([]); // Clear selected available rows indices
    setOrganization(org_name); // Reset the organization to the user's default
  };

  return (
    <div className="adminPanelRoot">
      {/* Loading Spinner */}
      {(isLoadingOrgs || isLoadingAllGateway || isLoadingAllGatewayTypes || isFetchingNewGateway || isEditingGateway) && (
        <Loader open={isLoadingOrgs || isLoadingAllGateway || isLoadingAllGatewayTypes || isFetchingNewGateway || isEditingGateway} />
      )}

      {/* Page heading */}
      <Typography variant="h4">{t('adminTrackers.allDevices')}</Typography>

      {/* Button to bring in new devices to the platform */}
      <Button variant="contained" color="primary" className="adminTrackersNewDevicesButton" onClick={fetchNewGateways}>
        {t('adminTrackers.uploadNewDevices')}
      </Button>

      <Grid container>
        {/* Available and Unavailable devices from our platform */}
        <Grid item xs={12}>
          <Typography variant="h6">{t('adminTrackers.availableDevices')}</Typography>
        </Grid>
        <Grid item xs={12} sm={9} className="adminTrackersDatatable">
          <DataTableWrapper
            hideAddButton
            noSpace
            rows={availableRows} // Pass the rows (gateway data) to the table
            columns={allDevicesColumns(t)} // Define the columns for the table
            selectable={{
              rows: 'multiple', // Allow multiple row selections
              rowsHeader: true, // Allow header row selection
            }}
            selected={selectedAvailableRowsIndex} // Highlight selected rows
            onRowSelectionChange={(rowsSelectedData, allRows, rowsSelected) => {
              handleSelectedTrackers(allRows); // Update selected rows when a selection change occurs
            }}
            extraOptions={{
              download: false, // Disable download option
              filter: false, // Disable filter option
              print: false, // Disable print option
              search: true, // Enable search option
              viewColumns: false, // Disable column visibility toggle
              customToolbar: () => (
                <Grid item xs={12}>
                  <IconButton
                    className="adminTrackersRemoveDevicesButton"
                    onClick={handleRemoveDevices}
                    disabled={isFetchingNewGateway || isEditingGateway || isLoadingAllGateway || _.isEmpty(selectedAvailableRowsIndex)}
                  >
                    <Tooltip arrow title={t('adminTrackers.removeDevices')}>
                      <RemoveDevicesIcon />
                    </Tooltip>
                  </IconButton>
                </Grid>
              ),
            }}
          />
        </Grid>

        {/* Organization selector and submission button */}
        <Grid item xs={12} sm={3}>
          <OrganizationSelector
            handleOrganizationChange={handleOrganizationChange} // Function to handle organization change
            selectedOrg={organization} // Currently selected organization
            mainMenuOpen={mainMenuOpen} // Whether the main menu is open
            setMainMenuOpen={setMainMenuOpen} // Function to control the main menu open state
            submenuAnchorEl={submenuAnchorEl} // Position of the submenu
            setSubmenuAnchorEl={setSubmenuAnchorEl} // Function to control the submenu position
          />
          <Button
            type="button"
            variant="contained"
            color="primary"
            className="adminTrackersSubmitButton"
            disabled={isFetchingNewGateway || isEditingGateway || isLoadingAllGateway || _.isEmpty(selectedRows) || _.isEmpty(organization)} // Disable if no rows are selected or if loading
            onClick={handleSubmit} // Trigger submit to update gateway data
          >
            {t('common.ok')}
          </Button>
        </Grid>

        {/* Assigned devices from our platform */}
        <Grid item xs={12}>
          <Typography variant="h6">{t('adminTrackers.assignedDevices')}</Typography>
        </Grid>
        <Grid item xs={12} sm={9} className="adminTrackersDatatable">
          <DataTableWrapper
            hideAddButton
            noSpace
            rows={assignedRows} // Pass the rows (gateway data) to the table
            columns={allDevicesColumns(t)} // Define the columns for the table
            extraOptions={{
              download: false, // Disable download option
              filter: false, // Disable filter option
              print: false, // Disable print option
              search: true, // Enable search option
              viewColumns: false, // Disable column visibility toggle
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Configuration;
