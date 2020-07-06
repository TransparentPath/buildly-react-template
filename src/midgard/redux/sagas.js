// react library imports
import authSaga from "./authuser/sagas/authuser.saga";
import crudSaga from "midgard/modules/crud/redux/crud.saga";
import { all } from "redux-saga/effects";
import coreUserSaga from "midgard/redux/coreuser/coreuser.saga";
import coreGroupSaga from "./coregroup/sagas/coregroup.saga";
import custodianSaga from "./custodian/sagas/custodian.saga";
import itemSaga from "./items/sagas/items.saga";
import sensorsGatewaySaga from "./sensorsGateway/sagas/sensorsGateway.saga";
import shipmentSaga from "./shipment/sagas/shipment.saga";

// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield all([
    // import all sagas and call them here:
    //entryPointForGulpStart
    //entryPointForGulpEnd
    authSaga(),
    custodianSaga(),
    coreUserSaga(),
    coreGroupSaga(),
    crudSaga(),
    itemSaga(),
    sensorsGatewaySaga(),
    shipmentSaga(),
  ]);
}
