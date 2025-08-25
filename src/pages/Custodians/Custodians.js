import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper'; // Component for displaying a table with actions
import { getUser } from '@context/User.context'; // To fetch the current logged-in user
import { routes } from '@routes/routesConstants'; // Predefined routes for the app
import {
  custodianColumns,
  getCustodianFormattedRow,
  getUniqueContactInfo,
} from '@utils/constants'; // Helper functions and constants for displaying custodian data
import AddCustodians from './forms/AddCustodians'; // Form for adding or editing custodians
import { useQuery } from 'react-query'; // For making API calls and handling data fetching
import { getCustodianQuery } from '@react-query/queries/custodians/getCustodianQuery'; // Query to fetch custodian data
import { getCustodianTypeQuery } from '@react-query/queries/custodians/getCustodianTypeQuery'; // Query to fetch custodian types
import { getContactQuery } from '@react-query/queries/custodians/getContactQuery'; // Query to fetch contact info
import { getCountriesQuery } from '@react-query/queries/shipments/getCountriesQuery'; // Query to fetch countries
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery'; // Query to fetch unit data
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery'; // Query to fetch all organizations
import { useDeleteCustodianMutation } from '@react-query/mutations/custodians/deleteCustodianMutation'; // Mutation to delete a custodian
import { useUploadBulkCustodianMutation } from '@react-query/mutations/custodians/uploadBulkCustodianMutation'; // Mutation for bulk uploading custodians
import useAlert from '@hooks/useAlert'; // Custom hook for displaying alerts
import { useTranslation } from 'react-i18next';

