import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery';
import { getRecipientAddressQuery } from '@react-query/queries/recipientaddress/getRecipientAddressQuery';
import { useDeleteRecipientAddressMutation } from '@react-query/mutations/recipientaddress/deleteRecipientAddressMutation';
import { routes } from '@routes/routesConstants';
import { getFormattedRecipientAddresses, getRecipientAddressColumns } from '@utils/constants';
import { useStore } from '@zustand/timezone/timezoneStore';
import AddRecipientAddress from '../forms/AddRecipientAddress';

const RecipientAddress = ({ redirectTo, history }) => {
  // Get the current user's organization ID
  const organization = getUser().organization.organization_uuid;

  // State variables for delete modal control
  const [openDeleteModal, setDeleteModal] = useState(false); // controls modal visibility
  const [deleteId, setDeleteId] = useState(null); // stores the id of the address to delete

  // Holds formatted recipient addresses to display in the table
  const [rows, setRows] = useState([]);

  // Custom alert hook for showing toast messages
  const { displayAlert } = useAlert();

  // Get timezone/store data
  const { data } = useStore();

  // Determine add/edit path based on redirect context
  const addPath = redirectTo
    ? `${redirectTo}/recipient-address`
    : `${routes.CONFIGURATION}/recipient-address/add`;

  const editPath = redirectTo
    ? `${redirectTo}/recipient-address`
    : `${routes.CONFIGURATION}/recipient-address/edit`;

  // Fetch unit data (e.g., date/time units) using React Query
  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization],
    () => getUnitQuery(organization, displayAlert, 'Recipient address'),
    { refetchOnWindowFocus: false },
  );

  // Fetch recipient addresses using React Query
  const { data: recipientAddressData, isLoading: isLoadingRecipientAddresses } = useQuery(
    ['recipientAddresses', organization],
    () => getRecipientAddressQuery(organization, displayAlert, 'Recipient address'),
    { refetchOnWindowFocus: false },
  );

  // Update the rows for the table when recipient address data changes
  useEffect(() => {
    setRows(getFormattedRecipientAddresses(recipientAddressData));
  }, [recipientAddressData]);

  // Handle Add button click - navigate to Add Recipient Address form
  const onAddButtonClick = () => {
    history.push(`${addPath}`, {
      from: redirectTo || routes.CONFIGURATION,
    });
  };

  // Handle Edit button action - navigate to Edit form with data
  const editType = (item) => {
    history.push(`${editPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.CONFIGURATION,
      data: item,
    });
  };

  // Handle Delete button action - open modal and store id
  const deleteType = (item) => {
    setDeleteId(item.id);
    setDeleteModal(true);
  };

  // Mutation hook for deleting a recipient address
  const { mutate: deleteRecipientAddressMutation, isLoading: isDeletingRecipientAddress } = useDeleteRecipientAddressMutation(displayAlert, 'Recipient address');

  // Confirm deletion from modal
  const handleDeleteModal = () => {
    deleteRecipientAddressMutation(deleteId); // trigger delete mutation
    setDeleteModal(false); // close the modal
  };

  return (
    <DataTableWrapper
      noSpace
      loading={isLoadingRecipientAddresses || isDeletingRecipientAddress || isLoadingUnits}
      rows={rows}
      // Set up columns with proper formatting and unit display
      columns={getRecipientAddressColumns(
        data,
        // Get unit of measure for date (if exists)
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
          : '',
        // Get unit of measure for time (if exists)
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
          : '',
      )}
      filename="RecipientAddress" // For export/download
      addButtonHeading="Add Address"
      onAddButtonClick={onAddButtonClick} // Function for Add button
      editAction={editType} // Function to handle row edit
      deleteAction={deleteType} // Function to handle row delete
      openDeleteModal={openDeleteModal} // Delete modal visibility
      setDeleteModal={setDeleteModal} // Setter for modal state
      handleDeleteModal={handleDeleteModal} // Confirm delete handler
      deleteModalTitle="Are you sure you want to Delete this Recipient Address?" // Modal title
      tableHeight="300px" // Table view height
    >
      {/* Route for adding a recipient address */}
      <Route path={`${addPath}`} component={AddRecipientAddress} />
      {/* Route for editing a recipient address */}
      <Route path={`${editPath}/:id`} component={AddRecipientAddress} />
    </DataTableWrapper>
  );
};

export default RecipientAddress;
