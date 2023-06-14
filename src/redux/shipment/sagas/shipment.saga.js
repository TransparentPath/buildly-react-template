import {
  put, takeLatest, all, call,
} from 'redux-saga/effects';
import _ from 'lodash';
import { httpService } from '../../../modules/http/http.service';
import { showAlert } from '../../alert/actions/alert.actions';
import {
  GET_SHIPMENTS,
  GET_SHIPMENTS_SUCCESS,
  GET_SHIPMENTS_FAILURE,
  ADD_SHIPMENT,
  ADD_SHIPMENT_SUCCESS,
  ADD_SHIPMENT_FAILURE,
  EDIT_SHIPMENT,
  EDIT_SHIPMENT_SUCCESS,
  EDIT_SHIPMENT_FAILURE,
  DELETE_SHIPMENT,
  DELETE_SHIPMENT_SUCCESS,
  DELETE_SHIPMENT_FAILURE,
  GET_DASHBOARD_ITEMS,
  GET_DASHBOARD_ITEMS_SUCCESS,
  GET_DASHBOARD_ITEMS_FAILURE,
  ADD_PDF_IDENTIFIER,
  ADD_PDF_IDENTIFIER_SUCCESS,
  ADD_PDF_IDENTIFIER_FAILURE,
  GET_COUNTRIES_STATES,
  GET_COUNTRIES_STATES_SUCCESS,
  GET_COUNTRIES_STATES_FAILURE,
  GET_CURRENCIES,
  GET_CURRENCIES_SUCCESS,
  GET_CURRENCIES_FAILURE,
} from '../actions/shipment.actions';

const shipmentApiEndPoint = 'shipment/';

function* getShipmentList(payload) {
  try {
    let query_params = `?organization_uuid=${payload.organization_uuid}`;

    const response = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}consortium/?organization_uuid=${payload.organization_uuid}`,
    );
    const consortium_uuid = _.join(_.map(response.data, 'consortium_uuid'), ',');
    if (consortium_uuid) {
      query_params = query_params.concat(`&consortium_uuid=${consortium_uuid}`);
    }

    const data = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${shipmentApiEndPoint}shipment/${query_params}`,
    );
    if (data && data.data) {
      let shipment_data = data.data;
      if (_.isArray(shipment_data)) {
        shipment_data = _.filter(shipment_data, (shipment) => _.toLower(shipment.platform_name) !== 'iclp');
      }

      yield [
        yield put({ type: GET_SHIPMENTS_SUCCESS, data: shipment_data }),
        yield put(
          showAlert({
            type: 'success',
            open: true,
            message: 'Successfully fetched all shipment data',
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
          message: 'Couldn\'t load data due to some error!',
        }),
      ),
      yield put({ type: GET_SHIPMENTS_FAILURE, error }),
    ];
  }
}

function* addShipment(action) {
  const { history, payload, redirectTo } = action;
  try {
    const data = yield call(
      httpService.makeRequest,
      'post',
      `${window.env.API_URL}${shipmentApiEndPoint}shipment/`,
      payload,
    );
    yield [
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Successfully Added Shipment',
        }),
      ),
      yield put({ type: ADD_SHIPMENT_SUCCESS, shipment: data.data }),
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
          message: 'Error in creating Shipment',
        }),
      ),
      yield put({ type: ADD_SHIPMENT_FAILURE, error }),
    ];
  }
}

function* editShipment(action) {
  const { payload, history, redirectTo } = action;
  try {
    const data = yield call(
      httpService.makeRequest,
      'patch',
      `${window.env.API_URL}${shipmentApiEndPoint}shipment/${payload.id}/`,
      payload,
    );

    yield [
      yield put({ type: EDIT_SHIPMENT_SUCCESS, shipment: data.data }),
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Shipment successfully Edited!',
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
          message: 'Error in Updating Shipment!',
        }),
      ),
      yield put({ type: EDIT_SHIPMENT_FAILURE, error }),
    ];
  }
}

function* deleteShipment(payload) {
  try {
    yield call(
      httpService.makeRequest,
      'delete',
      `${window.env.API_URL}${shipmentApiEndPoint}shipment/${payload.id}/`,
    );
    yield [
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Shipment deleted successfully!',
        }),
      ),
      yield put({ type: DELETE_SHIPMENT_SUCCESS, id: payload.id }),
    ];
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Error in deleting Shipment!',
        }),
      ),
      yield put({ type: DELETE_SHIPMENT_FAILURE, error }),
    ];
  }
}

