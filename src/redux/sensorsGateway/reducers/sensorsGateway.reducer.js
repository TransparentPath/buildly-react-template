import _ from 'lodash';
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
import { ca } from 'date-fns/locale';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  gatewayData: [],
  gatewayTypeList: [],
  sensorData: [],
  sensorTypeList: [],
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case GET_GATEWAYS:
    case ADD_GATEWAY:
    case EDIT_GATEWAY:
    case DELETE_GATEWAY:
    case GET_GATEWAYS_TYPE:
    case ADD_GATEWAYS_TYPE:
    case EDIT_GATEWAYS_TYPE:
    case DELETE_GATEWAYS_TYPE:
    case GET_SENSORS:
    case ADD_SENSOR:
    case EDIT_SENSOR:
    case DELETE_SENSOR:
    case GET_SENSORS_TYPE:
    case ADD_SENSORS_TYPE:
    case EDIT_SENSORS_TYPE:
    case DELETE_SENSORS_TYPE:
    case GET_NEW_GATEWAYS:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null,
      };

    case GET_GATEWAYS_FAILURE:
    case ADD_GATEWAY_FAILURE:
    case EDIT_GATEWAY_FAILURE:
    case DELETE_GATEWAY_FAILURE:
    case GET_GATEWAYS_TYPE_FAILURE:
    case ADD_GATEWAYS_TYPE_FAILURE:
    case EDIT_GATEWAYS_TYPE_FAILURE:
    case DELETE_GATEWAYS_TYPE_FAILURE:
    case GET_SENSORS_FAILURE:
    case ADD_SENSOR_FAILURE:
    case EDIT_SENSOR_FAILURE:
    case DELETE_SENSOR_FAILURE:
    case GET_SENSORS_TYPE_FAILURE:
    case ADD_SENSORS_TYPE_FAILURE:
    case EDIT_SENSORS_TYPE_FAILURE:
    case DELETE_SENSORS_TYPE_FAILURE:
    case GET_NEW_GATEWAYS_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.error,
      };

    case GET_GATEWAYS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        gatewayData: action.data,
      };

    case ADD_GATEWAY_SUCCESS:
    case EDIT_GATEWAY_SUCCESS: {
      const found = _.find(
        state.gatewayData,
        { id: action.gateway.id },
      );
      const gatewayData = found
        ? _.map(state.gatewayData, (gateway) => (
          gateway.id === action.gateway.id
            ? action.gateway
            : gateway
        ))
        : [...state.gatewayData, action.gateway];
      return {
        ...state,
        loading: false,
        loaded: true,
        gatewayData,
      };
    }

    case DELETE_GATEWAY_SUCCESS: {
      const gatewayData = _.filter(state.gatewayData, (gateway) => gateway.id !== action.id);

      return {
        ...state,
        loading: false,
        loaded: true,
        gatewayData,
      };
    }

    case GET_NEW_GATEWAYS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
      };

    case GET_GATEWAYS_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        gatewayTypeList: action.data,
      };

    case ADD_GATEWAYS_TYPE_SUCCESS:
    case EDIT_GATEWAYS_TYPE_SUCCESS: {
      const found = _.find(
        state.gatewayTypeList,
        { id: action.gatewayType.id },
      );
      const gatewayTypeList = found
        ? _.map(state.gatewayTypeList, (gatewyType) => (
          gatewyType.id === action.gatewayType.id
            ? action.gatewayType
            : gatewyType
        ))
        : [...state.gatewayTypeList, action.gatewayType];
      return {
        ...state,
        loading: false,
        loaded: true,
        gatewayTypeList,
      };
    }

    case DELETE_GATEWAYS_TYPE_SUCCESS: {
      const gatewayTypeList = _.filter(state.gatewayTypeList, (gatewayType) => (
        gatewayType.id !== action.id
      ));

      return {
        ...state,
        loading: false,
        loaded: true,
        gatewayTypeList,
      };
    }

    case GET_SENSORS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        sensorData: action.data,
      };

    case ADD_SENSOR_SUCCESS:
    case EDIT_SENSOR_SUCCESS: {
      const found = _.find(
        state.sensorData,
        { id: action.sensor.id },
      );
      const sensorData = found
        ? _.map(state.sensorData, (sensor) => (
          sensor.id === action.sensor.id
            ? action.sensor
            : sensor
        ))
        : [...state.sensorData, action.sensor];
      return {
        ...state,
        loading: false,
        loaded: true,
        sensorData,
      };
    }

    case DELETE_SENSOR_SUCCESS: {
      const sensorData = _.filter(state.sensorData, (sensor) => sensor.id !== action.id);

      return {
        ...state,
        loading: false,
        loaded: true,
        sensorData,
      };
    }

    case GET_SENSORS_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        sensorTypeList: action.data,
      };

    case ADD_SENSORS_TYPE_SUCCESS:
    case EDIT_SENSORS_TYPE_SUCCESS: {
      const found = _.find(
        state.sensorTypeList,
        { id: action.sensorType.id },
      );
      const sensorTypeList = found
        ? _.map(state.sensorTypeList, (snsrType) => (
          snsrType.id === action.sensorType.id
            ? action.sensorType
            : snsrType
        ))
        : [...state.sensorTypeList, action.sensorType];
      return {
        ...state,
        loading: false,
        loaded: true,
        sensorTypeList,
      };
    }

    case DELETE_SENSORS_TYPE_SUCCESS: {
      const sensorTypeList = _.filter(state.sensorTypeList, (sensorType) => (
        sensorType.id !== action.id
      ));

      return {
        ...state,
        loading: false,
        loaded: true,
        sensorTypeList,
      };
    }

    default:
      return state;
  }
};
