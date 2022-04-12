import React, { useEffect, useState, useContext } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment-timezone';
import {
  Typography,
  Tabs,
  Tab,
  Box,
  Grid,
  Button,
  IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  Add as AddIcon,
  ViewComfy as ViewComfyIcon,
  ViewCompact as ViewCompactIcon,
} from '@mui/icons-material';
import Loader from '../../components/Loader/Loader';
import { MapComponent } from '../../components/MapComponent/MapComponent';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import CustomizedTooltips from '../../components/ToolTip/ToolTip';
import { UserContext } from '../../context/User.context';
import SensorReport from '../../pages/Reporting/components/SensorReport';
import {
  getCustodians,
  getCustodianType,
  getContact,
  getCustody,
} from '../../redux/custodian/actions/custodian.actions';
import {
  getItems,
  getItemType,
  getUnitsOfMeasure,
} from '../../redux/items/actions/items.actions';
import {
  getCustodyOptions,
  getShipmentOptions,
} from '../../redux/options/actions/options.actions';
import {
  getGateways,
  getGatewayType,
  getSensors,
  getSensorType,
  getAggregateReport,
} from '../../redux/sensorsGateway/actions/sensorsGateway.actions';
import {
  getShipmentDetails,
  deleteShipment,
} from '../../redux/shipment/actions/shipment.actions';
import { routes } from '../../routes/routesConstants';
import {
  getFormattedRow,
  MAP_TOOLTIP,
} from './ShipmentConstants';
import ShipmentDataTable from './components/ShipmentDataTable';
import AddShipment from './forms/AddShipment';

const useStyles = makeStyles((theme) => ({
  dashboardHeading: {
    fontWeight: 'bold',
  },
  tileHeading: {
    flex: 1,
    padding: theme.spacing(1, 2),
    textTransform: 'uppercase',
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
  },
  addButton: {
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(2),
    },
  },
  switchViewSection: {
    background: '#383636',
    width: '100%',
    display: 'flex',
    minHeight: '40px',
    alignItems: 'center',
  },
  menuButton: {
    marginLeft: 'auto',
    zIndex: '5',
  },
  tabContainer: {
    backgroundColor: '#222222',
    margin: '0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& .MuiTabs-root': {
      zIndex: '5',
    },
  },
}));

