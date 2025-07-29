import React, { useState } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getGatewayTypeQuery } from '@react-query/queries/sensorGateways/getGatewayTypeQuery';
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery';
import { useDeleteGatewayTypeMutation } from '@react-query/mutations/sensorGateways/deleteGatewayTypeMutation';
import { routes } from '@routes/routesConstants';
import { getTrackerTypeColumns } from '@utils/constants';
import { useStore } from '@zustand/timezone/timezoneStore';
import AddGatewayType from '../forms/AddGatewayType';

const GatewayType = ({ redirectTo, history }) => {
  // State hooks for managing the modal and ID of the gateway type to delete
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Getting organization UUID from the user context
  const organization = getUser().organization.organization_uuid;

  // Custom hook to display alerts
  const { displayAlert } = useAlert();

  // Using Zustand store for retrieving timezone-related data
  const { data } = useStore();

  // Determine the 'add' and 'edit' routes, conditionally using 'redirectTo' or fallback paths
  const addPath = redirectTo
    ? `${redirectTo}/gateway-type`
    : `${routes.CONFIGURATION}/gateway-type/add`;

  const editPath = redirectTo
    ? `${redirectTo}/gateway-type`
    : `${routes.CONFIGURATION}/gateway-type/edit`;

  // Queries for fetching unit data and gateway types, with loading states
  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization],
    () => getUnitQuery(organization, displayAlert, 'Custodian type'),
    { refetchOnWindowFocus: false }, // Disable refetch on window focus
  );

  const { data: gatewayTypesData, isLoading: isLoadingGatewayTypes } = useQuery(
    ['gatewayTypes'],
    () => getGatewayTypeQuery(displayAlert, 'Custodian type'),
    { refetchOnWindowFocus: false }, // Disable refetch on window focus
  );

  // Handler for the 'Add' button, navigates to the 'add' path
  const onAddButtonClick = () => {
    history.push(`${addPath}`, {
      from: redirectTo || routes.CONFIGURATION,
    });
  };

  // Handler for editing a gateway type, navigates to the 'edit' path with item data
  const editType = (item) => {
    history.push(`${editPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.CONFIGURATION,
      data: item,
    });
  };

  // Handler for triggering the delete modal with the gateway type ID to be deleted
  const deleteType = (item) => {
    setDeleteId(item.id);
    setDeleteModal(true);
  };

  // Mutation for deleting a gateway type using the custom hook
  const { mutate: deleteGatewayTypeMutation, isLoading: isDeletingGatewayType } = useDeleteGatewayTypeMutation(displayAlert, 'Custodian type');

  // Handler for confirming the deletion in the modal
  const handleDeleteModal = () => {
    deleteGatewayTypeMutation(deleteId); // Perform the deletion mutation
    setDeleteModal(false); // Close the modal after deletion
  };

  return (
    <DataTableWrapper
      // Main DataTable wrapper for displaying gateway types with configuration
      noSpace // Disables space between elements
      loading={isLoadingUnits || isLoadingGatewayTypes || isDeletingGatewayType} // Shows loading indicator based on queries/mutations
      rows={gatewayTypesData || []} // Data for the table rows, defaults to an empty array if no data
      columns={getTrackerTypeColumns(
        data,
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
          : '', // Fetch unit of measure for 'date' if exists
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
          : '', // Fetch unit of measure for 'time' if exists
      )}
      filename="TrackerType" // Filename for exporting the data table
      addButtonHeading="Tracker Type" // Label for the 'Add' button
      onAddButtonClick={onAddButtonClick} // Handler for 'Add' button click
      editAction={editType} // Handler for editing action on a row
      deleteAction={deleteType} // Handler for delete action on a row
      openDeleteModal={openDeleteModal} // State to determine if the delete modal is open
      setDeleteModal={setDeleteModal} // Function to close/delete modal
      handleDeleteModal={handleDeleteModal} // Function to execute deletion on modal confirm
      deleteModalTitle="Are you sure you want to Delete this Tracker Type?" // Title of the confirmation modal
      tableHeight="300px" // Table height
    >
      {/* Routes for the Add and Edit forms */}
      <Route path={`${addPath}`} component={AddGatewayType} />
      <Route path={`${editPath}/:id`} component={AddGatewayType} />
    </DataTableWrapper>
  );
};

export default GatewayType;
