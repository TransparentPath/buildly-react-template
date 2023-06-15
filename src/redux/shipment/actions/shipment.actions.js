export const SAVE_SHIPMENT_FORM_DATA = 'SHIPMENT/SAVE_SHIPMENT_FORM_DATA';

export const GET_SHIPMENTS = 'SHIPMENT/GET_SHIPMENTS';
export const GET_SHIPMENTS_SUCCESS = 'SHIPMENT/GET_SHIPMENTS_SUCCESS';
export const GET_SHIPMENTS_FAILURE = 'SHIPMENT/GET_SHIPMENTS_FAILURE';

export const ADD_SHIPMENT = 'SHIPMENT/ADD_SHIPMENT';
export const ADD_SHIPMENT_SUCCESS = 'SHIPMENT/ADD_SHIPMENT_SUCCESS';
export const ADD_SHIPMENT_FAILURE = 'SHIPMENT/ADD_SHIPMENT_FAILURE';

export const EDIT_SHIPMENT = 'SHIPMENT/EDIT_SHIPMENT';
export const EDIT_SHIPMENT_SUCCESS = 'SHIPMENT/EDIT_SHIPMENT_SUCCESS';
export const EDIT_SHIPMENT_FAILURE = 'SHIPMENT/EDIT_SHIPMENT_FAILURE';

export const DELETE_SHIPMENT = 'SHIPMENT/DELETE_SHIPMENT';
export const DELETE_SHIPMENT_SUCCESS = 'SHIPMENT/DELETE_SHIPMENT_SUCCESS';
export const DELETE_SHIPMENT_FAILURE = 'SHIPMENT/DELETE_SHIPMENT_FAILURE';

export const ADD_PDF_IDENTIFIER = 'SHIPMENT/ADD_PDF_IDENTIFIER';
export const ADD_PDF_IDENTIFIER_SUCCESS = 'SHIPMENT/ADD_PDF_IDENTIFIER_SUCCESS';
export const ADD_PDF_IDENTIFIER_FAILURE = 'SHIPMENT/ADD_PDF_IDENTIFIER_FAILURE';

export const GET_COUNTRIES_STATES = 'SHIPMENT/GET_COUNTRIES_STATES';
export const GET_COUNTRIES_STATES_SUCCESS = 'SHIPMENT/GET_COUNTRIES_STATES_SUCCESS';
export const GET_COUNTRIES_STATES_FAILURE = 'SHIPMENT/GET_COUNTRIES_STATES_FAILURE';

export const GET_CURRENCIES = 'SHIPMENT/GET_CURRENCIES';
export const GET_CURRENCIES_SUCCESS = 'SHIPMENT/GET_CURRENCIES_SUCCESS';
export const GET_CURRENCIES_FAILURE = 'SHIPMENT/GET_CURRENCIES_FAILURE';

/**
 * Save Shipment Form Data
 * @param {Object} formData
 */
export const saveShipmentFormData = (formData) => ({
  type: SAVE_SHIPMENT_FORM_DATA,
  formData,
});

/**
 * Get Shipment Details
 * @param {String} organization_uuid
 */
export const getShipmentDetails = (
  organization_uuid = null,
  status = null,
  fetchRelatedData = false,
) => ({
  type: GET_SHIPMENTS,
  organization_uuid,
  status,
  fetchRelatedData,
});

/**
 * Add Shipment
 * @param {Object} payload
 * @param {Object} history
 * @param {String} redirectTo
 */
export const addShipment = (payload, history, redirectTo) => ({
  type: ADD_SHIPMENT,
  payload,
  history,
  redirectTo,
});

/**
 * Edit Shipment
 * @param {Object} payload
 * @param {Object} history
 * @param {String} redirectTo
 */
export const editShipment = (payload, history, redirectTo) => ({
  type: EDIT_SHIPMENT,
  payload,
  history,
  redirectTo,
});

/**
 * Delete Shipment entity
 * @param {string} id
 */
export const deleteShipment = (id) => ({ type: DELETE_SHIPMENT, id });

/**
 * PDF Identifier
 * @param {FormData} data
 * @param {String} filename
 * @param {String} identifier
 * @param {Object} payload
 * @param {Object} history
 * @param {String} redirectTo
 * @param {String} organization_uuid
 */
export const pdfIdentifier = (
  data,
  filename,
  identifier,
  payload,
  history,
  redirectTo,
  organization_uuid,
) => ({
  type: ADD_PDF_IDENTIFIER,
  data,
  filename,
  identifier,
  payload,
  history,
  redirectTo,
  organization_uuid,
});

/**
 * Get countries and related states
 */
export const getCountries = () => ({ type: GET_COUNTRIES_STATES });

/**
 * Get currencies
 */
export const getCurrencies = () => ({ type: GET_CURRENCIES });
