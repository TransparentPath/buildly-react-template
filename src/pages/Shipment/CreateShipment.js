import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Geocode from 'react-geocode';
import _ from 'lodash';
import moment from 'moment-timezone';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  Battery4Bar as BatteryIcon,
  BoltOutlined as ShockIcon,
  DisabledByDefault as CancelIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  LightModeOutlined as LightIcon,
  LocationOn as LocationIcon,
  Opacity as HumidityIcon,
  Thermostat as TemperatureIcon,
} from '@mui/icons-material';
import DataTableWrapper from '../../components/DataTableWrapper/DataTableWrapper';
import DatePickerComponent from '../../components/DatePicker/DatePicker';
import Loader from '../../components/Loader/Loader';
import MapComponent from '../../components/MapComponent/MapComponent';
import { UserContext } from '../../context/User.context';
import { useInput } from '../../hooks/useInput';
import { getContact, getCustodianType, getCustodians } from '../../redux/custodian/actions/custodian.actions';
import { getItemType, getItems, getUnitOfMeasure } from '../../redux/items/actions/items.actions';
import { getGatewayType, getGateways } from '../../redux/sensorsGateway/actions/sensorsGateway.actions';
import { addShipmentTemplate, getShipmentTemplates } from '../../redux/shipment/actions/shipment.actions';
import { routes } from '../../routes/routesConstants';
import { getCustodianFormattedRow, getItemFormattedRow, itemColumns } from '../../utils/constants';
import { SHIPMENT_STATUS, TIVE_GATEWAY_TIMES, UOM_TEMPERATURE_CHOICES } from '../../utils/mock';
import { validators } from '../../utils/validators';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  fieldset: {
    border: `1px solid ${theme.palette.background.light}`,
    padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  legend: {
    fontSize: theme.spacing(1.5),
  },
  innerAsterisk: {
    fontSize: theme.spacing(4),
    color: theme.palette.secondary.main,
    paddingTop: `${theme.spacing(3)} !important`,
  },
  outerAsterisk: {
    fontSize: theme.spacing(4),
    color: theme.palette.secondary.main,
    paddingLeft: `${theme.spacing(2)} !important`,
    paddingTop: `${theme.spacing(5)} !important`,
  },
  adjustSpacing: {
    marginRight: theme.spacing(6),
  },
  alertSettingText: {
    color: theme.palette.background.light,
  },
  highest: {
    fontWeight: 700,
    color: theme.palette.error.main,
  },
  lowest: {
    fontWeight: 700,
    color: theme.palette.info.main,
  },
  cancel: {
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(-4),
    fill: theme.palette.background.light,
  },
  attachedFiles: {
    border: `1px solid ${theme.palette.background.light}`,
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(0.5),
    height: '100%',
  },
  fileButton: {
    paddingTop: `${theme.spacing(5)} !important`,
    '& fieldset': {
      border: 0,
    },
  },
  gatewayDetails: {
    display: 'flex',
    justifyContent: 'end',
    marginRight: theme.spacing(1),
    padding: theme.spacing(5),
    paddingTop: theme.spacing(2),
  },
  finalName: {
    paddingTop: theme.spacing(5),
    color: theme.palette.background.light,
    '& div': {
      paddingLeft: `${theme.spacing(4)} !important`,
    },
  },
  finalNameDisplay: {
    backgroundColor: theme.palette.primary.light,
  },
}));

