import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { useTimezoneSelect, allTimezones } from 'react-timezone-select';
import FormModal from '@components/Modal/FormModal';
import {
  Button, Grid, MenuItem, TextField,
} from '@mui/material';
import { isDesktop } from '@utils/mediaQuery';
import { validators } from '@utils/validators';
import {
  DATE_DISPLAY_CHOICES,
  TIME_DISPLAY_CHOICES,
  UOM_DISTANCE_CHOICES,
  UOM_TEMPERATURE_CHOICES,
  UOM_WEIGHT_CHOICES,
} from '@utils/mock';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import '../UserManagementStyles.css';
import { getCoreuserQuery } from '@react-query/queries/coreuser/getCoreuserQuery';
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery';
import { getCountriesQuery } from '@react-query/queries/shipments/getCountriesQuery';
import { getCurrenciesQuery } from '@react-query/queries/shipments/getCurrenciesQuery';

const AddOrganization = ({ open, setOpen }) => {
  const { displayAlert } = useAlert();

  const [openConfirmModal, setConfirmModal] = useState(false);
  const [emailData, setEmailData] = useState([]);
  const [orgData, setOrgData] = useState([]);
  const [orgAbbData, setOrgAbbData] = useState([]);
  const [adminEmails, setAdminEmails] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);
  const [formError, setFormError] = useState({});

  const organization_name = useInput('', { required: true });
  const organization_abbrevation = useInput('', { required: true });
  const country = useInput('United States', { required: true });
  const currency = useInput('USD', { required: true });
  const dateFormat = useInput('MMM DD, YYYY', { required: true });
  const timeFormat = useInput('hh:mm:ss A', { required: true });
  const distance = useInput('Miles', { required: true });
  const temp = useInput('Fahrenheit', { required: true });
  const weight = useInput('Pounds', { required: true });
  const timezone = useInput('America/Los_Angeles', { required: true });

  const { options: tzOptions } = useTimezoneSelect({ labelStyle: 'original', timezones: allTimezones });

  const { data: coreuserData } = useQuery(
    ['users'],
    () => getCoreuserQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  const { data: organizations } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  const { data: countriesData } = useQuery(
    ['countries'],
    () => getCountriesQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  const { data: currenciesData } = useQuery(
    ['currencies'],
    () => getCurrenciesQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  useEffect(() => {
    if (coreuserData) {
      const edata = coreuserData.map((item) => item.email);
      setEmailData(edata);
    }
  }, [coreuserData]);

  useEffect(() => {
    if (organizations) {
      const odata = organizations.map((item) => item.name);
      const oadata = organizations.map((item) => item.name.replace(/[^A-Z0-9]/g, ''));
      setOrgData(odata);
      setOrgAbbData(oadata);
    }
  }, [organizations]);

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

  const discardFormData = () => {
    setAdminEmails([]);
    organization_name.clear();
    organization_abbrevation.clear();
    country.reset();
    currency.reset();
    dateFormat.reset();
    timeFormat.reset();
    distance.reset();
    temp.reset();
    weight.reset();
    timezone.reset();
    setFormError({});
    setConfirmModal(false);
    setOpen(false);
  };

  const closeFormModal = () => {
    const dataHasChanged = !_.isEmpty(adminEmails)
      || organization_name.hasChanged()
      || organization_abbrevation.hasChanged()
      || country.hasChanged()
      || currency.hasChanged()
      || dateFormat.hasChanged()
      || timeFormat.hasChanged()
      || distance.hasChanged()
      || temp.hasChanged()
      || weight.hasChanged()
      || timezone.hasChanged();
    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setOpen(false);
    }
  };

  const handleBlur = (e, validation, input, extras, extraData) => {
    let validateObj;
    if (extras) {
      validateObj = validators(validation, { value: input, required: true, extra: extraData });
    } else {
      validateObj = validators(validation, input);
    }
    const prevState = { ...formError };
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e.target.id]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [e.target.id]: {
          error: false,
          message: '',
        },
      });
    }
  };

  const handleInputChange = (e) => {
    const emails = e.target.value.split(',').map((email) => email.trim());
    setAdminEmails(emails);
  };

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (_.isEmpty(adminEmails) || !organization_name.value || !organization_abbrevation.value) {
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

  return (
    <div>
      <FormModal
        open={open}
        handleClose={closeFormModal}
        title="Add Organization"
        openConfirmModal={openConfirmModal}
        setConfirmModal={setConfirmModal}
        handleConfirmModal={discardFormData}
      >
        <form
          className="addOrganizationFormContainer"
          noValidate
        // onSubmit={handleSubmit}
        >
          <Grid container spacing={isDesktop() ? 2 : 0}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="admin_email"
                label="Administrator Emails"
                name="admin_email"
                autoComplete="admin_email"
                error={formError.admin_email && formError.admin_email.error}
                helperText={
                  formError.admin_email ? formError.admin_email.message : ''
                }
                onBlur={(e) => handleBlur(e, 'duplicateEmail', adminEmails, true, emailData)}
                onChange={handleInputChange}
                value={adminEmails.join(', ')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                required
                id="organization_name"
                label="Organization Name"
                error={formError.organization_name && formError.organization_name.error}
                helperText={
                  formError.organization_name ? formError.organization_name.message : ''
                }
                onBlur={(e) => handleBlur(e, 'duplicateOrgName', organization_name, true, orgData)}
                value={organization_name.value}
                onChange={(e) => {
                  organization_name.setValue(e.target.value);
                  organization_abbrevation.setValue(e.target.value.replace(/[^A-Z0-9]/g, ''));
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="organization_abbrevation"
                label="Organization Abbreviation"
                name="organization_abbrevation"
                autoComplete="organization_abbrevation"
                error={
                  formError.organization_abbrevation
                  && formError.organization_abbrevation.error
                }
                helperText={
                  formError.organization_abbrevation
                    ? formError.organization_abbrevation.message
                    : ''
                }
                inputProps={{
                  maxLength: 7,
                  style: { textTransform: 'uppercase' },
                }}
                onBlur={(e) => handleBlur(e, 'duplicateOrgAbb', organization_abbrevation, true, orgAbbData)}
                {...organization_abbrevation.bind}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                select
                id="country"
                name="country"
                label="Default Country"
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
                <MenuItem value="">Select</MenuItem>
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
                label="Default Currency"
                autoComplete="currency"
                {...currency.bind}
              >
                <MenuItem value="">Select</MenuItem>
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
            <Grid item xs={12} md={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                select
                id="date-format"
                name="date-format"
                label="Default Date Format"
                autoComplete="date-format"
                {...dateFormat.bind}
              >
                <MenuItem value="">Select</MenuItem>
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
                label="Default Time Format"
                autoComplete="time-format"
                {...timeFormat.bind}
              >
                <MenuItem value="">Select</MenuItem>
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
            <Grid item xs={12} md={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                select
                id="distance"
                name="distance"
                label="Default Unit of Measure for Distance"
                autoComplete="distance"
                {...distance.bind}
              >
                <MenuItem value="">Select</MenuItem>
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
            <Grid item xs={12} md={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                select
                id="temp"
                name="temp"
                label="Default Unit of Measure for Temperature"
                autoComplete="temp"
                {...temp.bind}
              >
                <MenuItem value="">Select</MenuItem>
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
            <Grid item xs={12} md={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                select
                id="weight"
                name="weight"
                label="Default Unit of Measure for Weight"
                autoComplete="weight"
                {...weight.bind}
              >
                <MenuItem value="">Select</MenuItem>
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
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                select
                id="timezone"
                name="timezone"
                label="Default Time Zone"
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
          </Grid>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className="addOrganizationSubmit"
                disabled={submitDisabled()}
              >
                Register & Send
              </Button>
            </Grid>
          </Grid>
        </form>
      </FormModal>
    </div>
  );
};

export default AddOrganization;
