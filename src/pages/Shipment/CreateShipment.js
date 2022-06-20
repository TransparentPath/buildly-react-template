import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import Geocode from 'react-geocode';
import _ from 'lodash';
import moment from 'moment-timezone';
import { routes } from '../../routes/routesConstants';
import { MapComponent } from '../../components/MapComponent/MapComponent';
import {
  Button,
  useTheme,
  useMediaQuery,
  Grid,
  TextField,
  Typography,
  Box,
  MenuItem,
  FormControl,
  FormLabel,
  Divider,
  Autocomplete,
  Chip,
  Checkbox,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckBox as CheckBoxIcon,
} from '@mui/icons-material';
import {
  TempIcon,
  HumidIcon,
} from '../../components/Icons/Icons';
import { makeStyles } from '@mui/styles';
import Loader from '../../components/Loader/Loader';
import { UserContext } from '../../context/User.context';
import { checkForGlobalAdmin } from '../../utils/utilMethods';
import DatePickerComponent from '../../components/DatePicker/DatePicker';
import { useInput } from '../../hooks/useInput';
import {
  getCustodians,
  getCustodianType,
  getContact,
  addCustody,
  editCustody,
} from '../../redux/custodian/actions/custodian.actions';
import {
  getItems,
  getItemType,
  getUnitsOfMeasure,
} from '../../redux/items/actions/items.actions';
import {
  getGateways,
  getGatewayType,
  getSensors,
  getSensorType,
  editGateway,
} from '../../redux/sensorsGateway/actions/sensorsGateway.actions';
import {
  getShipmentDetails,
  editShipment,
  addShipment,
  saveShipmentFormData,
} from '../../redux/shipment/actions/shipment.actions';
import {
  SENSOR_PLATFORM,
  TRANSPORT_MODE,
} from '../../utils/mock';
import { validators } from '../../utils/validators';
import {
  getGatewayFormattedRow,
  getSensorFormattedRow,
  getAvailableGateways,
} from '../../pages/SensorsGateway/Constants';
import { getItemFormattedRow } from '../../pages/Items/ItemsConstants';
import { getCustodianFormattedRow } from '../../pages/Custodians/CustodianConstants';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  dashboardHeading: {
    fontWeight: 'bold',
    marginBottom: '0.5em',
  },
  formTitle: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
  },
  fieldset: {
    border: '1px solid #EBC645',
    padding: '2rem',
    borderRadius: '1rem',
    width: '80%',
    marginTop: '1rem',
  },
  legend: {
    fontSize: '0.8rem',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  submit: {
    borderRadius: '18px',
    fontSize: '14px',
  },
  buttonContainer: {
    width: '80%',
    margin: theme.spacing(2, 0),
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
  inputWithTooltip: {
    display: 'flex',
    alignItems: 'center',
  },
  divider: {
    width: '100%',
    marginTop: '10px',
    borderWidth: '1px',
    borderColor: theme.palette.primary.main,
  },
  autoComplete: {
    marginTop: '0px',
    width: '100%',
  },
  envInput: {
    margin: '1.2rem 0px',
  },
  flexContainer: {
    display: 'flex', justifyContent: 'space-around', flexDirection: 'row',
  },
  smallInput: {
    width: '20%',
    marginLeft: '16px',
    flex: '1',
  },
}));

