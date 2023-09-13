import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import DataTableWrapper from '../../components/DataTableWrapper/DataTableWrapper';
import Forbidden from '../../components/Forbidden/Forbidden';
import { UserContext } from '../../context/User.context';
import {
  getCustodians,
  deleteCustodian,
  getContact,
  getCustodianType,
} from '../../redux/custodian/actions/custodian.actions';
import { getCountries } from '../../redux/shipment/actions/shipment.actions';
import { routes } from '../../routes/routesConstants';
import {
  custodianColumns,
  getCustodianFormattedRow,
  getUniqueContactInfo,
} from '../../utils/constants';
import { checkForAdmin, checkForGlobalAdmin } from '../../utils/utilMethods';
import AddCustodians from './forms/AddCustodians';

const Custodian = ({
  dispatch,
  history,
  custodianData,
  loading,
  contactInfo,
  redirectTo,
}) => {
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState('');
  const [deleteContactObjId, setDeleteContactObjId] = useState('');
  const [rows, setRows] = useState([]);
  const organization = useContext(UserContext).organization.organization_uuid;
  const isAdmin = checkForAdmin(useContext(UserContext))
    // eslint-disable-next-line react-hooks/rules-of-hooks
    || checkForGlobalAdmin(useContext(UserContext));

  const addCustodianPath = redirectTo
    ? `${redirectTo}/custodian`
    : `${routes.CUSTODIANS}/add`;

  const editCustodianPath = redirectTo
    ? `${redirectTo}/custodian`
    : `${routes.CUSTODIANS}/edit`;

  useEffect(() => {
    dispatch(getCustodians(organization));
    dispatch(getCustodianType());
    dispatch(getContact(organization));
    dispatch(getCountries());
  }, []);

  useEffect(() => {
    if (!_.isEmpty(custodianData) && !_.isEmpty(contactInfo)) {
      setRows(getCustodianFormattedRow(custodianData, contactInfo));
    }
  }, [custodianData, contactInfo]);

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
    ));
    setDeleteModal(false);
  };

  const onAddButtonClick = () => {
    history.push(addCustodianPath, {
      from: redirectTo || routes.CUSTODIANS,
    });
  };

  return (
    <>
      {isAdmin && (
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
      )}
      {!isAdmin && (
        <Forbidden
          history={history}
          location={location}
        />
      )}
    </>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.custodianReducer,
});

export default connect(mapStateToProps)(Custodian);
