import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import DataTableWrapper from '../../components/DataTableWrapper/DataTableWrapper';
import { UserContext } from '../../context/User.context';
import { getContact, getCustodians } from '../../redux/custodian/actions/custodian.actions';
import { getUnitOfMeasure } from '../../redux/items/actions/items.actions';
import {
  getGateways,
  getGatewayType,
  deleteGateway,
} from '../../redux/sensorsGateway/actions/sensorsGateway.actions';
import {
  getShipmentDetails,
} from '../../redux/shipment/actions/shipment.actions';
import { routes } from '../../routes/routesConstants';
import { gatewayColumns, getGatewayFormattedRow } from '../../utils/constants';
import AddGateway from './forms/AddGateway';

const Gateway = ({
  dispatch,
  history,
  gatewayData,
  loading,
  gatewayTypeList,
  redirectTo,
  shipmentData,
  timezone,
  custodianData,
  unitOfMeasure,
}) => {
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [deleteGatewayId, setDeleteGatewayId] = useState('');
  const [rows, setRows] = useState([]);
  const organization = useContext(UserContext).organization.organization_uuid;

  const addPath = redirectTo
    ? `${redirectTo}/gateways`
    : `${routes.SENSORS_GATEWAY}/gateway/add`;

  const editPath = redirectTo
    ? `${redirectTo}/gateways`
    : `${routes.SENSORS_GATEWAY}/gateway/edit`;

  useEffect(() => {
    dispatch(getGateways(organization));
    dispatch(getGatewayType());
    dispatch(getCustodians(organization));
    dispatch(getContact(organization));
    dispatch(getShipmentDetails(organization, 'Planned,Enroute'));
    dispatch(getUnitOfMeasure(organization));
  }, []);

  useEffect(() => {
    if (!_.isEmpty(gatewayData) && !_.isEmpty(gatewayTypeList)) {
      setRows(getGatewayFormattedRow(gatewayData, gatewayTypeList, shipmentData, custodianData));
    }
  }, [gatewayData, gatewayTypeList, shipmentData, custodianData]);

  const editGatewayAction = (item) => {
    history.push(`${editPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.SENSORS_GATEWAY,
      data: item,
    });
  };

  const deleteGatewayAction = (item) => {
    setDeleteGatewayId(item.id);
    setDeleteModal(true);
  };

  const handleDeleteModal = () => {
    dispatch(deleteGateway(deleteGatewayId, organization));
    setDeleteModal(false);
  };

  const onAddButtonClick = () => {
    history.push(addPath, {
      from: redirectTo || routes.SENSORS_GATEWAY,
    });
  };

  return (
    <DataTableWrapper
      loading={loading}
      rows={rows || []}
      columns={gatewayColumns(
        timezone,
        _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
          ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
          : '',
      )}
      filename="GatewayData"
      addButtonHeading="Add Gateway"
      onAddButtonClick={onAddButtonClick}
      editAction={editGatewayAction}
      deleteAction={deleteGatewayAction}
      openDeleteModal={openDeleteModal}
      setDeleteModal={setDeleteModal}
      handleDeleteModal={handleDeleteModal}
      deleteModalTitle="Are you sure you want to delete this Gateway?"
      tableHeader="Gateway"
      hideAddButton
      centerLabel
    >
      <Route path={`${addPath}`} component={AddGateway} />
      <Route path={`${editPath}/:id`} component={AddGateway} />
    </DataTableWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.sensorsGatewayReducer,
  ...state.optionsReducer,
  ...state.shipmentReducer,
  ...state.custodianReducer,
  ...state.itemsReducer,
  loading: (
    state.sensorsGatewayReducer.loading
    || state.optionsReducer.loading
    || state.shipmentReducer.loading
    || state.custodianReducer.loading
    || state.itemsReducer.loading
  ),
});

export default connect(mapStateToProps)(Gateway);
