import {
  put, takeLatest, all, call,
} from 'redux-saga/effects';
import _ from 'lodash';
import { httpService } from '../../../modules/http/http.service';
import { showAlert } from '../../alert/actions/alert.actions';
import {
  GET_GATEWAYS,
  GET_GATEWAYS_SUCCESS,
  GET_GATEWAYS_FAILURE,
  GET_NEW_GATEWAYS,
  GET_NEW_GATEWAYS_SUCCESS,
  GET_NEW_GATEWAYS_FAILURE,
  ADD_GATEWAY,
  ADD_GATEWAY_SUCCESS,
  ADD_GATEWAY_FAILURE,
  EDIT_GATEWAY,
  EDIT_GATEWAY_SUCCESS,
  EDIT_GATEWAY_FAILURE,
  DELETE_GATEWAY,
  DELETE_GATEWAY_SUCCESS,
  DELETE_GATEWAY_FAILURE,
  GET_GATEWAYS_TYPE,
  GET_GATEWAYS_TYPE_SUCCESS,
  GET_GATEWAYS_TYPE_FAILURE,
  ADD_GATEWAYS_TYPE,
  ADD_GATEWAYS_TYPE_SUCCESS,
  ADD_GATEWAYS_TYPE_FAILURE,
  EDIT_GATEWAYS_TYPE,
  EDIT_GATEWAYS_TYPE_SUCCESS,
  EDIT_GATEWAYS_TYPE_FAILURE,
  DELETE_GATEWAYS_TYPE,
  DELETE_GATEWAYS_TYPE_SUCCESS,
  DELETE_GATEWAYS_TYPE_FAILURE,
  GET_SENSORS,
  GET_SENSORS_SUCCESS,
  GET_SENSORS_FAILURE,
  ADD_SENSOR,
  ADD_SENSOR_SUCCESS,
  ADD_SENSOR_FAILURE,
  EDIT_SENSOR,
  EDIT_SENSOR_SUCCESS,
  EDIT_SENSOR_FAILURE,
  DELETE_SENSOR,
  DELETE_SENSOR_SUCCESS,
  DELETE_SENSOR_FAILURE,
  GET_SENSORS_TYPE,
  GET_SENSORS_TYPE_SUCCESS,
  GET_SENSORS_TYPE_FAILURE,
  ADD_SENSORS_TYPE,
  ADD_SENSORS_TYPE_SUCCESS,
  ADD_SENSORS_TYPE_FAILURE,
  EDIT_SENSORS_TYPE,
  EDIT_SENSORS_TYPE_SUCCESS,
  EDIT_SENSORS_TYPE_FAILURE,
  DELETE_SENSORS_TYPE,
  DELETE_SENSORS_TYPE_SUCCESS,
  DELETE_SENSORS_TYPE_FAILURE,
} from '../actions/sensorsGateway.actions';

const sensorApiEndPoint = 'sensors/';

function* getGatewayList(payload) {
  try {
    const data = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${sensorApiEndPoint}gateway/?organization_uuid=${payload.organization_uuid}`,
    );
    yield put({ type: GET_GATEWAYS_SUCCESS, data: _.filter(data.data, (gateway) => !_.includes(gateway.name, 'ICLP')) });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t load data due to some error!',
        }),
      ),
      yield put({ type: GET_GATEWAYS_FAILURE, error }),
    ];
  }
}

function* getNewGateways(payload) {
  try {
    const data = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${sensorApiEndPoint}gateway/create_gateway/`,
    );
    yield put({ type: GET_NEW_GATEWAYS_SUCCESS });
    window.location.reload();
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t load new gateways due to some error!',
        }),
      ),
      yield put({ type: GET_NEW_GATEWAYS_FAILURE, error }),
    ];
  }
}

function* addGateway(action) {
  const { history, payload, redirectTo } = action;
  try {
    const data = yield call(
      httpService.makeRequest,
      'post',
      `${window.env.API_URL}${sensorApiEndPoint}gateway/`,
      payload,
    );
    yield [
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Successfully Added Gateway',
        }),
      ),
      yield put({ type: ADD_GATEWAY_SUCCESS, gateway: data.data }),
    ];
    if (history && redirectTo) {
      yield call(history.push, redirectTo);
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Error in creating Gateway',
        }),
      ),
      yield put({ type: ADD_GATEWAY_FAILURE, error }),
    ];
  }
}

function* editGateWayItem(action) {
  const { payload, history, redirectTo } = action;
  try {
    const data = yield call(
      httpService.makeRequest,
      'patch',
      `${window.env.API_URL}${sensorApiEndPoint}gateway/${payload.id}/`,
      payload,
    );
    yield [
      yield put({ type: EDIT_GATEWAY_SUCCESS, gateway: data.data }),
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Gateway successfully Edited!',
        }),
      ),
    ];
    if (history && redirectTo) {
      yield call(history.push, redirectTo);
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t edit Gateway due to some error!',
        }),
      ),
      yield put({ type: EDIT_GATEWAY_FAILURE, error }),
    ];
  }
}