// Custodian component that manages custodian data and actions
const Custodian = ({ history, redirectTo }) => {
  // Fetch current user and their organization UUID
  const user = getUser();
  const organization = user.organization.organization_uuid;

  // Use alert hook to display alerts
  const { displayAlert } = useAlert();

  const { t } = useTranslation();

  // State variables for handling rows, modal visibility, and deletion
  const [rows, setRows] = useState([]); // Stores formatted rows for the data table
  const [openDeleteModal, setDeleteModal] = useState(false); // Controls visibility of the delete confirmation modal
  const [deleteItemId, setDeleteItemId] = useState(''); // Stores the ID of the item to delete
  const [deleteContactObjId, setDeleteContactObjId] = useState(''); // Stores the ID of the contact object to delete

  // Query hooks to fetch different types of data needed for the custodians
  const { data: custodianData, isLoading: isLoadingCustodians } = useQuery(
    ['custodians', organization],
    () => getCustodianQuery(organization, displayAlert, 'Custodian'),
    { refetchOnWindowFocus: false }, // Disable refetch on window focus for performance
  );

  const { data: custodianTypesData, isLoading: isLoadingCustodianTypes } = useQuery(
    ['custodianTypes'],
    () => getCustodianTypeQuery(displayAlert, 'Custodian'),
    { refetchOnWindowFocus: false },
  );

  const { data: contactInfo, isLoading: isLoadingContact } = useQuery(
    ['contact', organization],
    () => getContactQuery(organization, displayAlert, 'Custodian'),
    { refetchOnWindowFocus: false },
  );

  const { data: countriesData, isLoading: isLoadingCountries } = useQuery(
    ['countries'],
    () => getCountriesQuery(displayAlert, 'Custodian'),
    { refetchOnWindowFocus: false },
  );

  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization],
    () => getUnitQuery(organization, displayAlert, 'Custodian'),
    { refetchOnWindowFocus: false },
  );

  const { data: orgData, isLoading: isLoadingOrgs } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert, 'Custodian'),
    { refetchOnWindowFocus: false },
  );

  // Mutations for deleting a custodian and uploading bulk custodians
  const { mutate: deleteCustodianMutation, isLoading: isDeletingCustodian } = useDeleteCustodianMutation(organization, displayAlert, 'Custodian');
  const { mutate: uploadBulkCustodianMutation, isLoading: isUploadingBulkCustodian } = useUploadBulkCustodianMutation(organization, displayAlert, 'Custodian');

  // Define paths for adding and editing custodians, redirecting based on the `redirectTo` prop
  const addCustodianPath = redirectTo
    ? `${redirectTo}/custodian`
    : `${routes.CUSTODIANS}/add`;

  const editCustodianPath = redirectTo
    ? `${redirectTo}/custodian`
    : `${routes.CUSTODIANS}/edit`;

  // Effect hook to update rows whenever custodian data, contact info, or custodian types are fetched
  useEffect(() => {
    if (!_.isEmpty(custodianData) && !_.isEmpty(contactInfo) && !_.isEmpty(custodianTypesData)) {
      setRows(getCustodianFormattedRow(custodianData, contactInfo, custodianTypesData)); // Format rows for the data table
    }
  }, [custodianData, contactInfo, custodianTypesData]);

  // Edit action handler: navigates to the edit custodian page and passes relevant data
  const editItem = (item) => {
    const contactObj = getUniqueContactInfo(item, contactInfo); // Get unique contact info for the item
    history.push(`${editCustodianPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.CUSTODIANS,
      data: item,
      contactData: contactObj,
      custodianTypesData,
      orgData,
    });
  };

  // Delete action handler: sets up the modal for confirming deletion
  const deleteItem = (item) => {
    const contactObj = getUniqueContactInfo(item, contactInfo); // Get unique contact info for the item
    setDeleteItemId(item.id); // Set the ID of the item to delete
    setDeleteContactObjId(contactObj.id); // Set the ID of the contact object to delete
    setDeleteModal(true); // Open the delete confirmation modal
  };

  // Handler for confirming the deletion
  const handleDeleteModal = () => {
    setDeleteModal(false); // Close the modal
    deleteCustodianMutation([deleteItemId, deleteContactObjId]); // Perform the deletion mutation
  };

  // Navigate to the add custodian page
  const onAddButtonClick = () => {
    history.push(addCustodianPath, {
      from: redirectTo || routes.CUSTODIANS,
      custodianTypesData,
      orgData,
    });
  };

  // Upload bulk custodian data
  const onUploadData = (file) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('bulk_data_file', file, file.name); // Attach the file to the FormData
    formData.append('organization_uuid', organization); // Attach organization UUID
    uploadBulkCustodianMutation(formData); // Perform the bulk upload mutation
  };

  return (
    // DataTableWrapper component that displays custodian data in a table format
    <DataTableWrapper
      loading={
        isLoadingCustodians || isLoadingCustodianTypes || isLoadingContact || isLoadingCountries || isLoadingUnits
        || isLoadingOrgs || isDeletingCustodian || isUploadingBulkCustodian // Show loading spinner while data is being fetched
      }
      rows={rows || []} // Pass rows (formatted custodian data) to the table
      columns={custodianColumns(t)} // Define the columns for the table
      filename={t('custodian.filename')} // Filename for the exported data
      addButtonHeading={t('custodian.addButtonHeading')} // Heading for the add button
      onAddButtonClick={onAddButtonClick} // Action when the add button is clicked
      editAction={editItem} // Action when an item is edited
      deleteAction={deleteItem} // Action when an item is deleted
      openDeleteModal={openDeleteModal} // Pass modal visibility state
      setDeleteModal={setDeleteModal} // Set function to control modal visibility
      handleDeleteModal={handleDeleteModal} // Handle deletion confirmation
      deleteModalTitle={t('custodian.deleteModalTitle')} // Modal title
      tableHeader={t('custodian.tableHeader')} // Table header
      downloadTemplateButton // Enable download template button
      uploadDataButton // Enable upload data button
      downloadTemplateHref={window.env.CUSTODIAN_TEMPLATE_URL} // URL for downloading bulk template
      onUploadData={onUploadData} // Handle file upload
      downloadTemplateHeading={t('custodian.downloadTemplateHeading')} // Heading for the download template button
      uploadDataHeading={t('custodian.uploadDataHeading')} // Heading for the upload data button
    >
      {/* Define routes for adding and editing custodians */}
      <Route path={addCustodianPath} component={AddCustodians} />
      <Route path={`${editCustodianPath}/:id`} component={AddCustodians} />
    </DataTableWrapper>
  );
};

export default Custodian;
