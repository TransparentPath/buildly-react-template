import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment-timezone';
import {
  Box,
  Button,
  Chip,
  Fade,
  FormControl,
  FormLabel,
  Grid,
  Stack,
  Tab,
  TableCell,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  tooltipClasses,
  useTheme,
} from '@mui/material';
import { Assignment as NoteIcon } from '@mui/icons-material';
import { makeStyles, styled } from '@mui/styles';
import Loader from '../../components/Loader/Loader';
import MapComponent from '../../components/MapComponent/MapComponent';
import DataTableWrapper from '../../components/DataTableWrapper/DataTableWrapper';
import { UserContext } from '../../context/User.context';
import {
  getContact,
  getCustodians,
} from '../../redux/custodian/actions/custodian.actions';
import { getItems, getUnitOfMeasure } from '../../redux/items/actions/items.actions';
import { getGateways } from '../../redux/sensorsGateway/actions/sensorsGateway.actions';
import { getShipmentDetails } from '../../redux/shipment/actions/shipment.actions';
import { getShipmentFormattedRow, shipmentColumns } from '../../utils/constants';
import { routes } from '@routes/routesConstants';

const useStyles = makeStyles((theme) => ({
  title: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.light,
  },
  tabs: {
    [theme.breakpoints.down('sm')]: {
      '& .MuiTabs-scroller': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
    },
    [theme.breakpoints.up('sm')]: {
      position: 'absolute',
      top: '24%',
      left: '0',
    },
  },
  tab: {
    color: theme.palette.background.default,
  },
  dataTable: {
    marginTop: '-40px',
    '& .MuiTableCell-root': {
      color: 'inherit',
    },
    '& .MuiTableCell-paddingCheckbox': {
      display: 'none',
    },
  },
  attachedFiles: {
    border: `1px solid ${theme.palette.background.light}`,
    borderRadius: theme.spacing(0.5),
    height: '100%',
  },
  legend: {
    fontSize: theme.spacing(1.5),
  },
  shipmentName: {
    textDecoration: 'underline',
    textDecorationColor: theme.palette.background.light,
    cursor: 'pointer',
  },
  createButton: {
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.default,
  },
}));