function* deleteGatewayItem(payload) {
  try {
    yield call(
      httpService.makeRequest,
      'delete',
      `${window.env.API_URL}${sensorApiEndPoint}gateway/${payload.id}/`,
    );
    yield [
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Gateway deleted successfully!',
        }),
      ),
      yield put({ type: DELETE_GATEWAY_SUCCESS, id: payload.id }),
    ];
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Error in deleting Gateway!',
        }),
      ),
      yield put({ type: DELETE_GATEWAY_FAILURE, error }),
    ];
  }
}

function* getGatewayTypeList() {
  try {
    const data = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${sensorApiEndPoint}gateway_type/`,
    );
    yield put({
      type: GET_GATEWAYS_TYPE_SUCCESS,
      data: _.filter(data.data, (gatewayType) => _.toLower(gatewayType.name) !== 'iclp'),
    });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t load data due to some error!',
        }),
      ),
      yield put({ type: GET_GATEWAYS_TYPE_FAILURE, error }),
    ];
  }
}

function* addGatewayType(action) {
  const { payload } = action;
  try {
    const data = yield call(
      httpService.makeRequest,
      'post',
      `${window.env.API_URL}${sensorApiEndPoint}gateway_type/`,
      payload,
    );
    if (data && data.data) {
      yield [
        yield put({ type: ADD_GATEWAYS_TYPE_SUCCESS, gatewayType: data.data }),
        yield put(
          showAlert({
            type: 'success',
            open: true,
            message: 'Successfully Added Gateway Type',
          }),
        ),
      ];
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t Add Gateway Type due to some error!',
        }),
      ),
      yield put({ type: ADD_GATEWAYS_TYPE_FAILURE, error }),
    ];
  }
}

function* editGatewayType(action) {
  const { payload } = action;
  try {
    const data = yield call(
      httpService.makeRequest,
      'patch',
      `${window.env.API_URL}${sensorApiEndPoint}gateway_type/${payload.id}`,
      payload,
    );
    if (data && data.data) {
      yield [
        yield put({ type: EDIT_GATEWAYS_TYPE_SUCCESS, gatewayType: data.data }),
        yield put(
          showAlert({
            type: 'success',
            open: true,
            message: 'Successfully Edited Gateway Type',
          }),
        ),
      ];
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t Edit Gateway Type due to some error!',
        }),
      ),
      yield put({ type: EDIT_GATEWAYS_TYPE_FAILURE, error }),
    ];
  }
}

function* deleteGatewayType(payload) {
  try {
    const data = yield call(
      httpService.makeRequest,
      'delete',
      `${window.env.API_URL}${sensorApiEndPoint}gateway_type/${payload.id}`,
    );
    yield [
      yield put({ type: DELETE_GATEWAYS_TYPE_SUCCESS, id: payload.id }),
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Successfully Deleted Gateway Type',
        }),
      ),
    ];
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t Delete Gateway Type due to some error!',
        }),
      ),
      yield put({ type: DELETE_GATEWAYS_TYPE_FAILURE, error }),
    ];
  }
}

function* getSensorList(payload) {
  try {
    const data = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${sensorApiEndPoint}sensor/?organization_uuid=${payload.organization_uuid}`,
    );
    yield put({ type: GET_SENSORS_SUCCESS, data: data.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t load data due to some error!',
        }),
      ),
      yield put({ type: GET_SENSORS_FAILURE, error }),
    ];
  }
}

function* addSensor(action) {
  const { history, payload, redirectTo } = action;
  try {
    const data = yield call(
      httpService.makeRequest,
      'post',
      `${window.env.API_URL}${sensorApiEndPoint}sensor/`,
      payload,
    );
    yield [
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Successfully Added Sensor',
        }),
      ),
      yield put({ type: ADD_SENSOR_SUCCESS, sensor: data.data }),
    ];
    if (history && redirectTo) {
      yield call(history.push, redirectTo);
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Error in creating Gateway',
        }),
      ),
      yield put({ type: ADD_SENSOR_FAILURE, error }),
    ];
  }
}

function* editSensorItem(action) {
  const { payload, history, redirectTo } = action;
  try {
    const data = yield call(
      httpService.makeRequest,
      'patch',
      `${window.env.API_URL}${sensorApiEndPoint}sensor/${payload.id}/`,
      payload,
    );
    yield [
      yield put({ type: EDIT_SENSOR_SUCCESS, sensor: data.data }),
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Sensor successfully Edited!',
        }),
      ),
    ];
    if (history && redirectTo) {
      yield call(history.push, redirectTo);
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t edit Gateway due to some error!',
        }),
      ),
      yield put({ type: EDIT_SENSOR_FAILURE, error }),
    ];
  }
}

function* deleteSensorItem(payload) {
  try {
    yield call(
      httpService.makeRequest,
      'delete',
      `${window.env.API_URL}${sensorApiEndPoint}sensor/${payload.id}/`,
    );
    yield [
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Sensor deleted successfully!',
        }),
      ),
      yield put({ type: DELETE_SENSOR_SUCCESS, id: payload.id }),
    ];
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Error in deleting Gateway!',
        }),
      ),
      yield put({ type: DELETE_SENSOR_FAILURE, error }),
    ];
  }
}

