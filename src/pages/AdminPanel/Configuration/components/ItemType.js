import React, { useState } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper'; // Wrapper for the data table UI component
import { getUser } from '@context/User.context'; // Function to get user context
import { routes } from '@routes/routesConstants'; // Application's routing constants
import { getColumns } from '@utils/constants'; // Function to retrieve table columns configuration
import AddItemType from '../forms/AddItemType'; // Component for adding or editing item type
import { useQuery } from 'react-query'; // React Query hook for fetching data
import { getItemTypeQuery } from '@react-query/queries/items/getItemTypeQuery'; // API call for fetching item types
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery'; // API call for fetching units
import { useDeleteItemTypeMutation } from '@react-query/mutations/items/deleteItemTypeMutation'; // Mutation hook to delete item type
import useAlert from '@hooks/useAlert'; // Custom hook for displaying alerts
import { useStore } from '@zustand/timezone/timezoneStore'; // Custom hook for accessing timezone store
import { useTranslation } from 'react-i18next';

const ItemType = ({ redirectTo, history }) => {
  const { t } = useTranslation();

  // Retrieve organization ID from the user context
  const organization = getUser().organization.organization_uuid;

  // State hooks for managing delete modal visibility and the item type to delete
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Retrieve alert display function from the custom alert hook
  const { displayAlert } = useAlert();

  // Get the timezone data from the Zustand store (for usage across components)
  const { data } = useStore();

  // Build paths for adding and editing item types based on the redirectTo prop
  const addPath = redirectTo
    ? `${redirectTo}/item-type`
    : `${routes.CONFIGURATION}/item-type/add`;

  const editPath = redirectTo
    ? `${redirectTo}/item-type`
    : `${routes.CONFIGURATION}/item-type/edit`;

  // Query hooks for fetching units and item types data using React Query
  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization], // Query key based on organization ID
    () => getUnitQuery(organization, displayAlert, 'Item type'), // API call to fetch units
    { refetchOnWindowFocus: false }, // Prevent refetch on window focus
  );

  const { data: itemTypesData, isLoading: isLoadingItemTypes } = useQuery(
    ['itemTypes', organization], // Query key for item types data
    () => getItemTypeQuery(organization, displayAlert, 'Item type'), // API call to fetch item types
    { refetchOnWindowFocus: false }, // Prevent refetch on window focus
  );

  // Handles clicking on the "Add Item Type" button and redirects to the add item type form
  const onAddButtonClick = () => {
    history.push(`${addPath}`, {
      from: redirectTo || routes.CONFIGURATION, // Pass 'from' prop to indicate origin
    });
  };

  // Redirects to the edit item type form with the selected item type's ID and data
  const editType = (item) => {
    history.push(`${editPath}/:${item.id}`, {
      type: 'edit', // Pass type as 'edit' to indicate editing mode
      from: redirectTo || routes.CONFIGURATION, // Pass 'from' prop to indicate origin
      data: item, // Pass the item data to the edit form
    });
  };

  // Sets the item to be deleted and opens the delete modal
  const deleteType = (item) => {
    setDeleteId(item.id); // Set the ID of the item to be deleted
    setDeleteModal(true); // Open the delete confirmation modal
  };

  // Mutation hook for deleting an item type
  const { mutate: deleteItemTypeMutation, isLoading: isDeletingItemType } = useDeleteItemTypeMutation(organization, displayAlert, 'Item type');

  // Function to handle the deletion when the delete modal is confirmed
  const handleDeleteModal = () => {
    deleteItemTypeMutation(deleteId); // Perform the mutation to delete the item type
    setDeleteModal(false); // Close the delete modal
  };

  return (
    <DataTableWrapper
      noSpace // Prop to remove extra space around the table
      loading={isLoadingUnits || isLoadingItemTypes || isDeletingItemType} // Show loading indicator if data is loading
      rows={itemTypesData || []} // Pass item types data as rows for the table
      columns={getColumns(
        data, // Pass timezone data to column configuration
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
          : '', // Find unit for 'date' and pass it for column configuration
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
          : '', // Find unit for 'time' and pass it for column configuration
        t,
      )}
      filename={t('itemType.filename')} // Filename for the downloadable table data
      addButtonHeading={t('itemType.itemType')} // Heading for the "Add" button
      onAddButtonClick={onAddButtonClick} // Action for "Add" button click
      editAction={editType} // Action for editing an item type
      deleteAction={deleteType} // Action for deleting an item type
      openDeleteModal={openDeleteModal} // Boolean for controlling delete modal visibility
      setDeleteModal={setDeleteModal} // Function to control the delete modal visibility
      handleDeleteModal={handleDeleteModal} // Function to handle the delete action
      deleteModalTitle={t('itemType.deleteModalTitle')} // Title of the delete confirmation modal
      tableHeight="300px" // Set table height
    >
      {/* Route for the AddItemType form */}
      <Route path={`${addPath}`} component={AddItemType} />
      {/* Route for the EditItemType form */}
      <Route path={`${editPath}/:id`} component={AddItemType} />
    </DataTableWrapper>
  );
};

export default ItemType;
