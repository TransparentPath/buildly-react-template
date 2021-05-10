import React, { useState, useContext } from 'react';
import { connect } from 'react-redux';
import {
  makeStyles,
  TextField,
  Box,
  Checkbox,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckBox as CheckBoxIcon,
} from '@material-ui/icons';
import DataTable from '@components/Table/Table';
import { UserContext } from '@context/User.context';
import {
  getFormattedRow,
  getFormattedSensorRow,
  getAvailableGateways,
} from '@pages/SensorsGateway/Constants';
import { editShipment } from '@redux/shipment/actions/shipment.actions';
import { routes } from '@routes/routesConstants';
import { checkIfCustodianInfoEdited } from './custodian-info/AddCustodyForm';
import { gatewayColumns, sensorsColumns } from '../ShipmentConstants';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > * + *': {
      marginTop: theme.spacing(3),
    },
  },
  buttonContainer: {
    margin: theme.spacing(8, 0),
    textAlign: 'center',
    justifyContent: 'center',
  },
  alignRight: {
    marginLeft: 'auto',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  loadingWrapper: {
    position: 'relative',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      width: '70%',
      margin: 'auto',
    },
  },
  submit: {
    borderRadius: '18px',
    fontSize: 11,
  },
}));

// eslint-disable-next-line import/no-mutable-exports
export let checkIfSensorGatewayEdited = () => false;

const SensorsGatewayInfo = ({
  gatewayData,
  gatewayTypeList,
  shipmentData,
  history,
  loading,
  handleNext,
  handleCancel,
  shipmentFormData,
  dispatch,
  sensorData,
  sensorTypeList,
  viewOnly,
  setConfirmModal,
  setConfirmModalFor,
}) => {
  const classes = useStyles();
  const [gatewayIds, setGatewayIds] = useState(
    (shipmentFormData && shipmentFormData.gateway_ids) || [],
  );
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
  const organization = useContext(UserContext).organization.organization_uuid;

  let rows = [];
  let sensorsRow = [];
  const columns = gatewayColumns;
  if (gatewayData && gatewayData.length) {
    const selectedRows = [];
    const selectedSensors = [];
    gatewayData.forEach((element) => {
      if (gatewayIds.indexOf(element.gateway_uuid) !== -1) {
        selectedRows.push(element);
        if (sensorData && sensorData.length) {
          sensorData.forEach((sensor) => {
            if (element.url === sensor.gateway) {
              selectedSensors.push(sensor);
            }
          });
        }
      }
    });
    rows = getFormattedRow(selectedRows, gatewayTypeList, shipmentData);
    sensorsRow = getFormattedSensorRow(selectedSensors, sensorTypeList);
  }

  const onInputChange = (value) => {
    setGatewayIds(value.map((val) => val.gateway_uuid));
  };

  const submitDisabled = () => !gatewayIds.length || gatewayData === null;

  // eslint-disable-next-line max-len
  checkIfSensorGatewayEdited = () => Boolean(gatewayIds.length !== shipmentFormData.gateway_ids.length);

  /**
   * Submit The form and add/edit custodian
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const shipmentFormValue = {
      ...{ ...shipmentFormData, gateway_ids: gatewayIds },
    };
    dispatch(
      editShipment(
        shipmentFormValue,
        history,
        `${routes.SHIPMENT}/edit/:${shipmentFormData.id}`,
        organization,
      ),
    );
  };

  const onNextClick = () => {
    if (checkIfSensorGatewayEdited()) {
      setConfirmModalFor('next');
      setConfirmModal(true);
    } else {
      handleNext();
    }
  };

  const onCancelClick = () => {
    if (checkIfSensorGatewayEdited()) {
      setConfirmModalFor('close');
      setConfirmModal(true);
    } else {
      handleCancel();
    }
  };
  return (
    <Box mb={5} mt={3}>
      <form noValidate onSubmit={handleSubmit}>
        <Card variant="outlined" className={classes.form}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  id="combo-box-demo"
                  disabled={viewOnly}
                  options={
                    (gatewayData
                      && getAvailableGateways(
                        gatewayData,
                        shipmentFormData.platform_name
                          ? shipmentFormData.platform_name.toLowerCase()
                          : 'iclp',
                        gatewayTypeList,
                        shipmentData,
                      ))
                    || []
                  }
                  getOptionLabel={(option) => option && option.name}
                  filterSelectedOptions
                  onChange={(event, newValue) => onInputChange(newValue)}
                  defaultValue={rows}
                  renderOption={(option, { selected }) => (
                    <>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.name}
                    </>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      disabled={viewOnly}
                      label="Associate to Gateway"
                      variant="outlined"
                      placeholder="Select a Gateway"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Box mt={3} mb={5}>
          <Grid container>
            {rows.length > 0 && (
              <Grid item xs={12}>
                <Box mt={5}>
                  <Typography gutterBottom variant="h5">
                    Associated Gateways
                  </Typography>
                  <DataTable
                    rows={rows || []}
                    columns={columns}
                    hasSearch={false}
                  />
                </Box>
              </Grid>
            )}
            {sensorsRow.length > 0 && (
              <Grid item xs={12}>
                <Box mt={5}>
                  <Typography gutterBottom variant="h5">
                    Associated Sensors with Gateway
                  </Typography>
                  <DataTable
                    rows={sensorsRow || []}
                    columns={sensorsColumns}
                    hasSearch={false}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
        <Grid container spacing={3} className={classes.buttonContainer}>
          <Grid item xs={6} sm={2}>
            {viewOnly ? (
              <Button
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={onCancelClick}
              >
                Done
              </Button>
            ) : (
                <div className={classes.loadingWrapper}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    disabled={loading || submitDisabled()}
                  >
                    Save
                </Button>
                  {loading && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </div>
              )}
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={onNextClick}
              className={classes.submit}
            >
              Next: Environmental Limits
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.sensorsGatewayReducer,
  ...state.shipmentReducer,
});

export default connect(mapStateToProps)(SensorsGatewayInfo);
