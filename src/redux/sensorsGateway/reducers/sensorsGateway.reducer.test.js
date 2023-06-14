import * as actions from '../actions/sensorsGateway.actions';
import * as reducer from './sensorsGateway.reducer';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  gatewayData: [],
  gatewayTypeList: [],
  sensorData: [],
  sensorTypeList: [],
};

describe('Get Gateway reducer', () => {
  it('Empty Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_GATEWAYS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get Gateway success Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_GATEWAYS_SUCCESS, data: [] },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      gatewayData: [],
    });
  });

  it('get Gateway fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_GATEWAYS_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Get New Gateways reducer', () => {
  it('Empty Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_NEW_GATEWAYS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get new Gateways success Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_NEW_GATEWAYS_SUCCESS },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
    });
  });

  it('get new Gateways fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_NEW_GATEWAYS_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Add Gateway reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ADD_GATEWAY },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Add Gateway success Reducer', () => {
    const data = { id: 1, name: 'Test data' };
    expect(reducer.default(
      initialState,
      { type: actions.ADD_GATEWAY_SUCCESS, gateway: data },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      gatewayData: [data],
    });
  });

  it('Add Gateway fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ADD_GATEWAY_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Edit Gateway reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.EDIT_GATEWAY },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Edit Gateway success Reducer', () => {
    const data = { id: 1, name: 'Test data' };
    const editedData = { id: 1, name: 'Test data edited' };
    expect(reducer.default(
      { ...initialState, gatewayData: [data] },
      { type: actions.EDIT_GATEWAY_SUCCESS, gateway: editedData },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      gatewayData: [editedData],
    });
  });

  it('Edit Gateway fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.EDIT_GATEWAY_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Delete Gateway reducer', () => {
  it('Empty Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_GATEWAY },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Delete Gateway success Reducer', () => {
    const data = { id: 1, name: 'Test data' };
    expect(reducer.default(
      { ...initialState, gatewayData: [data] },
      { type: actions.DELETE_GATEWAY_SUCCESS, id: data.id },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      gatewayData: [],
    });
  });

  it('Delete Gateway fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_GATEWAY_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Get Gateway type reducer', () => {
  it('Empty Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_GATEWAYS_TYPE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Get Gateway type success Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_GATEWAYS_TYPE_SUCCESS, data: [] },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      gatewayTypeList: [],
    });
  });

  it('Get Gateway type fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_GATEWAYS_TYPE_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Add Gateway type reducer', () => {
  it('Empty Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ADD_GATEWAYS_TYPE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Add Gateway type success Reducer', () => {
    const data = { id: 1, name: 'Test data' };
    expect(reducer.default(
      initialState,
      { type: actions.ADD_GATEWAYS_TYPE_SUCCESS, gatewayType: data },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      gatewayTypeList: [data],
    });
  });

  it('Add Gateway type fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ADD_GATEWAYS_TYPE_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Edit Gateway type reducer', () => {
  it('Empty Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.EDIT_GATEWAYS_TYPE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Edit Gateway type success Reducer', () => {
    const data = { id: 1, name: 'Test data' };
    const editedData = { id: 1, name: 'Test data edited' };
    expect(reducer.default(
      {
        ...initialState,
        gatewayTypeList: [data],
      },
      { type: actions.EDIT_GATEWAYS_TYPE_SUCCESS, gatewayType: editedData },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      gatewayTypeList: [editedData],
    });
  });

  it('Edit Gateway type fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.EDIT_GATEWAYS_TYPE_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Delete Gateway type reducer', () => {
  it('Empty Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_GATEWAYS_TYPE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Delete Gateway type success Reducer', () => {
    const data = { id: 1, name: 'Test data' };
    expect(reducer.default(
      { ...initialState, gatewayTypeList: [data] },
      { type: actions.DELETE_GATEWAYS_TYPE_SUCCESS, id: data.id },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      gatewayTypeList: [],
    });
  });

  it('Delete Gateway type fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_GATEWAYS_TYPE_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Get Sensor reducer', () => {
  it('Empty Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_SENSORS },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('get Sensors success Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_SENSORS_SUCCESS, data: [] },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      sensorData: [],
    });
  });

  it('get Sensor fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_SENSORS_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Add Sensor reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ADD_SENSOR },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Add Sensor success Reducer', () => {
    const data = { id: 1, name: 'Test data' };
    expect(reducer.default(
      initialState,
      { type: actions.ADD_SENSOR_SUCCESS, sensor: data },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      sensorData: [data],
    });
  });

  it('Add Sensor fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ADD_SENSOR_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Edit Sensor reducer', () => {
  it('Empty reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.EDIT_SENSOR },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Edit Sensor success Reducer', () => {
    const data = { id: 1, name: 'Test data' };
    const editedData = { id: 1, name: 'Test data edited' };
    expect(reducer.default(
      { ...initialState, sensorData: [data] },
      { type: actions.EDIT_SENSOR_SUCCESS, sensor: editedData },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      sensorData: [editedData],
    });
  });

  it('Edit Sensor fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.EDIT_SENSOR_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Delete Sensor reducer', () => {
  it('Empty Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_SENSOR },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Delete Sensor success Reducer', () => {
    const data = { id: 1, name: 'Test data' };
    expect(reducer.default(
      { ...initialState, sensorData: [data] },
      { type: actions.DELETE_SENSOR_SUCCESS, id: data.id },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      sensorData: [],
    });
  });

  it('Delete Gateway fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_SENSOR_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Get Sensor type reducer', () => {
  it('Empty Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_SENSORS_TYPE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Get Sensor type success Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_SENSORS_TYPE_SUCCESS, data: [] },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      sensorTypeList: [],
    });
  });

  it('Get Sensor type fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.GET_SENSORS_TYPE_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Add Sensor type reducer', () => {
  it('Empty Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ADD_SENSORS_TYPE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Add Sensor type success Reducer', () => {
    const data = { id: 1, name: 'Test data' };
    expect(reducer.default(
      initialState,
      { type: actions.ADD_SENSORS_TYPE_SUCCESS, sensorType: data },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      sensorTypeList: [data],
    });
  });

  it('Add Sensor type fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.ADD_SENSORS_TYPE_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Edit Sensor type reducer', () => {
  it('Empty Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.EDIT_SENSORS_TYPE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Edit Sensor type success Reducer', () => {
    const data = { id: 1, name: 'Test data' };
    const editedData = { id: 1, name: 'Test data edited' };
    expect(reducer.default(
      {
        ...initialState,
        sensorTypeList: [data],
      },
      { type: actions.EDIT_SENSORS_TYPE_SUCCESS, sensorType: editedData },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      sensorTypeList: [editedData],
    });
  });

  it('Edit Sensor type fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.EDIT_SENSORS_TYPE_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});

describe('Delete Sensor type reducer', () => {
  it('Empty Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_SENSORS_TYPE },
    )).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('Delete Sensor type success Reducer', () => {
    const data = { id: 1, name: 'Test data' };
    expect(reducer.default(
      { ...initialState, sensorTypeList: [data] },
      { type: actions.DELETE_SENSORS_TYPE_SUCCESS, id: data.id },
    )).toEqual({
      ...initialState,
      loaded: true,
      loading: false,
      sensorTypeList: [],
    });
  });

  it('Delete Sensor type fail Reducer', () => {
    expect(reducer.default(
      initialState,
      { type: actions.DELETE_SENSORS_TYPE_FAILURE },
    )).toEqual({
      ...initialState,
      error: undefined,
      loaded: true,
      loading: false,
    });
  });
});
