import React, { useState, useEffect } from "react";
import { Route } from "react-router-dom";
import _ from "lodash";
import DataTableWrapper from "../../components/DataTableWrapper/DataTableWrapper";
import { getUser } from "../../context/User.context";
// import {
//   deleteItem,
// } from '../../redux/items/actions/items.actions';
import { routes } from "../../routes/routesConstants";
import { itemColumns, getItemFormattedRow } from "../../utils/constants";
import AddItems from "./forms/AddItems";
import { useQuery } from "react-query";
import { useStore } from "../../zustand/items/itemStore";

const Items = ({ history, redirectTo }) => {
  const store = useStore();
  const user = getUser();
  const organization = user.organization.organization_uuid;

  const [rows, setRows] = useState([]);

  const { data: itemData, isLoading: isLoadingItems } = useQuery(
    ["items", organization],
    () => store.getItems(organization)
  );

  const { data: itemTypesData, isLoading: isLoadingItemTypes } = useQuery(
    ["itemTypes", organization],
    () => store.getItemTypes(organization)
  );

  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ["unit", organization],
    () => store.getUnit(organization)
  );

  const { data: productData, isLoading: isLoadingProducts } = useQuery(
    ["products", organization],
    () => store.getProducts(organization)
  );

  const { data: productTypesData, isLoading: isLoadingProductTypes } = useQuery(
    ["productTypes", organization],
    () => store.getProductTypes(organization)
  );

  // const [openDeleteModal, setDeleteModal] = useState(false);
  // const [deleteItemId, setDeleteItemId] = useState('');

  const addItemPath = redirectTo
    ? `${redirectTo}/items`
    : `${routes.ITEMS}/add`;

  // const editItemPath = redirectTo
  //   ? `${redirectTo}/items`
  //   : `${routes.ITEMS}/edit`;

  useEffect(() => {
    if (
      !_.isEmpty(itemData) &&
      !_.isEmpty(itemTypesData) &&
      !_.isEmpty(unitData)
    ) {
      setRows(getItemFormattedRow(itemData, itemTypesData, unitData));
    }
  }, [itemData, itemTypesData, unitData]);

  // const editItems = (item) => {
  //   history.push(`${editItemPath}/:${item.id}`, {
  //     type: 'edit',
  //     from: redirectTo || routes.ITEMS,
  //     data: item,
  //   });
  // };

  // const deleteItems = (item) => {
  //   setDeleteItemId(item.id);
  //   setDeleteModal(true);
  // };

  // const handleDeleteModal = () => {
  //   dispatch(deleteItem(deleteItemId, organization));
  //   setDeleteModal(false);
  // };

  const onAddButtonClick = () => {
    history.push(addItemPath, {
      from: redirectTo || routes.ITEMS,
    });
  };

  return (
    <DataTableWrapper
      loading={
        isLoadingItems ||
        isLoadingItemTypes ||
        isLoadingUnits ||
        isLoadingProducts ||
        isLoadingProductTypes
      }
      rows={rows || []}
      columns={itemColumns(
        _.find(
          unitData,
          (unit) => _.toLower(unit.unit_of_measure_for) === "currency"
        )
          ? _.find(
              unitData,
              (unit) => _.toLower(unit.unit_of_measure_for) === "currency"
            ).unit_of_measure
          : ""
      )}
      filename="ItemsData"
      addButtonHeading="Add Item"
      onAddButtonClick={onAddButtonClick}
      // editAction={editItems}
      // deleteAction={deleteItems}
      // openDeleteModal={openDeleteModal}
      // setDeleteModal={setDeleteModal}
      // handleDeleteModal={handleDeleteModal}
      deleteModalTitle="Are you sure you want to delete this Item?"
      tableHeader="Items"
      centerLabel
    >
      <Route path={`${addItemPath}`} component={AddItems} />
      {/* <Route path={`${editItemPath}/:id`} component={AddItems} /> */}
    </DataTableWrapper>
  );
};

export default Items;
