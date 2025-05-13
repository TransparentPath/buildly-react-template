import React, { useState } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getCustodianTypeQuery } from '@react-query/queries/custodians/getCustodianTypeQuery';
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery';
import { useDeleteCustodianTypeMutation } from '@react-query/mutations/custodians/deleteCustodianTypeMutation';
import { routes } from '@routes/routesConstants';
import { getColumns } from '@utils/constants';
import { useStore } from '@zustand/timezone/timezoneStore';
import AddCustodianType from '../forms/AddCustodianType';

const CustodianType = ({ redirectTo, history }) => {
  // Retrieve the current user's organization UUID
  const organization = getUser().organization.organization_uuid;

  // State for handling the delete confirmation modal and selected custodian type ID
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Hook to trigger alerts for errors/success
  const { displayAlert } = useAlert();

  // Global store to access timezone or other shared values
  const { data } = useStore();

  // Path for "Add Custodian Type" navigation, customized if redirectTo is provided
  const addPath = redirectTo
    ? `${redirectTo}/custodian-type`
    : `${routes.CONFIGURATION}/custodian-type/add`;

  // Path for "Edit Custodian Type" navigation
  const editPath = redirectTo
    ? `${redirectTo}/custodian-type`
    : `${routes.CONFIGURATION}/custodian-type/edit`;

  // Fetch available units for the organization
  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization],
    () => getUnitQuery(organization, displayAlert),
    { refetchOnWindowFocus: false }, // Prevent refetch on window focus for performance
  );

  // Fetch all custodian types
  const { data: custodianTypesData, isLoading: isLoadingCustodianTypes } = useQuery(
    ['custodianTypes'],
    () => getCustodianTypeQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  // Handler for the "Add" button click
  const onAddButtonClick = () => {
    history.push(`${addPath}`, {
      from: redirectTo || routes.CONFIGURATION,
    });
  };

  // Handler to initiate edit action for a specific custodian type
  const editType = (item) => {
    history.push(`${editPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.CONFIGURATION,
      data: item,
    });
  };

  // Handler to trigger delete confirmation modal for a selected custodian type
  const deleteType = (item) => {
    setDeleteId(item.id);
    setDeleteModal(true);
  };

  // Mutation hook to delete a custodian type
  const { mutate: deleteCustodianTypeMutation, isLoading: isDeletingCustodianType } = useDeleteCustodianTypeMutation(displayAlert);

  // Finalize deletion of custodian type and close the modal
  const handleDeleteModal = () => {
    deleteCustodianTypeMutation(deleteId); // Executes delete mutation
    setDeleteModal(false); // Closes modal
  };

  return (
    <DataTableWrapper
      noSpace
      loading={isLoadingUnits || isLoadingCustodianTypes || isDeletingCustodianType} // Show loader if any async operation is in progress
      rows={custodianTypesData || []} // Rows to display in the table
      columns={getColumns(
        data,
        // Fetch the unit of measure for 'date' if available
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
          : '',
        // Fetch the unit of measure for 'time' if available
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
          : '',
      )}
      filename="CustodianType" // Filename for export (e.g. CSV)
      addButtonHeading="Custodian Type" // Text on the "Add" button
      onAddButtonClick={onAddButtonClick} // Handler when "Add" button is clicked
      editAction={editType} // Handler for row edit action
      deleteAction={deleteType} // Handler for row delete action
      openDeleteModal={openDeleteModal} // Delete modal open state
      setDeleteModal={setDeleteModal} // Setter for modal visibility
      handleDeleteModal={handleDeleteModal} // Handler when delete is confirmed
      deleteModalTitle="Are you sure you want to Delete this Custodian Type?" // Modal message
      tableHeight="300px" // Table max height
    >
      {/* Route to render AddCustodianType form for add or edit */}
      <Route path={`${addPath}`} component={AddCustodianType} />
      <Route path={`${editPath}/:id`} component={AddCustodianType} />
    </DataTableWrapper>
  );
};

export default CustodianType;
