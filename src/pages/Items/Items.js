import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getUser } from '@context/User.context';
import { routes } from '@routes/routesConstants';
import { itemColumns, getItemFormattedRow } from '@utils/constants';
import AddItems from './forms/AddItems';
import { useQuery } from 'react-query';
import { getItemQuery } from '@react-query/queries/items/getItemQuery';
import { getItemTypeQuery } from '@react-query/queries/items/getItemTypeQuery';
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery';
import { getProductQuery } from '@react-query/queries/items/getProductQuery';
import { getProductTypeQuery } from '@react-query/queries/items/getProductTypeQuery';
import { useDeleteItemMutation } from '@react-query/mutations/items/deleteItemMutation';
import useAlert from '@hooks/useAlert';
import { useTranslation } from 'react-i18next';
import translateDynamicText from '@utils/googleTranslate';

const Items = ({ history, redirectTo }) => {
  const { t, i18n } = useTranslation();

  // Fetch the logged-in user and their organization ID
  const user = getUser();
  const organization = user.organization.organization_uuid;

  // Hook to manage alerts
  const { displayAlert } = useAlert();

  // State management for table rows and delete modal
  const [rows, setRows] = useState([]); // Stores the rows for the table
  const [openDeleteModal, setDeleteModal] = useState(false); // Controls visibility of delete confirmation modal
  const [deleteItemId, setDeleteItemId] = useState(''); // ID of the item to be deleted

  const [translatedCurrency, setTranslatedCurrency] = useState('');

  // Fetching different data via react-query hooks:
  const { data: itemData, isLoading: isLoadingItems } = useQuery(
    ['items', organization],
    () => getItemQuery(organization, displayAlert, 'Item'),
    { refetchOnWindowFocus: false },
  );

  const { data: itemTypesData, isLoading: isLoadingItemTypes } = useQuery(
    ['itemTypes', organization],
    () => getItemTypeQuery(organization, displayAlert, 'Item'),
    { refetchOnWindowFocus: false },
  );

  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization],
    () => getUnitQuery(organization, displayAlert, 'Item'),
    { refetchOnWindowFocus: false },
  );

  const { data: productData, isLoading: isLoadingProducts } = useQuery(
    ['products', organization],
    () => getProductQuery(organization, displayAlert, 'Item'),
    { refetchOnWindowFocus: false },
  );

  const { data: productTypesData, isLoading: isLoadingProductTypes } = useQuery(
    ['productTypes', organization],
    () => getProductTypeQuery(organization, displayAlert, 'Item'),
    { refetchOnWindowFocus: false },
  );

  // Define the paths for adding and editing items based on the `redirectTo` prop
  const addItemPath = redirectTo
    ? `${redirectTo}/items`
    : `${routes.ITEMS}/add`;

  const editItemPath = redirectTo
    ? `${redirectTo}/items`
    : `${routes.ITEMS}/edit`;

  // useEffect to translate the currency
  useEffect(async () => {
    let curr = _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'currency'))
      ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'currency')).unit_of_measure
      : '';
    if (i18n.language !== 'en') {
      curr = await translateDynamicText(curr, i18n.language);
    }
    setTranslatedCurrency(curr);
  }, [unitData]);

  // Effect hook to format and update the rows when data changes
  useEffect(() => {
    if (!_.isEmpty(itemData) && !_.isEmpty(itemTypesData) && !_.isEmpty(unitData)) {
      // Format the item data into rows for the table
      setRows(getItemFormattedRow(itemData, itemTypesData, unitData));
    }
  }, [itemData, itemTypesData, unitData]);

  // Handle the edit functionality by pushing the edit route and passing necessary data
  const editItems = (item) => {
    history.push(`${editItemPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.ITEMS,
      data: item,
      itemTypesData,
      productData,
      productTypesData,
      unitData,
      translatedCurrency,
    });
  };

  // Handle the delete functionality by opening the delete modal and setting the item ID
  const deleteItems = (item) => {
    setDeleteItemId(item.id); // Set the ID of the item to be deleted
    setDeleteModal(true); // Open the delete confirmation modal
  };

  // Mutation hook to delete an item
  const { mutate: deleteItemMutation, isLoading: isDeletingItem } = useDeleteItemMutation(organization, displayAlert, 'Item');

  // Function to handle the delete modal's confirmation action
  const handleDeleteModal = () => {
    setDeleteModal(false); // Close the modal
    deleteItemMutation(deleteItemId); // Call the mutation to delete the item
  };

  // Function to handle the add button click, redirect to the AddItem form
  const onAddButtonClick = () => {
    history.push(addItemPath, {
      from: redirectTo || routes.ITEMS,
      itemTypesData,
      productData,
      productTypesData,
      unitData,
      translatedCurrency,
    });
  };

  return (
    <div>
      {/* DataTableWrapper component displays a table with loading, rows, columns, and other props */}
      <DataTableWrapper
        loading={isLoadingItems || isLoadingItemTypes || isLoadingUnits || isLoadingProducts || isLoadingProductTypes || isDeletingItem}
        rows={rows || []} // Pass the formatted rows
        columns={itemColumns(translatedCurrency, t)}
        filename={t('items.filename')} // Filename for downloading the data
        addButtonHeading={t('items.addButtonHeading')} // Heading for the add button
        onAddButtonClick={onAddButtonClick} // Trigger the onAddButtonClick function when clicked
        editAction={editItems} // Action to handle editing an item
        deleteAction={deleteItems} // Action to handle deleting an item
        openDeleteModal={openDeleteModal} // Pass modal visibility state
        setDeleteModal={setDeleteModal} // Pass the setter for closing the modal
        handleDeleteModal={handleDeleteModal} // Handle the confirmation of item deletion
        deleteModalTitle={t('items.deleteModalTitle')} // Modal title
        tableHeader={t('items.tableHeader')} // Table header text
      >
        {/* Define routes for adding and editing items */}
        <Route path={`${addItemPath}`} component={AddItems} />
        <Route path={`${editItemPath}/:id`} component={AddItems} />
      </DataTableWrapper>
    </div>
  );
};

export default Items;
