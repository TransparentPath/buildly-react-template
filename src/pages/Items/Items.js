import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import DataTableWrapper from '../../components/DataTableWrapper/DataTableWrapper';
import { UserContext } from '../../context/User.context';
import {
  getItems,
  deleteItem,
  getItemType,
  getUnitOfMeasure,
  getProducts,
  getProductType,
} from '../../redux/items/actions/items.actions';
import {
  getItemsOptions,
  getProductsOptions,
} from '../../redux/options/actions/options.actions';
import { routes } from '../../routes/routesConstants';
import { itemColumns, getItemFormattedRow } from './ItemsConstants';
import AddItems from './forms/AddItems';

const Items = ({
  dispatch,
  history,
  itemData,
  loading,
  itemTypeList,
  redirectTo,
  unitOfMeasure,
  products,
  itemOptions,
  productOptions,
}) => {
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState('');
  const [rows, setRows] = useState([]);
  const organization = useContext(UserContext).organization.organization_uuid;

  const addItemPath = redirectTo
    ? `${redirectTo}/items`
    : `${routes.ITEMS}/add`;

  const editItemPath = redirectTo
    ? `${redirectTo}/items`
    : `${routes.ITEMS}/edit`;

  useEffect(() => {
    if (itemData === null) {
      dispatch(getItems(organization));
      dispatch(getItemType(organization));
    }
    if (!unitOfMeasure) {
      dispatch(getUnitOfMeasure(organization));
    }
    if (products === null) {
      dispatch(getProducts(organization));
      dispatch(getProductType(organization));
    }
    if (itemOptions === null) {
      dispatch(getItemsOptions());
    }
    if (productOptions === null) {
      dispatch(getProductsOptions());
    }
  }, []);

  useEffect(() => {
    if (
      itemData
      && itemData.length
      && itemTypeList
      && itemTypeList.length
      && unitOfMeasure
      && unitOfMeasure.length
    ) {
      setRows(getItemFormattedRow(
        itemData,
        itemTypeList,
        unitOfMeasure,
      ));
    }
  }, [itemData, itemTypeList, unitOfMeasure]);

  const editItems = (item) => {
    history.push(`${editItemPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.ITEMS,
      data: item,
    });
  };

  const deleteItems = (item) => {
    setDeleteItemId(item.id);
    setDeleteModal(true);
  };

  const handleDeleteModal = () => {
    dispatch(deleteItem(deleteItemId, organization));
    setDeleteModal(false);
  };

  const onAddButtonClick = () => {
    history.push(addItemPath, {
      from: redirectTo || routes.ITEMS,
    });
  };

  return (
    <DataTableWrapper
      loading={loading}
      rows={rows || []}
      columns={itemColumns(
        _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'currency'))
          ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'currency')).unit_of_measure
          : '',
      )}
      filename="ItemsData"
      addButtonHeading="Add Item"
      onAddButtonClick={onAddButtonClick}
      editAction={editItems}
      deleteAction={deleteItems}
      openDeleteModal={openDeleteModal}
      setDeleteModal={setDeleteModal}
      handleDeleteModal={handleDeleteModal}
      deleteModalTitle="Are you sure you want to delete this Item?"
      tableHeader="Items"
      centerLabel
    >
      <Route path={`${addItemPath}`} component={AddItems} />
      <Route path={`${editItemPath}/:id`} component={AddItems} />
    </DataTableWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.itemsReducer,
  ...state.optionsReducer,
  loading: (
    state.itemsReducer.loading
    || state.optionsReducer.loading
  ),
});
export default connect(mapStateToProps)(Items);
