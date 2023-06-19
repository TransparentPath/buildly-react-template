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
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  BoltOutlined as ShockIcon,
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
import { getContact, getCustodians } from '../../redux/custodian/actions/custodian.actions';
import { getItemType, getItems, getUnitOfMeasure } from '../../redux/items/actions/items.actions';
import { addShipmentTemplate, getShipmentTemplates } from '../../redux/shipment/actions/shipment.actions';
import { getCustodianFormattedRow, getItemFormattedRow, itemColumns } from '../../utils/constants';
import { SHIPMENT_STATUS, UOM_TEMPERATURE_CHOICES } from '../../utils/mock';
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
    paddingTop: `${theme.spacing(5)} !important`,
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
  const note = useInput('');
  const [additionalCustodians, setAdditionalCustocations] = useState([]);

  const [formError, setFormError] = useState({});

  const uncheckedIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  useEffect(() => {
    dispatch(getShipmentTemplates(organization.organization_uuid));
    dispatch(getCustodians(organization.organization_uuid));
    dispatch(getContact(organization.organization_uuid));
    dispatch(getUnitOfMeasure(organization.organization_uuid));
    dispatch(getItems(organization.organization_uuid));
    dispatch(getItemType(organization.organization_uuid));
  }, []);

  useEffect(() => {
    if (!_.isEmpty(custodianData) && !_.isEmpty(contactInfo)) {
      setCustodianList(getCustodianFormattedRow(custodianData, contactInfo));
    }
  }, [custodianData, contactInfo]);

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

      <form className={classes.form} noValidate>
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
                      required
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
                      required
                      value={originAbb}
                    />
                  </Grid>
                  <Grid item xs={1} className={classes.innerAsterisk}>*</Grid>

                  <Grid item xs={11}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      required
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
                      required
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
                      required
                      value={destinationAbb}
                    />
                  </Grid>
                  <Grid item xs={1} className={classes.innerAsterisk}>*</Grid>

                  <Grid item xs={11}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      required
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
                  required
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
              <Grid item xs={0.5} className={classes.innerAsterisk} style={{ paddingLeft: 16 }}>
                *
              </Grid>

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
                    required
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
                    required
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
                    required
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
                    required
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
                    required
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
                    required
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
                  disabled={saveTemplateDisabled()}
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
                  required
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
                  required
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
                  required
                  id="bill-of-lading"
                  name="bill-of-lading"
                  label="Bill Of Lading"
                  autoComplete="bill-of-lading"
                  {...billOfLading.bind}
                />
              </Grid>
            </Grid>
          </FormControl>
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
  loading: (
    state.shipmentReducer.loading
    || state.custodianReducer.loading
    || state.optionsReducer.loading
    || state.itemsReducer.loading
  ),
});

export default connect(mapStateToProps)(CreateShipment);
