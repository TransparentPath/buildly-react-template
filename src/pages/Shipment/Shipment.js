import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment-timezone';
import { ExpandButton } from 'mui-datatables';
import {
  Box, Grid, Tab, TableCell, TableRow, Tabs, Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
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
}) => {
  const classes = useStyles();
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

  const components = {
    ExpandButton: (props) => {
      const { dataIndex } = props;
      if (dataIndex === 3 || dataIndex === 4) {
        return <div style={{ width: '24px' }} />;
      }
      return <ExpandButton {...props} />;
    },
  };

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
    setSelectedShipment(!_.isEmpty(filteredRows) ? filteredRows[0] : null);
  }, [shipmentFilter, shipmentData, custodianData, custodyData, itemData, gatewayData, allSensorAlerts]);

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
            columns={shipmentColumns(
              timezone,
              _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
                ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
                : '',
            )}
            extraOptions={{
              expandableRows: true,
              expandableRowsHeader: false,
              expandableRowsOnClick: true,
              customToolbar: () => (<HeaderElements style={{ right: '180%' }} />),
              isRowExpandable: (dataIndex, expandedRows) => {
                if (dataIndex === 3 || dataIndex === 4) return false;
                // Prevent expand/collapse of any row if there are 4 rows expanded
                // already (but allow those already expanded to be collapsed)
                return !((
                  expandedRows.data.length > 4 && expandedRows.data.filter(
                    (d) => d.dataIndex === dataIndex,
                  ).length === 0
                ));
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
                            <Grid item>
                              <Typography fontWeight={700}>
                                Order ID:
                              </Typography>
                              <Typography>
                                {ship.order_number}
                              </Typography>
                            </Grid>

                            <Grid item>
                              <Typography fontWeight={700}>
                                Items:
                              </Typography>
                              {_.map(_.split(ship.itemNames, ','), (item, idx) => (
                                <Typography key={`${item}-${idx}`}>{item}</Typography>
                              ))}
                            </Grid>

                            <Grid item>
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
                              <Grid key={`${carr}-${idx}`} item>
                                <Typography fontWeight={700}>
                                  {`Logistics company ${idx + 1}:`}
                                </Typography>
                                <Typography>
                                  {carr}
                                </Typography>
                              </Grid>
                            ))}
                            <Grid item>
                              <Typography fontWeight={700}>
                                Receiver:
                              </Typography>
                              <Typography>
                                {ship.destination}
                              </Typography>
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
            components={components}
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
