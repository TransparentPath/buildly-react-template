import _ from 'lodash';
import {
  SAVE_SHIPMENT_FORM_DATA,
  GET_SHIPMENTS,
  GET_SHIPMENTS_FAILURE,
  GET_SHIPMENTS_SUCCESS,
  ADD_SHIPMENT,
  ADD_SHIPMENT_SUCCESS,
  ADD_SHIPMENT_FAILURE,
  EDIT_SHIPMENT,
  EDIT_SHIPMENT_SUCCESS,
  EDIT_SHIPMENT_FAILURE,
  DELETE_SHIPMENT,
  DELETE_SHIPMENT_SUCCESS,
  DELETE_SHIPMENT_FAILURE,
  ADD_PDF_IDENTIFIER,
  ADD_PDF_IDENTIFIER_SUCCESS,
  ADD_PDF_IDENTIFIER_FAILURE,
  GET_COUNTRIES_STATES,
  GET_COUNTRIES_STATES_SUCCESS,
  GET_COUNTRIES_STATES_FAILURE,
  GET_CURRENCIES,
  GET_CURRENCIES_SUCCESS,
  GET_CURRENCIES_FAILURE,
  GET_SHIPMENT_TEMPLATES,
  GET_SHIPMENT_TEMPLATES_SUCCESS,
  GET_SHIPMENT_TEMPLATES_FAILURE,
  ADD_SHIPMENT_TEMPLATE,
  ADD_SHIPMENT_TEMPLATE_SUCCESS,
  ADD_SHIPMENT_TEMPLATE_FAILURE,
} from '../actions/shipment.actions';

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  shipmentFormData: null,
  shipmentData: [],
  countries: [],
  currencies: [],
  templates: [],
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case SAVE_SHIPMENT_FORM_DATA:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: null,
        shipmentFormData: action.formData,
      };

    case GET_SHIPMENTS:
    case ADD_SHIPMENT:
    case EDIT_SHIPMENT:
    case DELETE_SHIPMENT:
    case ADD_PDF_IDENTIFIER:
    case GET_COUNTRIES_STATES:
    case GET_CURRENCIES:
    case GET_SHIPMENT_TEMPLATES:
    case ADD_SHIPMENT_TEMPLATE:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null,
      };

    case GET_SHIPMENTS_FAILURE:
    case ADD_SHIPMENT_FAILURE:
    case EDIT_SHIPMENT_FAILURE:
    case DELETE_SHIPMENT_FAILURE:
    case ADD_PDF_IDENTIFIER_FAILURE:
    case GET_COUNTRIES_STATES_FAILURE:
    case GET_CURRENCIES_FAILURE:
    case GET_SHIPMENT_TEMPLATES_FAILURE:
    case ADD_SHIPMENT_TEMPLATE_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.error,
      };

    case GET_SHIPMENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        shipmentData: action.data,
      };

    case ADD_SHIPMENT_SUCCESS:
    case EDIT_SHIPMENT_SUCCESS: {
      const found = _.find(
        state.shipmentData,
        { id: action.shipment.id },
      );
      const shipmentData = found
        ? _.map(state.shipmentData, (shipment) => (
          shipment.id === action.shipment.id
            ? action.shipment
            : shipment
        ))
        : [...state.shipmentData, action.shipment];
      return {
        ...state,
        loading: false,
        loaded: true,
        shipmentData,
      };
    }

    case DELETE_SHIPMENT_SUCCESS: {
      const shipmentData = _.filter(state.shipmentData, (shipment) => shipment.id !== action.id);

      return {
        ...state,
        loading: false,
        loaded: true,
        shipmentData,
      };
    }

    case ADD_PDF_IDENTIFIER_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        shipmentFormData: {
          ...state.shipmentFormData,
          uploaded_pdf: action.uploaded_pdf,
          uploaded_pdf_link: action.uploaded_pdf_link,
          unique_identifier: action.unique_identifier,
        },
      };

    case GET_COUNTRIES_STATES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        countries: action.countries,
      };

    case GET_CURRENCIES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        currencies: action.currencies,
      };

    case GET_SHIPMENT_TEMPLATES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        templates: action.data,
      };

    case ADD_SHIPMENT_TEMPLATE_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        templates: [...state.templates, action.data],
      };

    default:
      return state;
  }
};
