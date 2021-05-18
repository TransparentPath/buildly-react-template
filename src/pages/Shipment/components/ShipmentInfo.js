import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  Button,
  useTheme,
  makeStyles,
  useMediaQuery,
  Grid,
  TextField,
  Typography,
  Box,
  MenuItem,
  CircularProgress,
  Checkbox,
  InputAdornment,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import DatePickerComponent from '@components/DatePicker/DatePicker';
import CustomizedTooltips from '@components/ToolTip/ToolTip';
import { UserContext } from '@context/User.context';
import { useInput } from '@hooks/useInput';
import {
  editShipment,
  addShipment,
  saveShipmentFormData,
} from '@redux/shipment/actions/shipment.actions';
import { routes } from '@routes/routesConstants';
import {
  SHIPMENT_STATUS,
  TRANSPORT_MODE,
  SENSOR_PLATFORM,
} from '@utils/mock';
import { setOptionsData } from '@utils/utilMethods';
import { validators } from '@utils/validators';
import ShipmentRouteInfo from './ShipmentRouteInfo';

const useStyles = makeStyles((theme) => ({
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
  buttonContainer: {
    margin: theme.spacing(8, 0),
    textAlign: 'center',
    justifyContent: 'center',
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
}));

// eslint-disable-next-line import/no-mutable-exports
export let checkIfShipmentInfoEdited;

const ShipmentInfo = (props) => {
  const {
    handleNext,
    shipmentFormData,
    history,
    loading,
    dispatch,
    handleCancel,
    location,
    shipmentFlag,
    unitsOfMeasure,
    shipmentOptions,
    viewOnly,
    setConfirmModal,
    setConfirmModalFor,
  } = props;
  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const editPage = location.state && location.state.type === 'edit';
  const editData = location.state && location.state.data;

  const shipment_name = useInput(
    (editData && editData.name) || '',
    { required: true },
  );
  const lading_bill = useInput(
    (editData && editData.bol_order_id) || '',
  );
  const load_no = useInput('');
  const shipment_status = useInput(
    (editData && editData.status) || '',
    { required: true },
  );
  const route_desc = useInput(
    (editData && editData.route_description) || '',
  );
  const mode_type = useInput(
    (editData && editData.transport_mode) || '',
  );
  const route_dist = useInput('');
  const [scheduled_departure, handleDepartureDateChange] = useState(
    (editData && new Date(editData.estimated_time_of_departure))
    || new Date(),
  );
  const [scheduled_arrival, handleScheduledDateChange] = useState(
    (editData && new Date(editData.estimated_time_of_arrival))
    || new Date(),
  );
  const [flags, setFlags] = useState(
    (editData && editData.flags) || [],
  );
  const [uom_temp, setUomTemp] = useState(
    (editData && editData.uom_temp) || '',
  );
  const [uom_weight, setUomWeight] = useState(
    (editData && editData.uom_weight) || '',
  );
  const [uom_distance, setUomDistance] = useState(
    (editData && editData.uom_distance) || '',
  );
  const [platform_name, setPlatformName] = useState(
    (editData && editData.platform_name) || 'ICLP',
  );

  const [formError, setFormError] = useState({});
  const [fieldsMetadata, setFieldsMetaData] = useState({
    shipment_name: '',
    shipment_status: '',
    lading_bill: '',
    route_desc: '',
    mode_type: '',
    scheduled_departure: '',
    scheduled_arrival: '',
    flags: '',
    uom_temp: '',
    uom_distance: '',
    uom_weight,
    platform_name: '',
  });

  const shipmentFlags = (editData && editData.flags) || [];
  const organization = useContext(UserContext).organization.organization_uuid;

  useEffect(() => {
    if (editPage && shipmentFormData === null) {
      dispatch(saveShipmentFormData(editData));
    }
  }, []);

  useEffect(() => {
    const metadata = { ...fieldsMetadata };
    if (shipmentOptions && shipmentOptions.actions) {
      metadata.shipment_name = setOptionsData(
        shipmentOptions.actions.POST,
        'name',
      );
      metadata.shipment_status = setOptionsData(
        shipmentOptions.actions.POST,
        'status',
      );
      metadata.route_desc = setOptionsData(
        shipmentOptions.actions.POST,
        'route_description',
      );
      metadata.lading_bill = setOptionsData(
        shipmentOptions.actions.POST,
        'bol_order_id',
      );
      metadata.mode_type = setOptionsData(
        shipmentOptions.actions.POST,
        'transport_mode',
      );
      metadata.scheduled_departure = setOptionsData(
        shipmentOptions.actions.POST,
        'estimated_time_of_departure',
      );
      metadata.scheduled_arrival = setOptionsData(
        shipmentOptions.actions.POST,
        'estimated_time_of_arrival',
      );
      metadata.flags = setOptionsData(
        shipmentOptions.actions.POST,
        'flags',
      );
      metadata.uom_temp = setOptionsData(
        shipmentOptions.actions.POST,
        'uom_temp',
      );
      metadata.uom_distance = setOptionsData(
        shipmentOptions.actions.POST,
        'uom_distance',
      );
      metadata.uom_weight = setOptionsData(
        shipmentOptions.actions.POST,
        'uom_weight',
      );
      metadata.platform_name = setOptionsData(
        shipmentOptions.actions.POST,
        'platform_name',
      );
    }

    setFieldsMetaData(metadata);
  }, [shipmentOptions]);

  useEffect(() => {
    if (unitsOfMeasure && unitsOfMeasure.length) {
      _.forEach(unitsOfMeasure, (unit) => {
        if (
          _.includes(
            _.lowerCase(unit.supported_class),
            'temp',
          ) && unit.is_default_for_class
        ) {
          setUomTemp(unit.url);
        } else if (
          _.includes(
            _.lowerCase(unit.supported_class),
            'distance',
          ) && unit.is_default_for_class
        ) {
          setUomDistance(unit.url);
        } else if (
          _.includes(
            _.lowerCase(unit.supported_class),
            'weight',
          ) && unit.is_default_for_class
        ) {
          setUomWeight(unit.url);
        }
      });
    }
  }, [unitsOfMeasure]);

  /**
   * Handle input field blur event
   * @param {Event} e Event
   * @param {String} validation validation type if any
   * @param {Object} input input field
   */

  const handleBlur = (e, validation, input, parentId) => {
    const validateObj = validators(validation, input);
    const prevState = { ...formError };
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e.target.id || parentId]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [e.target.id || parentId]: {
          error: false,
          message: '',
        },
      });
    }
  };

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!shipment_name.value) {
      return true;
    }
    let errorExists = false;
    _.forEach(errorKeys, (key) => {
      if (formError[key].error) {
        errorExists = true;
      }
    });
    return errorExists;
  };

  /**
   * Submit The form and add/edit custodian
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const shipmentFormValue = {
      name: shipment_name.value,
      status: shipment_status.value,
      bol_order_id: lading_bill.value,
      route_description: route_desc.value,
      transport_mode: mode_type.value,
      estimated_time_of_arrival: scheduled_arrival,
      estimated_time_of_departure: scheduled_departure,
      ...(editData && { id: editData.id }),
      items: (editData && editData.items) || [],
      gateway_ids: (editData && editData.gateway_ids) || [],
      sensor_report_ids: (
        editData
        && editData.sensor_report_ids
      ) || [],
      wallet_ids: (editData && editData.wallet_ids) || [],
      custodian_ids: (editData && editData.custodian_ids) || [],
      flags,
      uom_distance,
      uom_temp,
      uom_weight,
      organization_uuid: organization,
      platform_name,
    };

    if (editPage && editData) {
      dispatch(
        editShipment(
          shipmentFormValue,
          history,
          `${routes.SHIPMENT}/edit/:${editData.id}`,
          organization,
        ),
      );
    } else {
      dispatch(addShipment(shipmentFormValue, history, organization));
    }
  };

  const onShipmentFlagChange = (value) => {
    setFlags(_.map(value, 'url'));
  };

  checkIfShipmentInfoEdited = () => (
    shipment_name.hasChanged()
    || lading_bill.hasChanged()
    || load_no.hasChanged()
    || shipment_status.hasChanged()
    || route_desc.hasChanged()
    || mode_type.hasChanged()
    || route_dist.hasChanged()
    || (flags.length !== shipmentFlags.length)
  );

  const onNextClick = (event) => {
    if (checkIfShipmentInfoEdited() === true) {
      handleSubmit(event);
    }
    handleNext();
  };

  const onCancelClick = () => {
    if (checkIfShipmentInfoEdited() === true) {
      setConfirmModalFor('close');
      setConfirmModal(true);
    } else {
      handleCancel();
    }
  };
  return (
    <>
      <div>
        {!isDesktop && (
          <Box mb={2}>
            <Typography variant="h4">
              Shipment Details (1/5)
            </Typography>
          </Box>
        )}
        <form
          className={classes.form}
          noValidate
          onSubmit={handleSubmit}
        >
          <Box mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Grid
                  container
                  spacing={isDesktop ? 2 : 0}
                >
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      required
                      id="shipment_name"
                      label="Shipment name"
                      name="shipment_name"
                      autoComplete="shipment_name"
                      disabled={viewOnly}
                      error={
                        formError.shipment_name
                        && formError.shipment_name.error
                      }
                      helperText={
                        formError.shipment_name
                          ? formError.shipment_name.message
                          : ''
                      }
                      onBlur={(e) => handleBlur(e, 'required', shipment_name)}
                      {...shipment_name.bind}
                      InputProps={
                        fieldsMetadata.shipment_name.help_text
                        && {
                          endAdornment: (
                            <InputAdornment position="end">
                              <CustomizedTooltips
                                toolTipText={
                                  fieldsMetadata.shipment_name.help_text
                                }
                              />
                            </InputAdornment>
                          ),
                        }
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      id="lading_bill"
                      label="Bill of lading"
                      name="lading_bill"
                      autoComplete="lading_bill"
                      disabled={viewOnly}
                      {...lading_bill.bind}
                      InputProps={
                        fieldsMetadata.lading_bill.help_text
                        && {
                          endAdornment: (
                            <InputAdornment position="end">
                              <CustomizedTooltips
                                toolTipText={
                                  fieldsMetadata.lading_bill.help_text
                                }
                              />
                            </InputAdornment>
                          ),
                        }
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      required
                      id="mode_type"
                      select
                      label="Mode type"
                      disabled={viewOnly}
                      {...mode_type.bind}
                      InputProps={
                        fieldsMetadata.mode_type.help_text
                        && {
                          endAdornment: (
                            <InputAdornment position="start">
                              <CustomizedTooltips
                                toolTipText={
                                  fieldsMetadata.mode_type.help_text
                                }
                              />
                            </InputAdornment>
                          ),
                        }
                      }
                    >
                      <MenuItem value="">Select</MenuItem>
                      {TRANSPORT_MODE
                      && _.map(
                        _.orderBy(TRANSPORT_MODE, ['value'], ['asc']),
                        (item, index) => (
                          <MenuItem
                            key={`transportMode${index}:${item.value}`}
                            value={item.value}
                          >
                            {item.label}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      multiline
                      rows={6}
                      id="route_desc"
                      label="Route description"
                      name="route_desc"
                      autoComplete="route_desc"
                      disabled={viewOnly}
                      {...route_desc.bind}
                      InputProps={
                        fieldsMetadata.route_desc.help_text
                        && {
                          endAdornment: (
                            <InputAdornment position="end">
                              <CustomizedTooltips
                                toolTipText={
                                  fieldsMetadata.route_desc.help_text
                                }
                              />
                            </InputAdornment>
                          ),
                        }
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      required
                      id="uom_temp"
                      select
                      label="Unit of measure temperature"
                      disabled={viewOnly}
                      value={uom_temp}
                      onChange={(e) => setUomTemp(e.target.value)}
                      InputProps={
                        fieldsMetadata.uom_temp.help_text
                        && {
                          endAdornment: (
                            <InputAdornment position="start">
                              <CustomizedTooltips
                                toolTipText={
                                  fieldsMetadata.uom_temp.help_text
                                }
                              />
                            </InputAdornment>
                          ),
                        }
                      }
                    >
                      <MenuItem value="">Select</MenuItem>
                      {unitsOfMeasure
                      && _.map(
                        _.orderBy(
                          _.filter(unitsOfMeasure, { supported_class: 'Temperature' }),
                          ['name'],
                          ['asc'],
                        ),
                        (item, index) => (
                          <MenuItem
                            key={`temperature${index}:${item.id}`}
                            value={item.url}
                          >
                            {item.name}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      required
                      id="platform_name"
                      select
                      label="Sensor Platform"
                      disabled={viewOnly}
                      value={platform_name}
                      onChange={(e) => setPlatformName(e.target.value)}
                      InputProps={
                        fieldsMetadata.platform_name.help_text
                        && {
                          endAdornment: (
                            <InputAdornment position="start">
                              <CustomizedTooltips
                                toolTipText={
                                  fieldsMetadata.platform_name.help_text
                                }
                              />
                            </InputAdornment>
                          ),
                        }
                      }
                    >
                      <MenuItem value="">Select</MenuItem>
                      {SENSOR_PLATFORM
                      && _.map(
                        _.orderBy(SENSOR_PLATFORM, ['value'], ['asc']),
                        (item, index) => (
                          <MenuItem
                            key={`sensorPlatform${index}:${item.value}`}
                            value={item.value}
                          >
                            {item.label}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      required
                      id="shipment_status"
                      name="shipment_status"
                      select
                      label="Shipment status"
                      disabled={viewOnly}
                      {...shipment_status.bind}
                      InputProps={
                        fieldsMetadata.shipment_status.help_text
                        && {
                          endAdornment: (
                            <InputAdornment position="start">
                              <CustomizedTooltips
                                toolTipText={
                                  fieldsMetadata.shipment_status.help_text
                                }
                              />
                            </InputAdornment>
                          ),
                        }
                      }
                    >
                      <MenuItem value="">Select</MenuItem>
                      {SHIPMENT_STATUS
                      && _.map(
                        _.orderBy(SHIPMENT_STATUS, ['value'], ['asc']),
                        (item, index) => (
                          <MenuItem
                            key={`shipmentStatus${index}:${item.value}`}
                            value={item.value}
                          >
                            {item.label}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <DatePickerComponent
                      label="Scheduled departure"
                      selectedDate={scheduled_departure}
                      hasTime
                      handleDateChange={handleDepartureDateChange}
                      disabled={viewOnly}
                      helpText={
                        fieldsMetadata.scheduled_departure
                        && fieldsMetadata.scheduled_departure.help_text
                          ? fieldsMetadata.scheduled_departure.help_text
                          : ''
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DatePickerComponent
                      label="Scheduled arrival"
                      selectedDate={scheduled_arrival}
                      hasTime
                      handleDateChange={handleScheduledDateChange}
                      disabled={viewOnly}
                      helpText={
                        fieldsMetadata.scheduled_arrival
                        && fieldsMetadata.scheduled_arrival.help_text
                          ? fieldsMetadata.scheduled_arrival.help_text
                          : ''
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Autocomplete
                        multiple
                        id="tags-outlined"
                        disabled={viewOnly}
                        options={shipmentFlag || []}
                        getOptionLabel={(option) => (
                          option
                            ? `${option.name} (${option.type})`
                            : ''
                        )}
                        getOptionSelected={(option, value) => `${option.name} (${option.type})` === `${value.name} (${value.type})`}
                        style={{ flex: 1 }}
                        onChange={(event, newValue) => onShipmentFlagChange(newValue)}
                        value={
                          (
                            shipmentFlag
                            && _.filter(
                              shipmentFlag,
                              (flag) => _.indexOf(flags, flag.url) !== -1,
                            )
                          ) || []
                        }
                        renderOption={(option, { selected }) => (
                          <>
                            <Checkbox
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {`${option.name} (${option.type})`}
                          </>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label="Violations/Warnings"
                            placeholder="Select"
                            disabled={viewOnly}
                            margin="normal"
                          />
                        )}
                      />
                      {fieldsMetadata.flags
                      && fieldsMetadata.flags.help_text
                      && (
                        <CustomizedTooltips
                          toolTipText={
                            fieldsMetadata.flags.help_text
                          }
                        />
                      )}
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      required
                      id="uom_distance"
                      select
                      label="Unit of measure distance"
                      value={uom_distance}
                      disabled={viewOnly}
                      onChange={(e) => setUomDistance(e.target.value)}
                      InputProps={
                        fieldsMetadata.uom_distance.help_text
                        && {
                          endAdornment: (
                            <InputAdornment position="start">
                              <CustomizedTooltips
                                toolTipText={
                                  fieldsMetadata.uom_distance.help_text
                                }
                              />
                            </InputAdornment>
                          ),
                        }
                      }
                    >
                      <MenuItem value="">Select</MenuItem>
                      {unitsOfMeasure
                      && _.map(
                        _.orderBy(
                          _.filter(unitsOfMeasure, { supported_class: 'Distance and Length' }),
                          ['name'],
                          ['asc'],
                        ),
                        (item, index) => (
                          <MenuItem
                            key={`lengthUnit${index}:${item.id}`}
                            value={item.url}
                          >
                            {item.name}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      required
                      id="uom_weight"
                      select
                      label="Unit of measure mass/weight"
                      value={uom_weight}
                      disabled={viewOnly}
                      onChange={(e) => setUomWeight(e.target.value)}
                      InputProps={
                        fieldsMetadata.uom_weight.help_text
                        && {
                          endAdornment: (
                            <InputAdornment position="start">
                              <CustomizedTooltips
                                toolTipText={
                                  fieldsMetadata.uom_weight.help_text
                                }
                              />
                            </InputAdornment>
                          ),
                        }
                      }
                    >
                      <MenuItem value="">Select</MenuItem>
                      {unitsOfMeasure
                      && _.map(
                        _.orderBy(
                          _.filter(unitsOfMeasure, { supported_class: 'Mass and Weight' }),
                          ['name'],
                          ['asc'],
                        ),
                        (item, index) => (
                          <MenuItem
                            key={`weightUnit${index}:${item.id}`}
                            value={item.url}
                          >
                            {item.name}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  </Grid>
                </Grid>
              </Grid>
              {(shipmentFormData || editPage) && (
                <Grid item xs={12}>
                  <ShipmentRouteInfo {...props} />
                </Grid>
              )}
            </Grid>
          </Box>
          <Grid
            container
            spacing={3}
            className={classes.buttonContainer}
          >
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
                disabled={shipmentFormData === null}
                className={classes.submit}
              >
                Save & Next: Shipment Key
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.shipmentReducer,
  ...state.itemsReducer,
  ...state.custodianReducer,
  ...state.optionsReducer,
  loading: (
    state.shipmentReducer.loading
    || state.itemsReducer.loading
    || state.custodianReducer.loading
    || state.optionsReducer.loading
  ),
});

export default connect(mapStateToProps)(ShipmentInfo);
