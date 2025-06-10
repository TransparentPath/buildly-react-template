/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Typography,
  useTheme,
  Button,
  Box,
  Tooltip,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Add as AddIcon, Sync as SyncIcon } from '@mui/icons-material';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import GatewayActions from './components/GatewayActions';
import { getUser } from '@context/User.context';
import { routes } from '@routes/routesConstants';
import { gatewayColumns, getGatewayFormattedRow } from '@utils/constants';
import AddGateway from './forms/AddGateway';
import { useQuery } from 'react-query';
import { getGatewayQuery } from '@react-query/queries/sensorGateways/getGatewayQuery';
import { getGatewayTypeQuery } from '@react-query/queries/sensorGateways/getGatewayTypeQuery';
import { getCustodianTypeQuery } from '@react-query/queries/custodians/getCustodianTypeQuery';
import { getCustodianQuery } from '@react-query/queries/custodians/getCustodianQuery';
import { getContactQuery } from '@react-query/queries/custodians/getContactQuery';
import { getShipmentsQuery } from '@react-query/queries/shipments/getShipmentsQuery';
import { getCountriesQuery } from '@react-query/queries/shipments/getCountriesQuery';
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery';
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery';
import { useSyncGatewayMutation } from '@react-query/mutations/sensorGateways/syncGatewayMutation';
import { useEditGatewayMutation } from '@react-query/mutations/sensorGateways/editGatewayMutation';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import { useStore } from '@zustand/timezone/timezoneStore';
import Loader from '@components/Loader/Loader';
import AddShipper from './forms/AddShipper';
import { checkForAdmin, checkForGlobalAdmin } from '@utils/utilMethods';

/**
 * Gateway Component
 * This component manages the display and interaction with sensor gateways.
 * It includes functionality for syncing gateways, editing gateways, and managing shippers.
 */
