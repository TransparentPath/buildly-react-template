import * as actions from './custodian.actions';

// Test Get Custodians action
describe('Get Custodians action', () => {
  it('should create an action to get custodians', () => {
    const organization_uuid = '224761f5-0010-4a46-ba2f-d92a4fdc1d21';
    const expectedAction = {
      type: actions.GET_CUSTODIANS,
      organization_uuid,
    };
    expect(actions.getCustodians(organization_uuid))
      .toEqual(expectedAction);
  });
});

// Test Add Custodians action
describe('Add Custodian action', () => {
  it('should create an action to add custodian', () => {
    const payload = { id: 123, name: 'Abc' };
    const history = {};
    const redirectTo = '/test';
    const expectedAction = {
      type: actions.ADD_CUSTODIANS,
      payload,
      history,
      redirectTo,
    };
    expect(actions.addCustodians(payload, history, redirectTo))
      .toEqual(expectedAction);
  });
});

// Test Edit Custodian action
describe('Edit Custodian action', () => {
  it('should create an action to edit custodian', () => {
    const payload = { id: 123 };
    const history = {};
    const redirectTo = '/test';
    const expectedAction = {
      type: actions.EDIT_CUSTODIANS,
      payload,
      history,
      redirectTo,
    };
    expect(actions.editCustodian(payload, history, redirectTo))
      .toEqual(expectedAction);
  });
});

// Test Delete Custodian action
describe('Delete Custodian action', () => {
  it('should create an action to delete custodian', () => {
    const custodianId = '123';
    const contactObjId = '21';
    const organization_uuid = '224761f5-0010-4a46-ba2f-d92a4fdc1d21';
    const expectedAction = {
      type: actions.DELETE_CUSTODIANS,
      custodianId,
      contactObjId,
      organization_uuid,
    };
    expect(actions.deleteCustodian(
      custodianId,
      contactObjId,
      organization_uuid,
    )).toEqual(expectedAction);
  });
});

// Test Get Custodian Type action
describe('Get Custodian Type action', () => {
  it('should create an action to get custodian type', () => {
    const expectedAction = {
      type: actions.GET_CUSTODIAN_TYPE,
    };
    expect(actions.getCustodianType()).toEqual(expectedAction);
  });
});

// Test Get Contact action
describe('Get Contact action', () => {
  it('should create an action to get contact', () => {
    const organization_uuid = '224761f5-0010-4a46-ba2f-d92a4c1d21';
    const expectedAction = {
      type: actions.GET_CONTACT,
      organization_uuid,
    };
    expect(actions.getContact(organization_uuid))
      .toEqual(expectedAction);
  });
});

// Test Get Custody action
describe('Get Custody action', () => {
  it('should create an action to get custody', () => {
    const expectedAction = {
      type: actions.GET_CUSTODY,
    };
    expect(actions.getCustody()).toEqual(expectedAction);
  });
});

// Test Add Custody action
describe('Add Custody action', () => {
  it('should create an action to add custody', () => {
    const payload = {
      name: 'Test',
    };
    const expectedAction = {
      type: actions.ADD_CUSTODY,
      payload,
    };
    expect(actions.addCustody(payload)).toEqual(expectedAction);
  });
});

// Test Edit Custody action
describe('Edit Custody action', () => {
  it('should create an action to edit custody', () => {
    const payload = {
      name: 'Test Edited',
    };
    const expectedAction = {
      type: actions.EDIT_CUSTODY,
      payload,
    };
    expect(actions.editCustody(payload)).toEqual(expectedAction);
  });
});

// Test Add Custodian Type action
describe('Add Custodian Type action', () => {
  it('should create an action to add custodian type', () => {
    const payload = {
      name: 'Test',
      create_date: new Date(),
      edit_date: new Date(),
    };
    const expectedAction = {
      type: actions.ADD_CUSTODIAN_TYPE,
      payload,
    };
    expect(actions.addCustodianType(payload))
      .toEqual(expectedAction);
  });
});

// Test Edit Custodian Type action
describe('Edit Custodian Type action', () => {
  it('should create an action to edit custodian type', () => {
    const payload = {
      name: 'Test Edited',
      edit_date: new Date(),
    };
    const expectedAction = {
      type: actions.EDIT_CUSTODIAN_TYPE,
      payload,
    };
    expect(actions.editCustodianType(payload))
      .toEqual(expectedAction);
  });
});

// Test Delete Custodian Type action
describe('Delete Custodian Type action', () => {
  it('should create an action to delete custodian type', () => {
    const id = 1;
    const expectedAction = {
      type: actions.DELETE_CUSTODIAN_TYPE,
      id,
    };
    expect(actions.deleteCustodianType(id)).toEqual(expectedAction);
  });
});