const CreateShipment = (props) => {
  const {
    shipmentFormData,
    history,
    loading,
    dispatch,
    location,
    unitsOfMeasure,
    timezone,
    gatewayData,
    itemData,
    custodianData,
    contactInfo,
    itemTypeList,
    gatewayTypeList,
    sensorData,
    sensorTypeList,
    shipmentData,
    custodyData,
    aggregateReportData,
  } = props;
  const classes = useStyles();
  const user = useContext(UserContext);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const editPage = location.state && location.state.type === 'edit';
  const editData = location.state && location.state.data;
  const copyData = (location.state
    && location.state.type === 'copy'
    && location.state.data) || {};

  // For non-admins the forms becomes view-only once the shipment status is no longer just planned
  const viewOnly = !checkForGlobalAdmin(user)
    && editPage
    && editData
    && editData.status
    && _.lowerCase(editData.status) !== 'planned';

  const { organization } = useContext(UserContext);
  const { organization_uuid } = organization;

  const [shipment_name, setShipmentName] = useState(
    (editData && editData.name) || '',
  );
  const purchase_order_number = useInput(
    (editData && editData.purchase_order_number) || '',
  );
  const order_number = useInput(
    (editData && editData.order_number) || '',
  );
  const shipper_number = useInput(
    (editData && editData.shipper_number) || '',
  );
  const carrier = useInput(
    (editData && editData.carrier) || '',
    { required: true },
  );
  const mode_type = useInput(
    (editData && editData.transport_mode) || '',
  );
  const [scheduled_departure, handleDepartureDateChange] = useState(
    (editData && editData.estimated_time_of_departure)
    || new Date(),
  );
  const [scheduled_arrival, handleScheduledDateChange] = useState(
    (editData && editData.estimated_time_of_arrival)
    || new Date(),
  );
  const [min_temp_val, changeMinTempVal] = useState(
    (shipmentFormData && shipmentFormData.min_excursion_temp) || 0,
  );
  const [max_temp_val, changeMaxTempVal] = useState(
    (shipmentFormData && shipmentFormData.max_excursion_temp) || 100,
  );
  const [minMaxTempValue, setMinMaxTempValue] = useState(
    shipmentFormData && [
      shipmentFormData.min_excursion_temp || 0,
      shipmentFormData.max_excursion_temp || 100,
    ],
  );

  const [min_humid_val, changeMinHumidVal] = useState(
    (shipmentFormData && shipmentFormData.min_excursion_humidity) || 0,
  );
  const [max_humid_val, changeMaxHumidVal] = useState(
    (shipmentFormData && shipmentFormData.max_excursion_humidity) || 100,
  );
  const [minMaxHumidValue, setMinMaxHumidValue] = useState(
    shipmentFormData && [
      shipmentFormData.min_excursion_humidity || 0,
      shipmentFormData.max_excursion_humidity || 100,
    ],
  );

  let latLongChanged = false;

  const [custodianList, setCustodianList] = useState([]);
  const [start_of_custody, setStartCustody] = useState(
    (editData && editData.start_of_custody) || '',
  );
  const [end_of_custody, setEndCustody] = useState(
    (editData && editData.end_of_custody) || '',
  );
  const [start_of_custody_location, setStartLocation] = useState(
    (editData && editData.start_of_custody_location) || '',
  );
  const [end_of_custody_location, setEndLocation] = useState(
    (editData && editData.end_of_custody_location) || '',
  );
  const [start_of_custody_address, setStartAddress] = useState(
    (editData && editData.start_of_custody_location) || '',
  );
  const [end_of_custody_address, setEndAddress] = useState(
    (editData && editData.end_of_custody_location) || '',
  );

  const [itemIds, setItemIds] = useState(
    (shipmentFormData && shipmentFormData.items) || [],
  );

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const [gatewayIds, setGatewayIds] = useState(
    (shipmentFormData && shipmentFormData.gateway_ids) || [],
  );
  const [platform_name, setPlatformName] = useState(
    (shipmentFormData && shipmentFormData.platform_name) || 'tive',
  );
  const [formError, setFormError] = useState({});

  const shipmentFormMinMaxHumid = [
    (shipmentFormData && shipmentFormData.min_excursion_humidity) || 0,
    (shipmentFormData && shipmentFormData.max_excursion_humidity) || 100,
  ];

  const shipmentFormMinMaxTemp = [
    (shipmentFormData && shipmentFormData.min_excursion_temp) || 0,
    (shipmentFormData && shipmentFormData.max_excursion_temp) || 100,
  ];

  const [gatewayOptions, setGatewayOptions] = useState([]);

  let formTitle;
  if (!editPage) {
    formTitle = 'Create Shipment';
  } else if (viewOnly) {
    formTitle = 'View Shipment';
  } else {
    formTitle = 'Edit Shipment';
  }

  useEffect(() => {
    if (!shipmentData) {
      const getUpdatedSensorData = !aggregateReportData;
      const getUpdatedCustody = !custodyData;
      dispatch(getShipmentDetails(
        organization_uuid,
        'Planned,Enroute',
        null,
        getUpdatedSensorData,
        getUpdatedCustody,
        'get',
      ));
    }
    if (!custodianData) {
      dispatch(getCustodians(organization_uuid));
      dispatch(getCustodianType());
      dispatch(getContact(organization_uuid));
    }
    if (!itemData) {
      dispatch(getItems(organization_uuid));
      dispatch(getItemType(organization_uuid));
    }
    if (!gatewayData) {
      dispatch(getGateways(organization_uuid));
      dispatch(getGatewayType());
    }
    if (!unitsOfMeasure) {
      dispatch(getUnitsOfMeasure());
    }
    if (!sensorData) {
      dispatch(getSensors(organization_uuid));
      dispatch(getSensorType());
    }
  }, []);

  useEffect(() => {
    if (editPage || shipmentFormData === null) {
      dispatch(saveShipmentFormData(editData));
    }
  }, []);

  useEffect(() => {
    if (editData && editData.start_of_custody_location) {
      getAddress(
        editData.start_of_custody_location,
        'start',
      );
    }
    if (editData && editData.end_of_custody_location) {
      getAddress(
        editData.end_of_custody_location,
        'end',
      );
    }
  }, [editData]);

  useEffect(() => {
    if (
      custodianData
      && contactInfo
      && custodianData.length
    ) {
      setCustodianList(getCustodianFormattedRow(
        custodianData,
        contactInfo,
      ));
    }
    let item_rows;
    if (itemData && itemData.length) {
      let selectedRows = [];
      _.forEach(itemData, (item) => {
        if (_.indexOf(itemIds, item.url) !== -1) {
          selectedRows = [...selectedRows, item];
        }
      });
      item_rows = getItemFormattedRow(selectedRows, itemTypeList, unitsOfMeasure);
    }

    let gatewayRows = [];
    let sensorsRow = [];

    if (gatewayData && gatewayData.length) {
      let selectedRows = [];
      let selectedSensors = [];
      _.forEach(gatewayData, (element) => {
        if (_.indexOf(gatewayIds, element.gateway_uuid) !== -1) {
          selectedRows = [...selectedRows, element];
          if (sensorData && sensorData.length) {
            _.forEach(sensorData, (sensor) => {
              if (element.url === sensor.gateway) {
                selectedSensors = [...selectedSensors, sensor];
              }
            });
          }
        }
      });
      gatewayRows = getGatewayFormattedRow(selectedRows, gatewayTypeList);
      sensorsRow = getSensorFormattedRow(selectedSensors, sensorTypeList);
    }
    if (
      gatewayData
      && gatewayData.length
      && gatewayTypeList
      && gatewayTypeList.length
      && shipmentData
      && shipmentData.length
      && shipmentFormData
    ) {
      const opts = getAvailableGateways(
        gatewayData,
        platform_name
          ? _.lowerCase(platform_name)
          : 'tive',
        gatewayTypeList,
        shipmentData,
        shipmentFormData,
      );
      setGatewayOptions(opts);
    }
  // eslint-disable-next-line max-len
  }, [custodianData, contactInfo, gatewayData, itemData, platform_name, gatewayTypeList, shipmentData]);

  /**
   * Submit The form and add/edit custodian
   * @param {Event} event the default submit event
   */
  const onAddCustodyClick = (event) => {
    event.preventDefault();
    const custodyFormValues = {
      custodian: [custodianURL],
      start_of_custody_location: start_of_custody_location || null,
      end_of_custody_location: end_of_custody_location || null,
      // shipment_id: shipment.value,
      // has_current_custody: has_current_custody.value,
      // first_custody: first_custody.value,
      // last_custody: last_custody.value,
      radius: organization.radius,
      ...(editData !== null && { id: editData.id }),
      shipment_name: shipment_name.value,
      shipment: shipmentFormData.id,
    };
    if (editData !== null) {
      dispatch(editCustody(custodyFormValues));
    } else {
      dispatch(addCustody(custodyFormValues));
    }
  };

  const getLatLong = (address, pointer) => {
    if (pointer === 'start') {
      latLongChanged = true;
      setStartAddress(address);
    } else if (pointer === 'end') {
      latLongChanged = true;
      setEndAddress(address);
    }
    if (
      (pointer === 'start'
        && address !== start_of_custody_address
        && address !== '')
      || (pointer === 'end'
        && address !== end_of_custody_address
        && address !== '')
    ) {
      latLongChanged = true;
      Geocode.setApiKey(window.env.GEO_CODE_API);
      Geocode.setLanguage('en');
      Geocode.fromAddress(address).then(
        (response) => {
          const { lat, lng } = response.results[0].geometry.location;
          if (pointer === 'start') {
            setStartLocation(`${lat},${lng}`);
          } else if (pointer === 'end') {
            setEndLocation(`${lat},${lng}`);
          }
        },
        (error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        },
      );
    }
  };

  const getAddress = (latLong, pointer) => {
    Geocode.setApiKey(window.env.GEO_CODE_API);
    Geocode.setLanguage('en');
    const latlong = latLong.split(',');
    Geocode.fromLatLng(latlong[0], latlong[1]).then(
      (response) => {
        const { results } = response;
        const establishment = _.find(
          results,
          (item) => _.includes(item.types, 'establishment'),
        );
        const premise = _.find(
          results,
          (item) => _.includes(item.types, 'premise'),
        );
        const filteredResult = establishment || premise || results[0];
        if (pointer === 'start') {
          setStartAddress(filteredResult.formatted_address);
        } else if (pointer === 'end') {
          setEndAddress(filteredResult.formatted_address);
        }
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      },
    );
  };

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

  const onInputChange = (value, type, custody) => {
    switch (type) {
      case 'item':
        if (value.length > itemIds.length) {
          setItemIds([...itemIds, _.last(value).url]);
        } else if (value.length < itemIds.length) { setItemIds(value); }
        break;
      case 'custodian':
        if (value) {
          if (custodianList.length > 0) {
            let selectedCustodian = '';
            _.forEach(custodianList, (list) => {
              if (list.url === value) {
                selectedCustodian = list;
              }
            });
            if (custody === 'start') {
              setStartCustody(value);
              getLatLong(selectedCustodian.location, 'start');
            } else if (custody === 'end') {
              setEndCustody(value);
              getLatLong(selectedCustodian.location, 'end');
            }
          }
        }
        break;
      case 'gateway':
        if (value.length > gatewayIds.length) {
          setGatewayIds([...gatewayIds, _.last(value).gateway_uuid]);
        } else if (value.length < gatewayIds.length) { setGatewayIds(value); }
        break;
      default:
        break;
    }
  };

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!shipment_name.value
      && (itemIds.length === 0 || itemData === null)
      && (!gatewayIds.length || gatewayData === null)) {
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
   * Submit The form
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const updateGateway = _.find(gatewayData, { gateway_uuid: gatewayIds[0] });
    const shipmentFormValue = {
      ...copyData,
      name: shipment_name.value,
      purchase_order_number: purchase_order_number.value,
      order_number: order_number.value,
      shipper_number: shipper_number.value,
      carrier,
      transport_mode: mode_type.value,
      status: (editData && editData.status) || 'Planned',
      estimated_time_of_arrival: scheduled_arrival,
      estimated_time_of_departure: scheduled_departure,
      ...(editData && { id: editData.id }),
      items: (editData && editData.items) || itemIds,
      gateway_ids: (editData && editData.gateway_ids) || gatewayIds,
      gateway_imei: (editData && editData.gateway_imei) || [updateGateway.imei_number],
      uom_distance: 'Miles',
      uom_temp: 'Fahrenheit',
      uom_weight: 'Pounds',
      organization_uuid,
      platform_name,
      max_excursion_temp: max_temp_val,
      min_excursion_temp: min_temp_val,
      max_excursion_humidity: max_humid_val,
      min_excursion_humidity: min_humid_val,
    };

    if (editPage && editData) {
      if (shipmentFormData.gateway_ids.length > 0) {
        let attachedGateway = null;
        attachedGateway = _.filter(
          gatewayData, (gateway) => gateway.gateway_uuid === shipmentFormData.gateway_ids[0],
        );
        dispatch(
          editShipment(
            shipmentFormValue,
            history,
            `${routes.SHIPMENT}/edit/:${editData.id}`,
            organization_uuid,
            attachedGateway[0],
          ),
        );
      } else {
        dispatch(
          editShipment(
            shipmentFormValue,
            history,
            `${routes.SHIPMENT}/edit/:${editData.id}`,
            organization_uuid,
            null,
          ),
        );
      }
    } else {
      dispatch(addShipment(shipmentFormValue, history, null, organization_uuid));
    }
    dispatch(editGateway({
      ...updateGateway,
      gateway_status: 'assigned',
      shipment_ids: [shipmentFormData.id],
    }));
  };

  const handleTempMinMaxChange = (e, value) => {
    setMinMaxTempValue(value);
    changeMinTempVal(value[0]);
    changeMaxTempVal(value[1]);
  };

  const handleHumidMinMaxChange = (e, value) => {
    setMinMaxHumidValue(value);
    changeMinHumidVal(value[0]);
    changeMaxHumidVal(value[1]);
  };

  // const checkIfEnvironmentLimitsEdited = () => !(
  //   minMaxTempValue.length === shipmentFormMinMaxTemp.length
  //   && _.every(
  //     shipmentFormMinMaxTemp,
  //     (item) => _.indexOf(minMaxTempValue, item) > -1,
  //   )) || !(
  //   minMaxHumidValue.length === shipmentFormMinMaxHumid.length
  //   && _.every(
  //     shipmentFormMinMaxHumid,
  //     (item) => _.indexOf(minMaxHumidValue, item) > -1,
  //   ));

  // const checkIfCustodianInfoEdited = () => (
  //   custodianURL !== (
  //     (editData && editData.custodian_data && editData.custodian_data.url)
  //       || '')
  //     // || (editData && (start_of_custody !== editData.start_of_custody))
  //     // || (editData && (end_of_custody !== editData.end_of_custody))
  //     || latLongChanged
  //     // || has_current_custody.hasChanged()
  //     // || first_custody.hasChanged()
  //     // || last_custody.hasChanged()
  // );

  // const checkIfItemInfoEdited = () => !!(itemIds.length !== shipmentFormData.items.length);

  // const checkIfSensorGatewayEdited = () => {
  //   if (gatewayIds.length) {
  //     return shipmentFormData.gateway_ids
  //       ? !!(gatewayIds.length !== shipmentFormData.gateway_ids.length) : true;
  //   }
  //   return false;
  // };

  // const checkIfFormEdited = () => {
  //   console.log('In form edited');

  // };

  return (
    <Box mt={5} mb={5}>
      {loading && <Loader open={loading} />}
      <Box mb={3} mt={2} display="flex" alignItems="center" justifyContent="space-between">
        <Typography
          className={classes.dashboardHeading}
          variant="h4"
        >
          {formTitle}
        </Typography>
      </Box>
      <form
        className={classes.form}
        noValidate
        onSubmit={handleSubmit}
      >
        <Box mb={2}>
          <Grid container spacing={2}>
            <FormControl
              component="fieldset"
              variant="outlined"
              color="primary"
              className={classes.fieldset}
            >
              <FormLabel
                component="legend"
                className={classes.legend}
              >
                Shipment details
              </FormLabel>
              <Grid container spacing={2}>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  sx={{ padding: '8px' }}
                >
                  <Grid container spacing={isDesktop ? 2 : 0}>
                    <Grid item xs={12}>
                      <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        fullWidth
                        className={classes.submit}
                      >
                        <AddIcon />
                        {' '}
                        Add Shipment Origin
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        select
                        disabled={viewOnly}
                        id="start_of_custody"
                        label="Origin Company"
                        onBlur={(e) => handleBlur(e, 'required', start_of_custody, 'start_of_custody')}
                        value={start_of_custody}
                        onChange={(event) => onInputChange(event.target.value, 'custodian', 'start')}
                      >
                        <MenuItem value="">Select</MenuItem>
                        {custodianList
                    && _.map(
                      _.orderBy(custodianList, ['name'], ['asc']),
                      (item, index) => (
                        <MenuItem
                          key={`custodian${index}:${item.id}`}
                          value={item.url}
                        >
                          {item.name}
                        </MenuItem>
                      ),
                    )}
                      </TextField>
                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        id="start_of_custody_address"
                        label="Origin Address"
                        name="start_of_custody_address"
                        autoComplete="start_of_custody_address"
                        value={start_of_custody_address}
                        onChange={(e) => getLatLong(e.target.value, 'start')}
                      />
                      <MapComponent
                        isMarkerShown
                        googleMapURL={window.env.MAP_API_URL}
                        zoom={10}
                        loadingElement={
                          <div style={{ height: '100%' }} />
                  }
                        containerElement={
                          <div style={{ height: '200px', marginTop: '10px' }} />
                  }
                        mapElement={
                          <div style={{ height: '100%' }} />
                  }
                        markers={[
                          {
                            lat: start_of_custody_location
                      && parseFloat(start_of_custody_location.split(',')[0]),
                            lng: start_of_custody_location
                      && parseFloat(start_of_custody_location.split(',')[1]),
                            radius: organization.radius,
                          },
                        ]}
                        geofence={
                    editData
                    && editData.start_of_custody_location_geofence
                  }
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  sx={{ padding: '8px' }}
                >
                  <Grid container spacing={isDesktop ? 2 : 0}>
                    <Grid item xs={12}>
                      <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        fullWidth
                        className={classes.submit}
                        required
                      >
                        <AddIcon />
                        {' '}
                        Add Shipment Destination
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        disabled={viewOnly}
                        select
                        id="end_of_custody"
                        label="Destination Company"
                        onBlur={(e) => handleBlur(e, 'required', end_of_custody, 'end_of_custody')}
                        value={end_of_custody}
                        onChange={(event) => onInputChange(event.target.value, 'custodian', 'end')}
                      >
                        <MenuItem value="">Select</MenuItem>
                        {custodianList
                    && _.map(
                      _.orderBy(custodianList, ['name'], ['asc']),
                      (item, index) => (
                        <MenuItem
                          key={`custodian${index}:${item.id}`}
                          value={item.url}
                        >
                          {item.name}
                        </MenuItem>
                      ),
                    )}
                      </TextField>

                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        id="end_of_custody_address"
                        label="Destination Address"
                        name="end_of_custody_address"
                        autoComplete="end_of_custody_address"
                        value={end_of_custody_address}
                        onChange={(e) => getLatLong(e.target.value, 'end')}
                      />
                      <MapComponent
                        isMarkerShown
                        googleMapURL={window.env.MAP_API_URL}
                        zoom={10}
                        loadingElement={
                          <div style={{ height: '100%' }} />
                  }
                        containerElement={
                          <div style={{ height: '200px', marginTop: '10px' }} />
                  }
                        mapElement={
                          <div style={{ height: '100%' }} />
                  }
                        markers={[
                          {
                            lat: end_of_custody_location
                      && parseFloat(end_of_custody_location.split(',')[0]),
                            lng: end_of_custody_location
                      && parseFloat(end_of_custody_location.split(',')[1]),
                            radius: organization.radius,
                          },
                        ]}
                        geofence={
                    editData
                    && editData.end_of_custody_location_geofence
                  }
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Divider
                  orientation="horizontal"
                  light
                  className={classes.divider}
                />
              </Grid>
              <Grid container spacing={2}>
                <Grid
                  item
                  xs={12}
                  sm={8}
                  sx={{ padding: '8px' }}
                >
                  <Grid container spacing={isDesktop ? 2 : 0}>
                    <Grid
                      item
                      xs={12}
                    >
                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        id="mode_type"
                        select
                        label="Transportation type"
                        disabled={viewOnly}
                        {...mode_type.bind}
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
                    <Grid
                      item
                      xs={12}
                    >
                      <Autocomplete
                        multiple
                        id="items-outlined"
                        disabled={viewOnly}
                        disableCloseOnSelect
                        fullWidth
                        className={classes.autoComplete}
                        options={
                    (
                      itemData
                      && _.orderBy(
                        itemData,
                        ['name'],
                        ['asc'],
                      )
                    ) || []
                  }
                        getOptionLabel={(option) => (
                          option
                    && option.name
                        )}
                        isOptionEqualToValue={(option, value) => (
                          option.url === value
                        )}
                        filterSelectedOptions
                        value={itemIds}
                        onChange={(event, newValue) => onInputChange(newValue, 'item', null)}
                        renderTags={(value, getTagProps) => (
                          _.map(value, (option, index) => (
                            <Chip
                              variant="default"
                              key={`item-${index}:${option}`}
                              label={
                          itemData
                            ? _.find(itemData, { url: option })?.name
                            : ''
                        }
                              {...getTagProps({ index })}
                            />
                          ))
                        )}
                        // eslint-disable-next-line no-shadow
                        renderOption={(props, option, { selected }) => (
                          <li {...props} key={`item-${option}`}>
                            <Checkbox
                              icon={icon}
                              checkedIcon={checkedIcon}
                              style={{ marginRight: 8, color: '#fff' }}
                              checked={selected}
                            />
                            {option.name}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            disabled={viewOnly}
                            variant="outlined"
                            label="Product to be shipped"
                            placeholder="Select a product"
                          />
                        )}
                      />
                    </Grid>

                  </Grid>

                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{ padding: '8px' }}
                >
                  <Grid container spacing={isDesktop ? 2 : 0}>
                    <Grid item xs={6}>
                      <Grid
                        item
                        xs={12}
                      >
                        <TextField
                          variant="outlined"
                          margin="normal"
                          fullWidth
                          required
                          id="max_temp_val"
                          label="Max"
                          name="max_temp_val"
                          autoComplete="max_temp_val"
                          value={max_temp_val}
                          disabled={viewOnly}
                          InputProps={{
                            endAdornment: <InputAdornment position="end"><TempIcon color="white" name="Max Temperature" /></InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        className={classes.envInput}
                      >
                        <TextField
                          variant="outlined"
                          margin="normal"
                          fullWidth
                          id="min_temp_val"
                          label="Min"
                          required
                          name="min_temp_val"
                          autoComplete="min_temp_val"
                          value={min_temp_val}
                          disabled={viewOnly}
                          InputProps={{
                            endAdornment: <InputAdornment position="end"><TempIcon color="white" name="Min Temperature" /></InputAdornment>,
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid item xs={6}>
                      <Grid
                        item
                        xs={12}
                      >
                        <TextField
                          variant="outlined"
                          margin="normal"
                          fullWidth
                          id="max_humid_val"
                          label="Max"
                          required
                          name="max_humid_val"
                          autoComplete="max_humid_val"
                          value={max_humid_val}
                          disabled={viewOnly}
                          InputProps={{
                            endAdornment: <InputAdornment position="end"><HumidIcon color="white" name="Max Humidity" /></InputAdornment>,
                          }}
                        />

                      </Grid>
                      <Grid
                        item
                        xs={12}
                        className={classes.envInput}
                      >
                        <TextField
                          variant="outlined"
                          margin="normal"
                          fullWidth
                          required
                          id="min_humid_val"
                          label="Min"
                          name="min_humid_val"
                          autoComplete="min_humid_val"
                          value={min_humid_val}
                          disabled={viewOnly}
                          className={classes.envInput}
                          InputProps={{
                            endAdornment: <InputAdornment position="end"><HumidIcon color="white" name="Min Humidity" /></InputAdornment>,
                          }}
                        />

                      </Grid>
                    </Grid>
                  </Grid>

                </Grid>
                <Grid item xs={10} sm={8} />
                <Grid item xs={2} sm={4} display="flex" alignItems="flex-end" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    className={classes.submit}
                    size="small"
                  >
                    Save as Template
                  </Button>
                </Grid>
              </Grid>
            </FormControl>

            <FormControl
              component="fieldset"
              variant="outlined"
              color="primary"
              className={classes.fieldset}
            >
              <FormLabel
                component="legend"
                className={classes.legend}
              >
                Additional information
              </FormLabel>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} sx={{ padding: '8px' }}>
                  <Grid container spacing={isDesktop ? 2 : 0} display="flex" justifyItems="space-between" flexDirection="row">
                    <Grid item xs={2} sm={4}>
                      <TextField
                        variant="outlined"
                        margin="normal"
                        id="organization_uuid"
                        label="Org"
                        name="organization_uuid"
                        autoComplete="organization_uuid"
                        disabled={viewOnly}
                        {...organization_uuid.bind}
                      />

                    </Grid>
                    <Grid item xs={10} sm={8}>
                      <TextField
                        variant="outlined"
                        required
                        margin="normal"
                        fullWidth
                        id="order_number"
                        label="Order Number"
                        name="order_number"
                        autoComplete="order_number"
                        disabled={viewOnly}
                        {...order_number.bind}
                      />
                    </Grid>

                  </Grid>

                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} sx={{ padding: '8px' }}>
                  <Grid container spacing={isDesktop ? 2 : 0}>
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="purchase_order_number"
                        label="Purchase Order Number"
                        name="purchase_order_number"
                        autoComplete="purchase_order_number"
                        disabled={viewOnly}
                        {...purchase_order_number.bind}
                      />
                      <DatePickerComponent
                        label="Pickup Date/Time"
                        fullWidth
                        required
                        selectedDate={
                        moment(scheduled_departure).tz(timezone)
                          .format('MMMM DD, YYYY HH:mm:ss')
                      }
                        hasTime
                        handleDateChange={handleDepartureDateChange}
                        disabled={viewOnly}
                      />
                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        id="carrier"
                        select
                        label="Carrier"
                        disabled={viewOnly}
                        {...mode_type.bind}
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

                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ padding: '8px' }}>
                  <Grid
                    container
                    spacing={isDesktop ? 2 : 0}
                  >
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="shipper_number"
                        label="Shipper Number"
                        name="shipper_number"
                        autoComplete="shipper_number"
                        disabled={viewOnly}
                        {...shipper_number.bind}
                      />
                      <DatePickerComponent
                        label="Dropoff Date/Time"
                        fullWidth
                        required
                        selectedDate={
                        moment(scheduled_arrival).tz(timezone)
                          .format('MMMM DD, YYYY HH:mm:ss')
                      }
                        hasTime
                        handleDateChange={handleScheduledDateChange}
                        disabled={viewOnly}
                      />
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        className={classes.submit}
                        size="small"
                        style={{
                          marginTop: '2rem',
                        }}
                      >
                        <AddIcon />
                        {' '}
                        Add Additional Carrier
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </FormControl>

            <FormControl
              component="fieldset"
              variant="outlined"
              color="primary"
              className={classes.fieldset}
            >
              <FormLabel
                component="legend"
                className={classes.legend}
              >
                Gateway
              </FormLabel>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    required
                    id="platform_name"
                    select
                    label="Gateway Platform"
                    disabled={
                        viewOnly
                        || !!(shipmentFormData && shipmentFormData.platform_name)
                      }
                    // value={platform_name}
                    // onChange={(e) => setPlatformName(e.target.value)}
                    helperText={
                        shipmentFormData && shipmentFormData.platform_name
                          ? 'Once set, platform cannot be edited.'
                          : 'Platform can be set just once.'
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
                <Grid item xs={6}>
                  <Autocomplete
                    multiple
                    id="gateways-outlined"
                  //   disabled={
                  //   viewOnly
                  //   || (shipmentFormData
                  //     && shipmentFormData.gateway_ids
                  //     && shipmentFormData.gateway_ids.length > 0
                  //   )
                  // }
                    disableCloseOnSelect
                    options={gatewayOptions}
                    getOptionLabel={(option) => (
                      option
                    && option.name
                    )}
                    isOptionEqualToValue={(option, value) => (
                      option.gateway_uuid === value
                    )}
                    filterSelectedOptions
                    value={gatewayIds}
                    onChange={(event, newValue) => onInputChange(newValue, 'gateway', null)}
                    renderTags={(value, getTagProps) => (
                      _.map(value, (option, index) => (
                        <Chip
                          variant="default"
                          label={
                          gatewayData
                            ? _.find(gatewayData, { gateway_uuid: option })?.name
                            : ''
                        }
                          {...getTagProps({ index })}
                        />
                      ))
                    )}
                    // eslint-disable-next-line no-shadow
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={`gateway-${option}`}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8, color: '#fff' }}
                          checked={selected}
                        />
                        {option.name}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        disabled={viewOnly}
                        label="Gateway Label"
                        variant="outlined"
                        placeholder="Select a Gateway"
                        helperText={
                        shipmentFormData
                        && shipmentFormData.gateway_ids
                        && shipmentFormData.gateway_ids.length === 0
                          ? '**You can attach gateway/sensor only once per shipment.'
                          : '**In case you want to change the gateway/sensor, please cancel this shipment and create a new one.'
                      }
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </FormControl>

            <Grid container spacing={2} marginTop="0.5rem">
              <Grid item xs={2} sm={5} />
              <Grid item xs={10} sm={4} className={classes.flexContainer}>
                <TextField
                  variant="outlined"
                  required
                  margin="normal"
                  // id="load_no_1"
                  label="Org"
                  name="load_no"
                  // autoComplete="load_no"
                  disabled={viewOnly}
                  // {...load_no.bind}
                  style={{
                    width: '20%',
                  }}
                />
                <TextField
                  variant="outlined"
                  required
                  margin="normal"
                  // id="load_no_2"
                  label="Order No."
                  // name="load_no"
                  // autoComplete="load_no"
                  disabled={viewOnly}
                  // {...load_no.bind}
                  style={{
                    flex: '2',
                    width: '20%',
                    marginLeft: '16px',
                  }}
                  className={classes.smallInput}
                />
                <TextField
                  variant="outlined"
                  required
                  margin="normal"
                  // id="load_no_3"
                  label="Origin"
                  // name="load_no"
                  // autoComplete="load_no"
                  disabled={viewOnly}
                  // {...load_no.bind}
                  className={classes.smallInput}
                />
                <TextField
                  variant="outlined"
                  required
                  margin="normal"
                  // id="load_no_4"
                  label="Dest."
                  // name="load_no"
                  // autoComplete="load_no"
                  disabled={viewOnly}
                  // {...load_no.bind}
                  className={classes.smallInput}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
            className={classes.buttonContainer}
          >
            <Grid item xs={12} sm={6}>
              <Button
                type="button"
                fullWidth
                variant="outlined"
                color="primary"
                className={classes.submit}
              >
                Cancel
              </Button>

            </Grid>
            <Grid item xs={12} sm={6}>
              {viewOnly ? (
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  // onClick={onCancelClick}
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
                    Save Shipment
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
          </Grid>
        </Box>

      </form>
    </Box>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.shipmentReducer,
  ...state.itemsReducer,
  ...state.custodianReducer,
  ...state.optionsReducer,
  ...state.sensorsGatewayReducer,
  loading: (
    state.shipmentReducer.loading
    || state.itemsReducer.loading
    || state.custodianReducer.loading
    || state.optionsReducer.loading
    || state.sensorsGatewayReducer.loading
  ),
});

export default connect(mapStateToProps)(CreateShipment);
