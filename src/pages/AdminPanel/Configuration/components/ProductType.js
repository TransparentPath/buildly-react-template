import React, { useState } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';

import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getProductTypeQuery } from '@react-query/queries/items/getProductTypeQuery';
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery';
import { useDeleteProductTypeMutation } from '@react-query/mutations/items/deleteProductTypeMutation';
import { routes } from '@routes/routesConstants';
import { getColumns } from '@utils/constants';
import { useStore } from '@zustand/timezone/timezoneStore';
import AddProductType from '../forms/AddProductType';

const ProductType = ({ redirectTo, history }) => {
  // Get the current user's organization ID
  const organization = getUser().organization.organization_uuid;

  // State to handle the delete modal visibility
  const [openDeleteModal, setDeleteModal] = useState(false);
  // State to hold the ID of the product type to delete
  const [deleteId, setDeleteId] = useState(null);

  // Hook to show alerts for success/error messages
  const { displayAlert } = useAlert();

  // Retrieve global store data (e.g., timezone info)
  const { data } = useStore();

  // Define the path to navigate to when adding a product type
  const addPath = redirectTo
    ? `${redirectTo}/product-type`
    : `${routes.CONFIGURATION}/product-type/add`;

  // Define the path to navigate to when editing a product type
  const editPath = redirectTo
    ? `${redirectTo}/product-type`
    : `${routes.CONFIGURATION}/product-type/edit`;

  // Fetch unit data for the organization using React Query
  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization],
    () => getUnitQuery(organization, displayAlert, 'Product type'),
    { refetchOnWindowFocus: false },
  );

  // Fetch product type data for the organization using React Query
  const { data: productTypesData, isLoading: isLoadingProductTypes } = useQuery(
    ['productTypes', organization],
    () => getProductTypeQuery(organization, displayAlert, 'Product type'),
    { refetchOnWindowFocus: false },
  );

  // Handle the click of the "Add" button to navigate to the add form
  const onAddButtonClick = () => {
    history.push(`${addPath}`, {
      from: redirectTo || routes.CONFIGURATION,
    });
  };

  // Navigate to the edit form with the selected item's data
  const editType = (item) => {
    history.push(`${editPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.CONFIGURATION,
      data: item,
    });
  };

  // Set the ID for deletion and open the delete confirmation modal
  const deleteType = (item) => {
    setDeleteId(item.id);
    setDeleteModal(true);
  };

  // Mutation hook to delete a product type
  const { mutate: deleteProductTypeMutation, isLoading: isDeletingProductType } = useDeleteProductTypeMutation(organization, displayAlert, 'Product type');

  // Execute the delete mutation and close the modal
  const handleDeleteModal = () => {
    deleteProductTypeMutation(deleteId);
    setDeleteModal(false);
  };

  // Render the data table along with routes for Add/Edit forms
  return (
    <DataTableWrapper
      noSpace
      loading={isLoadingUnits || isLoadingProductTypes || isDeletingProductType}
      rows={productTypesData || []}
      columns={getColumns(
        data,
        // Retrieve the unit of measure for 'date', fallback to empty string
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
          : '',
        // Retrieve the unit of measure for 'time', fallback to empty string
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
          : '',
      )}
      filename="ProductType" // Filename to use when exporting data
      addButtonHeading="Product Type" // Label on the "Add" button
      onAddButtonClick={onAddButtonClick} // Add button click handler
      editAction={editType} // Edit action callback
      deleteAction={deleteType} // Delete action callback
      openDeleteModal={openDeleteModal} // Whether delete modal is open
      setDeleteModal={setDeleteModal} // Function to toggle delete modal
      handleDeleteModal={handleDeleteModal} // Confirm delete action
      deleteModalTitle="Are you sure you want to Delete this Product Type?" // Delete modal confirmation text
      tableHeight="300px" // Table height styling
    >
      {/* Route to render the AddProductType form in add mode */}
      <Route path={`${addPath}`} component={AddProductType} />
      {/* Route to render the AddProductType form in edit mode */}
      <Route path={`${editPath}/:id`} component={AddProductType} />
    </DataTableWrapper>
  );
};

export default ProductType;
