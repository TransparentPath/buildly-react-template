import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import DataTableWrapper from '../../components/DataTableWrapper/DataTableWrapper';
import { UserContext } from '../../context/User.context';
import {
  getCustodians,
  getCustodianType,
  deleteCustodian,
  getContact,
  getCustody,
} from '../../redux/custodian/actions/custodian.actions';
import {
  getCustodianOptions,
  getContactOptions,
} from '../../redux/options/actions/options.actions';
import { getCountries } from '../../redux/shipment/actions/shipment.actions';
import { routes } from '../../routes/routesConstants';
import {
  custodianColumns,
  getCustodianFormattedRow,
  getUniqueContactInfo,
} from '../../utils/constants';
import AddCustodians from './forms/AddCustodians';

const Custodian = ({
  dispatch,
  history,
  custodianData,
  loading,
  contactInfo,
  redirectTo,
  custodyData,
  custodianOptions,
  contactOptions,
}) => {
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState('');
  const [deleteContactObjId, setDeleteContactObjId] = useState('');
  const [rows, setRows] = useState([]);
  const organization = useContext(UserContext).organization.organization_uuid;

  const addCustodianPath = redirectTo
    ? `${redirectTo}/custodian`
    : `${routes.CUSTODIANS}/add`;

  const editCustodianPath = redirectTo
    ? `${redirectTo}/custodian`
    : `${routes.CUSTODIANS}/edit`;

  useEffect(() => {
    if (custodianData === null) {
      dispatch(getCustodians(organization));
      dispatch(getCustodianType());
      dispatch(getContact(organization));
    }
    if (!custodyData) {
      dispatch(getCustody());
    }
    if (custodianOptions === null) {
      dispatch(getCustodianOptions());
    }
    if (contactOptions === null) {
      dispatch(getContactOptions());
    }
    dispatch(getCountries());
  }, []);

  useEffect(() => {
    if (custodianData && custodianData.length && contactInfo && contactInfo.length) {
      setRows(getCustodianFormattedRow(custodianData, contactInfo));
    }
  }, [JSON.stringify(custodianData), JSON.stringify(contactInfo)]);

  const editItem = (item) => {
    const contactObj = getUniqueContactInfo(item, contactInfo);
    history.push(`${editCustodianPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.CUSTODIANS,
      data: item,
      contactData: contactObj,
    });
  };

  const deleteItem = (item) => {
    const contactObj = getUniqueContactInfo(item, contactInfo);
    setDeleteItemId(item.id);
    setDeleteContactObjId(contactObj.id);
    setDeleteModal(true);
  };

  const handleDeleteModal = () => {
    dispatch(deleteCustodian(
      deleteItemId,
      deleteContactObjId,
      organization,
    ));
    setDeleteModal(false);
  };

  const onAddButtonClick = () => {
    history.push(addCustodianPath, {
      from: redirectTo || routes.CUSTODIANS,
    });
  };

  return (
    <DataTableWrapper
      loading={loading}
      rows={rows || []}
      columns={custodianColumns}
      filename="CustodianData"
      addButtonHeading="Add Custodian"
      onAddButtonClick={onAddButtonClick}
      editAction={editItem}
      deleteAction={deleteItem}
      openDeleteModal={openDeleteModal}
      setDeleteModal={setDeleteModal}
      handleDeleteModal={handleDeleteModal}
      deleteModalTitle="Are you sure you want to delete this Custodian?"
      tableHeader="Custodians"
    >
      <Route path={addCustodianPath} component={AddCustodians} />
      <Route path={`${editCustodianPath}/:id`} component={AddCustodians} />
    </DataTableWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.custodianReducer,
  ...state.optionsReducer,
  loading: (
    state.custodianReducer.loading
    || state.optionsReducer.loading
  ),
});

export default connect(mapStateToProps)(Custodian);
