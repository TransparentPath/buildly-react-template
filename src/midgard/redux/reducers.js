// react library imports
import { combineReducers } from "redux";
import authReducer from "./authuser/reducers/authuser.reducer";
import coreuserReducer from "./coreuser/coreuser.reducer";
import coreGroupReducer from "./coregroup/reducers/coregroup.reducer";
import crudDataReducer from "midgard/modules/crud/redux/crud.reducer";
import alertReducer from "./alert/reducers/alert.reducer";
import custodianReducer from "./custodian/reducers/custodian.reducer";
import itemsReducer from "./items/reducers/items.reducer";
import sensorsGatewayReducer from "./sensorsGateway/reducers/sensorsGateway.reducer";
import shipmentReducer from "./shipment/reducers/shipment.reducers";
import { LOGOUT_SUCCESS } from "./authuser/actions/authuser.actions";

const appReducer = combineReducers({
  //entryPointForGulpStart
  //entryPointForGulpEnd
  authReducer,
  coreuserReducer,
  coreGroupReducer,
  crudDataReducer,
  alertReducer,
  custodianReducer,
  itemsReducer,
  sensorsGatewayReducer,
  shipmentReducer,
});

const rootReducer = (state, action) => {
  if (action.type === LOGOUT_SUCCESS) {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
