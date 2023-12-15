import React, { useState, useEffect } from "react";
import { Route } from "react-router-dom";
import _ from "lodash";
import DataTableWrapper from "../../components/DataTableWrapper/DataTableWrapper";
import { getUser } from "../../context/User.context";
import { routes } from "../../routes/routesConstants";
import { itemColumns, getItemFormattedRow } from "../../utils/constants";
import AddItems from "./forms/AddItems";
import { useQuery } from "react-query";
import { getItemQuery } from "../../react-query/queries/items/getItemQuery";
import { getItemTypeQuery } from "../../react-query/queries/items/getItemTypeQuery";
import { getUnitQuery } from "../../react-query/queries/items/getUnitQuery";
import { getProductQuery } from "../../react-query/queries/items/getProductQuery";
import { getProductTypeQuery } from "../../react-query/queries/items/getProductTypeQuery";
import { useDeleteItemMutation } from "../../react-query/mutations/items/deleteItemMutation";

const Items = ({ history, redirectTo }) => {
  const user = getUser();
  const organization = user.organization.organization_uuid;

  const [rows, setRows] = useState([]);
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState("");

  useEffect(() => {
    const { state } = history.location;
    if (state && state.successMessage) {
      successMessage.current = state.successMessage;
    } else if (state && state.errorMessage) {
      errorMessage.current = state.errorMessage;
    }
  }, [history.location.state]);

  const { data: itemData, isLoading: isLoadingItems } = useQuery(
    ["items", organization],
    () => getItemQuery(organization)
  );

  const { data: itemTypesData, isLoading: isLoadingItemTypes } = useQuery(
    ["itemTypes", organization],
    () => getItemTypeQuery(organization)
  );

  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ["unit", organization],
    () => getUnitQuery(organization)
  );

  const { data: productData, isLoading: isLoadingProducts } = useQuery(
    ["products", organization],
    () => getProductQuery(organization)
  );

  const { data: productTypesData, isLoading: isLoadingProductTypes } = useQuery(
    ["productTypes", organization],
    () => getProductTypeQuery(organization)
  );

  const addItemPath = redirectTo
    ? `${redirectTo}/items`
    : `${routes.ITEMS}/add`;

  const editItemPath = redirectTo
    ? `${redirectTo}/items`
    : `${routes.ITEMS}/edit`;

  useEffect(() => {
    if (
      !_.isEmpty(itemData) &&
      !_.isEmpty(itemTypesData) &&
      !_.isEmpty(unitData)
    ) {
      setRows(getItemFormattedRow(itemData, itemTypesData, unitData));
    }
  }, [itemData, itemTypesData, unitData]);

  const editItems = (item) => {
    history.push(`${editItemPath}/:${item.id}`, {
      type: "edit",
      from: redirectTo || routes.ITEMS,
      data: item,
      itemTypesData: itemTypesData,
      productData: productData,
      productTypesData: productTypesData,
      unitData: unitData,
    });
  };

  const deleteItems = (item) => {
    setDeleteItemId(item.id);
    setDeleteModal(true);
  };

  const { mutate: deleteItemMutation, isLoading: isDeletingItem } =
    useDeleteItemMutation(organization, setDeleteModal);

  const handleDeleteModal = () => {
    setDeleteModal(false);
    deleteItemMutation(deleteItemId);
  };

  const onAddButtonClick = () => {
    history.push(addItemPath, {
      from: redirectTo || routes.ITEMS,
      itemTypesData: itemTypesData,
      productData: productData,
      productTypesData: productTypesData,
      unitData: unitData,
    });
  };

  return (
    <div>
      <DataTableWrapper
        loading={
          isLoadingItems ||
          isLoadingItemTypes ||
          isLoadingUnits ||
          isLoadingProducts ||
          isLoadingProductTypes ||
          isDeletingItem
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
    </div>
  );
};

export default Items;