function* getSensorTypeList() {
  try {
    const data = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${sensorApiEndPoint}sensor_type/`,
    );
    yield put({ type: GET_SENSORS_TYPE_SUCCESS, data: data.data });
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t load data due to some error!',
        }),
      ),
      yield put({ type: GET_SENSORS_TYPE_FAILURE, error }),
    ];
  }
}

function* addSensorType(action) {
  const { payload } = action;
  try {
    const data = yield call(
      httpService.makeRequest,
      'post',
      `${window.env.API_URL}${sensorApiEndPoint}sensor_type/`,
      payload,
    );
    if (data && data.data) {
      yield [
        yield put({ type: ADD_SENSORS_TYPE_SUCCESS, sensorType: data.data }),
        yield put(
          showAlert({
            type: 'success',
            open: true,
            message: 'Successfully Added Sensor Type',
          }),
        ),
      ];
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t Add Sensor Type due to some error!',
        }),
      ),
      yield put({ type: ADD_SENSORS_TYPE_FAILURE, error }),
    ];
  }
}

function* editSensorType(action) {
  const { payload } = action;
  try {
    const data = yield call(
      httpService.makeRequest,
      'patch',
      `${window.env.API_URL}${sensorApiEndPoint}sensor_type/${payload.id}`,
      payload,
    );
    if (data && data.data) {
      yield [
        yield put({ type: EDIT_SENSORS_TYPE_SUCCESS, sensorType: data.data }),
        yield put(
          showAlert({
            type: 'success',
            open: true,
            message: 'Successfully Edited Sensor Type',
          }),
        ),
      ];
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t Edit Sensor Type due to some error!',
        }),
      ),
      yield put({ type: EDIT_SENSORS_TYPE_FAILURE, error }),
    ];
  }
}

function* deleteSensorType(payload) {
  try {
    const data = yield call(
      httpService.makeRequest,
      'delete',
      `${window.env.API_URL}${sensorApiEndPoint}sensor_type/${payload.id}`,
    );
    yield [
      yield put({ type: DELETE_SENSORS_TYPE_SUCCESS, id: payload.id }),
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Successfully Deleted Sensor Type',
        }),
      ),
    ];
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t Delete Sensor Type due to some error!',
        }),
      ),
      yield put({ type: DELETE_SENSORS_TYPE_FAILURE, error }),
    ];
  }
}

function* watchGetGateway() {
  yield takeLatest(GET_GATEWAYS, getGatewayList);
}

function* watchGetNewGateways() {
  yield takeLatest(GET_NEW_GATEWAYS, getNewGateways);
}

function* watchAddGateway() {
  yield takeLatest(ADD_GATEWAY, addGateway);
}

function* watchEditGateway() {
  yield takeLatest(EDIT_GATEWAY, editGateWayItem);
}

function* watchDeleteGateway() {
  yield takeLatest(DELETE_GATEWAY, deleteGatewayItem);
}

function* watchGetGatewayType() {
  yield takeLatest(GET_GATEWAYS_TYPE, getGatewayTypeList);
}

function* watchAddGatewayType() {
  yield takeLatest(ADD_GATEWAYS_TYPE, addGatewayType);
}

function* watchEditGatewayType() {
  yield takeLatest(EDIT_GATEWAYS_TYPE, editGatewayType);
}

function* watchDeleteGatewayType() {
  yield takeLatest(DELETE_GATEWAYS_TYPE, deleteGatewayType);
}

function* watchGetSensor() {
  yield takeLatest(GET_SENSORS, getSensorList);
}

function* watchAddSensor() {
  yield takeLatest(ADD_SENSOR, addSensor);
}

function* watchEditSensor() {
  yield takeLatest(EDIT_SENSOR, editSensorItem);
}

function* watchDeleteSensor() {
  yield takeLatest(DELETE_SENSOR, deleteSensorItem);
}

function* watchGetSensorType() {
  yield takeLatest(GET_SENSORS_TYPE, getSensorTypeList);
}

function* watchAddSensorType() {
  yield takeLatest(ADD_SENSORS_TYPE, addSensorType);
}

function* watchEditSensorType() {
  yield takeLatest(EDIT_SENSORS_TYPE, editSensorType);
}

function* watchDeleteSensorType() {
  yield takeLatest(DELETE_SENSORS_TYPE, deleteSensorType);
}

export default function* sensorsGatewaySaga() {
  yield all([
    watchGetGateway(),
    watchGetNewGateways(),
    watchAddGateway(),
    watchDeleteGateway(),
    watchEditGateway(),
    watchGetGatewayType(),
    watchAddGatewayType(),
    watchEditGatewayType(),
    watchDeleteGatewayType(),
    watchGetSensor(),
    watchAddSensor(),
    watchEditSensor(),
    watchDeleteSensor(),
    watchGetSensorType(),
    watchAddSensorType(),
    watchEditSensorType(),
    watchDeleteSensorType(),
  ]);
}