const Gateway = ({ history, redirectTo }) => {
  const user = getUser(); // Fetch the current logged-in user
  const isSuperAdmin = checkForGlobalAdmin(user); // Check if the user is a super admin
  const isAdmin = checkForAdmin(user); // Check if the user is an admin
  const organization = user.organization.organization_uuid; // Get the organization UUID of the logged-in user
  const theme = useTheme(); // Material-UI theme for styling

  const { displayAlert } = useAlert(); // Hook to display alerts
  const { data } = useStore(); // Zustand store for timezone data

  // State variables
  const [rows, setRows] = useState([]); // Stores formatted gateway data
  const [shippers, setShippers] = useState([]); // Stores unique shippers
  const [showAddShipper, setShowAddShipper] = useState(false); // Controls the visibility of the "Add Shipper" modal
  const [selectedRows, setSelectedRows] = useState([]); // Tracks selected rows in the data table
  const [selectedIndices, setSelectedIndices] = useState({}); // Tracks selected row indices for each shipper

  // Fetch gateway data
  const { data: gatewayData, isLoading: isLoadingGateways } = useQuery(
    ['gateways', organization],
    () => getGatewayQuery(organization, displayAlert, 'Gateway'),
    { refetchOnWindowFocus: false },
  );

  // Fetch gateway types
  const { data: gatewayTypesData, isLoading: isLoadingGatewayTypes } = useQuery(
    ['gatewayTypes'],
    () => getGatewayTypeQuery(displayAlert, 'Gateway'),
    { refetchOnWindowFocus: false },
  );

  // Fetch custodian types
  const { data: custodianTypesData, isLoading: isLoadingCustodianTypes } = useQuery(
    ['custodianTypes'],
    () => getCustodianTypeQuery(displayAlert, 'Gateway'),
    { refetchOnWindowFocus: false },
  );

  // Fetch custodians
  const { data: custodianData, isLoading: isLoadingCustodians } = useQuery(
    ['custodians', organization],
    () => getCustodianQuery(organization, displayAlert, 'Gateway'),
    { refetchOnWindowFocus: false },
  );

  // Fetch contact information
  const { data: contactInfo, isLoading: isLoadingContact } = useQuery(
    ['contact', organization],
    () => getContactQuery(organization, displayAlert, 'Gateway'),
    { refetchOnWindowFocus: false },
  );

  // Fetch shipment data
  const { data: shipmentData, isLoading: isLoadingShipments } = useQuery(
    ['shipments', organization],
    () => getShipmentsQuery(organization, 'Planned,En route,Arrived', displayAlert, 'Gateway'),
    { refetchOnWindowFocus: false },
  );

  // Fetch countries
  const { data: countriesData, isLoading: isLoadingCountries } = useQuery(
    ['countries'],
    () => getCountriesQuery(displayAlert, 'Gateway'),
    { refetchOnWindowFocus: false },
  );

  // Fetch unit data
  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization],
    () => getUnitQuery(organization, displayAlert, 'Gateway'),
    { refetchOnWindowFocus: false },
  );

  // Fetch organization data
  const { data: orgData, isLoading: isLoadingOrgs } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert, 'Gateway'),
    { refetchOnWindowFocus: false },
  );

  // Mutation to sync gateways
  const { mutate: syncGatewayMutation, isLoading: isSyncingGateway } = useSyncGatewayMutation(organization, displayAlert, 'Gateway');

  // Mutation to edit gateways
  const { mutate: editGatewayMutation, isLoading: isEditingGateway } = useEditGatewayMutation(organization, null, null, displayAlert, 'Gateway');

  // Path for editing gateways
  const editPath = redirectTo
    ? `${redirectTo}/gateways`
    : `${routes.TRACKERS}/gateway/edit`;

  // Effect to format and set gateway rows
  useEffect(() => {
    if (!_.isEmpty(gatewayData) && !_.isEmpty(gatewayTypesData)) {
      setRows(
        getGatewayFormattedRow(
          gatewayData,
          gatewayTypesData,
          shipmentData,
          custodianData,
        ),
      );
    } else {
      setRows([]);
    }
  }, [gatewayData, gatewayTypesData, shipmentData, custodianData]);

  // Effect to extract unique shippers from rows
  useEffect(() => {
    if (!_.isEmpty(rows)) {
      let uniqueShippers = [...new Set(rows.map((item) => item.custodian).flat())];
      if (_.includes(uniqueShippers, '-')) {
        uniqueShippers = uniqueShippers.filter((shipper) => shipper !== '-').concat('-');
      }
      setShippers(uniqueShippers);
    } else {
      setShippers([]);
    }
  }, [rows]);

  // Effect to reset selected rows and indices when editing is complete
  useEffect(() => {
    if (!isEditingGateway) {
      setSelectedRows([]);
      setSelectedIndices({});
    }
  }, [isEditingGateway]);

  /**
   * Navigate to the edit gateway page with the selected gateway data.
   * @param {object} item - The selected gateway data.
   */
  const editGatewayAction = (item) => {
    history.push(`${editPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.TRACKERS,
      data: item,
      gatewayTypesData,
      unitData,
      custodianData,
      contactInfo,
      countriesData,
    });
  };

  /**
   * Handle selection of trackers for a specific custodian.
   * Updates the selected rows and indices for the custodian.
   * @param {array} allRows - The selected rows.
   * @param {string} custodianName - The name of the custodian.
   */
  const handleSelectedTrackers = (allRows, custodianName) => {
    const selectIndices = selectedIndices;
    const selectRows = selectedRows;
    const prevSelectedRows = _.filter(selectedRows, (row) => row.custodian.toString() !== custodianName);
    const filteredRows = _.filter(rows, (row) => row.custodian.toString() === custodianName);
    const selectedFilteredRows = allRows.map((item) => filteredRows[item.dataIndex]);
    selectIndices[custodianName] = allRows.map((item) => item.dataIndex);
    setSelectedRows([...prevSelectedRows, ...selectedFilteredRows]);
    setSelectedIndices(selectIndices);
  };

  /**
   * Handle syncing of gateways.
   * Triggers the sync gateway mutation with the required data.
   * @param {Event} event - The sync button click event.
   */
  const handleSyncGateways = (event) => {
    event.preventDefault();
    const gatewaySyncValue = {
      organization_uuid: organization,
      platform_type: 'Tive',
    };
    syncGatewayMutation(gatewaySyncValue);
  };

  return (
    <div>
      {/* Show loader if data is being fetched or synced */}
      {(isLoadingGateways
        || isLoadingGatewayTypes
        || isLoadingCustodianTypes
        || isLoadingCustodians
        || isLoadingContact
        || isLoadingShipments
        || isLoadingCountries
        || isLoadingUnits
        || isLoadingOrgs
        || isSyncingGateway)
        && (
          <Loader open={isLoadingGateways
            || isLoadingGatewayTypes
            || isLoadingCustodianTypes
            || isLoadingCustodians
            || isLoadingContact
            || isLoadingShipments
            || isLoadingCountries
            || isLoadingUnits
            || isLoadingOrgs
            || isSyncingGateway}
          />
        )}

      {/* Header section with sync and add shipper buttons */}
      <Grid container spacing={1} mt={4.3} className="gatewayContainer">
        <Grid item xs={12} className="gatewayHeaderContainer">
          <div className="gatewayHeader">
            <Typography variant="h4" mr={2}>Trackers</Typography>
            <Tooltip placement="bottom" title="Sync Trackers">
              <SyncIcon className="gatewaySyncIcon" onClick={handleSyncGateways} />
            </Tooltip>
            {isSuperAdmin && !_.isEmpty(selectedRows) && !_.isEqual(_.size(selectedRows), 0) && (
              <GatewayActions
                selectedRows={selectedRows}
                custodianData={custodianData}
                contactInfo={contactInfo}
                editGatewayMutation={editGatewayMutation}
                isEditingGateway={isEditingGateway}
              />
            )}
          </div>
          {(isSuperAdmin || isAdmin) && (
            <Button
              type="button"
              variant="contained"
              color="primary"
              style={{ marginBottom: '25px' }}
              onClick={() => setShowAddShipper(true)}
            >
              <AddIcon />
              Add Shipper
            </Button>
          )}
        </Grid>
      </Grid>

      {/* Add Shipper modal */}
      <AddShipper
        open={showAddShipper}
        setOpen={setShowAddShipper}
        orgData={orgData}
        custodianTypesData={custodianTypesData}
      />

      {/* Main content section */}
      <Grid container mt={3} pb={4}>
        {/* Display message if no shippers are available */}
        {_.isEmpty(shippers) && (
          <Typography className="gatewayEmptyText">No data to display</Typography>
        )}

        {/* Display shippers and their associated trackers */}
        {!_.isEmpty(shippers) && (
          <Grid item xs={12} sm={8} lg={9}>
            {shippers.map((custodianName, index) => (
              <Accordion key={index} className="gatewayAccordion">
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={_.isEqual(custodianName, '-') ? 'unassigned-content' : `${custodianName}-content`}
                  id={_.isEqual(custodianName, '-') ? 'unassigned-header' : `${custodianName}-header`}
                >
                  <Typography className="gatewayAccordingHeading notranslate">
                    {_.isEqual(custodianName, '-') ? 'UNASSIGNED TRACKERS' : custodianName.toUpperCase()}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <DataTableWrapper
                    hideAddButton
                    filename={_.isEqual(custodianName, '-') ? 'Unassigned Trackers' : `${custodianName} Trackers`}
                    rows={rows.filter((row) => row.custodian.toString() === custodianName) || []}
                    columns={gatewayColumns(
                      data,
                      _.find(
                        unitData,
                        (unit) => _.toLower(unit.unit_of_measure_for) === 'date',
                      )
                        ? _.find(
                          unitData,
                          (unit) => _.toLower(unit.unit_of_measure_for) === 'date',
                        ).unit_of_measure
                        : '',
                      theme,
                    )}
                    selectable={{
                      rows: isSuperAdmin ? 'multiple' : 'none',
                      rowsHeader: !!isSuperAdmin,
                    }}
                    onRowSelectionChange={(rowsSelectedData, allRows, rowsSelected) => {
                      if (isSuperAdmin) {
                        handleSelectedTrackers(allRows, custodianName);
                      }
                    }}
                    selected={selectedIndices[custodianName]}
                    editAction={editGatewayAction}
                  />
                  <Route path={`${editPath}/:id`} component={AddGateway} />
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
        )}

        {/* Display inventory summary for each shipper */}
        {!_.isEmpty(shippers) && (
          <Grid item xs={12} sm={3.5} lg={2.7} className="gatewayInventoryContainer">
            {!_.isEmpty(shippers) && shippers.map((custodianName, index) => {
              const trackers = rows.filter((row) => row.custodian.toString() === custodianName);
              const {
                availableCount,
                assignedCount,
                inTransitCount,
                unavailableCount,
              } = trackers.reduce(
                (acc, tracker) => {
                  if (tracker.gateway_status === 'available') {
                    acc.availableCount++;
                  } else if (tracker.gateway_status === 'assigned') {
                    acc.assignedCount++;
                  } else if (tracker.gateway_status === 'in-transit') {
                    acc.inTransitCount++;
                  } else if (tracker.gateway_status === 'unavailable') {
                    acc.unavailableCount++;
                  }
                  return acc;
                },
                {
                  availableCount: 0,
                  assignedCount: 0,
                  inTransitCount: 0,
                  unavailableCount: 0,
                },
              );

              return (
                <div key={index}>
                  {!_.isEqual(custodianName, '-')
                    ? (
                      <Box className="inventoryContainer">
                        <Typography className="inventoryTitle notranslate">{custodianName.toUpperCase()}</Typography>
                        {availableCount > 0 && (
                          <Box className="inventorySubContainer inventoryAvailable">
                            <div className="inventoryCountContainer">
                              <Typography>{availableCount}</Typography>
                            </div>
                            <Typography className="inventoryText">Available</Typography>
                          </Box>
                        )}
                        {assignedCount > 0 && (
                          <Box className="inventorySubContainer inventoryAssigned">
                            <div className="inventoryCountContainer">
                              <Typography>{assignedCount}</Typography>
                            </div>
                            <Typography className="inventoryText">Assigned</Typography>
                          </Box>
                        )}
                        {inTransitCount > 0 && (
                          <Box className="inventorySubContainer inventoryInTransit">
                            <div className="inventoryCountContainer">
                              <Typography>{inTransitCount}</Typography>
                            </div>
                            <Typography className="inventoryText">In Transit</Typography>
                          </Box>
                        )}
                        {unavailableCount > 0 && (
                          <Box className="inventorySubContainer inventoryUnavailable">
                            <div className="inventoryCountContainer">
                              <Typography>{unavailableCount}</Typography>
                            </div>
                            <Typography className="inventoryText">Unavailable</Typography>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box className="inventoryContainer">
                        <Typography>UNASSIGNED</Typography>
                        <Typography className="inventoryUnassignedText">{_.size(trackers)}</Typography>
                      </Box>
                    )}
                </div>
              );
            })}
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default Gateway;
