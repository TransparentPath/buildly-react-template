/* eslint-disable no-nested-ternary */
import React, { useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Fade,
  FormControl,
  FormLabel,
  Grid,
  Stack,
  TableCell,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import Loader from '@components/Loader/Loader';
import MapComponent from '@components/MapComponent/MapComponent';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import CustomizedSteppers from '@components/CustomizedStepper/CustomizedStepper';
import { getUser } from '@context/User.context';
import { routes } from '@routes/routesConstants';
import { useQuery } from 'react-query';
import { getShipmentsQuery } from '@react-query/queries/shipments/getShipmentsQuery';
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery';
import { getCustodianQuery } from '@react-query/queries/custodians/getCustodianQuery';
import { getItemQuery } from '@react-query/queries/items/getItemQuery';
import { getAllGatewayQuery } from '@react-query/queries/sensorGateways/getAllGatewayQuery';
import { getCustodyQuery } from '@react-query/queries/custodians/getCustodyQuery';
import { getCountriesQuery } from '@react-query/queries/shipments/getCountriesQuery';
import { getSensorAlertQuery } from '@react-query/queries/sensorGateways/getSensorAlertQuery';
import { getSensorReportQuery } from '@react-query/queries/sensorGateways/getSensorReportQuery';
import { useSyncSingleTrackerMutation } from '@react-query/mutations/sensorGateways/syncSingleTracker';
import useAlert from '@hooks/useAlert';
import { useStore } from '@zustand/timezone/timezoneStore';
import './ShipmentStyles.css';
import { LANGUAGES, TIVE_GATEWAY_TIMES } from '@utils/mock';
import { getIcon, getShipmentFormattedRow, shipmentColumns } from '@utils/constants';
import { Assignment as NoteIcon } from '@mui/icons-material';

const Shipment = ({ history }) => {
  const muiTheme = useTheme();
  const user = getUser();
  const organization = user.organization.organization_uuid;
  const userLanguage = user.user_language;

  const inputRef = useRef(null);

  const { displayAlert } = useAlert();
  const { data } = useStore();

  const [shipmentFilter, setShipmentFilter] = useState('Active');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState({});
  const [steps, setSteps] = useState([]);
  const [tableRow, setTableRow] = useState([]);

  const { data: shipmentData, isLoading: isLoadingShipments } = useQuery(
    ['shipments', shipmentFilter, organization],
    () => getShipmentsQuery(organization, shipmentFilter === 'Active' ? 'Planned,En route,Arrived' : shipmentFilter, displayAlert),
    { refetchOnWindowFocus: false },
  );

  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization],
    () => getUnitQuery(organization, displayAlert),
    { enabled: !_.isEmpty(selectedShipment), refetchOnWindowFocus: false },
  );

  const { data: custodianData, isLoading: isLoadingCustodians } = useQuery(
    ['custodians', organization],
    () => getCustodianQuery(organization, displayAlert),
    { enabled: !_.isEmpty(selectedShipment), refetchOnWindowFocus: false },
  );

  const { data: itemData, isLoading: isLoadingItems } = useQuery(
    ['items', organization],
    () => getItemQuery(organization, displayAlert),
    { enabled: !_.isEmpty(selectedShipment), refetchOnWindowFocus: false },
  );

  const { data: custodyData, isLoading: isLoadingCustodies } = useQuery(
    ['custodies', shipmentData, shipmentFilter, selectedShipment],
    () => getCustodyQuery(encodeURIComponent(_.toString(_.without(_.map(shipmentData, 'shipment_uuid'), null))), displayAlert),
    {
      enabled: !_.isEmpty(selectedShipment) && !_.isEmpty(encodeURIComponent(_.toString(_.without(_.map(shipmentData, 'shipment_uuid'), null)))),
      refetchOnWindowFocus: false,
    },
  );

  const { data: countriesData, isLoading: isLoadingCountries } = useQuery(
    ['countries'],
    () => getCountriesQuery(displayAlert),
    { enabled: !_.isEmpty(selectedShipment), refetchOnWindowFocus: false },
  );

  const { data: sensorAlertData, isLoading: isLoadingSensorAlerts } = useQuery(
    ['sensorAlerts', shipmentData, shipmentFilter, selectedShipment],
    () => getSensorAlertQuery(encodeURIComponent(_.toString(_.without(_.map(shipmentData, 'partner_shipment_id'), null))), displayAlert),
    {
      enabled: !_.isEmpty(selectedShipment) && !_.isEmpty(encodeURIComponent(_.toString(_.without(_.map(shipmentData, 'partner_shipment_id'), null)))),
      refetchOnWindowFocus: false,
    },
  );

  const { data: sensorReportData, isLoading: isLoadingSensorReports } = useQuery(
    ['sensorReports', shipmentData, shipmentFilter, selectedShipment],
    () => getSensorReportQuery(encodeURIComponent(_.toString(_.without(_.map(shipmentData, 'partner_shipment_id'), null))), null, displayAlert),
    {
      enabled: !_.isEmpty(selectedShipment) && !_.isEmpty(encodeURIComponent(_.toString(_.without(_.map(shipmentData, 'partner_shipment_id'), null)))),
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: syncSingleTrackerMutation, isLoading: isSyncingSingleTracker, data: syncTrackerData } = useSyncSingleTrackerMutation(displayAlert);

  const country = _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'country'))
    ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'country')).unit_of_measure
    : 'United States';
  const organizationCountry = _.find(countriesData, (item) => item.country.toLowerCase() === country.toLowerCase())
    && _.find(countriesData, (item) => item.country.toLowerCase() === country.toLowerCase()).iso3;

  const isLoaded = isLoadingShipments
    || isLoadingUnits
    || isLoadingCustodians
    || isLoadingItems
    || isSyncingSingleTracker
    || isLoadingCustodies
    || isLoadingCountries
    || isLoadingSensorAlerts
    || isLoadingSensorReports
    || isSyncingSingleTracker;

  useEffect(() => {
    if (!_.isEmpty(shipmentData) && !_.isEqual(isLoaded, true)) {
      const localDelayedShipments = JSON.parse(localStorage.getItem('delayedShipments')) || [];
      const delayedShipments = _.filter(shipmentData, (item) => item.delayed === true && item.status === 'Planned');
      const newDelayedShipments = _.filter(delayedShipments, (item) => !localDelayedShipments.includes(item.name));
      if (!_.isEmpty(newDelayedShipments)) {
        newDelayedShipments.forEach((item) => {
          displayAlert('error', `Shipment: ${item.name} has not yet departed.`);
        });
      }
      const updatedDelayedShipments = [...localDelayedShipments, ...newDelayedShipments.map((item) => item.name)];
      localStorage.setItem('delayedShipments', JSON.stringify(updatedDelayedShipments));
    }
  }, [shipmentData, isLoaded]);

  useEffect(() => {
    const formattedRow = getShipmentFormattedRow(
      selectedShipment,
      custodianData,
      custodyData,
      itemData,
      syncTrackerData,
      sensorAlertData,
      muiTheme.palette.error.main,
      muiTheme.palette.info.main,
      sensorReportData,
    );
    setTableRow([formattedRow]);
  }, [shipmentFilter, shipmentData, custodianData, custodyData,
    itemData, syncTrackerData, sensorAlertData, sensorReportData]);

  useEffect(() => {
    if (selectedShipment) {
      processMarkers(selectedShipment);
    }
  }, [sensorAlertData, sensorReportData, data]);

  const processMarkers = (shipment) => {
    const formattedRow = getShipmentFormattedRow(
      shipment,
      custodianData,
      custodyData,
      itemData,
      syncTrackerData,
      sensorAlertData,
      muiTheme.palette.error.main,
      muiTheme.palette.info.main,
      sensorReportData,
    );
    const dateFormat = !_.isEmpty(unitData) && _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure;
    const timeFormat = !_.isEmpty(unitData) && _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure;
    const tempMeasure = !_.isEmpty(unitData) && _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature')).unit_of_measure;
    let markersToSet = [];
    const filteredReports = _.filter(sensorReportData, { shipment_id: formattedRow.partner_shipment_id });
    const filteredAlerts = _.filter(sensorAlertData, { shipment_id: formattedRow.partner_shipment_id });
    let newSteps = [];
    let arrivedSteps = [];
    let activeSteps = [];

    newSteps = [
      {
        id: 1,
        title: formattedRow.origin,
        titleColor: 'inherit',
        label: 'Shipment created',
        content: moment(formattedRow.create_date).tz(data).format(`${dateFormat} ${timeFormat}`),
        active: true,
        error: false,
        info: false,
        completed: formattedRow.last_fujitsu_verification_datetime && _.lte(
          moment(formattedRow.create_date).unix(),
          moment(formattedRow.last_fujitsu_verification_datetime).unix(),
        ),
      },
      {
        id: 2,
        title: formattedRow.origin,
        titleColor: 'inherit',
        label: 'Shipment started',
        content: _.isEmpty(formattedRow.actual_time_of_departure)
          ? moment(formattedRow.estimated_time_of_departure).tz(data).format(`${dateFormat} ${timeFormat}`)
          : moment(formattedRow.actual_time_of_departure).tz(data).format(`${dateFormat} ${timeFormat}`),
        caption: _.isEmpty(formattedRow.actual_time_of_departure) ? '(Estimated Time)' : '(Actual Time)',
        active: !!formattedRow.actual_time_of_departure,
        error: false,
        info: false,
        completed: formattedRow.last_fujitsu_verification_datetime && _.lte(
          moment(formattedRow.actual_time_of_departure || formattedRow.estimated_time_of_departure).unix(),
          moment(formattedRow.last_fujitsu_verification_datetime).unix(),
        ),
      },
    ];

    if (!_.isEmpty(filteredAlerts)) {
      const alerts = _.filter(filteredAlerts, (alert) => !alert.recovered_alert_id);
      const arrivedAlerts = _.filter(alerts, (alert) => {
        const createDate = moment(alert.create_date).unix();
        return (
          createDate >= (moment(formattedRow.actual_time_of_departure).unix() || moment(formattedRow.estimated_time_of_departure).unix())
          && createDate <= (moment(formattedRow.actual_time_of_arrival).unix() || moment(formattedRow.estimated_time_of_arrival).unix())
        );
      });
      const activeAlerts = _.filter(alerts, (alert) => {
        const createDate = moment(alert.create_date).unix();
        return !(
          createDate >= (moment(formattedRow.actual_time_of_departure).unix() || moment(formattedRow.estimated_time_of_departure).unix())
          && createDate <= (moment(formattedRow.actual_time_of_arrival).unix() || moment(formattedRow.estimated_time_of_arrival).unix())
        );
      });
      if (_.isEmpty(formattedRow.actual_time_of_arrival)) {
        arrivedSteps = _.map(alerts, (a) => {
          const error = _.includes(_.toLower(a.alert_type), 'max') || _.includes(_.toLower(a.alert_type), 'shock') || _.includes(_.toLower(a.alert_type), 'light');
          const info = _.includes(_.toLower(a.alert_type), 'min');
          const item = {
            id: a.parameter_type,
            color: error ? muiTheme.palette.error.main : muiTheme.palette.info.main,
            title: error ? `Maximum ${_.capitalize(a.parameter_type)} Excursion` : `Minimum ${_.capitalize(a.parameter_type)} Excursion`,
          };
          return ({
            id: moment(a.create_date).unix(),
            titleIcon: getIcon(item),
            title: a.parameter_type === 'shock' || a.parameter_type === 'light'
              ? `${_.toString(_.round(_.toNumber(a.parameter_value.split(' ')[0]), 2))} ${a.parameter_value.split(' ')[1]}`
              : a.parameter_value,
            titleColor: error ? muiTheme.palette.error.main : muiTheme.palette.info.main,
            label: 'Exception',
            content: moment(a.create_date).tz(data).format(`${dateFormat} ${timeFormat}`),
            active: false,
            completed: formattedRow.last_fujitsu_verification_datetime && _.lte(
              moment(a.create_date).unix(),
              moment(formattedRow.last_fujitsu_verification_datetime).unix(),
            ),
            error,
            info,
          });
        });
      } else {
        arrivedSteps = _.map(arrivedAlerts, (a) => {
          const error = _.includes(_.toLower(a.alert_type), 'max') || _.includes(_.toLower(a.alert_type), 'shock') || _.includes(_.toLower(a.alert_type), 'light');
          const info = _.includes(_.toLower(a.alert_type), 'min');
          const item = {
            id: a.parameter_type,
            color: error ? muiTheme.palette.error.main : muiTheme.palette.info.main,
            title: error ? `Maximum ${_.capitalize(a.parameter_type)} Excursion` : `Minimum ${_.capitalize(a.parameter_type)} Excursion`,
          };
          return ({
            id: moment(a.create_date).unix(),
            titleIcon: getIcon(item),
            title: a.parameter_type === 'shock' || a.parameter_type === 'light'
              ? `${_.toString(_.round(_.toNumber(a.parameter_value.split(' ')[0]), 2))} ${a.parameter_value.split(' ')[1]}`
              : a.parameter_value,
            titleColor: error ? muiTheme.palette.error.main : muiTheme.palette.info.main,
            label: 'Exception',
            content: moment(a.create_date).tz(data).format(`${dateFormat} ${timeFormat}`),
            active: false,
            completed: formattedRow.last_fujitsu_verification_datetime && _.lte(
              moment(a.create_date).unix(),
              moment(formattedRow.last_fujitsu_verification_datetime).unix(),
            ),
            error,
            info,
          });
        });
        activeSteps = _.map(activeAlerts, (a) => {
          const error = _.includes(_.toLower(a.alert_type), 'max') || _.includes(_.toLower(a.alert_type), 'shock') || _.includes(_.toLower(a.alert_type), 'light');
          const info = _.includes(_.toLower(a.alert_type), 'min');
          const item = {
            id: a.parameter_type,
            color: error ? muiTheme.palette.error.main : muiTheme.palette.info.main,
            title: error ? `Maximum ${_.capitalize(a.parameter_type)} Excursion` : `Minimum ${_.capitalize(a.parameter_type)} Excursion`,
          };
          return ({
            id: moment(a.create_date).unix(),
            titleIcon: getIcon(item),
            title: a.parameter_type === 'shock' || a.parameter_type === 'light'
              ? `${_.toString(_.round(_.toNumber(a.parameter_value.split(' ')[0]), 2))} ${a.parameter_value.split(' ')[1]}`
              : a.parameter_value,
            titleColor: error ? muiTheme.palette.error.main : muiTheme.palette.info.main,
            label: 'Exception',
            content: moment(a.create_date).tz(data).format(`${dateFormat} ${timeFormat}`),
            active: false,
            completed: formattedRow.last_fujitsu_verification_datetime && _.lte(
              moment(a.create_date).unix(),
              moment(formattedRow.last_fujitsu_verification_datetime).unix(),
            ),
            error,
            info,
          });
        });
      }
    }
    newSteps = [...newSteps, ...arrivedSteps];

    newSteps = [...newSteps, {
      id: _.maxBy(newSteps, 'id') ? (_.maxBy(newSteps, 'id').id + 1) : 3,
      title: formattedRow.destination,
      titleColor: 'inherit',
      label: 'Shipment arrived',
      content: _.isEmpty(formattedRow.actual_time_of_arrival)
        ? moment(formattedRow.estimated_time_of_arrival).tz(data).format(`${dateFormat} ${timeFormat}`)
        : moment(formattedRow.actual_time_of_arrival).tz(data).format(`${dateFormat} ${timeFormat}`),
      caption: _.isEmpty(formattedRow.actual_time_of_arrival) ? '(Estimated Time)' : '(Actual Time)',
      active: !!formattedRow.actual_time_of_arrival,
      error: false,
      info: false,
      completed: formattedRow.last_fujitsu_verification_datetime && _.lte(
        moment(formattedRow.actual_time_of_arrival || formattedRow.estimated_time_of_arrival).unix(),
        moment(formattedRow.last_fujitsu_verification_datetime).unix(),
      ),
    }];

    newSteps = [...newSteps, ...activeSteps];

    newSteps = [...newSteps, {
      id: _.maxBy(newSteps, 'id') ? (_.maxBy(newSteps, 'id').id + 2) : 4,
      title: formattedRow.destination,
      titleColor: 'inherit',
      label: 'Shipment completed',
      content: _.isEqual(formattedRow.status, 'Completed')
        ? moment(formattedRow.actual_time_of_completion || formattedRow.edit_date).tz(data).format(`${dateFormat} ${timeFormat}`)
        : moment(formattedRow.actual_time_of_arrival || formattedRow.estimated_time_of_arrival).add(24, 'h').tz(data).format(`${dateFormat} ${timeFormat}`),
      caption: !_.isEqual(formattedRow.status, 'Completed') ? '(Estimated Time)' : '(Actual Time)',
      active: _.isEqual(formattedRow.status, 'Completed'),
      error: false,
      info: false,
      completed: formattedRow.last_fujitsu_verification_datetime && _.lte(
        _.isEqual(formattedRow.status, 'Completed')
          ? moment(formattedRow.actual_time_of_completion || formattedRow.edit_date).unix()
          : moment(formattedRow.actual_time_of_arrival || formattedRow.estimated_time_of_arrival).add(24, 'h').unix(),
        moment(formattedRow.last_fujitsu_verification_datetime).unix(),
      ),
    }];

    if (!_.isEmpty(filteredReports)) {
      _.forEach(filteredReports, (report) => {
        const { report_entry } = report;
        let marker = {};
        let color = muiTheme.palette.success.main;
        let allAlerts = [];
        const date = moment(report.activation_date).tz(data).format(dateFormat);
        const time = moment(report.activation_date).tz(data).format(timeFormat);

        const preAlerts = _.orderBy(
          _.filter(filteredAlerts, (alert) => _.lte(_.toNumber(alert.report_id), report.id)),
          'create_date',
        );
        const recoveryAlerts = _.filter(preAlerts, (pa) => !!pa.recovered_alert_id);
        const recoveredIDs = _.uniq(_.map(recoveryAlerts, 'recovered_alert_id'));
        const recoveredTypeDateTime = _.map(recoveryAlerts, (ra) => (
          { parameter_type: ra.parameter_type, create_date: ra.create_date }
        ));
        const alertsTillNow = _.filter(preAlerts, (alert) => {
          const found = _.find(recoveredTypeDateTime, (radt) => (
            _.isEqual(radt.parameter_type, alert.parameter_type)
            && !!_.gt(radt.create_date, alert.create_date)
          ));

          return !found && !alert.recovered_alert_id
            && !_.includes(recoveredIDs, _.toString(alert.id));
        });

        let uniqueAlerts = [];
        if (_.find(_.orderBy(alertsTillNow, 'create_date', 'desc'), { parameter_type: 'temperature' })) {
          uniqueAlerts = [...uniqueAlerts, _.find(_.orderBy(alertsTillNow, 'create_date', 'desc'), { parameter_type: 'temperature' })];
        }
        if (_.find(_.orderBy(alertsTillNow, 'create_date', 'desc'), { parameter_type: 'humidity' })) {
          uniqueAlerts = [...uniqueAlerts, _.find(_.orderBy(alertsTillNow, 'create_date', 'desc'), { parameter_type: 'humidity' })];
        }
        if (_.find(_.orderBy(alertsTillNow, 'create_date', 'desc'), { parameter_type: 'shock' })) {
          uniqueAlerts = [...uniqueAlerts, _.find(_.orderBy(alertsTillNow, 'create_date', 'desc'), { parameter_type: 'shock' })];
        }
        if (_.find(_.orderBy(alertsTillNow, 'create_date', 'desc'), { parameter_type: 'light' })) {
          uniqueAlerts = [...uniqueAlerts, _.find(_.orderBy(alertsTillNow, 'create_date', 'desc'), { parameter_type: 'light' })];
        }
        uniqueAlerts = _.orderBy(uniqueAlerts, 'create_date');

        const exactAlertID = _.filter(preAlerts, { report_id: _.toString(report.id) });
        _.forEach(exactAlertID, (alert) => {
          if (alert.recovered_alert_id) {
            _.remove(uniqueAlerts, { parameter_type: alert.parameter_type });
            allAlerts = [...allAlerts, { id: alert.parameter_type, color, title: `${_.capitalize(alert.parameter_type)} Excursion Recovered` }];
          }
        });

        _.forEach(uniqueAlerts, (alert) => {
          if (alert) {
            let alertColor = '';
            let title = '';
            const found = _.find(allAlerts, { id: alert.parameter_type });
            if (found) {
              _.remove(allAlerts, { id: alert.parameter_type });
            }

            switch (true) {
              case _.includes(_.toLower(alert.alert_type), 'max'):
              case _.includes(_.toLower(alert.alert_type), 'shock'):
              case _.includes(_.toLower(alert.alert_type), 'light'):
                color = muiTheme.palette.error.main;
                alertColor = muiTheme.palette.error.main;
                title = `Maximum ${_.capitalize(alert.parameter_type)} Excursion`;
                break;

              case _.includes(_.toLower(alert.alert_type), 'min'):
                if (color !== muiTheme.palette.error.main) {
                  color = muiTheme.palette.info.main;
                }
                alertColor = muiTheme.palette.info.main;
                title = `Minimum ${_.capitalize(alert.parameter_type)} Excursion`;
                break;

              default:
                break;
            }

            allAlerts = [...allAlerts, { id: alert.parameter_type, color: alertColor, title }];
          }
        });

        const temperature = _.isEqual(_.toLower(tempMeasure), 'fahrenheit')
          ? report_entry.report_temp_fah
          : report_entry.report_temp_cel
            ? _.round(report_entry.report_temp_cel, 2)
            : report_entry.report_temp_cel;
        const probe = _.isEqual(_.toLower(tempMeasure), 'fahrenheit')
          ? report_entry.report_probe_fah
          : report_entry.report_probe_cel
            ? _.round(report_entry.report_probe_cel, 2)
            : report_entry.report_probe_cel;
        const shock = report_entry.report_shock && _.round(report_entry.report_shock, 2);
        const light = report_entry.report_light && _.round(report_entry.report_light, 2);

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
              light,
              shock,
              tilt: report_entry.report_tilt,
              humidity: report_entry.report_humidity,
              battery: report_entry.report_battery,
              pressure: report_entry.report_pressure,
              probe,
              color,
              allAlerts,
              date,
              time,
            };

            markersToSet = [...markersToSet, marker];
          }
        } else {
          marker = {
            lat: '*',
            lng: '*',
            location: 'N/A',
            label: 'Clustered',
            temperature,
            light,
            shock,
            tilt: report_entry.report_tilt,
            humidity: report_entry.report_humidity,
            battery: report_entry.report_battery,
            pressure: report_entry.report_pressure,
            probe,
            color,
            allAlerts,
            date,
            time,
          };
        }
      });
    }

    setSteps(_.orderBy(newSteps, 'id'));
    setMarkers(_.orderBy(markersToSet, [(obj) => moment(`${obj.date} ${obj.time}`)], ['desc']));
    setSelectedMarker(markers[0]);
  };

  const getTranslatedLanguage = () => {
    const userLanguageAbbv = _.find(LANGUAGES, (item) => _.isEqual(item.label, userLanguage))?.value;
    let returnValue = userLanguageAbbv;
    if (!returnValue) {
      const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
      if (match) {
        const value = decodeURIComponent(match[2]);
        const parts = value.split('/');
        returnValue = parts[_.size(parts) - 1];
      }
    }
    return returnValue;
  };

  const filterTabClicked = async (filter) => {
    setShipmentFilter(filter);
    setSelectedShipment(null);
    setTableRow([]);
  };

  const handleShipmentChange = (event, newValue) => {
    setSelectedShipment(newValue);
    if (inputRef.current) {
      inputRef.current.blur();
    }
    if (newValue) {
      syncSingleTrackerMutation({ gateway_uuid: newValue.gateway_ids[0] });
    }
  };

  const renderSensorData = (marker) => {
    const isValidData = (
      marker.temperature !== null && marker.temperature !== undefined
      && marker.humidity !== null && marker.humidity !== undefined
      && marker.shock !== null && marker.shock !== undefined
      && marker.light !== null && marker.light !== undefined
      && marker.battery !== null && marker.battery !== undefined
    );
    const maxTemp = selectedShipment && _.orderBy(selectedShipment.max_excursion_temp, 'set_at', 'desc')[0];
    const minTemp = selectedShipment && _.orderBy(selectedShipment.min_excursion_temp, 'set_at', 'desc')[0];
    const maxHum = selectedShipment && _.orderBy(selectedShipment.max_excursion_humidity, 'set_at', 'desc')[0];
    const minHum = selectedShipment && _.orderBy(selectedShipment.min_excursion_humidity, 'set_at', 'desc')[0];
    const maxShock = selectedShipment && _.orderBy(selectedShipment.shock_threshold, 'set_at', 'desc')[0];
    const maxLight = selectedShipment && _.orderBy(selectedShipment.light_threshold, 'set_at', 'desc')[0];

    return isValidData && (
      <>
        <Grid container flex>
          <Typography>Temp (</Typography>
          <Typography className="shipmentMaxColor">{maxTemp.value}</Typography>
          <Typography>/</Typography>
          <Typography className="shipmentMinColor">{minTemp.value}</Typography>
          <Typography>{`): ${marker.temperature}`}</Typography>
        </Grid>
        <Grid container flex>
          <Typography>Humidity (</Typography>
          <Typography className="shipmentMaxColor">{maxHum.value}</Typography>
          <Typography>/</Typography>
          <Typography className="shipmentMinColor">{minHum.value}</Typography>
          <Typography>{`): ${marker.humidity}`}</Typography>
        </Grid>
        <Grid container flex>
          <Typography>Shock (</Typography>
          <Typography className="shipmentMaxColor">{maxShock.value}</Typography>
          <Typography>{`): ${marker.shock}`}</Typography>
        </Grid>
        <Grid container flex>
          <Typography>Light (</Typography>
          <Typography className="shipmentMaxColor">{maxLight.value}</Typography>
          <Typography>{`): ${marker.light}`}</Typography>
        </Grid>
        <Typography>{`Battery: ${marker.battery}`}</Typography>
      </>
    );
  };

  const renderIrregularTransmission = (marker) => {
    const hasInvalidData = (
      marker.temperature === null || marker.temperature === undefined
      || marker.humidity === null || marker.humidity === undefined
      || marker.shock === null || marker.shock === undefined
      || marker.light === null || marker.light === undefined
      || marker.battery === null || marker.battery === undefined
    );
    const maxTemp = selectedShipment && _.orderBy(selectedShipment.max_excursion_temp, 'set_at', 'desc')[0];
    const minTemp = selectedShipment && _.orderBy(selectedShipment.min_excursion_temp, 'set_at', 'desc')[0];
    const maxHum = selectedShipment && _.orderBy(selectedShipment.max_excursion_humidity, 'set_at', 'desc')[0];
    const minHum = selectedShipment && _.orderBy(selectedShipment.min_excursion_humidity, 'set_at', 'desc')[0];
    const maxShock = selectedShipment && _.orderBy(selectedShipment.shock_threshold, 'set_at', 'desc')[0];
    const maxLight = selectedShipment && _.orderBy(selectedShipment.light_threshold, 'set_at', 'desc')[0];

    return hasInvalidData && (
      <Grid item xs={12}>
        <Typography fontWeight={700} fontStyle="italic">
          Irregular Transmission:
        </Typography>
        {renderSensorValue('Temp ', marker.temperature, maxTemp.value, minTemp.value)}
        {renderSensorValue('Humidity ', marker.humidity, maxHum.value, minHum.value)}
        {renderSensorValue('Shock ', marker.shock, maxShock.value)}
        {renderSensorValue('Light ', marker.light, maxLight.value)}
        {renderSensorValue('Battery', marker.battery)}
      </Grid>
    );
  };

  const renderSensorValue = (label, value, max = null, min = null) => (
    !_.isEqual(value, null) && !_.isEqual(value, undefined) && (
      <Grid container flex>
        <Typography>{label}</Typography>
        {(max || min) && (
          <Typography>(</Typography>
        )}
        {max && (
          <Typography className="shipmentMaxColor">{max}</Typography>
        )}
        {max && min && (
          <Typography>/</Typography>
        )}
        {min && (
          <Typography className="shipmentMinColor">{min}</Typography>
        )}
        {(max || min) && (
          <Typography>)</Typography>
        )}
        <Typography>{`: ${value}`}</Typography>
      </Grid>
    )
  );

  return (
    <Box mt={5} mb={5}>
      {isLoaded && <Loader open={isLoaded} />}
      <Button
        type="button"
        onClick={(e) => history.push(routes.CREATE_SHIPMENT)}
        className="shipmentCreateButton"
      >
        + Create Shipment
      </Button>
      <Box className="shipmentContainer">
        <Typography className="shipmentHeading" variant="h4">
          Shipment
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <div className="shipmentSwitchViewSection">
            <ToggleButtonGroup
              color="secondary"
              value={shipmentFilter}
              exclusive
              fullWidth
            >
              {['Active', 'Completed', 'Battery Depleted', 'Damaged'].map((status) => (
                <ToggleButton
                  key={status}
                  value={status}
                  selected={shipmentFilter === status}
                  onClick={() => filterTabClicked(status)}
                >
                  {status}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div className="shipmentSwitchViewSection2">
            <Autocomplete
              id="shipment-name"
              className="shipmentSelectInput"
              options={shipmentData || []}
              getOptionLabel={(option) => option && option.name}
              value={selectedShipment}
              onChange={handleShipmentChange}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={inputRef}
                  className="notranslate"
                  variant="outlined"
                  label={<span className="translate">Shipment Name</span>}
                  placeholder="Select..."
                />
              )}
            />
          </div>
        </Grid>
      </Grid>
      {!_.isEmpty(selectedShipment) && (
        <Grid item xs={12} mt={2}>
          <MapComponent
            isMarkerShown={!_.isEmpty(markers)}
            showPath
            markers={markers}
            zoom={12}
            setSelectedMarker={setSelectedMarker}
            containerStyle={{ height: '600px' }}
            unitOfMeasure={unitData}
            mapCountry={organizationCountry}
            mapLanguage={getTranslatedLanguage()}
          />
        </Grid>
      )}
      {!_.isEmpty(selectedShipment) && (
        <Grid item xs={12} className="shipmentDataTable">
          <DataTableWrapper
            hideAddButton
            pagination
            rows={tableRow}
            filename="ShipmentData"
            columns={[
              {
                name: '',
                options: {
                  sort: false,
                  sortThirdClickReset: false,
                  filter: false,
                  customBodyRenderLite: (dataIndex) => (
                    tableRow[dataIndex] && tableRow[dataIndex].note
                      ? (
                        <Tooltip
                          TransitionComponent={Fade}
                          TransitionProps={{ timeout: 600 }}
                          placement="bottom-start"
                          title={<Typography>{tableRow[dataIndex].note}</Typography>}
                          className="shipmentTooltip"
                        >
                          <NoteIcon />
                        </Tooltip>
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
                      className="shipmentName notranslate"
                      onClick={(e) => {
                        history.push(routes.CREATE_SHIPMENT, {
                          ship: _.omit(tableRow[dataIndex], ['type', 'itemNames', 'tracker', 'battery_levels', 'alerts', 'allMarkers']),
                        });
                      }}
                    >
                      {tableRow[dataIndex].name}
                    </Typography>
                  ),
                },
              },
              ...shipmentColumns(
                data,
                _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
                  ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
                  : '',
                userLanguage,
                muiTheme,
              ),
              {
                name: 'battery_levels',
                label: 'Battery (%) with Intervals',
                options: {
                  sort: true,
                  sortThirdClickReset: true,
                  filter: true,
                  setCellProps: () => ({
                    style: {
                      width: '300px',
                      maxWidth: '300px',
                    },
                  }),
                  customBodyRenderLite: (dataIndex) => {
                    const ship = tableRow[dataIndex];
                    const tTime = _.find(TIVE_GATEWAY_TIMES, { value: ship.transmission_time });
                    const mTime = _.find(TIVE_GATEWAY_TIMES, { value: ship.measurement_time });

                    return (
                      <Grid container>
                        <Grid item className="shipmentGridTimeCenter">
                          <Typography variant="body1">
                            {ship.battery_levels}
                          </Typography>
                        </Grid>
                        <Grid item flex={1}>
                          <Typography variant="body1">
                            {`T: ${tTime ? tTime.short_label : 'N/A'}`}
                          </Typography>
                          <Typography variant="body1">
                            {`M: ${mTime ? mTime.short_label : 'N/A'}`}
                          </Typography>
                        </Grid>
                      </Grid>
                    );
                  },
                },
              },
            ]}
            extraOptions={{
              expandableRows: true,
              rowsExpanded: [0],
              download: false,
              filter: false,
              print: false,
              search: false,
              viewColumns: false,
              renderExpandableRow: (rowData, rowMeta) => {
                const colSpan = rowData.length + 1;
                const ship = tableRow[rowMeta.dataIndex];

                return (
                  <>
                    <TableRow>
                      <TableCell colSpan={colSpan}>
                        <CustomizedSteppers steps={steps} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={colSpan}>
                        <Grid container spacing={2}>
                          <Grid item xs={2}>
                            <Grid container rowGap={1}>
                              <Grid item xs={12}>
                                <Typography fontWeight={700}>
                                  Order ID:
                                </Typography>
                                <Typography className="notranslate">
                                  {ship.order_number}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography fontWeight={700}>
                                  Items:
                                </Typography>
                                {_.map(_.split(ship.itemNames, ','), (item, idx) => (
                                  <Typography className="notranslate" key={`${item}-${idx}`}>{item}</Typography>
                                ))}
                              </Grid>
                              <Grid item xs={12}>
                                <Typography fontWeight={700}>
                                  Status:
                                </Typography>
                                <Typography className="notranslate">
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
                                  <Typography className="notranslate">
                                    {carr}
                                  </Typography>
                                </Grid>
                              ))}
                              <Grid item xs={12}>
                                <Typography fontWeight={700}>
                                  Receiver:
                                </Typography>
                                <Typography className="notranslate">
                                  {ship.destination}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={2}>
                            {!_.isEmpty(markers) && markers[0] && (
                              <Grid container rowGap={1}>
                                <Grid item xs={12}>
                                  <Typography fontWeight={700}>
                                    Last location:
                                  </Typography>
                                  <Typography>
                                    {markers[0].location}
                                  </Typography>
                                </Grid>
                              </Grid>
                            )}
                          </Grid>
                          <Grid item xs={2}>
                            {!_.isEmpty(markers) && markers[0] && (
                              <Grid container rowGap={1}>
                                <Grid item xs={12}>
                                  <Typography fontWeight={700}>
                                    Last Reading:
                                  </Typography>
                                  <Typography component="span" className="translate">
                                    Recorded at:
                                    <span className="notranslate">{` ${markers[0].date} ${markers[0].time}`}</span>
                                  </Typography>
                                  {renderSensorData(markers[0])}
                                </Grid>
                                {renderIrregularTransmission(markers[0])}
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
                                  value={ship.note || ''}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <FormControl
                                  fullWidth
                                  component="fieldset"
                                  variant="outlined"
                                  className="shipmentAttachedFiles"
                                  style={{
                                    padding: _.isEmpty(ship.uploaded_pdf)
                                      ? muiTheme.spacing(3)
                                      : muiTheme.spacing(1.5),
                                  }}
                                >
                                  <FormLabel component="legend" className="shipmentLegend">
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
                  </>
                );
              },
            }}
          />
        </Grid>
      )}
    </Box>
  );
};

export default Shipment;
