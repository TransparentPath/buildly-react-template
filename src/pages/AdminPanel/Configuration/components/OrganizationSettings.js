/**
 * @file OrganizationSettings.jsx
 * @description Component for managing organization-wide settings including:
 * - Alert configurations (temperature, humidity, shock, light)
 * - Default thresholds and measurement intervals
 * - Regional settings (country, currency, timezone)
 * - Unit preferences (temperature, distance, weight)
 * - Date/time format preferences
 */

import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useTimezoneSelect, allTimezones } from 'react-timezone-select';
import {
  Button,
  Checkbox,
  Grid,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  BoltOutlined as ShockIcon,
  LightModeOutlined as LightIcon,
  Opacity as HumidityIcon,
  Thermostat as TemperatureIcon,
} from '@mui/icons-material';
import Loader from '@components/Loader/Loader';
import { useInput } from '@hooks/useInput';
import {
  DATE_DISPLAY_CHOICES,
  LANGUAGES,
  TIME_DISPLAY_CHOICES,
  TIVE_GATEWAY_TIMES,
  UOM_DISTANCE_CHOICES,
  UOM_TEMPERATURE_CHOICES,
  UOM_WEIGHT_CHOICES,
} from '@utils/mock';
import { uomDistanceUpdate } from '@utils/utilMethods';
import { isDesktop2 } from '@utils/mediaQuery';
import { getUser } from '@context/User.context';
import { useQuery } from 'react-query';
import { getOrganizationTypeQuery } from '@react-query/queries/authUser/getOrganizationTypeQuery';
import { getCountriesQuery } from '@react-query/queries/shipments/getCountriesQuery';
import { getCurrenciesQuery } from '@react-query/queries/shipments/getCurrenciesQuery';
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery';
import { useUpdateOrganizationMutation } from '@react-query/mutations/authUser/updateOrganizationMutation';
import { useEditUnitMutation } from '@react-query/mutations/items/editUnitMutation';
import useAlert from '@hooks/useAlert';
import '../../AdminPanelStyles.css';
import { useTranslation } from 'react-i18next';
import { TiltIcon } from '@utils/constants';

/**
 * OrganizationSettings Component
 *
 * Provides an interface for managing organization-wide settings with features:
 * - Alert management for different sensor types
 * - Threshold configuration for various measurements
 * - Regional and localization preferences
 * - Unit system preferences
 * - Data transmission and measurement intervals
 */
