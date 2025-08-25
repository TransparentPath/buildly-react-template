/* eslint-disable no-else-return */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Grid, Button } from '@mui/material';
import useAlert from '@hooks/useAlert';
import { useQuery } from 'react-query';
import { getUser } from '@context/User.context';
import { newGatewayColumns } from '@utils/constants';
import Loader from '@components/Loader/Loader';
import FormModal from '@components/Modal/FormModal';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import OrganizationSelector from '@components/OrganizationSelector/OrganizationSelector';
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery';
import { getGatewayQuery } from '@react-query/queries/sensorGateways/getGatewayQuery';
import { useFetchNewGatewayMutation } from 'react-query/mutations/sensorGateways/fetchNewGatewayMutation';
import { useEditGatewayMutation } from '@react-query/mutations/sensorGateways/editGatewayMutation';
import '../../AdminPanelStyles.css';

const Devices = ({ isNewDevices }) => {
  const { t } = useTranslation();

  // Initial setup: Retrieve user info and organization details
  const user = getUser();
  const org = user.organization.name;
  const org_uuid = user.organization.organization_uuid;

  // State hooks for managing the UI and data
  const [rows, setRows] = useState([]); // Holds the list of gateways/devices to display
  const [selectedRows, setSelectedRows] = useState([]); // Holds selected rows from the table
  const [selectedRowsIndex, setSelectedRowsIndex] = useState([]); // Holds indices of selected rows
  const [organization, setOrganization] = useState(user.organization.name); // Currently selected organization
  const [buttonClick, setButtonClick] = useState(false); // Tracks if the button to load gateways has been clicked
  const [mainMenuOpen, setMainMenuOpen] = useState(false); // Controls the menu open/close state
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null); // Anchors the submenu position

  // Hook for displaying alerts
  const { displayAlert } = useAlert();

  // Queries for fetching organization and gateway data
  const { data: orgData, isLoading: isLoadingOrgs } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert, 'Devices'), // Fetch all organizations
    { refetchOnWindowFocus: false },
  );

  const { data: gatewayData, isLoading: isLoadingGateways } = useQuery(
    ['gateways', organization],
    () => getGatewayQuery(null, displayAlert, 'Devices'), // Fetch gateway data for the selected organization
    { refetchOnWindowFocus: false, enabled: buttonClick }, // Fetch only after button is clicked
  );

  // Mutations for handling new and edited gateway data
  const { data: newGetewayData, mutate: fetchNewGatewayMutation, isLoading: isFetchingNewGateway } = useFetchNewGatewayMutation(displayAlert, 'Devices');
  const { mutate: editGatewayMutation, isLoading: isEditingGateway } = useEditGatewayMutation(org_uuid, null, null, displayAlert, 'Devices');

  // Function to fetch new gateways (either new or reused)
  const fetchGateways = () => {
    if (isNewDevices) {
      const newGatewayData = {
        platform_type: 'Tive',
        is_new: true,
      };
      fetchNewGatewayMutation(newGatewayData); // Fetch new gateways
    } else {
      setButtonClick(true); // Trigger fetching existing gateway data
    }
  };

  // Effect hook to update rows when new or existing gateway data is fetched
  useEffect(() => {
    if (isNewDevices) {
      if (!_.isEmpty(newGetewayData) && !_.isEmpty(newGetewayData.new_trackers)) {
        setRows(newGetewayData.new_trackers); // Set new trackers (devices)
      }
    } else {
      setRows(gatewayData); // Set fetched gateway data
    }
  }, [newGetewayData, gatewayData]);

  // Function to handle the selection of rows in the data table
  const handleSelectedTrackers = (allRows) => {
    const selectedFilteredRows = allRows.map((item) => {
      if (!_.isEmpty(newGetewayData) && !_.isEmpty(newGetewayData.new_trackers)) {
        return newGetewayData.new_trackers[item.dataIndex]; // Get selected rows for new gateways
      } else if (!_.isEmpty(gatewayData)) {
        return gatewayData[item.dataIndex]; // Get selected rows for existing gateways
      } else {
        return null;
      }
    });
    setSelectedRows(selectedFilteredRows); // Set selected rows data
    setSelectedRowsIndex(allRows.map((item) => item.dataIndex)); // Set selected rows indices
  };

  // Function to handle the change of the selected organization
  const handleOrganizationChange = (e) => {
    const organization_name = e.target ? e.target.value : e;
    setOrganization(!_.isEmpty(organization_name) ? organization_name : org); // Set the selected organization
    setMainMenuOpen(false); // Close the main menu
    setSubmenuAnchorEl(null); // Close the submenu
  };

  // Function to submit the selected rows and update gateway data
  const handleSubmit = () => {
    const { organization_uuid } = _.filter(orgData, (o) => _.isEqual(o.name, organization))[0]; // Find the UUID of the selected organization
    const updatedRows = selectedRows.map((row) => ({
      ...row,
      organization_uuid, // Add organization UUID to each row
      is_new: false, // Mark rows as no longer new
    }));
    editGatewayMutation(updatedRows); // Call the mutation to edit gateways
    const filteredRows = rows.filter((row) => !selectedRows.some((selected) => selected.id === row.id)); // Filter out the selected rows from the table
    setRows(filteredRows); // Update the rows
    setButtonClick(false); // Reset the button click state
    setSelectedRows([]); // Clear selected rows
    setSelectedRowsIndex([]); // Clear selected rows indices
    setOrganization(user.organization.name); // Reset the organization to the user's default
  };

  return (
    <div>
      {/* Loader component to show loading spinner while data is being fetched */}
      {(isLoadingOrgs || isFetchingNewGateway || isEditingGateway || isLoadingGateways) && <Loader open={isLoadingOrgs || isFetchingNewGateway || isEditingGateway || isLoadingGateways} />}

      {/* Button to trigger fetching gateways */}
      <Grid container>
        <Grid item xs={6} sm={3}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className="adminTrackersButton"
            onClick={fetchGateways} // Trigger fetching of new or reused gateways
            disabled={isFetchingNewGateway || isEditingGateway || isLoadingGateways} // Disable the button while data is being fetched
          >
            {isNewDevices ? t('adminTrackers.uploadNewDevices') : t('adminTrackers.uploadReusedDevices')}
          </Button>
        </Grid>
      </Grid>

      {/* Display the data table if there are rows to show */}
      {!_.isEmpty(rows) && (
        <Grid container>
          <Grid item xs={12} sm={8} mt={-6}>
            {/* DataTableWrapper component to display the gateway data */}
            <DataTableWrapper
              hideAddButton
              noOptionsIcon
              rows={rows || []} // Pass the rows (gateway data) to the table
              columns={newGatewayColumns(t)} // Define the columns for the table
              selectable={{
                rows: 'multiple', // Allow multiple row selections
                rowsHeader: true, // Allow header row selection
              }}
              selected={selectedRowsIndex} // Highlight selected rows
              onRowSelectionChange={(rowsSelectedData, allRows, rowsSelected) => {
                handleSelectedTrackers(allRows); // Update selected rows when a selection change occurs
              }}
            />
          </Grid>

          {/* Organization selector and submission button */}
          <Grid item xs={12} sm={4} mt={1}>
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
              style={{ marginLeft: '20px', marginTop: '8px' }}
              disabled={isFetchingNewGateway || isEditingGateway || isLoadingGateways || _.isEmpty(selectedRows) || _.isEmpty(organization)} // Disable if no rows are selected or if loading
              onClick={handleSubmit} // Trigger submit to update gateway data
            >
              {t('common.ok')}
            </Button>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default Devices;
