import React, { useState } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getRecipientAddressQuery } from '@react-query/queries/recipientaddress/getRecipientAddressQuery';
import { useDeleteRecipientAddressMutation } from '@react-query/mutations/recipientaddress/deleteRecipientAddressMutation';
import { routes } from '@routes/routesConstants';
import { getRecipientAddressColumns } from '@utils/constants';
import AddRecipientAddress from '../forms/AddRecipientAddress';

const RecipientAddress = ({ redirectTo, history }) => {
  const organization = getUser().organization.organization_uuid;
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { displayAlert } = useAlert();

  const addPath = redirectTo
    ? `${redirectTo}/recipient-address`
    : `${routes.CONFIGURATION}/recipient-address/add`;

  const editPath = redirectTo
    ? `${redirectTo}/recipient-address`
    : `${routes.CONFIGURATION}/recipient-address/edit`;

  const { data: recipientAddressData, isLoading: isLoadingRecipientAddresses } = useQuery(
    ['recipientAddresses', organization],
    () => getRecipientAddressQuery(organization, displayAlert),
    { refetchOnWindowFocus: false },
  );

  const onAddButtonClick = () => {
    history.push(`${addPath}`, {
      from: redirectTo || routes.CONFIGURATION,
    });
  };

  const editType = (item) => {
    history.push(`${editPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.CONFIGURATION,
      data: item,
    });
  };

  const deleteType = (item) => {
    setDeleteId(item.id);
    setDeleteModal(true);
  };

  const { mutate: deleteRecipientAddressMutation, isLoading: isDeletingRecipientAddress } = useDeleteRecipientAddressMutation(displayAlert);

  const handleDeleteModal = () => {
    deleteRecipientAddressMutation(deleteId);
    setDeleteModal(false);
  };

  return (
    <DataTableWrapper
      noSpace
      loading={isLoadingRecipientAddresses || isDeletingRecipientAddress}
      rows={recipientAddressData || []}
      columns={getRecipientAddressColumns()}
      filename="RecipientAddress"
      addButtonHeading="Recipient Address"
      onAddButtonClick={onAddButtonClick}
      editAction={editType}
      deleteAction={deleteType}
      openDeleteModal={openDeleteModal}
      setDeleteModal={setDeleteModal}
      handleDeleteModal={handleDeleteModal}
      deleteModalTitle="Are you sure you want to Delete this Recipient Address?"
      tableHeight="300px"
    >
      <Route path={`${addPath}`} component={AddRecipientAddress} />
      <Route path={`${editPath}/:id`} component={AddRecipientAddress} />
    </DataTableWrapper>
  );
};

export default RecipientAddress;