function* getDashboard(payload) {
  try {
    const data = yield call(
      httpService.makeRequest,
      'get',
      `${window.env.API_URL}${shipmentApiEndPoint}dashboard/?organization_uuid=${payload.organization_uuid}`,
    );
    yield put({
      type: GET_DASHBOARD_ITEMS_SUCCESS,
      data: data.data,
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
      yield put({
        type: GET_DASHBOARD_ITEMS_FAILURE,
        error,
      }),
    ];
  }
}

function* pdfIdentifier(action) {
  const {
    data,
    filename,
    identifier,
    payload,
    history,
    redirectTo,
    organization_uuid,
  } = action;
  try {
    let { uploaded_pdf, uploaded_pdf_link } = payload;
    if (data && filename) {
      const response = yield call(
        httpService.makeRequest,
        'post',
        `${window.env.API_URL}${shipmentApiEndPoint}upload_file/`,
        data,
      );
      uploaded_pdf = payload.uploaded_pdf
        ? [...payload.uploaded_pdf, filename]
        : [filename];
      uploaded_pdf_link = payload.uploaded_pdf_link
        ? [...payload.uploaded_pdf_link, response.data['aws url']]
        : [response.data['aws url']];
    }

    const unique_identifier = identifier;
    yield [
      yield put({
        type: ADD_PDF_IDENTIFIER_SUCCESS,
        uploaded_pdf,
        uploaded_pdf_link,
        unique_identifier,
      }),
      yield put({
        type: EDIT_SHIPMENT,
        payload: {
          ...payload,
          uploaded_pdf,
          uploaded_pdf_link,
          unique_identifier,
        },
        history,
        redirectTo,
        organization_uuid,
      }),
    ];
    if (data && filename && identifier) {
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Successfully Added PDF and Unique Identifer',
        }),
      );
    }
    if (data && filename && !identifier) {
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Successfully Added PDF',
        }),
      );
    }
    if (!data && !filename && identifier) {
      yield put(
        showAlert({
          type: 'success',
          open: true,
          message: 'Successfully Added Unique Identifer',
        }),
      );
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t Upload Bill due to some error!',
        }),
      ),
      yield put({
        type: ADD_PDF_IDENTIFIER_FAILURE,
        error,
      }),
    ];
  }
}

function* getCountries() {
  try {
    const data = yield call(
      httpService.makeRequest,
      'get',
      'https://countriesnow.space/api/v0.1/countries/states',
    );
    if (data && data.data && data.data.data) {
      let countries = [];
      _.forEach(data.data.data, (country) => {
        if (!_.includes(
          ['cuba', 'iran', 'north korea', 'russia', 'syria', 'venezuela'],
          _.toLower(country.name),
        )) {
          countries = [
            ...countries,
            {
              country: country.name,
              iso3: country.iso3,
              states: _.sortBy(_.without(_.uniq(country.states), [''])),
            },
          ];
        }
      });
      countries = _.uniqBy(countries, 'country');
      yield put({ type: GET_COUNTRIES_STATES_SUCCESS, countries });
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t load countries and related states due to some error!',
        }),
      ),
      yield put({ type: GET_COUNTRIES_STATES_FAILURE, error }),
    ];
  }
}

function* getCurrencies() {
  try {
    const data = yield call(
      httpService.makeRequest,
      'get',
      'https://countriesnow.space/api/v0.1/countries/currency',
    );
    if (data && data.data && data.data.data) {
      const currencies = _.uniqBy(_.map(
        data.data.data, (curr) => ({ country: curr.iso3, currency: curr.currency }),
      ), 'country');
      yield put({ type: GET_CURRENCIES_SUCCESS, currencies });
    }
  } catch (error) {
    yield [
      yield put(
        showAlert({
          type: 'error',
          open: true,
          message: 'Couldn\'t load currencies due to some error!',
        }),
      ),
      yield put({ type: GET_CURRENCIES_FAILURE, error }),
    ];
  }
}

function* watchGetShipment() {
  yield takeLatest(GET_SHIPMENTS, getShipmentList);
}

function* watchAddShipment() {
  yield takeLatest(ADD_SHIPMENT, addShipment);
}

function* watchEditShipment() {
  yield takeLatest(EDIT_SHIPMENT, editShipment);
}

function* watchDeleteShipment() {
  yield takeLatest(DELETE_SHIPMENT, deleteShipment);
}

function* watchPdfIdentifier() {
  yield takeLatest(ADD_PDF_IDENTIFIER, pdfIdentifier);
}

function* watchGetCountries() {
  yield takeLatest(GET_COUNTRIES_STATES, getCountries);
}

function* watchGetCurrencies() {
  yield takeLatest(GET_CURRENCIES, getCurrencies);
}

export default function* shipmentSaga() {
  yield all([
    watchGetShipment(),
    watchAddShipment(),
    watchDeleteShipment(),
    watchEditShipment(),
    watchPdfIdentifier(),
    watchGetCountries(),
    watchGetCurrencies(),
  ]);
}
