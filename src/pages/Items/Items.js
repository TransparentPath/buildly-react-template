import React, { useState, useEffect, useRef } from "react";
import { Route } from "react-router-dom";
import _ from "lodash";
import DataTableWrapper from "../../components/DataTableWrapper/DataTableWrapper";
import { getUser } from "../../context/User.context";
import { routes } from "../../routes/routesConstants";
import { itemColumns, getItemFormattedRow } from "../../utils/constants";
import AddItems from "./forms/AddItems";
import { useQuery, useMutation, useQueryClient } from "react-query";
import * as itemsApi from "../../react-query/items/itemsApi";
import * as itemTypesApi from "../../react-query/items/itemTypesApi";
import * as unitApi from "../../react-query/items/unitApi";
import * as productsApi from "../../react-query/items/productsApi";
import * as productTypesApi from "../../react-query/items/productTypesApi";
import { httpService } from "@modules/http/http.service";
import CustomAlert from "../../components/CustomAlert/CustomAlert";

const Items = ({ history, redirectTo }) => {
  const user = getUser();
  const organization = user.organization.organization_uuid;

  const [rows, setRows] = useState([]);
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState("");

  let successMessage = useRef();
  let errorMessage = useRef();

  useEffect(() => {
    successMessage.current = "";
    errorMessage.current = "";
  }, []);

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
    () => itemsApi.getItems(organization)
  );

  const { data: itemTypesData, isLoading: isLoadingItemTypes } = useQuery(
    ["itemTypes", organization],
    () => itemTypesApi.getItemTypes(organization)
  );

  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ["unit", organization],
    () => unitApi.getUnits(organization)
  );

  const { data: productData, isLoading: isLoadingProducts } = useQuery(
    ["products", organization],
    () => productsApi.getProducts(organization)
  );

  const { data: productTypesData, isLoading: isLoadingProductTypes } = useQuery(
    ["productTypes", organization],
    () => productTypesApi.getProductTypes(organization)
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

  const queryClient = useQueryClient();

  const { mutate: deleteItemMutation, isLoading: isDeletingItem } = useMutation(
    async () => {
      await httpService.makeRequest(
        "delete",
        `${window.env.API_URL}shipment/item/${deleteItemId}`
      );
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["items", organization]);
        successMessage.current = "Successfully deleted item";
      },
      onError: () => {
        errorMessage.current = "Error in deleting item";
      },
    }
  );

  const handleDeleteModal = () => {
    setDeleteModal(false);
    deleteItemMutation();
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
      {successMessage.current && (
        <CustomAlert
          data={{
            type: "success",
            open: true,
            message: successMessage.current,
          }}
        />
      )}
      {errorMessage.current && (
        <CustomAlert
          data={{
            type: "error",
            open: true,
            message: errorMessage.current,
          }}
        />
      )}
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
