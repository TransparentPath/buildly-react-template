import React, { useState } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash'; // Utility library for data manipulation
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper'; // Custom component to handle data table UI
import { getUser } from '@context/User.context'; // Function to get logged-in user context
import { routes } from '@routes/routesConstants'; // Centralized route constants
import { getProductColumns } from '@utils/constants'; // Function to generate column definitions for product table
import AddProduct from '../forms/AddProduct'; // Form component to add or edit products
import { useQuery } from 'react-query'; // React Query hook for data fetching
import { getProductQuery } from '@react-query/queries/items/getProductQuery'; // Fetch products API call
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery'; // Fetch units of measure API call
import { useDeleteProductMutation } from '@react-query/mutations/items/deleteProductMutation'; // Mutation hook for deleting product
import useAlert from '@hooks/useAlert'; // Custom hook for displaying alerts
import { useStore } from '@zustand/timezone/timezoneStore'; // Zustand store to get timezone-related or other global data

const Product = ({ redirectTo, history }) => {
  // Get current user's organization UUID
  const organization = getUser().organization.organization_uuid;

  // Local state for managing delete modal visibility and the product ID to delete
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Custom alert hook
  const { displayAlert } = useAlert();

  // Access global store values (e.g., for timezone or other settings)
  const { data } = useStore();

  // Dynamically determine the "add" path based on redirect context
  const addPath = redirectTo
    ? `${redirectTo}/product`
    : `${routes.CONFIGURATION}/product/add`;

  // Dynamically determine the "edit" path
  const editPath = redirectTo
    ? `${redirectTo}/product`
    : `${routes.CONFIGURATION}/product/edit`;

  // Fetch units of measure (e.g., weight, date, time units)
  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization],
    () => getUnitQuery(organization, displayAlert),
    { refetchOnWindowFocus: false },
  );

  // Fetch list of products
  const { data: productData, isLoading: isLoadingProducts } = useQuery(
    ['products', organization],
    () => getProductQuery(organization, displayAlert),
    { refetchOnWindowFocus: false },
  );

  // Handler for when the add button is clicked
  const onAddButtonClick = () => {
    history.push(`${addPath}`, {
      from: redirectTo || routes.CONFIGURATION,
    });
  };

  // Handler for edit action; navigates to edit form with item data
  const editType = (item) => {
    history.push(`${editPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.CONFIGURATION,
      data: item,
    });
  };

  // Handler to open delete modal and store product ID
  const deleteType = (item) => {
    setDeleteId(item.id);
    setDeleteModal(true);
  };

  // Mutation hook for deleting a product
  const { mutate: deleteProductMutation, isLoading: isDeletingProduct } = useDeleteProductMutation(organization, displayAlert);

  // Execute delete mutation and close modal
  const handleDeleteModal = () => {
    deleteProductMutation(deleteId);
    setDeleteModal(false);
  };

  return (
    <DataTableWrapper
      noSpace
      loading={isLoadingUnits || isLoadingProducts || isDeletingProduct}
      rows={productData || []}
      columns={getProductColumns(
        data,
        // Extract specific unit types (weight, date, time) from unit data
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'weight'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'weight')).unit_of_measure
          : '',
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
          : '',
        _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
          ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
          : '',
      )}
      filename="Products" // Export file name
      addButtonHeading="Product" // Label for add button
      onAddButtonClick={onAddButtonClick} // Add button action
      editAction={editType} // Edit action callback
      deleteAction={deleteType} // Delete action callback
      openDeleteModal={openDeleteModal} // State to show/hide delete modal
      setDeleteModal={setDeleteModal} // Function to toggle delete modal
      handleDeleteModal={handleDeleteModal} // Confirm delete action
      deleteModalTitle="Are you sure you want to Delete this Product?" // Modal confirmation message
      tableHeight="300px" // Table height
    >
      {/* Route to render AddProduct form for adding */}
      <Route path={`${addPath}`} component={AddProduct} />

      {/* Route to render AddProduct form for editing */}
      <Route path={`${editPath}/:id`} component={AddProduct} />
    </DataTableWrapper>
  );
};

export default Product;