const Shipment = (props) => {
  const {
    shipmentData,
    history,
    custodianData,
    dispatch,
    itemData,
    gatewayData,
    unitsOfMeasure,
    custodyData,
    sensorData,
    aggregateReportData,
    loading,
    shipmentOptions,
    custodyOptions,
    timezone,
    shipmentFormData,
  } = props;
  const classes = useStyles();

  const [openConfirmModal, setConfirmModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState('');
  const [activeRows, setActiveRows] = useState([]);
  const [completedRows, setCompletedRows] = useState([]);
  const [cancelledRows, setCancelledRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipmentFilter, setShipmentFilter] = useState('Active');
  const [selectedMarker, setSelectedMarker] = useState({});
  const [markers, setMarkers] = useState([]);
  const [tileView, setTileView] = useState(false);
  const [isMapLoaded, setMapLoaded] = useState(false);

  const subNav = [
    { label: 'Active', value: 'Active' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];
  const organization = useContext(UserContext).organization.organization_uuid;

  useEffect(() => {
    if (!shipmentData) {
      const getUpdatedSensorData = !aggregateReportData;
      const getUpdatedCustody = !custodyData;
      dispatch(getShipmentDetails(
        organization,
        'Planned,Enroute',
        null,
        getUpdatedSensorData,
        getUpdatedCustody,
        'get',
      ));
    } else {
      const UUIDS = _.map(_.filter(shipmentData, (shipment) => shipment.type === 'Active'), 'shipment_uuid');
      const uuids = _.toString(_.without(UUIDS, null));
      const encodedUUIDs = encodeURIComponent(uuids);
      if (encodedUUIDs) {
        dispatch(getCustody(encodedUUIDs));
      }
      const IDS = _.map(_.filter(shipmentData, (shipment) => shipment.type === 'Active'), 'partner_shipment_id');
      const ids = _.toString(_.without(IDS, null));
      const encodedIds = encodeURIComponent(ids);
      if (encodedIds) {
        dispatch(getAggregateReport(encodedIds));
      }
    }
    if (!custodianData) {
      dispatch(getCustodians(organization));
      dispatch(getCustodianType());
      dispatch(getContact(organization));
    }
    if (!itemData) {
      dispatch(getItems(organization));
      dispatch(getItemType(organization));
    }
    if (!gatewayData) {
      dispatch(getGateways(organization));
      dispatch(getGatewayType());
    }
    if (!unitsOfMeasure) {
      dispatch(getUnitsOfMeasure());
    }
    // if (!custodyData) {
    //   dispatch(getCustody());
    // }
    if (!sensorData) {
      dispatch(getSensors(organization));
      dispatch(getSensorType());
    }
    if (!shipmentOptions) {
      dispatch(getShipmentOptions());
    }
    if (!custodyOptions) {
      dispatch(getCustodyOptions());
    }
  }, []);

  useEffect(() => {
    if (
      shipmentData
      && custodianData
      && custodyData
      && aggregateReportData
    ) {
      const formattedRows = getFormattedRow(
        shipmentData,
        custodianData,
        custodyData,
        aggregateReportData,
        shipmentFormData,
        dispatch,
      );
      const ACTIVE_ROWS = _.filter(
        formattedRows,
        { type: 'Active' },
      );
      const COMPLETED_ROWS = _.filter(
        formattedRows,
        { type: 'Completed' },
      );
      const CANCELLED_ROWS = _.filter(
        formattedRows,
        { type: 'Cancelled' },
      );

      setRows(formattedRows);
      setActiveRows(ACTIVE_ROWS);
      setCompletedRows(COMPLETED_ROWS);
      setCancelledRows(CANCELLED_ROWS);
      if (!selectedShipment && formattedRows.length) {
        if (shipmentFilter === 'Cancelled') {
          setSelectedShipment(CANCELLED_ROWS[0]);
        } else if (shipmentFilter === 'Completed') {
          setSelectedShipment(COMPLETED_ROWS[0]);
        } else {
          setSelectedShipment(ACTIVE_ROWS[0]);
        }
      }
    }
  }, [shipmentData, custodianData, custodyData, aggregateReportData]);

  useEffect(() => {
    if (selectedShipment) {
      let markersToSet = [];
      let aggregateReportInfo = [];
      const temperatureUnit = _.filter(
        unitsOfMeasure,
        { supported_class: 'Temperature' },
      )[0].name.toLowerCase();
      let counter = 0;
      _.forEach(selectedShipment.sensor_report, (report) => {
        if (report.report_entries.length > 0) {
          _.forEach(report.report_entries, (report_entry) => {
            try {
              counter += 1;
              const temperature = report_entry.report_temp;
              let dateTime;
              if ('report_timestamp' in report_entry) {
                if (report_entry.report_timestamp !== null) {
                  dateTime = moment(report_entry.report_timestamp)
                    .tz(timezone).format('MMM DD YYYY, h:mm:ss a');
                }
              } else if ('report_location' in report_entry) {
                dateTime = moment(
                  report_entry.report_location.timeOfPosition,
                ).tz(timezone).format('MMM DD YYYY, h:mm:ss a');
              }

              // For a valid (latitude, longitude) pair: -90<=X<=+90 and -180<=Y<=180
              if (report_entry.report_location !== null
                && report_entry.report_latitude !== null
                && report_entry.report_longitude !== null) {
                const latitude = report_entry.report_latitude
                || report_entry.report_location.latitude;
                const longitude = report_entry.report_longitude
                || report_entry.report_location.longitude;
                if (
                  (latitude >= -90
                  && latitude <= 90)
                && (longitude >= -180
                  && longitude <= 180)
                && dateTime !== ''
                ) {
                  const marker = {
                    lat: latitude,
                    lng: longitude,
                    label: 'Clustered',
                    temperature,
                    light: report_entry.report_light,
                    shock: report_entry.report_shock,
                    tilt: report_entry.report_tilt,
                    humidity: report_entry.report_humidity,
                    battery: report_entry.report_battery,
                    pressure: report_entry.report_pressure,
                    color: 'green',
                    timestamp: dateTime,
                  };
                  // Considered use case: If a shipment stays at some
                  // position for long, other value changes can be
                  // critical
                  const markerFound = _.find(markersToSet, {
                    lat: marker.lat,
                    lng: marker.lng,
                  });

                  if (!markerFound) {
                    markersToSet = [...markersToSet, marker];
                  }
                  aggregateReportInfo = [
                    ...aggregateReportInfo,
                    marker,
                  ];
                }
              } else {
                const marker = {
                  lat: '*',
                  lng: '*',
                  label: 'Clustered',
                  temperature,
                  light: report_entry.report_light,
                  shock: report_entry.report_shock,
                  tilt: report_entry.report_tilt,
                  humidity: report_entry.report_humidity,
                  battery: report_entry.report_battery,
                  pressure: report_entry.report_pressure,
                  color: 'green',
                  timestamp: dateTime,
                };
                aggregateReportInfo = [
                  ...aggregateReportInfo,
                  marker,
                ];
              }
            } catch (e) {
              // eslint-disable-next-line no-console
              console.log(e);
            }
          });
        }
      });
      setMarkers(_.orderBy(
        markersToSet,
        (item) => moment(item.timestamp),
        ['asc'],
      ));
      selectedShipment.sensor_report_info = aggregateReportInfo;
      console.log('Shipment records: ', counter);
    }
  }, [selectedShipment, timezone]);

  useEffect(() => {
    if (markers && markers.length > 0) {
      setTimeout(() => setMapLoaded(true), 1000);
    }
  });

  useEffect(() => {
    if (shipmentFilter && rows.length) {
      if (shipmentFilter === 'Cancelled') {
        setSelectedShipment(cancelledRows[0]);
      } else if (shipmentFilter === 'Completed') {
        setSelectedShipment(completedRows[0]);
      } else {
        setSelectedShipment(activeRows[0]);
      }
    }
  }, [shipmentFilter, shipmentData]);

  const onAddButtonClick = () => {
    history.push(`${routes.SHIPMENT}/add`, {
      from: routes.SHIPMENT,
    });
  };

  const handleEdit = (item) => {
    history.push(`${routes.SHIPMENT}/edit/:${item.id}`, {
      type: 'edit',
      data: item,
      from: routes.SHIPMENT,
    });
  };

  const handleDelete = (item) => {
    setDeleteItemId(item.id);
    setConfirmModal(true);
  };

  const handleConfirmModal = () => {
    dispatch(deleteShipment(deleteItemId, organization));
    setConfirmModal(false);
  };

  const filterTabClicked = (event, filter) => {
    setSelectedShipment(null);
    setMarkers({});
    setShipmentFilter(filter);
    let shipmentStatus = '';
    switch (filter) {
      case 'Active':
      default:
        shipmentStatus = 'Planned,Enroute';
        break;
      case 'Completed':
      case 'Cancelled':
        shipmentStatus = filter;
        break;
    }
    const shipmentRows = _.filter(shipmentData, { type: filter });

    if (shipmentRows.length === 0) {
      dispatch(getShipmentDetails(
        organization,
        shipmentStatus,
        null,
        true,
        true,
        'get',
      ));
    }
  };

  const handleCopy = (item) => {
    const copyData = {
      transport_mode: item.transport_mode,
      status: 'Planned',
      max_excursion_temp: item.max_excursion_temp,
      min_excursion_temp: item.min_excursion_temp,
      max_excursion_humidity: item.max_excursion_humidity,
      min_excursion_humidity: item.min_excursion_humidity,
      max_warning_temp: item.max_warning_temp,
      min_warning_temp: item.min_warning_temp,
      max_warning_humidity: item.max_warning_humidity,
      min_warning_humidity: item.min_warning_humidity,
      route_description: item.route_description,
      unit_of_measure: item.unit_of_measure,
      value: item.value,
      gross_weight: item.gross_weight,
      net_weight: item.net_weight,
      organization_uuid: item.organization_uuid,
      uom_weight: item.uom_weight,
      uom_temp: item.uom_temp,
      uom_distance: item.uom_distance,
      items: item.items,
    };

    history.push(`${routes.SHIPMENT}/add`, {
      type: 'copy',
      data: copyData,
      from: routes.SHIPMENT,
    });
  };

  return (
    <Box mt={5} mb={5}>
      {loading && <Loader open={loading} />}
      <Box mb={3} mt={2} display="flex" alignItems="center" justifyContent="space-between">
        <Typography
          className={classes.dashboardHeading}
          variant="h4"
        >
          Shipments
        </Typography>
        <Button
          type="button"
          variant="contained"
          color="primary"
          className={classes.addButton}
          onClick={onAddButtonClick}
        >
          <AddIcon />
          {' '}
          Add Shipment
        </Button>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={tileView ? 6 : 12}>
          <Box mb={3} className={classes.tabContainer}>
            <Tabs
              value={shipmentFilter}
              onChange={filterTabClicked}
            >
              {subNav.map((itemProps, index) => (
                <Tab
                  {...itemProps}
                  key={`tab${index}:${itemProps.value}`}
                />
              ))}
            </Tabs>
            <IconButton
              className={classes.menuButton}
              onClick={() => setTileView(!tileView)}
              color="default"
              aria-label="menu"
              sx={{
                display: {
                  xs: 'none',
                  md: 'block',
                },
              }}
            >
              {!tileView
                ? <ViewCompactIcon />
                : <ViewComfyIcon />}
            </IconButton>
          </Box>
          <ShipmentDataTable
            rows={
              // eslint-disable-next-line no-nested-ternary
              shipmentFilter === 'Cancelled'
                ? cancelledRows
                : shipmentFilter === 'Completed'
                  ? completedRows
                  : activeRows
            }
            editAction={handleEdit}
            deleteAction={handleDelete}
            copyAction={handleCopy}
            rowsType={shipmentFilter}
            setSelectedShipment={setSelectedShipment}
            tileView={tileView}
            timezone={timezone}
          />
        </Grid>
        <Grid item xs={12} md={tileView ? 6 : 12}>
          <div className={classes.switchViewSection}>
            {
              selectedShipment
                ? (
                  <Typography
                    className={classes.tileHeading}
                    variant="h5"
                  >
                    {selectedShipment.name}
                  </Typography>
                )
                : (
                  <CustomizedTooltips toolTipText={MAP_TOOLTIP} />
                )
            }
            <IconButton
              className={classes.menuButton}
              onClick={() => setTileView(!tileView)}
              color="default"
              aria-label="menu"
              sx={{
                display: {
                  xs: 'none',
                  md: 'block',
                },
              }}
            >
              {!tileView
                ? <ViewCompactIcon />
                : <ViewComfyIcon />}
            </IconButton>
          </div>
          <MapComponent
            isMarkerShown={isMapLoaded}
            showPath
            markers={markers}
            shipmentFilter={shipmentFilter}
            googleMapURL={window.env.MAP_API_URL}
            zoom={12}
            setSelectedMarker={setSelectedMarker}
            loadingElement={
              <div style={{ height: '100%' }} />
            }
            containerElement={
              <div style={{ height: '600px' }} />
            }
            mapElement={
              <div style={{ height: '100%' }} />
            }
          />
        </Grid>
      </Grid>
      <SensorReport
        loading={loading}
        aggregateReport={selectedShipment && selectedShipment?.sensor_report_info}
        shipmentName={selectedShipment && selectedShipment?.name}
        selectedMarker={selectedShipment && selectedMarker}
      />
      <Route
        path={`${routes.SHIPMENT}/add`}
        component={AddShipment}
      />
      <Route
        path={`${routes.SHIPMENT}/edit/:id`}
        component={AddShipment}
      />
      <ConfirmModal
        open={openConfirmModal}
        setOpen={setConfirmModal}
        submitAction={handleConfirmModal}
        title="Are You sure you want to Delete this Shipment? The shipment will be ended in other platforms"
        submitText="Delete"
      />
    </Box>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.shipmentReducer,
  ...state.custodianReducer,
  ...state.itemsReducer,
  ...state.sensorsGatewayReducer,
  ...state.optionsReducer,
  loading: (
    state.shipmentReducer.loading
    || state.custodianReducer.loading
    || state.itemsReducer.loading
    || state.sensorsGatewayReducer.loading
    || state.optionsReducer.loading
  ),
});

export default connect(mapStateToProps)(Shipment);
