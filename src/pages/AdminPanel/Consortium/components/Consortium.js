import React, { useState } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';

// Custom wrapper component for data tables
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';

// Function to retrieve current user context
import { getUser } from '@context/User.context';

// Route constants used for navigation
import { routes } from '@routes/routesConstants';

// Utility function to generate columns for the consortium table
import { getConsortiumColumns } from '@utils/constants';

// Form component used for both adding and editing consortiums
import AddConsortium from '../forms/AddConsortium';

// React Query imports to fetch data from APIs
import { useQuery } from 'react-query';
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery';
import { getAllConsortiumQuery } from '@react-query/queries/consortium/getAllConsotiumQuery';
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery';

// Custom mutation hook to delete a consortium
import { useDeleteConsortiumMutation } from '@react-query/mutations/consortium/deleteConsortiumMutation';

// Custom hook to display alerts
import useAlert from '@hooks/useAlert';

// Zustand store to access timezone or related data
import { useStore } from '@zustand/timezone/timezoneStore';
import { useTranslation } from 'react-i18next';

const Consortium = ({ history, redirectTo }) => {
  const { t } = useTranslation();

  // Retrieve current user info
  const user = getUser();
  const organization = user.organization.organization_uuid;

  // Alert hook to show error/success messages
  const { displayAlert } = useAlert();

  // Access timezone or other related data from Zustand store
  const { data } = useStore();

  // State to handle delete modal visibility and selected consortium ID
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Define paths for adding and editing consortiums
  const addPath = redirectTo || `${routes.CONSORTIUM}/add`;
  const editPath = redirectTo || `${routes.CONSORTIUM}/edit`;

  // Fetch all organizations using React Query
  const { data: orgData, isLoading: isLoadingOrgs } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert, 'Consortium'),
    { refetchOnWindowFocus: false },
  );

  // Fetch all consortiums
  const { data: consortiumData, isLoading: isLoadingConsortiums } = useQuery(
    ['consortiums'],
    () => getAllConsortiumQuery(displayAlert, 'Consortium'),
    { refetchOnWindowFocus: false },
  );

  // Fetch units of measure (e.g., for date and time display)
  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization],
    () => getUnitQuery(organization, displayAlert, 'Consortium'),
    { refetchOnWindowFocus: false },
  );

  // Handle add button click: navigates to the AddConsortium form
  const onAddButtonClick = () => {
    history.push(`${addPath}`, {
      from: redirectTo || routes.CONSORTIUM,
      orgData,
    });
  };

  // Handle edit action: navigates to the AddConsortium form with existing item data
  const editData = (item) => {
    history.push(`${editPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.CONSORTIUM,
      data: item,
      orgData,
    });
  };

  // Handle delete action: opens confirmation modal
  const deleteData = (item) => {
    setDeleteId(item.id);
    setDeleteModal(true);
  };

  // Delete mutation hook
  const { mutate: deleteConsortiumMutation, isLoading: isDeletingConsortium } = useDeleteConsortiumMutation(displayAlert, 'Consortium');

  // Confirm deletion and close modal
  const handleDeleteModal = () => {
    deleteConsortiumMutation(deleteId);
    setDeleteModal(false);
  };

  return (
    <DataTableWrapper
      noSpace
      loading={isLoadingOrgs || isLoadingConsortiums || isLoadingUnits || isDeletingConsortium}
      rows={consortiumData || []}
      // Dynamically generate table columns, including handling date/time units if available
      columns={getConsortiumColumns(
        data,
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
          : '',
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
          : '',
        t,
      )}
      filename={t('consortium.tableTitle')}
      addButtonHeading={t('consortium.addButton')}
      onAddButtonClick={onAddButtonClick}
      editAction={editData}
      deleteAction={deleteData}
      openDeleteModal={openDeleteModal}
      setDeleteModal={setDeleteModal}
      handleDeleteModal={handleDeleteModal}
      deleteModalTitle={t('consortium.deleteModalTitle')}
    >
      {/* Routes for rendering the Add/Edit form inside the DataTableWrapper */}
      <Route path={`${addPath}`} component={AddConsortium} />
      <Route path={`${editPath}/:id`} component={AddConsortium} />
    </DataTableWrapper>
  );
};

export default Consortium;
