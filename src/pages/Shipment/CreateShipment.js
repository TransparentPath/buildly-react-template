import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment-timezone';
import {
  Button,
  useTheme,
  useMediaQuery,
  Grid,
  TextField,
  Typography,
  Box,
  MenuItem,
  CircularProgress,
  InputLabel,
  FormHelperText,
  FormGroup,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Field,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import Loader from '../../components/Loader/Loader';
import FormModal from '../../components/Modal/FormModal';
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
import ShipmentRouteInfo from './components/ShipmentRouteInfo';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  formTitle: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
  },
  step: {
    cursor: 'pointer',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    borderRadius: '1rem',
    fontSize: '14px',
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
  inputWithTooltip: {
    display: 'flex',
    alignItems: 'center',
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

  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const [confirmModalFor, setConfirmModalFor] = useState('');

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

  const closeModal = () => {
    if (checkIfFormEdited()) {
      setConfirmModalFor('close');
      setConfirmModal(true);
    } else {
      setFormModal(false);
      dispatch(saveShipmentFormData(null));
      history.push(routes.SHIPMENT);
    }
  };

  const handleCancel = () => {
    if (checkIfFormEdited()) {
      setConfirmModalFor('close');
      setConfirmModal(true);
    } else {
      dispatch(saveShipmentFormData(null));
      history.push(routes.SHIPMENT);
    }
  };

  const handleConfirmModal = () => {
    setConfirmModal(false);
    if (confirmModalFor === 'close') {
      dispatch(saveShipmentFormData(null));
      history.push(routes.SHIPMENT);
    }
  };

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
              style={{
                border: '1px solid #EBC645',
                padding: '0.5rem',
                borderRadius: '1rem',
              }}
            >
              <FormLabel
                component="legend"
                style={{
                  marginLeft: '1rem',
                }}
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
                      <p>Sample Text 1</p>
                    </Grid>
                    <Grid item xs={12}>
                      <p>Sample Text 2</p>
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
                      <p>Sample Text 3</p>
                    </Grid>
                    <Grid item xs={12}>
                      <p>Sample Text 4</p>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </FormControl>
          </Grid>

        </Box>

        <Grid
          container
          spacing={3}
          className={classes.buttonContainer}
        >
          <Grid item xs={6} sm={2}>
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
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              className={classes.submit}
            >
              Save Shipment
            </Button>
          </Grid>
        </Grid>
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
