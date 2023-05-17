import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import DataTableWrapper from '../../../components/DataTableWrapper/DataTableWrapper';
import { UserContext } from '../../../context/User.context';
import {
  getSensors,
  getSensorType,
  deleteSensor,
} from '../../../redux/sensorsGateway/actions/sensorsGateway.actions';
import {
  getSensorOptions,
} from '../../../redux/options/actions/options.actions';
import { routes } from '../../../routes/routesConstants';
import { sensorsColumns, getSensorFormattedRow } from '../Constants';
import AddSensors from '../forms/AddSensors';
import { getUnitOfMeasure } from '@redux/items/actions/items.actions';

const Sensors = ({
  dispatch,
  history,
  sensorData,
  loading,
  sensorTypeList,
  redirectTo,
  gatewayData,
  sensorOptions,
  timezone,
  unitOfMeasure,
}) => {
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [deleteSensorId, setDeleteSensorId] = useState('');
  const [rows, setRows] = useState([]);
  const organization = useContext(UserContext).organization.organization_uuid;

  const addPath = redirectTo
    ? `${redirectTo}/sensors`
    : `${routes.SENSORS_GATEWAY}/sensor/add`;

  const editPath = redirectTo
    ? `${redirectTo}/sensors`
    : `${routes.SENSORS_GATEWAY}/sensor/edit`;

  useEffect(() => {
    if (sensorData === null) {
      dispatch(getSensors(organization));
      dispatch(getSensorType());
    }
    if (sensorOptions === null) {
      dispatch(getSensorOptions());
    }
    if (!unitOfMeasure) {
      dispatch(getUnitOfMeasure(organization));
    }
  }, []);

  useEffect(() => {
    if (
      sensorData
      && sensorData.length
      && sensorTypeList
      && sensorTypeList.length
    ) {
      setRows(getSensorFormattedRow(sensorData, sensorTypeList, gatewayData));
    }
  }, [sensorData, sensorTypeList]);

  const editSensorItem = (item) => {
    history.push(`${editPath}/:${item.id}`, {
      type: 'edit',
      from: redirectTo || routes.SENSORS_GATEWAY,
      data: item,
    });
  };

  const deleteSensorItem = (item) => {
    setDeleteSensorId(item.id);
    setDeleteModal(true);
  };

  const handleDeleteModal = () => {
    dispatch(deleteSensor(deleteSensorId, organization));
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
      columns={sensorsColumns(
        timezone,
        _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
          ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
          : '',
      )}
      filename="SensorData"
      addButtonHeading="Add Sensor"
      onAddButtonClick={onAddButtonClick}
      editAction={editSensorItem}
      deleteAction={deleteSensorItem}
      openDeleteModal={openDeleteModal}
      setDeleteModal={setDeleteModal}
      handleDeleteModal={handleDeleteModal}
      deleteModalTitle="Are you sure you want to delete this Sensor?"
      tableHeader="Sensors"
      hideAddButton
      centerLabel
    >
      <Route path={`${addPath}`} component={AddSensors} />
      <Route path={`${editPath}/:id`} component={AddSensors} />
    </DataTableWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.sensorsGatewayReducer,
  ...state.optionsReducer,
  ...state.itemsReducer,
  loading: (
    state.sensorsGatewayReducer.loading
    || state.optionsReducer.loading
    || state.itemsReducer.loading
  ),
});

export default connect(mapStateToProps)(Sensors);