const CreateShipment = ({
  dispatch,
  loading,
  templates,
  custodianData,
  contactInfo,
  timezone,
  unitOfMeasure,
  itemData,
  itemTypeList,
  custodianTypeList,
  gatewayData,
  gatewayTypeList,
  history,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const { organization } = useContext(UserContext);

  const formTitle = 'Create Shipment';
  let latLongChanged = false;

  const [template, setTemplate] = useState('');
  const [custodianList, setCustodianList] = useState([]);
  const [originCustodian, setOriginCustodian] = useState('');
  const [originAbb, setOriginAbb] = useState('');
  const [startingAddress, setStartingAddress] = useState('');
  const [startingLocation, setStartingLocation] = useState('');

  const [destinationCustodian, setDestinationCustodian] = useState('');
  const [destinationAbb, setDestinationAbb] = useState('');
  const [endingAddress, setEndingAddress] = useState('');
  const [endingLocation, setEndingLocation] = useState('');

  const [departureDateTime, setDepartureDateTime] = useState(moment().startOf('day').hour(12).minute(0));
  const [arrivalDateTime, setArrivalDateTime] = useState(moment().startOf('day').hour(12).minute(0));
  const status = useInput('Planned');

  const [items, setItems] = useState([]);
  const [itemRows, setItemRows] = useState([]);

  const min_excursion_temp = useInput('0');
  const max_excursion_temp = useInput('100');
  const min_excursion_humidity = useInput('0');
  const max_excursion_humidity = useInput('100');
  const shock_threshold = useInput('4');
  const light_threshold = useInput('5');

  const shipmentName = useInput('');
  const purchaseOrderNumber = useInput('');
  const billOfLading = useInput('');
  const [files, setFiles] = useState([]);
  const [showNote, setShowNote] = useState(false);
  const [showAddCustodian, setShowAddCustodian] = useState(false);
  const note = useInput('');
  const [additionalCustodians, setAdditionalCustocations] = useState([]);

  const gatewayType = useInput('');
  const [availableGateways, setAvailableGateways] = useState([]);
  const gateway = useInput('');
  const transmissionInterval = useInput(5);
  const measurementInterval = useInput(5);

  const [formError, setFormError] = useState({});

  const uncheckedIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  useEffect(() => {
    dispatch(getShipmentTemplates(organization.organization_uuid));
    dispatch(getCustodians(organization.organization_uuid));
    dispatch(getCustodianType());
    dispatch(getContact(organization.organization_uuid));
    dispatch(getUnitOfMeasure(organization.organization_uuid));
    dispatch(getItems(organization.organization_uuid));
    dispatch(getItemType(organization.organization_uuid));
    dispatch(getGateways(organization.organization_uuid));
    dispatch(getGatewayType());
  }, []);

  useEffect(() => {
    if (!_.isEmpty(custodianData) && !_.isEmpty(contactInfo)) {
      setCustodianList(getCustodianFormattedRow(custodianData, contactInfo, custodianTypeList));
    }
  }, [custodianData, contactInfo, custodianTypeList]);

  useEffect(() => {
    if (!_.isEmpty(itemData)) {
      let selectedRows = [];
      _.forEach(itemData, (item) => {
        if (_.includes(items, item.url)) {
          selectedRows = [...selectedRows, item];
        }
      });

      const rows = getItemFormattedRow(selectedRows, itemTypeList, unitOfMeasure);
      setItemRows(rows);
    }
  }, [itemData, itemTypeList, unitOfMeasure, items]);

  useEffect(() => {
    const custodian = _.find(custodianData, { url: originCustodian });
    if (custodian) {
      const gateways = _.filter(gatewayData, {
        custodian_uuid: custodian.custodian_uuid,
        gateway_type: gatewayType.value,
      });
      setAvailableGateways(gateways);
    }
  }, [gatewayData, gatewayType.value, originCustodian]);

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

  const getAbbreviation = (name) => name.replace(/[^A-Z0-9]/g, '');

  const getLatLong = (address, pointer) => {
    if (pointer === 'start') {
      latLongChanged = true;
      setStartingAddress(address);
    } else if (pointer === 'end') {
      latLongChanged = true;
      setEndingAddress(address);
    }

    if (
      (pointer === 'start' && address && !_.isEqual(address, startingAddress))
      || (pointer === 'end' && address && !_.isEqual(address, endingAddress))
    ) {
      latLongChanged = true;
      Geocode.setApiKey(window.env.GEO_CODE_API);
      Geocode.setLanguage('en');
      Geocode.fromAddress(address).then(
        (response) => {
          const { lat, lng } = response.results[0].geometry.location;
          if (pointer === 'start') {
            setStartingLocation(`${lat},${lng}`);
          } else if (pointer === 'end') {
            setEndingLocation(`${lat},${lng}`);
          }
        },
        (error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        },
      );
    }
  };

  const onInputChange = (value, type, custody) => {
    switch (type) {
      case 'custodian':
        if (value) {
          const selectedCustodian = _.find(custodianList, { url: value });
          if (custody === 'start') {
            setOriginCustodian(value);
            setOriginAbb(getAbbreviation(selectedCustodian.abbrevation));
            getLatLong(selectedCustodian.location, 'start');
          } else if (custody === 'end') {
            setDestinationCustodian(value);
            setDestinationAbb(getAbbreviation(selectedCustodian.abbrevation));
            getLatLong(selectedCustodian.location, 'end');
          }
        }
        break;

      case 'item':
        if (_.size(value) > _.size(items)) {
          setItems([...items, _.last(value).url]);
        } else {
          setItems(value);
        }
        break;

      default:
        break;
    }
  };

  const saveTemplateDisabled = () => (
    (!!template
      && originCustodian === template.origin_custodian
      && destinationCustodian === template.destination_custodian
      && items === template.items
      && status.value === template.status
      && min_excursion_temp.value === template.min_excursion_temp
      && max_excursion_temp.value === template.max_excursion_temp
      && min_excursion_humidity.value === template.min_excursion_humidity
      && max_excursion_humidity.value === template.max_excursion_humidity
      && shock_threshold.value === template.shock_threshold
      && light_threshold.value === template.light_threshold
    ) || (!template && (!originCustodian || !destinationCustodian || _.isEmpty(items)))
  );

  const handleTemplateChange = (value) => {
    setTemplate(value);
    onInputChange(value.origin_custodian, 'custodian', 'start');
    onInputChange(value.destination_custodian, 'custodian', 'end');
    setItems(value.items);
    status.setValue(value.status);
    min_excursion_temp.setValue(value.min_excursion_temp);
    max_excursion_temp.setValue(value.max_excursion_temp);
    min_excursion_humidity.setValue(value.min_excursion_humidity);
    max_excursion_humidity.setValue(value.max_excursion_humidity);
    shock_threshold.setValue(value.shock_threshold);
    light_threshold.setValue(value.light_threshold);
  };

  const saveAsTemplate = () => {
    const itemName = _.find(itemRows, { url: items[0] }) ? _.find(itemRows, { url: items[0] }).name : 'NoItems';
    const templateFormValue = {
      name: `${originAbb}-${destinationAbb}-${itemName}`,
      origin_custodian: originCustodian,
      destination_custodian: destinationCustodian,
      items,
      status: status.value,
      min_excursion_temp: min_excursion_temp.value,
      max_excursion_temp: max_excursion_temp.value,
      min_excursion_humidity: min_excursion_humidity.value,
      max_excursion_humidity: max_excursion_humidity.value,
      shock_threshold: shock_threshold.value,
      light_threshold: light_threshold.value,
      organization_uuid: organization.organization_uuid,
    };
    dispatch(addShipmentTemplate(templateFormValue));
  };

  const fileChange = (event) => {
    const maxAllowedSize = 2 * 1024 * 1024;
    let error = false;

    _.forEach(event.target.files, (attachedFile) => {
      if (attachedFile) {
        switch (true) {
          case (attachedFile.type !== 'application/pdf'):
            error = error || true;
            // eslint-disable-next-line no-alert
            alert('Only PDF files are allowed for upload.');
            break;

          case (attachedFile.size > maxAllowedSize):
            error = error || true;
            // eslint-disable-next-line no-alert
            alert('File size is more that 2MB. Please upload another file.');
            break;

          default:
            break;
        }
      }
    });
    if (!error) {
      setFiles([...files, ...event.target.files]);
    }
  };

  const submitDisabled = () => (
    !originCustodian
    || !destinationCustodian
    || _.isEmpty(items)
    || !shipmentName.value
    || !gatewayType.value
    || !gateway.value
  );

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <Box mt={5} mb={5}>
      {loading && <Loader open={loading} />}
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item xs={8}>
          <Typography className={classes.dashboardHeading} variant="h5">
            {formTitle}
          </Typography>
        </Grid>

        <Grid item xs={4}>
          <TextField
            variant="outlined"
            id="template"
            select
            fullWidth
            placeholder="Select..."
            label="Templates"
            value={template}
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            <MenuItem value="">Select</MenuItem>
            {!_.isEmpty(templates) && _.map(templates, (tmp) => (
              <MenuItem key={tmp.template_uuid} value={tmp}>
                {tmp.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <form className={classes.form} noValidate onSubmit={handleSubmit}>
        <Box mt={2}>
          <FormControl fullWidth component="fieldset" variant="outlined" className={classes.fieldset}>
            <FormLabel component="legend" className={classes.legend}>
              Shipment Details
            </FormLabel>

            <Grid container spacing={isDesktop ? 4 : 0}>
              <Grid item xs={12} sm={6}>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <TextField
                      variant="outlined"
                      id="origin-custodian"
                      select
                      fullWidth
                      placeholder="Select..."
                      label="Origin Custodian"
                      onBlur={(e) => handleBlur(e, 'required', originCustodian, 'origin-custodian')}
                      value={originCustodian}
                      onChange={(e) => onInputChange(e.target.value, 'custodian', 'start')}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {!_.isEmpty(custodianList) && _.map(custodianList, (cust) => (
                        <MenuItem key={cust.custodian_uuid} value={cust.url}>
                          {cust.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={3}>
                    <TextField
                      variant="outlined"
                      id="origin-custodian-abbreviation"
                      label="ID"
                      disabled
                      value={originAbb}
                    />
                  </Grid>
                  <Grid item xs={1} className={classes.innerAsterisk}>*</Grid>

                  <Grid item xs={11}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      id="starting-address"
                      label="Starting Address"
                      name="starting-address"
                      autoComplete="starting-address"
                      value={startingAddress}
                      onChange={(e) => getLatLong(e.target.value, 'start')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end"><LocationIcon /></InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={1} className={classes.innerAsterisk}>*</Grid>

                  <Grid item xs={11}>
                    <MapComponent
                      isMarkerShown
                      googleMapURL={window.env.MAP_API_URL}
                      zoom={10}
                      loadingElement={<div style={{ height: '100%' }} />}
                      containerElement={<div style={{ height: '300px', marginTop: '10px' }} />}
                      mapElement={<div style={{ height: '100%' }} />}
                      markers={[
                        {
                          lat: startingLocation && parseFloat(startingLocation.split(',')[0]),
                          lng: startingLocation && parseFloat(startingLocation.split(',')[1]),
                          radius: organization.radius,
                        },
                      ]}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <TextField
                      variant="outlined"
                      id="destination-custodian"
                      select
                      fullWidth
                      placeholder="Select..."
                      label="Destination Custodian"
                      onBlur={(e) => handleBlur(e, 'required', destinationCustodian, 'destination-custodian')}
                      value={destinationCustodian}
                      onChange={(e) => onInputChange(e.target.value, 'custodian', 'end')}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {!_.isEmpty(custodianList) && _.map(custodianList, (cust) => (
                        <MenuItem key={cust.custodian_uuid} value={cust.url}>
                          {cust.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={3}>
                    <TextField
                      variant="outlined"
                      id="destination-custodian-abbreviation"
                      label="ID"
                      disabled
                      value={destinationAbb}
                    />
                  </Grid>
                  <Grid item xs={1} className={classes.innerAsterisk}>*</Grid>

                  <Grid item xs={11}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      id="ending-address"
                      label="Ending Address"
                      name="ending-address"
                      autoComplete="ending-address"
                      value={endingAddress}
                      onChange={(e) => getLatLong(e.target.value, 'end')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end"><LocationIcon /></InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={1} className={classes.innerAsterisk}>*</Grid>

                  <Grid item xs={11}>
                    <MapComponent
                      isMarkerShown
                      googleMapURL={window.env.MAP_API_URL}
                      zoom={10}
                      loadingElement={<div style={{ height: '100%' }} />}
                      containerElement={<div style={{ height: '300px', marginTop: '10px' }} />}
                      mapElement={<div style={{ height: '100%' }} />}
                      markers={[
                        {
                          lat: endingLocation && parseFloat(endingLocation.split(',')[0]),
                          lng: endingLocation && parseFloat(endingLocation.split(',')[1]),
                          radius: organization.radius,
                        },
                      ]}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={5.5} className={classes.adjustSpacing}>
                <DatePickerComponent
                  label="Shipment start"
                  selectedDate={moment(departureDateTime).tz(timezone)}
                  hasTime
                  handleDateChange={(value) => {
                    setDepartureDateTime(value);
                    setArrivalDateTime(value);
                  }}
                  dateFormat={
                    _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
                      ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
                      : ''
                  }
                  timeFormat={
                    _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
                      ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
                      : ''
                  }
                />
              </Grid>

              <Grid item xs={12} sm={5.5}>
                <DatePickerComponent
                  label="Shipment end"
                  selectedDate={moment(arrivalDateTime).tz(timezone)}
                  hasTime
                  handleDateChange={setArrivalDateTime}
                  dateFormat={
                    _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
                      ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
                      : ''
                  }
                  timeFormat={
                    _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
                      ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
                      : ''
                  }
                />
              </Grid>

              <Grid item xs={11} sm={5.5}>
                <TextField
                  variant="outlined"
                  id="status"
                  select
                  fullWidth
                  placeholder="Select..."
                  label="Shipment Status"
                  onBlur={(e) => handleBlur(e, 'required', status, 'status')}
                  {...status.bind}
                >
                  <MenuItem value="">Select</MenuItem>
                  {_.map(SHIPMENT_STATUS, (st, idx) => (
                    <MenuItem key={`${idx}-${st.label}`} value={st.value}>
                      {st.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={1} className={classes.outerAsterisk}>*</Grid>

              <Grid item xs={11.5}>
                <Autocomplete
                  multiple
                  id="items-multiple"
                  disableCloseOnSelect
                  filterSelectedOptions
                  options={_.orderBy(itemData, ['name'], ['asc'])}
                  getOptionLabel={(option) => option && option.name}
                  isOptionEqualToValue={(option, value) => (
                    !value || (value && (option.url === value))
                  )}
                  value={items}
                  onChange={(event, newValue) => onInputChange(newValue, 'item', null)}
                  renderTags={(value, getTagProps) => (
                    _.map(value, (option, index) => (
                      <Chip
                        variant="default"
                        label={
                          !_.isEmpty(itemData) && _.find(itemData, { url: option })
                            ? _.find(itemData, { url: option }).name
                            : ''
                        }
                        {...getTagProps({ index })}
                      />
                    ))
                  )}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox
                        icon={uncheckedIcon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Items to be shipped"
                      placeholder="Select..."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={0.5} className={classes.outerAsterisk}>*</Grid>

              {!_.isEmpty(itemRows) && (
                <Grid item xs={11.5} pt={0}>
                  <DataTableWrapper
                    loading={loading}
                    rows={itemRows}
                    columns={itemColumns(
                      _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'currency'))
                        ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'currency')).unit_of_measure
                        : '',
                    )}
                    hideAddButton
                    noOptionsIcon
                    noSpace
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={5.75} lg={3.83}>
                <div className={classes.fieldset}>
                  <Typography variant="body1" component="div" fontWeight={700}>
                    TEMPERATURE
                  </Typography>

                  <Typography mt={2} className={classes.alertSettingText}>
                    <span className={classes.highest}>HIGHEST</span>
                    {' safe temperature'}
                  </Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="max_excursion_temp"
                    name="max_excursion_temp"
                    autoComplete="max_excursion_temp"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><TemperatureIcon /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="start">
                          {
                            _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature'))
                            && _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature')).unit_of_measure === UOM_TEMPERATURE_CHOICES[0]
                              ? <span>&#8457;</span>
                              : <span>&#8451;</span>
                          }
                        </InputAdornment>
                      ),
                    }}
                    onBlur={(e) => handleBlur(e, 'required', max_excursion_temp, 'max_excursion_temp')}
                    {...max_excursion_temp.bind}
                  />

                  <Typography mt={3} className={classes.alertSettingText}>
                    <span className={classes.lowest}>LOWEST</span>
                    {' safe temperature'}
                  </Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="min_excursion_temp"
                    name="min_excursion_temp"
                    autoComplete="min_excursion_temp"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><TemperatureIcon /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="start">
                          {
                            _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature'))
                            && _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature')).unit_of_measure === UOM_TEMPERATURE_CHOICES[0]
                              ? <span>&#8457;</span>
                              : <span>&#8451;</span>
                          }
                        </InputAdornment>
                      ),
                    }}
                    onBlur={(e) => handleBlur(e, 'required', min_excursion_temp, 'min_excursion_temp')}
                    {...min_excursion_temp.bind}
                  />
                </div>
              </Grid>

              <Grid item xs={12} sm={5.75} lg={3.83}>
                <div className={classes.fieldset}>
                  <Typography variant="body1" component="div" fontWeight={700}>
                    HUMIDITY
                  </Typography>

                  <Typography mt={2} className={classes.alertSettingText}>
                    <span className={classes.highest}>HIGHEST</span>
                    {' safe humidity'}
                  </Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="max_excursion_humidity"
                    name="max_excursion_humidity"
                    autoComplete="max_excursion_humidity"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><HumidityIcon /></InputAdornment>,
                      endAdornment: <InputAdornment position="start">%</InputAdornment>,
                    }}
                    onBlur={(e) => handleBlur(e, 'required', max_excursion_humidity, 'max_excursion_humidity')}
                    {...max_excursion_humidity.bind}
                  />

                  <Typography mt={3} className={classes.alertSettingText}>
                    <span className={classes.lowest}>LOWEST</span>
                    {' safe humidity'}
                  </Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="min_excursion_humidity"
                    name="min_excursion_humidity"
                    autoComplete="min_excursion_humidity"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><HumidityIcon /></InputAdornment>,
                      endAdornment: <InputAdornment position="start">%</InputAdornment>,
                    }}
                    onBlur={(e) => handleBlur(e, 'required', min_excursion_humidity, 'min_excursion_humidity')}
                    {...min_excursion_humidity.bind}
                  />
                </div>
              </Grid>

              <Grid item xs={12} sm={5.75} lg={3.83}>
                <div className={classes.fieldset}>
                  <Typography variant="body1" component="div" fontWeight={700}>
                    SHOCK & LIGHT
                  </Typography>

                  <Typography mt={2} className={classes.alertSettingText}>
                    <span className={classes.highest}>MAX</span>
                    {' shock'}
                  </Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="shock_threshold"
                    name="shock_threshold"
                    autoComplete="shock_threshold"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><ShockIcon /></InputAdornment>,
                      endAdornment: <InputAdornment position="start">G</InputAdornment>,
                    }}
                    onBlur={(e) => handleBlur(e, 'required', shock_threshold, 'shock_threshold')}
                    {...shock_threshold.bind}
                  />

                  <Typography mt={3} className={classes.alertSettingText}>
                    <span className={classes.highest}>MAX</span>
                    {' light'}
                  </Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="light_threshold"
                    name="light_threshold"
                    autoComplete="light_threshold"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LightIcon /></InputAdornment>,
                      endAdornment: <InputAdornment position="start">lumens</InputAdornment>,
                    }}
                    onBlur={(e) => handleBlur(e, 'required', light_threshold, 'light_threshold')}
                    {...light_threshold.bind}
                  />
                </div>
              </Grid>

              <Grid item xs={11.5} textAlign="end">
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  disabled={loading || saveTemplateDisabled()}
                  onClick={saveAsTemplate}
                >
                  Save as Template
                </Button>
              </Grid>
            </Grid>
          </FormControl>

          <FormControl fullWidth component="fieldset" variant="outlined" className={classes.fieldset}>
            <FormLabel component="legend" className={classes.legend}>
              Order Information
            </FormLabel>

            <Grid container spacing={isDesktop ? 4 : 0}>
              <Grid item xs={2}>
                <TextField
                  variant="outlined"
                  fullWidth
                  disabled
                  id="org-abbreviation"
                  name="org-abbreviation"
                  autoComplete="org-abbreviation"
                  value={organization && organization.abbrevation}
                />
              </Grid>

              <Grid item xs={9.5}>
                <TextField
                  variant="outlined"
                  fullWidth
                  id="shipment-name"
                  name="shipment-name"
                  label="Shipment Name"
                  autoComplete="shipment-name"
                  onBlur={(e) => handleBlur(e, 'required', shipmentName, 'shipment-name')}
                  {...shipmentName.bind}
                />
              </Grid>
              <Grid item xs={0.5} className={classes.outerAsterisk}>*</Grid>

              <Grid item xs={5.75}>
                <TextField
                  variant="outlined"
                  fullWidth
                  id="purchase-order-number"
                  name="purchase-order-number"
                  label="Purchase Order Number"
                  autoComplete="purchase-order-number"
                  {...purchaseOrderNumber.bind}
                />
              </Grid>

              <Grid item xs={5.75}>
                <TextField
                  variant="outlined"
                  fullWidth
                  id="bill-of-lading"
                  name="bill-of-lading"
                  label="Bill Of Lading"
                  autoComplete="bill-of-lading"
                  {...billOfLading.bind}
                />
              </Grid>

              <Grid item xs={10}>
                <FormControl fullWidth component="fieldset" variant="outlined" className={classes.attachedFiles}>
                  <FormLabel component="legend" className={classes.legend}>
                    Attached Files
                  </FormLabel>

                  <Stack direction="row" spacing={1}>
                    {!_.isEmpty(files) && _.map(files, (file, idx) => (
                      <Chip
                        key={`${file.name}-${idx}`}
                        variant="outlined"
                        label={file.name}
                        onDelete={(e) => setFiles(_.filter(files, (f, index) => (index !== idx)))}
                      />
                    ))}
                  </Stack>
                </FormControl>
              </Grid>
              <Grid item xs={1.5} className={classes.fileButton}>
                <TextField
                  variant="outlined"
                  fullWidth
                  type="file"
                  id="attach-files"
                  name="attach-files"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ multiple: true }}
                  onChange={fileChange}
                />
              </Grid>

              <Grid item xs={12}>
                {!showNote && (
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    onClick={(e) => setShowNote(true)}
                  >
                    + Add a note
                  </Button>
                )}
                {showNote && (
                  <Grid container spacing={2}>
                    <Grid item xs={11.5}>
                      <TextField
                        variant="outlined"
                        multiline
                        fullWidth
                        maxRows={4}
                        id="note"
                        name="note"
                        label="Note"
                        autoComplete="note"
                        {...note.bind}
                      />
                    </Grid>

                    <Grid item xs={0.5}>
                      <Button
                        type="button"
                        onClick={(e) => {
                          note.setValue('');
                          setShowNote(false);
                        }}
                      >
                        <CancelIcon fontSize="large" className={classes.cancel} />
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Grid>

              {!_.isEmpty(additionalCustodians)
              && _.map(additionalCustodians, (addCust, index) => (
                <Grid item xs={12} key={`${index}-${addCust.custodian_uuid}`}>
                  <Grid container spacing={4}>
                    <Grid item xs={5.5}>
                      <TextField
                        id={`add-cust-${addCust.custodian_uuid}`}
                        select
                        fullWidth
                        placeholder="Select..."
                        label={`Custodian ${index + 1}`}
                        value={addCust}
                        onChange={(e) => {
                          const newList = _.map(
                            additionalCustodians,
                            (cust, idx) => (idx === index ? e.target.value : cust),
                          );
                          setAdditionalCustocations(newList);
                        }}
                      >
                        <MenuItem value="">Select</MenuItem>
                        {!_.isEmpty(custodianList)
                        && _.map(_.without(
                          custodianList,
                          _.find(custodianList, { url: originCustodian }),
                          ..._.without(additionalCustodians, addCust),
                          _.find(custodianList, { url: destinationCustodian }),
                        ), (cust) => (
                          <MenuItem key={cust.custodian_uuid} value={cust}>
                            {cust.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={2.5}>
                      <TextField
                        variant="outlined"
                        id={`add-cust-abb-${addCust.custodian_uuid}`}
                        label="ID"
                        fullWidth
                        disabled
                        value={addCust.abbrevation}
                      />
                    </Grid>

                    <Grid item xs={3.5}>
                      <TextField
                        variant="outlined"
                        id={`add-cust-type-${addCust.custodian_uuid}`}
                        label="Custodian Type"
                        fullWidth
                        disabled
                        value={addCust.type}
                      />
                    </Grid>

                    {index > 0 && (
                      <Grid item xs={0.5}>
                        <Button
                          type="button"
                          onClick={(e) => {
                            const newList = _.filter(
                              additionalCustodians,
                              (cust, idx) => (idx !== index),
                            );
                            setAdditionalCustocations(newList);
                          }}
                        >
                          <CancelIcon fontSize="large" className={classes.cancel} />
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              ))}

              <Grid item xs={11.5}>
                {showAddCustodian && (
                  <TextField
                    variant="outlined"
                    id="additional-custodian"
                    select
                    fullWidth
                    placeholder="Select..."
                    label="Add additional carrier"
                    onChange={(e) => {
                      setAdditionalCustocations([...additionalCustodians, e.target.value]);
                      setShowAddCustodian(false);
                    }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {!_.isEmpty(custodianList)
                    && _.map(_.without(
                      custodianList,
                      _.find(custodianList, { url: originCustodian }),
                      ...additionalCustodians,
                      _.find(custodianList, { url: destinationCustodian }),
                    ), (cust) => (
                      <MenuItem key={cust.custodian_uuid} value={cust}>
                        {cust.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                {!showAddCustodian && (
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    onClick={(e) => setShowAddCustodian(true)}
                  >
                    + Add additional carrier
                  </Button>
                )}
              </Grid>
            </Grid>
          </FormControl>

          <FormControl fullWidth component="fieldset" variant="outlined" className={classes.fieldset}>
            <FormLabel component="legend" className={classes.legend}>
              Tracker
            </FormLabel>

            <Grid container spacing={isDesktop ? 4 : 0}>
              <Grid item xs={5.5}>
                <TextField
                  id="gateway-type"
                  select
                  fullWidth
                  placeholder="Select..."
                  label="Tracker platform"
                  onBlur={(e) => handleBlur(e, 'required', gatewayType, 'gateway-type')}
                  {...gatewayType.bind}
                >
                  <MenuItem value="">Select</MenuItem>
                  {!_.isEmpty(gatewayTypeList) && _.map(gatewayTypeList, (gtype) => (
                    <MenuItem key={gtype.id} value={gtype.url}>
                      {_.capitalize(gtype.name)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={0.5} className={classes.outerAsterisk}>*</Grid>

              <Grid item xs={5.5}>
                <TextField
                  id="gateway"
                  select
                  fullWidth
                  placeholder="Select..."
                  label="Tracker identifier"
                  onBlur={(e) => handleBlur(e, 'required', gateway, 'gateway')}
                  {...gateway.bind}
                >
                  <MenuItem value="">Select</MenuItem>
                  {!_.isEmpty(availableGateways) && _.map(availableGateways, (avgt) => (
                    <MenuItem key={avgt.gateway_uuid} value={avgt}>
                      {avgt.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={0.5} className={classes.outerAsterisk}>*</Grid>
            </Grid>
            {gateway && gateway.value && (
              <Grid item xs={11.5} className={classes.gatewayDetails}>
                <Typography variant="body1" component="div">
                  Battery Level:
                </Typography>
                <BatteryIcon color="secondary" />
                <Typography variant="body1" component="div">
                  {`${gateway.value.last_known_battery_level}%`}
                </Typography>
              </Grid>
            )}
            {gateway && gateway.value && (
              <Grid item xs={12}>
                <Grid container spacing={4}>
                  <Grid item xs={6} />
                  <Grid item xs={2.75}>
                    <TextField
                      id="transmission-interval"
                      select
                      fullWidth
                      placeholder="Select..."
                      label="Transmission interval"
                      onBlur={(e) => handleBlur(e, 'required', transmissionInterval, 'transmission-interval')}
                      {...transmissionInterval.bind}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {!_.isEmpty(TIVE_GATEWAY_TIMES)
                      && _.map(TIVE_GATEWAY_TIMES, (time, index) => (
                        <MenuItem key={`${time.value}-${index}`} value={time.value}>
                          {time.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={2.75}>
                    <TextField
                      id="measurement-interval"
                      select
                      fullWidth
                      placeholder="Select..."
                      label="Measurement interval"
                      onBlur={(e) => handleBlur(e, 'required', measurementInterval, 'measurement-interval')}
                      {...measurementInterval.bind}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {!_.isEmpty(TIVE_GATEWAY_TIMES) && _.map(
                        _.filter(TIVE_GATEWAY_TIMES, (t) => t.value <= transmissionInterval.value),
                        (time, index) => (
                          <MenuItem key={`${time.value}-${index}`} value={time.value}>
                            {time.label}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </FormControl>

          <Grid container spacing={2} className={classes.finalName}>
            <Grid item xs={3}>
              <Typography>ID</Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography>SHIPMENT NAME</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography>ORIGIN</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography>DEST</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <TextField
                variant="outlined"
                id="org-id-final"
                fullWidth
                disabled
                className={classes.finalNameDisplay}
                value={organization && organization.abbrevation}
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                variant="outlined"
                id="shipment-name-final"
                fullWidth
                disabled
                className={classes.finalNameDisplay}
                value={shipmentName.value}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                variant="outlined"
                id="origin-final"
                fullWidth
                disabled
                className={classes.finalNameDisplay}
                value={originAbb}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                variant="outlined"
                id="dest-final"
                fullWidth
                disabled
                className={classes.finalNameDisplay}
                value={destinationAbb}
              />
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            <Grid item xs={12} mt={1}>
              <Typography variant="caption" component="div" textAlign="center" fontStyle="italic" color={theme.palette.background.light}>
                This is your automated shipment number.
                It is automatically generated from the form above.
              </Typography>
            </Grid>

            <Grid item xs={0.5} />
            <Grid item xs={5.5}>
              <Button type="button" variant="outlined" fullWidth onClick={(e) => history.push(routes.SHIPMENT)}>
                Cancel
              </Button>
            </Grid>

            <Grid item xs={5.5}>
              <Button type="submit" variant="contained" fullWidth disabled={loading || submitDisabled()}>
                Create a shipment
              </Button>
            </Grid>
            <Grid item xs={0.5} />
          </Grid>

          <Grid container spacing={4}>
            <Grid item xs={12} mt={2}>
              <Typography variant="caption" component="div" textAlign="center" fontStyle="italic" color={theme.palette.background.light}>
                You must fill out all required fields to create an active shipment
              </Typography>
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
  ...state.custodianReducer,
  ...state.optionsReducer,
  ...state.itemsReducer,
  ...state.sensorsGatewayReducer,
  loading: (
    state.shipmentReducer.loading
    || state.custodianReducer.loading
    || state.optionsReducer.loading
    || state.itemsReducer.loading
    || state.sensorsGatewayReducer.loading
  ),
});

export default connect(mapStateToProps)(CreateShipment);