const Shipment = ({
  shipmentData,
  custodianData,
  dispatch,
  itemData,
  gatewayData,
  custodyData,
  loading,
  timezone,
  unitOfMeasure,
  allSensorAlerts,
  history,
  sensorReports,
}) => {
  const classes = useStyles();
  const muiTheme = useTheme();
  const subNav = [
    { label: 'Active', value: 'Active' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  const [shipmentFilter, setShipmentFilter] = useState('Active');
  const [rows, setRows] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState({});
  const [allMarkers, setAllMarkers] = useState([]);

  const organization = useContext(UserContext).organization.organization_uuid;

  const HeaderElements = () => (
    <Tabs
      value={shipmentFilter}
      onChange={filterTabClicked}
      className={classes.tabs}
    >
      {_.map(subNav, (itemProps, index) => (
        <Tab
          {...itemProps}
          key={`tab${index}:${itemProps.value}`}
          className={classes.tab}
        />
      ))}
    </Tabs>
  );

  const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.background.dark,
      maxWidth: theme.spacing(40),
      border: `1px solid ${theme.palette.background.light}`,
    },
  }));

  useEffect(() => {
    dispatch(getShipmentDetails(organization, 'Planned,Enroute', true, true));
    dispatch(getCustodians(organization));
    dispatch(getContact(organization));
    dispatch(getItems(organization));
    dispatch(getGateways(organization));
    dispatch(getUnitOfMeasure(organization));
  }, []);

  useEffect(() => {
    const formattedRows = getShipmentFormattedRow(
      shipmentData,
      custodianData,
      custodyData,
      itemData,
      gatewayData,
      allSensorAlerts,
      muiTheme.palette.error.main,
      muiTheme.palette.info.main,
      sensorReports,
    );

    const filteredRows = _.filter(formattedRows, { type: shipmentFilter });
    setRows(filteredRows);
    setAllMarkers(_.map(filteredRows, 'allMarkers'));
  }, [shipmentFilter, shipmentData, custodianData, custodyData,
    itemData, gatewayData, allSensorAlerts, sensorReports]);

  useEffect(() => {
    if (selectedShipment) {
      processMarkers(selectedShipment);
    }
  }, [allSensorAlerts, sensorReports]);

  const processMarkers = (shipment) => {
    const dateFormat = !_.isEmpty(unitOfMeasure) && _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure;
    const timeFormat = !_.isEmpty(unitOfMeasure) && _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure;
    const tempMeasure = !_.isEmpty(unitOfMeasure) && _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature')).unit_of_measure;
    let markersToSet = [];
    const filteredReports = _.filter(sensorReports, {
      shipment_id: shipment.partner_shipment_id,
    });
    const filteredAlerts = _.filter(allSensorAlerts, { shipment_id: shipment.partner_shipment_id });

    if (!_.isEmpty(filteredReports)) {
      _.forEach(filteredReports, (report) => {
        const { report_entry } = report;
        const alert = _.find(filteredAlerts, {
          report_id: _.toString(report.id),
          recovered_alert_id: null,
        });
        let marker = {};
        let date = '';
        let time = '';
        let color = 'green';
        let alertFor = '';

        const temperature = _.isEqual(_.toLower(tempMeasure), 'fahrenheit')
          ? report_entry.report_temp_fah
          : _.round(report_entry.report_temp_cel, 2).toFixed(2);
        const probe = _.isEqual(_.toLower(tempMeasure), 'fahrenheit')
          ? report_entry.report_probe_fah
          : _.round(report_entry.report_probe_cel, 2).toFixed(2);

        if (alert) {
          switch (true) {
            case _.includes(_.toLower(alert.alert_type), 'max'):
            case _.includes(_.toLower(alert.alert_type), 'shock'):
            case _.includes(_.toLower(alert.alert_type), 'light'):
              color = muiTheme.palette.error.main;
              alertFor = alert.parameter_type;
              break;

            case _.includes(_.toLower(alert.alert_type), 'min'):
              color = muiTheme.palette.info.main;
              alertFor = alert.parameter_type;
              break;

            default:
              break;
          }
        }

        if ('report_timestamp' in report_entry) {
          if (report_entry.report_timestamp !== null) {
            date = moment(report_entry.report_timestamp).tz(timezone).format(dateFormat);
            time = moment(report_entry.report_timestamp).tz(timezone).format(timeFormat);
          }
        } else if ('report_location' in report_entry) {
          date = moment(
            report_entry.report_location.timeOfPosition,
          ).tz(timezone).format(dateFormat);
          time = moment(
            report_entry.report_location.timeOfPosition,
          ).tz(timezone).format(timeFormat);
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
            (latitude >= -90 && latitude <= 90)
            && (longitude >= -180 && longitude <= 180)
            && date && time
          ) {
            marker = {
              lat: latitude,
              lng: longitude,
              location: report_entry.report_location,
              label: 'Clustered',
              temperature,
              light: report_entry.report_light,
              shock: report_entry.report_shock,
              tilt: report_entry.report_tilt,
              humidity: report_entry.report_humidity,
              battery: report_entry.report_battery,
              pressure: report_entry.report_pressure,
              probe,
              color,
              alertFor,
              date,
              time,
            };
            // Considered use case: If a shipment stays at some
            // position for long, other value changes can be
            // critical
            const markerFound = _.find(markersToSet, {
              lat: marker.lat,
              lng: marker.lng,
            }) && color === 'green';

            if (!markerFound) {
              markersToSet = [...markersToSet, marker];
            }
          }
        } else {
          marker = {
            lat: '*',
            lng: '*',
            location: 'N/A',
            label: 'Clustered',
            temperature,
            light: report_entry.report_light,
            shock: report_entry.report_shock,
            tilt: report_entry.report_tilt,
            humidity: report_entry.report_humidity,
            battery: report_entry.report_battery,
            pressure: report_entry.report_pressure,
            probe,
            color,
            alertFor,
            date,
            time,
          };
        }
      });
    }

    setSelectedShipment(shipment);
    setMarkers(markersToSet);
    setSelectedMarker(_.last(markersToSet));
  };

  const filterTabClicked = (event, filter) => {
    let shipmentStatus = '';
    setShipmentFilter(filter);

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

    dispatch(getShipmentDetails(organization, shipmentStatus, true, true));
  };

  return (
    <Box mt={5} mb={5}>
      {loading && <Loader open={loading} />}
      <Button type="button" onClick={(e) => history.push(routes.CREATE_SHIPMENT)} className={classes.createButton}>
        + Create Shipment
      </Button>
      <Grid container>
        <Grid item xs={12}>
          <div className={classes.title}>
            <Typography className={classes.tileHeading} variant="h6">
              {selectedShipment ? selectedShipment.name : 'All shipments'}
            </Typography>
          </div>
        </Grid>

        <Grid item xs={12}>
          <MapComponent
            allMarkers={allMarkers}
            isMarkerShown={!_.isEmpty(markers)}
            showPath
            markers={markers}
            googleMapURL={window.env.MAP_API_URL}
            zoom={_.isEmpty(markers) ? 4 : 12}
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

        <Grid item xs={12} className={classes.dataTable}>
          <DataTableWrapper
            loading={loading}
            rows={rows}
            columns={[
              {
                name: '',
                options: {
                  sort: false,
                  sortThirdClickReset: false,
                  filter: false,
                  customBodyRenderLite: (dataIndex) => (
                    rows[dataIndex] && rows[dataIndex].note
                      ? (
                        <HtmlTooltip
                          TransitionComponent={Fade}
                          TransitionProps={{ timeout: 600 }}
                          placement="bottom-start"
                          title={<Typography>{rows[dataIndex].note}</Typography>}
                        >
                          <NoteIcon />
                        </HtmlTooltip>
                      ) : <></>
                  ),
                },
              },
              {
                name: 'name',
                label: 'Shipment Name',
                options: {
                  sort: true,
                  sortThirdClickReset: true,
                  filter: true,
                  customBodyRenderLite: (dataIndex) => (
                    <Typography
                      className={classes.shipmentName}
                      onClick={(e) => {
                        history.push(routes.CREATE_SHIPMENT, { ship: rows[dataIndex] });
                      }}
                    >
                      {rows[dataIndex].name}
                    </Typography>
                  ),
                },
              },
              ...shipmentColumns(
                timezone,
                _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
                  ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
                  : '',
              ),
            ]}
            extraOptions={{
              expandableRows: true,
              expandableRowsHeader: false,
              expandableRowsOnClick: true,
              customToolbar: () => (<HeaderElements style={{ right: '180%' }} />),
              setRowProps: (row, dataIndex, rowIndex) => ({
                style: { color: _.isEqual(row[2], 'Planned') ? muiTheme.palette.background.light : 'inherit' },
              }),
              onRowExpansionChange: (curExpanded, allExpanded, rowsExpanded) => {
                if (_.isEmpty(allExpanded)) {
                  setAllMarkers(_.map(rows, 'allMarkers'));
                  setSelectedShipment(null);
                  setMarkers([]);
                  setSelectedMarker({});
                } else {
                  processMarkers(rows[_.last(allExpanded).dataIndex]);
                }
              },
              renderExpandableRow: (rowData, rowMeta) => {
                const colSpan = rowData.length + 1;
                const ship = rows[rowMeta.rowIndex];

                return (
                  <TableRow>
                    <TableCell colSpan={colSpan}>
                      <Grid container spacing={2}>
                        <Grid item xs={2}>
                          <Grid container rowGap={1}>
                            <Grid item xs={12}>
                              <Typography fontWeight={700}>
                                Order ID:
                              </Typography>
                              <Typography>
                                {ship.order_number}
                              </Typography>
                            </Grid>

                            <Grid item xs={12}>
                              <Typography fontWeight={700}>
                                Items:
                              </Typography>
                              {_.map(_.split(ship.itemNames, ','), (item, idx) => (
                                <Typography key={`${item}-${idx}`}>{item}</Typography>
                              ))}
                            </Grid>

                            <Grid item xs={12}>
                              <Typography fontWeight={700}>
                                Status:
                              </Typography>
                              <Typography>
                                {ship.type}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item xs={2}>
                          <Grid container rowGap={1}>
                            {_.map(ship.carriers, (carr, idx) => (
                              <Grid key={`${carr}-${idx}`} item xs={12}>
                                <Typography fontWeight={700}>
                                  {`Logistics company ${idx + 1}:`}
                                </Typography>
                                <Typography>
                                  {carr}
                                </Typography>
                              </Grid>
                            ))}

                            <Grid item xs={12}>
                              <Typography fontWeight={700}>
                                Receiver:
                              </Typography>
                              <Typography>
                                {ship.destination}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item xs={2}>
                          {_.isEqual(ship.status, 'Enroute') && _.last(markers) && (
                            <Grid container rowGap={1}>
                              <Grid item xs={12}>
                                <Typography fontWeight={700}>
                                  Last location:
                                </Typography>
                                <Typography>
                                  {_.last(markers).location}
                                </Typography>
                              </Grid>
                            </Grid>
                          )}
                        </Grid>

                        <Grid item xs={2}>
                          {_.isEqual(ship.status, 'Enroute') && _.last(markers) && (
                            <Grid container rowGap={1}>
                              <Grid item xs={12}>
                                <Typography fontWeight={700}>
                                  Last Reading:
                                </Typography>
                                <Typography>
                                  {`Temp: ${_.last(markers).temperature}`}
                                </Typography>
                                <Typography>
                                  {`Humidity: ${_.last(markers).humidity}`}
                                </Typography>
                                <Typography>
                                  {`Shock: ${_.last(markers).shock}`}
                                </Typography>
                                <Typography>
                                  {`Light: ${_.last(markers).light}`}
                                </Typography>
                                <Typography>
                                  {`Battery: ${_.last(markers).battery}`}
                                </Typography>
                              </Grid>
                            </Grid>
                          )}
                        </Grid>

                        <Grid item xs={4} alignItems="end" justifyContent="end">
                          <Grid container rowGap={1}>
                            <Grid item xs={12}>
                              <TextField
                                variant="outlined"
                                disabled
                                multiline
                                fullWidth
                                maxRows={4}
                                id="note"
                                name="note"
                                label="Note"
                                autoComplete="note"
                                value={ship.note}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <FormControl
                                fullWidth
                                component="fieldset"
                                variant="outlined"
                                className={classes.attachedFiles}
                                style={{
                                  padding: _.isEmpty(ship.uploaded_pdf)
                                    ? muiTheme.spacing(3)
                                    : muiTheme.spacing(1.5),
                                }}
                              >
                                <FormLabel component="legend" className={classes.legend}>
                                  Attached Files
                                </FormLabel>

                                <Stack direction="row" spacing={1}>
                                  {!_.isEmpty(ship.uploaded_pdf)
                                  && _.map(ship.uploaded_pdf, (file, idx) => (
                                    <Chip key={`${file}-${idx}`} variant="outlined" label={file} />
                                  ))}
                                </Stack>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </TableCell>
                  </TableRow>
                );
              },
            }}
            filename="ShipmentData"
            hideAddButton
          />
        </Grid>
      </Grid>
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