const OrganizationSettings = () => {
  /**
   * Current organization data and UUID from user context
   */
  const organizationData = getUser().organization;
  const organization = getUser().organization.organization_uuid;

  /**
   * Alert hook for displaying notifications
   */
  const { displayAlert } = useAlert();

  const { t } = useTranslation();

  /**
   * Data Fetching
   * Queries for organization types, countries, currencies, and unit preferences
   */
  const { data: organizationTypesData, isLoading: isLoadingOrganizationTypes } = useQuery(
    ['organizationTypes'],
    () => getOrganizationTypeQuery(displayAlert, 'Organization settings'),
    { refetchOnWindowFocus: false },
  );

  const { data: countriesData, isLoading: isLoadingCountries } = useQuery(
    ['countries'],
    () => getCountriesQuery(displayAlert, 'Organization settings'),
    { refetchOnWindowFocus: false },
  );

  const { data: currenciesData, isLoading: isLoadingCurrencies } = useQuery(
    ['currencies'],
    () => getCurrenciesQuery(displayAlert, 'Organization settings'),
    { refetchOnWindowFocus: false },
  );

  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization],
    () => getUnitQuery(organization, displayAlert, 'Organization settings'),
    { refetchOnWindowFocus: false },
  );

  /**
   * Form Input States
   * Using custom useInput hook for form field management
   */
  const allowImportExport = useInput(
    (organizationData && organizationData.allow_import_export) || false,
  );
  const radius = useInput(
    (organizationData && organizationData.radius) || 0,
  );
  const orgType = useInput(
    (organizationData && organizationData.organization_type) || '',
  );
  const orgAbb = useInput(
    (organizationData && organizationData.abbrevation) || '',
  );
  const enableTilt = useInput(
    (organizationData && organizationData.enable_tilt) || false,
  );

  /**
   * Threshold Settings
   * Default values for various sensor measurements
   */
  const defaultMaxTemperature = useInput(
    (organizationData && organizationData.default_max_temperature) || 100,
  );
  const defaultMinTemperature = useInput(
    (organizationData && organizationData.default_min_temperature) || 0,
  );
  const defaultMaxHumidity = useInput(
    (organizationData && organizationData.default_max_humidity) || 100,
  );
  const defaultMinHumidity = useInput(
    (organizationData && organizationData.default_min_humidity) || 0,
  );
  const defaultShock = useInput(
    (organizationData && organizationData.default_shock) || 4,
  );
  const defaultLight = useInput(
    (organizationData && organizationData.default_light) || 5,
  );

  /**
   * Transmission Settings
   * Intervals for data transmission and measurement
   */
  const defaultPreTransitTransmissionInterval = useInput(
    (organizationData && organizationData.default_pre_transit_transmission_interval) || 120,
  );
  const defaultPreTransitMeasurementInterval = useInput(
    (organizationData && organizationData.default_pre_transit_measurement_interval) || 120,
  );
  const defaultTransitTransmissionInterval = useInput(
    (organizationData && organizationData.default_transit_transmission_interval) || 20,
  );
  const defaultTransitMeasurementInterval = useInput(
    (organizationData && organizationData.default_transit_measurement_interval) || 20,
  );
  const defaultPostTransitTransmissionInterval = useInput(
    (organizationData && organizationData.default_post_transit_transmission_interval) || 120,
  );
  const defaultPostTransitMeasurementInterval = useInput(
    (organizationData && organizationData.default_post_transit_measurement_interval) || 120,
  );

  /**
   * Alert Settings
   * Toggle states for different types of alerts
   */
  const supressTempAlerts = useInput(
    !_.includes(organizationData.alerts_to_suppress, 'temperature'),
  );
  const supressHumidityAlerts = useInput(
    !_.includes(organizationData.alerts_to_suppress, 'humidity'),
  );
  const supressShockAlerts = useInput(
    !_.includes(organizationData.alerts_to_suppress, 'shock'),
  );
  const supressLightAlerts = useInput(
    !_.includes(organizationData.alerts_to_suppress, 'light'),
  );

  /**
   * Regional Settings
   * Country, currency, and localization preferences
   */
  const country = useInput(
    _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'country'))
      ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'country')).unit_of_measure
      : 'United States',
  );
  const currency = useInput(
    _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'currency'))
      ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'currency')).unit_of_measure
      : 'USD',
  );
  const dateFormat = useInput(
    _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
      ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
      : 'MMM DD, YYYY',
  );
  const timeFormat = useInput(
    _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
      ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
      : 'hh:mm:ss A',
  );

  /**
   * Unit Preferences
   * Measurement system settings
   */
  const distance = useInput(
    _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'distance'))
      ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'distance')).unit_of_measure
      : 'Miles',
  );
  const temp = useInput(
    _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature'))
      ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature')).unit_of_measure
      : 'Fahrenheit',
  );
  const weight = useInput(
    _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'weight'))
      ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'weight')).unit_of_measure
      : 'Pounds',
  );

  /**
   * Timezone Settings
   * Time zone selection using react-timezone-select
   */
  const { options: tzOptions } = useTimezoneSelect({ labelStyle: 'original', timezones: allTimezones });
  const timezone = useInput(
    _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time zone'))
      ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time zone')).unit_of_measure
      : 'America/Los_Angeles',
  );

  /**
   * Language Settings
   * Interface language preference
   */
  const language = useInput(
    _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'language'))
      ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'language')).unit_of_measure
      : 'English',
  );

  /**
   * UI State Management
   */
  const [countryList, setCountryList] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);

  /**
   * Effect Hooks
   * Handle data processing and state updates
   */
  useEffect(() => {
    if (!_.isEmpty(countriesData)) {
      setCountryList(_.sortBy(_.without(_.uniq(_.map(countriesData, 'country')), [''])));
    }
  }, [countriesData]);

  useEffect(() => {
    if (!_.isEmpty(currenciesData)) {
      setCurrencyList(_.sortBy(_.without(_.uniq(_.map(currenciesData, 'currency')), [''])));
    }
  }, [currenciesData]);

  useEffect(() => {
    // Update form fields with unit data when available
    country.setValue(
      _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'country'))
        ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'country')).unit_of_measure
        : 'United States',
    );
    currency.setValue(
      _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'currency'))
        ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'currency')).unit_of_measure
        : 'USD',
    );
    dateFormat.setValue(
      _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
        ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
        : 'MMM DD, YYYY',
    );
    timeFormat.setValue(
      _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
        ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
        : 'hh:mm:ss A',
    );
    distance.setValue(
      _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'distance'))
        ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'distance')).unit_of_measure
        : 'Miles',
    );
    temp.setValue(
      _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature'))
        ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature')).unit_of_measure
        : 'Fahrenheit',
    );
    weight.setValue(
      _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'weight'))
        ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'weight')).unit_of_measure
        : 'Pounds',
    );
    timezone.setValue(
      _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time zone'))
        ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time zone')).unit_of_measure
        : 'America/Los_Angeles',
    );
    language.setValue(
      _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'language'))
        ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'language')).unit_of_measure
        : 'English',
    );
  }, [unitData]);

  /**
   * Form Actions
   */
  const resetValues = () => {
    // Reset all form fields to their initial values
    allowImportExport.reset();
    radius.reset();
    orgType.reset();
    orgAbb.reset();
    enableTilt.reset();
    defaultMaxTemperature.reset();
    defaultMinTemperature.reset();
    defaultMaxHumidity.reset();
    defaultMinHumidity.reset();
    defaultShock.reset();
    defaultLight.reset();
    defaultPreTransitTransmissionInterval.reset();
    defaultPreTransitMeasurementInterval.reset();
    defaultTransitTransmissionInterval.reset();
    defaultTransitMeasurementInterval.reset();
    defaultPostTransitMeasurementInterval.reset();
    defaultPostTransitMeasurementInterval.reset();
    supressTempAlerts.reset();
    supressHumidityAlerts.reset();
    supressShockAlerts.reset();
    supressLightAlerts.reset();
    country.reset();
    currency.reset();
    dateFormat.reset();
    timeFormat.reset();
    distance.reset();
    temp.reset();
    weight.reset();
    timezone.reset();
    language.reset();
  };

  /**
   * Form Validation
   * @returns {boolean} True if any field has changed
   */
  const submitDisabled = () => (
    allowImportExport.hasChanged()
    || radius.hasChanged()
    || orgType.hasChanged()
    || orgAbb.hasChanged()
    || enableTilt.hasChanged()
    || defaultMaxTemperature.hasChanged()
    || defaultMinTemperature.hasChanged()
    || defaultMaxHumidity.hasChanged()
    || defaultMinHumidity.hasChanged()
    || defaultShock.hasChanged()
    || defaultLight.hasChanged()
    || defaultPreTransitTransmissionInterval.hasChanged()
    || defaultPreTransitMeasurementInterval.hasChanged()
    || defaultTransitTransmissionInterval.hasChanged()
    || defaultTransitMeasurementInterval.hasChanged()
    || defaultPostTransitTransmissionInterval.hasChanged()
    || defaultPostTransitMeasurementInterval.hasChanged()
    || supressTempAlerts.hasChanged()
    || supressHumidityAlerts.hasChanged()
    || supressShockAlerts.hasChanged()
    || supressLightAlerts.hasChanged()
    || country.hasChanged()
    || currency.hasChanged()
    || dateFormat.hasChanged()
    || timeFormat.hasChanged()
    || distance.hasChanged()
    || temp.hasChanged()
    || weight.hasChanged()
    || timezone.hasChanged()
    || language.hasChanged()
  );

  /**
   * API Mutations
   * Handlers for updating organization and unit settings
   */
  const { mutate: updateOrganizationMutation, isLoading: isUpdatingOrganization } = useUpdateOrganizationMutation(null, displayAlert, 'Organization settings');
  const { mutate: editUnitMutation, isLoading: isEditingUnit } = useEditUnitMutation(organization, displayAlert, 'Organization settings');

  /**
   * Form Submission Handler
   * Updates organization settings and unit preferences
   *
   * @param {Event} event Form submission event
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    // Update organization settings if changed
    if (allowImportExport.hasChanged()
      || radius.hasChanged()
      || orgType.hasChanged()
      || orgAbb.hasChanged()
      || enableTilt.hasChanged()
      || distance.hasChanged()
      || defaultMaxTemperature.hasChanged()
      || defaultMinTemperature.hasChanged()
      || defaultMaxHumidity.hasChanged()
      || defaultMinHumidity.hasChanged()
      || defaultShock.hasChanged()
      || defaultLight.hasChanged()
      || defaultPreTransitTransmissionInterval.hasChanged()
      || defaultPreTransitMeasurementInterval.hasChanged()
      || defaultTransitTransmissionInterval.hasChanged()
      || defaultTransitMeasurementInterval.hasChanged()
      || defaultPostTransitTransmissionInterval.hasChanged()
      || defaultPostTransitMeasurementInterval.hasChanged()
      || supressTempAlerts.hasChanged()
      || supressHumidityAlerts.hasChanged()
      || supressShockAlerts.hasChanged()
      || supressLightAlerts.hasChanged()
    ) {
      let data = {
        ...organizationData,
        edit_date: new Date(),
        allow_import_export: allowImportExport.value,
        radius: radius.value || 0,
        organization_type: orgType.value,
        abbrevation: _.toUpper(orgAbb.value),
        default_max_temperature: defaultMaxTemperature.value,
        default_min_temperature: defaultMinTemperature.value,
        default_max_humidity: defaultMaxHumidity.value,
        default_min_humidity: defaultMinHumidity.value,
        default_shock: defaultShock.value,
        default_light: defaultLight.value,
        default_pre_transit_transmission_interval: defaultPreTransitTransmissionInterval.value,
        default_pre_transit_measurement_interval: defaultPreTransitMeasurementInterval.value,
        default_transit_transmission_interval: defaultTransitTransmissionInterval.value,
        default_transit_measurement_interval: defaultTransitMeasurementInterval.value,
        default_post_transit_transmission_interval: defaultPostTransitTransmissionInterval.value,
        default_post_transit_measurement_interval: defaultPostTransitMeasurementInterval.value,
        alerts_to_suppress: _.without([
          !supressTempAlerts.value ? 'temperature' : '',
          !supressHumidityAlerts.value ? 'humidity' : '',
          !supressShockAlerts.value ? 'shock' : '',
          !supressLightAlerts.value ? 'light' : '',
        ], ''),
        enable_tilt: enableTilt.value,
      };

      // Update radius if distance unit changed
      if (distance.hasChanged()) {
        data = { ...data, radius: uomDistanceUpdate(distance.value, radius.value) };
      }

      updateOrganizationMutation(data);
    }

    // Update unit preferences if changed
    _.forEach(unitData, (unit) => {
      let uom = unit;
      switch (_.toLower(unit.unit_of_measure_for)) {
        case 'country':
          if (country.hasChanged()) {
            uom = { ...uom, unit_of_measure: country.value };
            editUnitMutation(uom);
          }
          break;
        case 'currency':
          if (currency.hasChanged()) {
            uom = { ...uom, unit_of_measure: currency.value };
            editUnitMutation(uom);
          }
          break;
        case 'date':
          if (dateFormat.hasChanged()) {
            uom = { ...uom, unit_of_measure: dateFormat.value };
            editUnitMutation(uom);
          }
          break;
        case 'time':
          if (timeFormat.hasChanged()) {
            uom = { ...uom, unit_of_measure: timeFormat.value };
            editUnitMutation(uom);
          }
          break;
        case 'distance':
          if (distance.hasChanged()) {
            uom = { ...uom, unit_of_measure: distance.value };
            editUnitMutation(uom);
          }
          break;
        case 'temperature':
          if (temp.hasChanged()) {
            uom = { ...uom, unit_of_measure: temp.value };
            editUnitMutation(uom);
          }
          break;
        case 'weight':
          if (weight.hasChanged()) {
            uom = { ...uom, unit_of_measure: weight.value };
            editUnitMutation(uom);
          }
          break;
        case 'time zone':
          if (timezone.hasChanged()) {
            uom = { ...uom, unit_of_measure: timezone.value };
            editUnitMutation(uom);
          }
          break;
        case 'language':
          if (language.hasChanged()) {
            uom = { ...uom, unit_of_measure: language.value };
            editUnitMutation(uom);
          }
          break;
        default:
          break;
      }
    });
  };

  return (
    <Grid className="adminPanelOrgRoot" container spacing={2}>
      {/* Loading indicator */}
      {(isLoadingOrganizationTypes
        || isLoadingCountries
        || isLoadingCurrencies
        || isLoadingUnits
        || isUpdatingOrganization
        || isEditingUnit)
        && (
          <Loader open={isLoadingOrganizationTypes
            || isLoadingCountries
            || isLoadingCurrencies
            || isLoadingUnits
            || isUpdatingOrganization
            || isEditingUnit}
          />
        )}
      <form className="adminPanelOrgFormContainer" noValidate onSubmit={handleSubmit}>
        {/* Alert Settings Section */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700}>{t('orgSettings.alertSettings')}</Typography>
          </Grid>
          <Grid item xs={6} alignSelf="center">
            <FormControlLabel
              labelPlacement="end"
              label={(
                <div className="adminPanelOrgIconContainer">
                  <TemperatureIcon className="adminPanelOrgIcons" />
                  {t('orgSettings.temperatureAlerts')}
                </div>
              )}
              control={<Switch checked={supressTempAlerts.value} color="primary" onChange={(e) => supressTempAlerts.setValue(e.target.checked)} />}
            />
          </Grid>
          <Grid item xs={6} alignSelf="center">
            <FormControlLabel
              labelPlacement="end"
              label={(
                <div className="adminPanelOrgIconContainer">
                  <HumidityIcon className="adminPanelOrgIcons" />
                  {t('orgSettings.humidityAlerts')}
                </div>
              )}
              control={<Switch checked={supressHumidityAlerts.value} color="primary" onChange={(e) => supressHumidityAlerts.setValue(e.target.checked)} />}
            />
          </Grid>
          <Grid item xs={6} alignSelf="center">
            <FormControlLabel
              labelPlacement="end"
              label={(
                <div className="adminPanelOrgIconContainer">
                  <ShockIcon className="adminPanelOrgIcons" />
                  {t('orgSettings.shockAlerts')}
                </div>
              )}
              control={<Switch checked={supressShockAlerts.value} color="primary" onChange={(e) => supressShockAlerts.setValue(e.target.checked)} />}
            />
          </Grid>
          <Grid item xs={6} alignSelf="center">
            <FormControlLabel
              labelPlacement="end"
              label={(
                <div className="adminPanelOrgIconContainer">
                  <LightIcon className="adminPanelOrgIcons" />
                  {t('orgSettings.lightAlerts')}
                </div>
              )}
              control={<Switch checked={supressLightAlerts.value} color="primary" onChange={(e) => supressLightAlerts.setValue(e.target.checked)} />}
            />
          </Grid>
        </Grid>

        {/* Enable Tilt for the organization */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700}>{t('orgSettings.enableTilt')}</Typography>
          </Grid>
          <Grid item xs={6} alignSelf="center">
            <FormControlLabel
              labelPlacement="end"
              label={(
                <div className="adminPanelOrgIconContainer">
                  <TiltIcon />
                  {t('orgSettings.tilt')}
                </div>
              )}
              control={<Switch checked={enableTilt.value} color="primary" onChange={(e) => enableTilt.setValue(e.target.checked)} />}
            />
          </Grid>
        </Grid>

        {/* Geofence Settings */}
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            margin="normal"
            id="radius"
            fullWidth
            label={t('orgSettings.radius', { unit: _.toLower(distance.value) })}
            name="radius"
            autoComplete="radius"
            {...radius.bind}
          />
        </Grid>

        {/* Organization Details */}
        <Grid container spacing={isDesktop2() ? 2 : 0}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              select
              id="org-type"
              name="org-type"
              label={t('orgSettings.organizationType')}
              autoComplete="orgType"
              {...orgType.bind}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {_.map(organizationTypesData, (type) => (
                <MenuItem key={`orgType-${type.id}`} value={type.id}>
                  {_.capitalize(type.name)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="org-abb"
              name="org-abb"
              label={t('orgSettings.organizationAbbreviation')}
              autoComplete="orgAbb"
              inputProps={{
                maxLength: 7,
                style: { textTransform: 'uppercase' },
              }}
              {...orgAbb.bind}
            />
          </Grid>
        </Grid>

        {/* Temperature Settings */}
        <Grid container spacing={isDesktop2() ? 2 : 0}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              type="number"
              className="adminPanelNumberInput"
              id="default-max-temperature"
              name="default-max-temperature"
              label={t('orgSettings.defaultMaxTemp')}
              autoComplete="default-max-temperature"
              InputProps={{
                startAdornment: <InputAdornment position="start"><TemperatureIcon /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="start">
                    {
                      _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature'))
                        && _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature')).unit_of_measure === UOM_TEMPERATURE_CHOICES[0]
                        ? <span>&#8457;</span>
                        : <span>&#8451;</span>
                    }
                  </InputAdornment>
                ),
              }}
              {...defaultMaxTemperature.bind}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              type="number"
              className="adminPanelNumberInput"
              id="default-min-temperature"
              name="default-min-temperature"
              label={t('orgSettings.defaultMinTemp')}
              autoComplete="default-min-temperature"
              InputProps={{
                startAdornment: <InputAdornment position="start"><TemperatureIcon /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="start">
                    {
                      _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature'))
                        && _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'temperature')).unit_of_measure === UOM_TEMPERATURE_CHOICES[0]
                        ? <span>&#8457;</span>
                        : <span>&#8451;</span>
                    }
                  </InputAdornment>
                ),
              }}
              {...defaultMinTemperature.bind}
            />
          </Grid>
        </Grid>

        {/* Humidity Settings */}
        <Grid container spacing={isDesktop2() ? 2 : 0}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              type="number"
              className="adminPanelNumberInput"
              id="default-max-humidity"
              name="default-max-humidity"
              label={t('orgSettings.defaultMaxHumidity')}
              autoComplete="default-max-humidity"
              InputProps={{
                startAdornment: <InputAdornment position="start"><HumidityIcon /></InputAdornment>,
                endAdornment: <InputAdornment position="start">%</InputAdornment>,
              }}
              {...defaultMaxHumidity.bind}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              type="number"
              className="adminPanelNumberInput"
              id="default-min-humidity"
              name="default-min-humidity"
              label={t('orgSettings.defaultMinHumidity')}
              autoComplete="default-min-humidity"
              InputProps={{
                startAdornment: <InputAdornment position="start"><HumidityIcon /></InputAdornment>,
                endAdornment: <InputAdornment position="start">%</InputAdornment>,
              }}
              {...defaultMinHumidity.bind}
            />
          </Grid>
        </Grid>

        {/* Shock and Light Settings */}
        <Grid container spacing={isDesktop2() ? 2 : 0}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              type="number"
              className="adminPanelNumberInput"
              id="default-shock"
              name="default-shock"
              label={t('orgSettings.defaultShock')}
              autoComplete="default-shock"
              InputProps={{
                startAdornment: <InputAdornment position="start"><ShockIcon /></InputAdornment>,
                endAdornment: <InputAdornment position="start">G</InputAdornment>,
              }}
              {...defaultShock.bind}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              type="number"
              className="adminPanelNumberInput"
              id="default-light"
              name="default-light"
              label={t('orgSettings.defaultLight')}
              autoComplete="default-light"
              InputProps={{
                startAdornment: <InputAdornment position="start"><LightIcon /></InputAdornment>,
                endAdornment: <InputAdornment position="start">lumens</InputAdornment>,
              }}
              {...defaultLight.bind}
            />
          </Grid>
        </Grid>

        {/* Transmission Settings */}
        <Grid container spacing={isDesktop2() ? 2 : 0}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              select
              placeholder={t('orgSettings.select')}
              id="default-pre-transit-transmission-interval"
              name="default-pre-transit-transmission-interval"
              label={t('orgSettings.defaultPreTransitTransmissionInterval')}
              autoComplete="default-pre-transit-transmission-interval"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ displayEmpty: true }}
              value={defaultPreTransitTransmissionInterval.value}
              onChange={(e) => {
                defaultPreTransitTransmissionInterval.setValue(e.target.value);
                defaultPreTransitMeasurementInterval.setValue(e.target.value);
              }}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {!_.isEmpty(TIVE_GATEWAY_TIMES)
                && _.map(TIVE_GATEWAY_TIMES, (time, index) => (
                  <MenuItem key={`${time.value}-${index}`} value={time.value}>
                    {time.label}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              select
              placeholder={t('orgSettings.select')}
              id="default-pre-transit-measurement-interval"
              name="default-pre-transit-measurement-interval"
              label={t('orgSettings.defaultPreTransitMeasurementInterval')}
              autoComplete="default-pre-transit-measurement-interval"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ displayEmpty: true }}
              {...defaultPreTransitMeasurementInterval.bind}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {!_.isEmpty(TIVE_GATEWAY_TIMES) && _.map(
                _.filter(TIVE_GATEWAY_TIMES, (tive) => tive.value <= defaultPreTransitTransmissionInterval.value),
                (time, index) => (
                  <MenuItem key={`${time.value}-${index}`} value={time.value}>
                    {time.label}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Grid>
        </Grid>

        <Grid container spacing={isDesktop2() ? 2 : 0}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              select
              placeholder={t('orgSettings.select')}
              id="default-transit-transmission-interval"
              name="default-transit-transmission-interval"
              label={t('orgSettings.defaultTransitTransmissionInterval')}
              autoComplete="default-transit-transmission-interval"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ displayEmpty: true }}
              value={defaultTransitTransmissionInterval.value}
              onChange={(e) => {
                defaultTransitTransmissionInterval.setValue(e.target.value);
                defaultTransitMeasurementInterval.setValue(e.target.value);
              }}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {!_.isEmpty(TIVE_GATEWAY_TIMES)
                && _.map(TIVE_GATEWAY_TIMES, (time, index) => (
                  <MenuItem key={`${time.value}-${index}`} value={time.value}>
                    {time.label}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              select
              placeholder={t('orgSettings.select')}
              id="default-transit-measurement-interval"
              name="default-transit-measurement-interval"
              label={t('orgSettings.defaultTransitMeasurementInterval')}
              autoComplete="default-transit-measurement-interval"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ displayEmpty: true }}
              {...defaultTransitMeasurementInterval.bind}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {!_.isEmpty(TIVE_GATEWAY_TIMES) && _.map(
                _.filter(TIVE_GATEWAY_TIMES, (tive) => tive.value <= defaultTransitTransmissionInterval.value),
                (time, index) => (
                  <MenuItem key={`${time.value}-${index}`} value={time.value}>
                    {time.label}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Grid>
        </Grid>

        <Grid container spacing={isDesktop2() ? 2 : 0}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              select
              placeholder={t('orgSettings.select')}
              id="default-post-transit-transmission-interval"
              name="default-post-transit-transmission-interval"
              label={t('orgSettings.defaultPostTransitTransmissionInterval')}
              autoComplete="default-post-transit-transmission-interval"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ displayEmpty: true }}
              value={defaultPostTransitTransmissionInterval.value}
              onChange={(e) => {
                defaultPostTransitTransmissionInterval.setValue(e.target.value);
                defaultPostTransitMeasurementInterval.setValue(e.target.value);
              }}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {!_.isEmpty(TIVE_GATEWAY_TIMES)
                && _.map(TIVE_GATEWAY_TIMES, (time, index) => (
                  <MenuItem key={`${time.value}-${index}`} value={time.value}>
                    {time.label}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              select
              placeholder={t('orgSettings.select')}
              id="default-post-transit-measurement-interval"
              name="default-post-transit-measurement-interval"
              label={t('orgSettings.defaultPostTransitMeasurementInterval')}
              autoComplete="default-post-transit-measurement-interval"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ displayEmpty: true }}
              {...defaultPostTransitMeasurementInterval.bind}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {!_.isEmpty(TIVE_GATEWAY_TIMES) && _.map(
                _.filter(TIVE_GATEWAY_TIMES, (tive) => tive.value <= defaultPostTransitTransmissionInterval.value),
                (time, index) => (
                  <MenuItem key={`${time.value}-${index}`} value={time.value}>
                    {time.label}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Grid>
        </Grid>

        {/* Regional Settings */}
        <Grid container spacing={isDesktop2() ? 2 : 0}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              select
              id="country"
              name="country"
              label={t('orgSettings.defaultCountry')}
              autoComplete="country"
              value={country.value}
              onChange={(e) => {
                const curr = _.find(currenciesData, {
                  country: _.find(countriesData, { country: e.target.value })
                    ? _.find(countriesData, { country: e.target.value }).iso3
                    : '',
                });
                currency.setValue(curr ? curr.currency : '');
                country.setValue(e.target.value);
              }}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {countryList && _.map(countryList, (cntry, index) => (
                <MenuItem
                  key={`country-${index}-${cntry}`}
                  value={cntry}
                >
                  {cntry}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              select
              id="currency"
              name="currency"
              label={t('orgSettings.defaultCurrency')}
              autoComplete="currency"
              {...currency.bind}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {currencyList && _.map(currencyList, (curr, index) => (
                <MenuItem
                  key={`currency-${index}-${curr}`}
                  value={curr}
                >
                  {curr}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Date/Time Format Settings */}
        <Grid container spacing={isDesktop2() ? 2 : 0}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              select
              id="date-format"
              name="date-format"
              label={t('orgSettings.defaultDateFormat')}
              autoComplete="date-format"
              {...dateFormat.bind}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {_.map(DATE_DISPLAY_CHOICES, (date, index) => (
                <MenuItem
                  key={`date-${index}-${date.label}`}
                  value={date.value}
                >
                  {date.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              select
              id="time-format"
              name="time-format"
              label={t('orgSettings.defaultTimeFormat')}
              autoComplete="time-format"
              {...timeFormat.bind}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {_.map(TIME_DISPLAY_CHOICES, (time, index) => (
                <MenuItem
                  key={`time-${index}-${time.label}`}
                  value={time.value}
                >
                  {time.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Unit Settings */}
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            select
            id="distance"
            name="distance"
            label={t('orgSettings.defaultDistance')}
            autoComplete="distance"
            {...distance.bind}
          >
            <MenuItem value="">{t('common.select')}</MenuItem>
            {_.map(UOM_DISTANCE_CHOICES, (dist, index) => (
              <MenuItem
                key={`distance-${index}-${dist}`}
                value={dist}
              >
                {dist}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            select
            id="temp"
            name="temp"
            label={t('orgSettings.defaultTemperature')}
            autoComplete="temp"
            {...temp.bind}
          >
            <MenuItem value="">{t('common.select')}</MenuItem>
            {_.map(UOM_TEMPERATURE_CHOICES, (tmp, index) => (
              <MenuItem
                key={`temperature-${index}-${tmp}`}
                value={tmp}
              >
                {tmp}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            select
            id="weight"
            name="weight"
            label={t('orgSettings.defaultWeight')}
            autoComplete="weight"
            {...weight.bind}
          >
            <MenuItem value="">{t('common.select')}</MenuItem>
            {_.map(UOM_WEIGHT_CHOICES, (wgt, index) => (
              <MenuItem
                key={`weight-${index}-${wgt}`}
                value={wgt}
              >
                {wgt}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Timezone Settings */}
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            select
            id="timezone"
            name="timezone"
            label={t('orgSettings.defaultTimezone')}
            autoComplete="timezone"
            value={timezone.value}
            onChange={(e) => {
              timezone.setValue(e.target.value);
            }}
          >
            {_.map(tzOptions, (tzOption, index) => (
              <MenuItem key={`${tzOption.value}-${index}`} value={tzOption.value}>
                {tzOption.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Language Settings */}
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            select
            id="language"
            name="language"
            label={t('orgSettings.defaultLanguage')}
            autoComplete="language"
            value={language.value}
            onChange={(e) => {
              language.setValue(e.target.value);
            }}
          >
            {_.map(LANGUAGES, (item, index) => (
              <MenuItem key={`${item.value}-${index}`} value={item.label}>
                {t(`languages.${item.label}`)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Form Actions */}
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={6} sm={4}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className="adminPanelSubmit"
              disabled={isLoadingOrganizationTypes
                || isLoadingCountries
                || isLoadingCurrencies
                || isLoadingUnits
                || isUpdatingOrganization
                || isEditingUnit
                || !submitDisabled()}
            >
              {t('orgSettings.save')}
            </Button>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => resetValues()}
              className="adminPanelSubmit"
            >
              {t('orgSettings.reset')}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Grid>
  );
};

export default OrganizationSettings;
