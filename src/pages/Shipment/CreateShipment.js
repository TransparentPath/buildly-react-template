/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import Geocode from 'react-geocode';
import _ from 'lodash';
import moment from 'moment-timezone';
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
import { routes } from '../../routes/routesConstants';
import { checkForGlobalAdmin } from '../../utils/utilMethods';
import DatePickerComponent from '../../components/DatePicker/DatePicker';
import CustomizedTooltips from '../../components/ToolTip/ToolTip';
import { useInput } from '../../hooks/useInput';
import {
  editShipment,
  addShipment,
  saveShipmentFormData,
} from '../../redux/shipment/actions/shipment.actions';
import {
  SHIPMENT_STATUS,
  TRANSPORT_MODE,
} from '../../utils/mock';
import { setOptionsData } from '../../utils/utilMethods';
import { validators } from '../../utils/validators';
import {
  getFormattedRow,
  getFormattedSensorRow,
  getAvailableGateways,
} from '../../pages/SensorsGateway/Constants';

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
    shipmentOptions,
    timezone,
    gatewayData,
    itemData,
    itemTypeList,
    gatewayTypeList,
    shipmentData,
    sensorData,
    sensorTypeList,

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
    (editData && editData.estimated_time_of_departure)
    || new Date(),
  );
  const [scheduled_arrival, handleScheduledDateChange] = useState(
    (editData && editData.estimated_time_of_arrival)
    || new Date(),
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

  const [min_temp_val, changeMinTempVal] = useState(
    (shipmentFormData && shipmentFormData.min_excursion_temp) || 0,
  );
  const [max_temp_val, changeMaxTempVal] = useState(
    (shipmentFormData && shipmentFormData.max_excursion_temp) || 100,
  );
  const [minMaxTempValue, setMinMaxTempValue] = useState(
    shipmentFormData && [
      shipmentFormData.min_excursion_temp || 0,
      shipmentFormData.min_warning_temp || 35,
      shipmentFormData.max_warning_temp || 75,
      shipmentFormData.max_excursion_temp || 100,
    ],
  );
  const [low_temp_val, changeLowTempVal] = useState(
    (shipmentFormData && shipmentFormData.min_warning_temp) || 35,
  );
  const [high_temp_val, changeHighTempVal] = useState(
    (shipmentFormData && shipmentFormData.max_warning_temp) || 75,
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
      shipmentFormData.min_warning_humidity || 35,
      shipmentFormData.max_warning_humidity || 75,
      shipmentFormData.max_excursion_humidity || 100,
    ],
  );
  const [low_humid_val, changeLowHumidVal] = useState(
    (shipmentFormData && shipmentFormData.min_warning_humidity) || 35,
  );
  const [high_humid_val, changeHighHumidVal] = useState(
    (shipmentFormData && shipmentFormData.max_warning_humidity) || 75,
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
    uom_temp: '',
    uom_distance: '',
    uom_weight,
    platform_name: '',
  });

  const organization = useContext(UserContext).organization.organization_uuid;

  let formTitle;
  if (!editPage) {
    formTitle = 'Create Shipment';
  } else if (viewOnly) {
    formTitle = 'View Shipment';
  } else {
    formTitle = 'Edit Shipment';
  }

  useEffect(() => {
    if (editPage || shipmentFormData === null) {
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

  const checkIfFormEdited = () => {
    console.log('In form edited');
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
      ...copyData,
      name: shipment_name.value,
      status: shipment_status.value ? shipment_status.value : 'Planned',
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
      uom_distance,
      uom_temp,
      uom_weight,
      organization_uuid: organization,
      // platform_name,
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
            organization,
            attachedGateway[0],
          ),
        );
      } else {
        dispatch(
          editShipment(
            shipmentFormValue,
            history,
            `${routes.SHIPMENT}/edit/:${editData.id}`,
            organization,
            null,
          ),
        );
      }
    } else {
      dispatch(addShipment(shipmentFormValue, history, null, organization));
    }
  };

  let latLongChanged = false;

  const [custodianURL, setCustodianURL] = useState(
    (editData && editData.custodian_data && editData.custodian_data.url) || '',
  );
  const [custodianList, setCustodianList] = useState([]);
  const [start_of_custody, handleStartChange] = useState(
    (editData && editData.start_of_custody) || new Date(),
  );
  const [end_of_custody, handleEndChange] = useState(
    (editData && editData.end_of_custody) || new Date(),
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

  // const load_id = useInput((editData && editData.load_id) || rows.length + 1);

  const shipment = useInput(
    shipmentFormData && shipmentFormData.shipment_uuid,
    '',
    { required: true },
  );
  // const shipment_name = useInput(shipmentFormData && shipmentFormData.name, '');
  const has_current_custody = useInput(
    (editData && editData.has_current_custody) || false,
  );
  const first_custody = useInput((editData && editData.first_custody) || false);
  const last_custody = useInput((editData && editData.last_custody) || false);
  // const [formError, setFormError] = useState({});

  const [custodyMetaData, setCustodyMetaData] = useState({});

  // useEffect(() => {
  //   if (custodyOptions && custodyOptions.actions) {
  //     setCustodyMetaData(custodyOptions.actions.POST);
  //   }
  // }, [custodyOptions]);

  // useEffect(() => {
  //   if (
  //     custodianData
  //     && contactInfo
  //     && custodianData.length
  //   ) {
  //     setCustodianList(getFormattedRow(
  //       custodianData,
  //       contactInfo,
  //     ));
  //   }
  // }, [custodianData, contactInfo]);

  // useEffect(() => {
  //   if (editData && editData.start_of_custody_location) {
  //     getAddress(
  //       editData.start_of_custody_location,
  //       'start',
  //     );
  //   }
  //   if (editData && editData.end_of_custody_location) {
  //     getAddress(
  //       editData.end_of_custody_location,
  //       'end',
  //     );
  //   }
  // }, [editData]);

  // const submitDisabled = () => !custodianURL;

  const onInputChange = (e) => {
    const { value } = e.target;
    if (value) {
      setCustodianURL(value);
      if (custodianList.length > 0) {
        let selectedCustodian = '';
        _.forEach(custodianList, (list) => {
          if (list.url === value) {
            selectedCustodian = list;
          }
        });
        getLatLong(selectedCustodian.location, 'start');
        getLatLong(selectedCustodian.location, 'end');
      }
    } else {
      setCustodianURL(value);
    }
  };

  // const handleBlur = (e, validation, input, parentId) => {
  //   const validateObj = validators(validation, input);
  //   const prevState = { ...formError };
  //   if (validateObj && validateObj.error) {
  //     setFormError({
  //       ...prevState,
  //       [e.target.id || parentId]: validateObj,
  //     });
  //   } else {
  //     setFormError({
  //       ...prevState,
  //       [e.target.id || parentId]: {
  //         error: false,
  //         message: '',
  //       },
  //     });
  //   }
  // };

  /**
   * Submit The form and add/edit custodian
   * @param {Event} event the default submit event
   */
  // const onAddCustodyClick = (event) => {
  //   event.preventDefault();
  //   const custodyFormValues = {
  //     start_of_custody,
  //     end_of_custody,
  //     custodian: [custodianURL],
  //     start_of_custody_location: start_of_custody_location || null,
  //     end_of_custody_location: end_of_custody_location || null,
  //     shipment_id: shipment.value,
  //     has_current_custody: has_current_custody.value,
  //     first_custody: first_custody.value,
  //     last_custody: last_custody.value,
  //     radius: organizationData.radius,
  //     load_id: load_id.value,
  //     ...(editData !== null && { id: editData.id }),
  //     shipment_name: shipment_name.value,
  //     shipment: shipmentFormData.id,
  //   };
  //   if (editData !== null) {
  //     dispatch(editCustody(custodyFormValues));
  //   } else {
  //     dispatch(addCustody(custodyFormValues));
  //   }
  //   checkIfCustodianInfoEdited = () => false;
  //   setOpenModal();
  // };

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

  // checkIfCustodianInfoEdited = () => (
  //   custodianURL !== (
  //     (editData && editData.custodian_data && editData.custodian_data.url)
  //     || '')
  //   || load_id.hasChanged()
  //   || (editData && (start_of_custody !== editData.start_of_custody))
  //   || (editData && (end_of_custody !== editData.end_of_custody))
  //   || latLongChanged
  //   || has_current_custody.hasChanged()
  //   || first_custody.hasChanged()
  //   || last_custody.hasChanged()
  // );

  const [shipmentMetaData, setShipmentMetaData] = useState({});

  useEffect(() => {
    if (shipmentOptions && shipmentOptions.actions) {
      setShipmentMetaData(shipmentOptions.actions.POST);
    }
  }, [shipmentOptions]);

  const handleTempMinMaxChange = (e, value) => {
    setMinMaxTempValue(value);
    changeMinTempVal(value[0]);
    changeMaxTempVal(value[3]);
    changeHighTempVal(value[2]);
    changeLowTempVal(value[1]);
  };

  const handleHumidMinMaxChange = (e, value) => {
    setMinMaxHumidValue(value);
    changeMinHumidVal(value[0]);
    changeMaxHumidVal(value[3]);
    changeHighHumidVal(value[2]);
    changeLowHumidVal(value[1]);
  };

  // /**
  //  * Submit The form and add/edit custodian
  //  * @param {Event} event the default submit event
  //  */
  //  const handleSubmit = (event) => {
  //   event.preventDefault();
  //   const shipmentFormValue = {
  //     ...{
  //       ...shipmentFormData,
  //       max_warning_temp: high_temp_val,
  //       min_warning_temp: low_temp_val,
  //       max_excursion_temp: max_temp_val,
  //       min_excursion_temp: min_temp_val,
  //       max_warning_humidity: high_humid_val,
  //       min_warning_humidity: low_humid_val,
  //       max_excursion_humidity: max_humid_val,
  //       min_excursion_humidity: min_humid_val,
  //     },
  //   };
  //   dispatch(
  //     editShipment(
  //       shipmentFormValue,
  //       history,
  //       `${routes.SHIPMENT}/edit/:${shipmentFormData.id}`,
  //       organization,
  //     ),
  //   );
  // };

  // const shipmentFormMinMaxHumid = [
  //   shipmentFormData.min_excursion_humidity || 0,
  //   shipmentFormData.min_warning_humidity || 35,
  //   shipmentFormData.max_warning_humidity || 75,
  //   shipmentFormData.max_excursion_humidity || 100,
  // ];

  // const shipmentFormMinMaxTemp = [
  //   shipmentFormData.min_excursion_temp || 0,
  //   shipmentFormData.min_warning_temp || 35,
  //   shipmentFormData.max_warning_temp || 75,
  //   shipmentFormData.max_excursion_temp || 100,
  // ];

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

  const [itemIds, setItemIds] = useState(
    (shipmentFormData && shipmentFormData.items) || [],
  );

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
  // let rows = [];

  if (itemData && itemData.length) {
    let selectedRows = [];
    _.forEach(itemData, (item) => {
      if (_.indexOf(itemIds, item.url) !== -1) {
        selectedRows = [...selectedRows, item];
      }
    });
    // rows = getFormattedRow(selectedRows, itemTypeList, unitsOfMeasure);
  }

  // const onInputChange = (value) => {
  //   switch (true) {
  //     case (value.length > itemIds.length):
  //       setItemIds([...itemIds, _.last(value).url]);
  //       break;

  //     case (value.length < itemIds.length):
  //       setItemIds(value);
  //       break;

  //     default:
  //       break;
  //   }
  // };

  // const submitDisabled = () => (
  //   itemIds.length === 0
  //   || itemData === null
  // );

  // checkIfItemInfoEdited = () => !!(itemIds.length !== shipmentFormData.items.length);
  /**
   * Submit The form and add/edit custodian
   * @param {Event} event the default submit event
   */
  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   const shipmentFormValue = {
  //     ...{ ...shipmentFormData, items: itemIds },
  //   };
  //   dispatch(
  //     editShipment(
  //       shipmentFormValue,
  //       history,
  //       `${routes.SHIPMENT}/edit/:${shipmentFormData.id}`,
  //       organization,
  //     ),
  //   );
  // };

  // const onNextClick = (event) => {
  //   if (checkIfItemInfoEdited()) {
  //     handleSubmit(event);
  //   }
  //   handleNext();
  // };

  // const onCancelClick = () => {
  //   if (checkIfItemInfoEdited()) {
  //     setConfirmModalFor('close');
  //     setConfirmModal(true);
  //   } else {
  //     handleCancel();
  //   }
  // };

  const [gatewayIds, setGatewayIds] = useState(
    (shipmentFormData && shipmentFormData.gateway_ids) || [],
  );
  const [platform_name, setPlatformName] = useState(
    (shipmentFormData && shipmentFormData.platform_name) || 'tive',
  );
  const [options, setOptions] = useState([]);

  let rows = [];
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
    rows = getFormattedRow(selectedRows, gatewayTypeList, shipmentData);
    sensorsRow = getFormattedSensorRow(selectedSensors, sensorTypeList);
  }

  useEffect(() => {
    const metadata = { ...fieldsMetadata };
    if (shipmentOptions && shipmentOptions.actions) {
      metadata.platform_name = setOptionsData(
        shipmentOptions.actions.POST,
        'platform_name',
      );
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
      setOptions(opts);
    }
  }, [gatewayData, platform_name, gatewayTypeList, shipmentData]);

  // const onInputChange = (value) => {
  //   switch (true) {
  //     case (value.length > gatewayIds.length):
  //       setGatewayIds([...gatewayIds, _.last(value).gateway_uuid]);
  //       break;

  //     case (value.length < gatewayIds.length):
  //       setGatewayIds(value);
  //       break;

  //     default:
  //       break;
  //   }
  // };

  // const submitDisabled = () => !gatewayIds.length || gatewayData === null;

  // eslint-disable-next-line max-len
  // checkIfSensorGatewayEdited = () => {
  //   if (gatewayIds.length) {
  //     return shipmentFormData.gateway_ids
  //       ? !!(gatewayIds.length !== shipmentFormData.gateway_ids.length) : true;
  //   }
  //   return false;
  // };

  // /**
  //  * Submit The form and add/edit custodian
  //  * @param {Event} event the default submit event
  //  */
  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   const updateGateway = _.find(gatewayData, { gateway_uuid: gatewayIds[0] });
  //   const shipmentFormValue = {
  //     ...{
  //       ...shipmentFormData,
  //       platform_name,
  //       gateway_ids: gatewayIds,
  //       gateway_imei: [updateGateway.imei_number],
  //     },
  //   };
  //   dispatch(
  //     editShipment(
  //       shipmentFormValue,
  //       history,
  //       `${routes.SHIPMENT}/edit/:${shipmentFormData.id}`,
  //       organization,
  //     ),
  //   );
  //   dispatch(editGateway({
  //     ...updateGateway,
  //     gateway_status: 'assigned',
  //     shipment_ids: [shipmentFormData.id],
  //   }));
  // };

  return (
    <Box mt={5} mb={5}>
      {loading && <Loader open={loading} />}
      <Box mb={3} mt={2} display="flex" alignItems="center" justifyContent="space-between">
        <Typography
          className={classes.dashboardHeading}
          variant="h4"
        >
          Create Shipment
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
                        id="start_custody_name"
                        label="Origin Company"
                        name="first_custody"
                        autoComplete="origin_company"
                      />
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
                            radius: 10,
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
                        id="start_custody_name"
                        label="Destination Company"
                        name="first_custody"
                        autoComplete="origin_company"
                      />
                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        id="start_of_custody_address"
                        label="Destination Address"
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
                            radius: 10,
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
                      {fieldsMetadata.mode_type.help_text
                    && (
                      <CustomizedTooltips
                        toolTipText={
                          fieldsMetadata.mode_type.help_text
                        }
                      />
                    )}
                    </Grid>
                    <Grid
                      item
                      xs={12}
                    >
                      <Autocomplete
                        multiple
                        id="tags-outlined"
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
                        onChange={(event, newValue) => onInputChange(newValue)}
                        renderTags={(value, getTagProps) => (
                          _.map(value, (option, index) => (
                            <Chip
                              variant="default"
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
                          <li {...props}>
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
                            placeholder="Select an item"
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
                        classname={classes.envinput}
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
                        id="organization"
                        label="Organization"
                        name="organization"
                        autoComplete="organization"
                        disabled={viewOnly}
                        {...organization.bind}
                      />

                    </Grid>
                    <Grid item xs={10} sm={8}>
                      <TextField
                        variant="outlined"
                        required
                        margin="normal"
                        fullWidth
                        id="load_no"
                        label="Order Number"
                        name="load_no"
                        autoComplete="load_no"
                        disabled={viewOnly}
                        {...load_no.bind}
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
                        id="lading_bill"
                        label="Bill of lading"
                        name="lading_bill"
                        autoComplete="lading_bill"
                        disabled={viewOnly}
                        {...lading_bill.bind}
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
                      // handleDateChange={handleDepartureDateChange}
                        disabled={viewOnly}
                        helpText={
                        fieldsMetadata.scheduled_departure
                        && fieldsMetadata.scheduled_departure.help_text
                          ? fieldsMetadata.scheduled_departure.help_text
                          : ''
                      }
                      />
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
                        id="lading_bill"
                        label="Shipper Number"
                        name="lading_bill"
                        autoComplete="lading_bill"
                        disabled={viewOnly}
                        {...lading_bill.bind}
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
                      // handleDateChange={handleScheduledDateChange}
                        disabled={viewOnly}
                        helpText={
                        fieldsMetadata.scheduled_arrival
                        && fieldsMetadata.scheduled_arrival.help_text
                          ? fieldsMetadata.scheduled_arrival.help_text
                          : ''
                      }
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
                    {/* {SENSOR_PLATFORM
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
                      )} */}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <Autocomplete
                    multiple
                    id="combo-box-demo"
                    disabled={
                    viewOnly
                    || (shipmentFormData
                      && shipmentFormData.gateway_ids
                      && shipmentFormData.gateway_ids.length > 0
                    )
                  }
                    options={options}
                    getOptionLabel={(option) => (
                      option
                    && option.name
                    )}
                    isOptionEqualToValue={(option, value) => (
                      option.gateway_uuid === value
                    )}
                    filterSelectedOptions
                    value={gatewayIds}
                    onChange={(event, newValue) => onInputChange(newValue)}
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
                      <li {...props}>
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
                  id="load_no_1"
                  label="Org"
                  name="load_no"
                  autoComplete="load_no"
                  disabled={viewOnly}
                  {...load_no.bind}
                  style={{
                    width: '20%',
                  }}
                />
                <TextField
                  variant="outlined"
                  required
                  margin="normal"
                  id="load_no_2"
                  label="Order No."
                  name="load_no"
                  autoComplete="load_no"
                  disabled={viewOnly}
                  {...load_no.bind}
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
                  id="load_no_3"
                  label="Origin"
                  name="load_no"
                  autoComplete="load_no"
                  disabled={viewOnly}
                  {...load_no.bind}
                  className={classes.smallInput}
                />
                <TextField
                  variant="outlined"
                  required
                  margin="normal"
                  id="load_no_4"
                  label="Dest."
                  name="load_no"
                  autoComplete="load_no"
                  disabled={viewOnly}
                  {...load_no.bind}
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
  ...state.optionsReducer,
});

export default connect(mapStateToProps)(CreateShipment);
