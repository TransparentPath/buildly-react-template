import React, { useState } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper'; // Wrapper component for displaying a data table
import { getUser } from '@context/User.context'; // Retrieves user data from context
import { routes } from '@routes/routesConstants'; // Contains route path constants
import { getColumns } from '@utils/constants'; // Utility to generate table column definitions
import AddOrganizationType from '../forms/AddOrganizationType'; // Form component for adding/editing organization types
import { useQuery } from 'react-query'; // React Query hook for fetching data
import { getOrganizationTypeQuery } from '@react-query/queries/authUser/getOrganizationTypeQuery'; // API function to fetch organization types
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery'; // API function to fetch measurement units
import { useDeleteOrganizationTypeMutation } from '@react-query/mutations/authUser/deleteOrganizationTypeMutation'; // Mutation hook to delete an organization type
import useAlert from '@hooks/useAlert'; // Custom hook to show alert messages
import { useStore } from '@zustand/timezone/timezoneStore'; // Zustand store to access timezone-related data

const OrganizationType = ({ redirectTo, history }) => {
  // State to control delete modal visibility
  const [openDeleteModal, setDeleteModal] = useState(false);
  // State to hold ID of the organization type to be deleted
  const [deleteId, setDeleteId] = useState(null);
  // Get the current user's organization UUID
  const organization = getUser().organization.organization_uuid;

  // Hook to display alert messages
  const { displayAlert } = useAlert();

  // Get timezone data (used for formatting in columns)
  const { data } = useStore();

  // Build paths for adding and editing based on optional `redirectTo` prop
  const addPath = redirectTo
    ? `${redirectTo}/org-type`
    : `${routes.CONFIGURATION}/org-type/add`;

  const editPath = redirectTo
    ? `${redirectTo}/org-type`
    : `${routes.CONFIGURATION}/org-type/edit`;

  // Fetch list of measurement units using organization ID
  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization], // Unique query key
    () => getUnitQuery(organization, displayAlert, 'Organization type'), // Query function
    { refetchOnWindowFocus: false }, // Prevent automatic refetch on window focus
  );

  // Fetch list of organization types (no org ID needed)
  const { data: organizationTypesData, isLoading: isLoadingOrganizationTypes } = useQuery(
    ['organizationTypes'], // Query key
    () => getOrganizationTypeQuery(displayAlert, 'Organization type'), // API call
    { refetchOnWindowFocus: false },
  );

  // Navigate to the "Add Organization Type" form
  const onAddButtonClick = () => {
    history.push(`${addPath}`, {
      from: redirectTo || routes.CONFIGURATION, // Keep track of origin
    });
  };

  // Navigate to the "Edit Organization Type" form with the selected item's data
  const editType = (item) => {
    history.push(`${editPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.CONFIGURATION,
      data: item, // Pass the organization type data
    });
  };

  // Open the delete confirmation modal for a specific item
  const deleteType = (item) => {
    setDeleteId(item.id); // Save ID for deletion
    setDeleteModal(true); // Open modal
  };

  // Hook to delete an organization type via mutation
  const { mutate: deleteOrganizationTypeMutation, isLoading: isDeletingOrganizationType } = useDeleteOrganizationTypeMutation(displayAlert, 'Organization type');

  // Handler for confirming deletion
  const handleDeleteModal = () => {
    deleteOrganizationTypeMutation(deleteId); // Trigger delete
    setDeleteModal(false); // Close modal
  };

  return (
    <DataTableWrapper
      noSpace // Removes padding/margin for tight layout
      loading={isLoadingUnits || isLoadingOrganizationTypes || isDeletingOrganizationType} // Show loading indicator if any data is being fetched/deleted
      rows={organizationTypesData || []} // Pass table row data
      columns={getColumns(
        data, // Timezone data
        // Extract date unit from unitData
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
          : '',
        // Extract time unit from unitData
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
          : '',
      )}
      filename="OrganizationType" // Filename for downloaded CSV/Excel
      addButtonHeading="Organization Type" // Label for Add button
      onAddButtonClick={onAddButtonClick} // Handler for Add button
      editAction={editType} // Handler for Edit button
      deleteAction={deleteType} // Handler for Delete button
      openDeleteModal={openDeleteModal} // Boolean to control delete modal
      setDeleteModal={setDeleteModal} // Setter to toggle delete modal
      handleDeleteModal={handleDeleteModal} // Action on confirming deletion
      deleteModalTitle="Are you sure you want to Delete this Organization Type?" // Confirmation message
      tableHeight="300px" // Fixed table height
    >
      {/* Route to AddOrganizationType form for adding */}
      <Route path={`${addPath}`} component={AddOrganizationType} />
      {/* Route to AddOrganizationType form for editing */}
      <Route path={`${editPath}/:id`} component={AddOrganizationType} />
    </DataTableWrapper>
  );
};

export default OrganizationType;
