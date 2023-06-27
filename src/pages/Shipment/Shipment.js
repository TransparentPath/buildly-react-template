import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment-timezone';
import {
  Box,
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
  aggregateReportData,
  history,
}) => {
  const classes = useStyles();
  const muiTheme = useTheme();
  const subNav = [
    { label: 'Active', value: 'Active' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  const [isMapLoaded, setMapLoaded] = useState(false);
  const [shipmentFilter, setShipmentFilter] = useState('Active');
  const [rows, setRows] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState({});

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
    dispatch(getShipmentDetails(organization, 'Planned,Enroute', true));
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
    );

    const filteredRows = _.filter(formattedRows, { type: shipmentFilter });
    setRows(filteredRows);
  }, [shipmentFilter, shipmentData, custodianData, custodyData,
    itemData, gatewayData, allSensorAlerts]);

  // useEffect(() => {
  //   const dateFormat = !_.isEmpty(unitOfMeasure) && _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure;
  //   const timeFormat = !_.isEmpty(unitOfMeasure) && _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure;
  //   let markersToSet = [];

  //   if (!_.isEmpty(aggregateReportData)) {
  //     let counter = 0;
  //     _.forEach(aggregateReportData, (report) => {
  //       _.forEach(report.report_entries, (report_entry) => {
  //         try {
  //           counter += 1;
  //           let marker = {};
  //           const temperature = report_entry.report_temp;
  //           let dateTime = '';
  //           if ('report_timestamp' in report_entry) {
  //             if (report_entry.report_timestamp !== null) {
  //               dateTime = moment(report_entry.report_timestamp)
  //                 .tz(timezone).format(`${dateFormat} ${timeFormat}`);
  //             }
  //           } else if ('report_location' in report_entry) {
  //             dateTime = moment(
  //               report_entry.report_location.timeOfPosition,
  //             ).tz(timezone).format(`${dateFormat} ${timeFormat}`);
  //           }

  //           // For a valid (latitude, longitude) pair: -90<=X<=+90 and -180<=Y<=180
  //           if (report_entry.report_location !== null
  //             && report_entry.report_latitude !== null
  //             && report_entry.report_longitude !== null) {
  //             const latitude = report_entry.report_latitude
  //               || report_entry.report_location.latitude;
  //             const longitude = report_entry.report_longitude
  //               || report_entry.report_location.longitude;
  //             if (
  //               (latitude >= -90
  //                 && latitude <= 90)
  //               && (longitude >= -180
  //                 && longitude <= 180)
  //               && dateTime !== ''
  //             ) {
  //               marker = {
  //                 lat: latitude,
  //                 lng: longitude,
  //                 location: report_entry.report_location,
  //                 label: 'Clustered',
  //                 temperature,
  //                 light: report_entry.report_light,
  //                 shock: report_entry.report_shock,
  //                 tilt: report_entry.report_tilt,
  //                 humidity: report_entry.report_humidity,
  //                 battery: report_entry.report_battery,
  //                 pressure: report_entry.report_pressure,
  //                 probe: report_entry.report_probe,
  //                 color: 'green',
  //                 timestamp: dateTime,
  //               };
  //               // Considered use case: If a shipment stays at some
  //               // position for long, other value changes can be
  //               // critical
  //               const markerFound = _.find(markersToSet, {
  //                 lat: marker.lat,
  //                 lng: marker.lng,
  //               });

  //               if (!markerFound) {
  //                 markersToSet = [...markersToSet, marker];
  //               }
  //             }
  //           } else {
  //             marker = {
  //               lat: '*',
  //               lng: '*',
  //               location: 'N/A',
  //               label: 'Clustered',
  //               temperature,
  //               light: report_entry.report_light,
  //               shock: report_entry.report_shock,
  //               tilt: report_entry.report_tilt,
  //               humidity: report_entry.report_humidity,
  //               battery: report_entry.report_battery,
  //               pressure: report_entry.report_pressure,
  //               probe: report_entry.report_probe,
  //               color: 'green',
  //               timestamp: dateTime,
  //             };
  //           }
  //         } catch (e) {
  //           // eslint-disable-next-line no-console
  //           console.log(e);
  //         }
  //       });
  //     });
  //   }

  //   setMarkers(markersToSet);
  //   setSelectedMarker(markersToSet[0]);
  // }, [aggregateReportData, unitOfMeasure]);

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

    dispatch(getShipmentDetails(organization, shipmentStatus, true));
  };

  return (
    <Box mt={5} mb={5}>
      {loading && <Loader open={loading} />}
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
                          {_.isEqual(ship.status, 'Enroute') && (
                            <Grid container rowGap={1}>
                              <Grid item xs={12}>
                                <Typography fontWeight={700}>
                                  Last location:
                                </Typography>
                                <Typography>
                                  Put location here
                                </Typography>
                              </Grid>
                            </Grid>
                          )}
                        </Grid>

                        <Grid item xs={2}>
                          {_.isEqual(ship.status, 'Enroute') && (
                            <Grid container rowGap={1}>
                              <Grid item xs={12}>
                                <Typography fontWeight={700}>
                                  Last Reading:
                                </Typography>
                                <Typography>
                                  {'Temp: '}
                                </Typography>
                                <Typography>
                                  {'Humidity: '}
                                </Typography>
                                <Typography>
                                  {'Shock: '}
                                </Typography>
                                <Typography>
                                  {'Light: '}
                                </Typography>
                                <Typography>
                                  {'Battery: '}
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
