import * as actions from './shipment.actions';

// Test Save Shipment Form Data action
describe('Save Shipment Form Data action', () => {
  it('should create an action to save shipment form data', () => {
    const formData = { name: 'Test Shipment' };
    const expectedAction = {
      type: actions.SAVE_SHIPMENT_FORM_DATA,
      formData,
    };
    expect(actions.saveShipmentFormData(formData))
      .toEqual(expectedAction);
  });
});

// Test Get Shipment Details action
describe('Get Shipment Details action', () => {
  it('should create an action to get shipment details', () => {
    const organization_uuid = 'gweiug-3t2igf-3yfhf-329hgds73';
    const expectedAction = {
      type: actions.GET_SHIPMENTS,
      organization_uuid,
      status: null,
      fetchRelatedData: false,
    };
    expect(actions.getShipmentDetails(organization_uuid)).toEqual(expectedAction);
  });
});

// Test Add Shipment action
describe('Add Shipment action', () => {
  it('should create an action to add shipment', () => {
    const payload = { name: 'Test Shipment New' };
    const history = {};
    const redirectTo = '/test';
    const expectedAction = {
      type: actions.ADD_SHIPMENT,
      payload,
      history,
      redirectTo,
    };
    expect(actions.addShipment(payload, history, redirectTo)).toEqual(expectedAction);
  });
});

// Test Edit Shipment action
describe('Edit Shipment action', () => {
  it('should create an action to edit shipment', () => {
    const payload = { name: 'Test Shipment New Edited' };
    const history = {};
    const redirectTo = '/test';
    const expectedAction = {
      type: actions.EDIT_SHIPMENT,
      payload,
      history,
      redirectTo,
    };
    expect(actions.editShipment(payload, history, redirectTo)).toEqual(expectedAction);
  });
});

// Test Delete Shipment action
describe('Delete Shipment action', () => {
  it('should create an action to delete shipment', () => {
    const id = 1;
    const expectedAction = { type: actions.DELETE_SHIPMENT, id };
    expect(actions.deleteShipment(id)).toEqual(expectedAction);
  });
});

// Test Add PDF Identifier action
describe('Add PDF Identifier action', () => {
  it('should create an action to add PDF identifier', () => {
    const data = { file: 'test.pdf' };
    const filename = 'test';
    const identifier = 'Reciept Number';
    const payload = { identifier: { 'Reciept Number': 'test' } };
    const history = {};
    const redirectTo = '/test';
    const organization_uuid = 'gweiug-3t2igf-3yfhf-329hgds73';
    const expectedAction = {
      type: actions.ADD_PDF_IDENTIFIER,
      data,
      filename,
      identifier,
      payload,
      history,
      redirectTo,
      organization_uuid,
    };
    expect(actions.pdfIdentifier(
      data,
      filename,
      identifier,
      payload,
      history,
      redirectTo,
      organization_uuid,
    )).toEqual(expectedAction);
  });
});

// Test Get countries and related states action
describe('Get countries and related states action', () => {
  it('should create an action to get countries and related states', () => {
    const expectedAction = { type: actions.GET_COUNTRIES_STATES };
    expect(actions.getCountries()).toEqual(expectedAction);
  });
});

// Test Get currencies action
describe('Get currencies action', () => {
  it('should create an action to get currencies', () => {
    const expectedAction = { type: actions.GET_CURRENCIES };
    expect(actions.getCurrencies()).toEqual(expectedAction);
  });
});
