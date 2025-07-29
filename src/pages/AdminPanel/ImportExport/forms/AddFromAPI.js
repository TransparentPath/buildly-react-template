/**
 * @file AddFromAPI.jsx
 * @description Component for configuring API integrations to import external data.
 * Supports mapping external API data to internal data structures for items, products,
 * and gateways. Includes validation, preview, and external provider detection.
 */

import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
} from '@mui/material';
import Loader from '@components/Loader/Loader';
import ConfirmModal from '@components/Modal/ConfirmModal';
import CustomizedTooltips from '@components/ToolTip/ToolTip';
import { getUser } from '@context/User.context';
import { useInput } from '@hooks/useInput';
import { validators } from '@utils/validators';
import { isDesktop2 } from '@utils/mediaQuery';
import { useQuery } from 'react-query';
import { getItemOptionQuery } from '@react-query/queries/options/getItemOptionQuery';
import { getGatewayOptionQuery } from '@react-query/queries/options/getGatewayOptionQuery';
import { getProductOptionQuery } from '@react-query/queries/options/getProductOptionQuery';
import { getApiResponseQuery } from '@react-query/queries/importExport/getApiResponseQuery';
import { useAddApiSetupMutation } from '@react-query/mutations/importExport/addApiSetupMutation';
import useAlert from '@hooks/useAlert';
import '../../AdminPanelStyles.css';

/**
 * AddFromAPI Component
 *
 * Provides an interface for configuring external API integrations with features:
 * - API endpoint configuration
 * - Authentication setup (API key in header or query param)
 * - Data mapping between external and internal schemas
 * - Support for multiple data types (items, products, gateways)
 * - External provider detection (e.g., Tive integration)
 * - Preview of API response data
 * - Field validation and error handling
 */
const AddFromAPI = () => {
  /**
   * Current user's organization UUID for API requests
   * @type {string}
   */
  const organization = getUser().organization.organization_uuid;

  /**
   * Alert hook for displaying notifications
   */
  const { displayAlert } = useAlert();

  /**
   * State Management
   * @type {Object} Column definitions and mappings
   */
  const [tableColumns, setTableColumns] = useState({});
  const [mapColumns, setMapColumns] = useState({});
  const [apiColumns, setAPIColumns] = useState({});

  /**
   * Form Input States
   * Using custom useInput hook for form field management
   */
  const apiURL = useInput('', { required: true });
  const keyParamName = useInput('', { required: true });
  const keyParamPlace = useInput('', { required: true });
  const apiKey = useInput('', { required: true });
  const apiResponseData = useInput('');
  const dataFor = useInput('', { required: true });

  /**
   * UI State Management
   */
  const [formError, setFormError] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [finalUrl, setFinalUrl] = useState('');
  const [reqHeader, setReqHeader] = useState('');

  /**
   * External Provider Configuration
   * @type {Object} Provider settings including name and supported data types
   */
  const [provider, setProvider] = useState({
    name: null,
    dataTypes: [],
    apiResponseData: '',
  });

  /**
   * Data Fetching
   * Queries for available options and configurations
   */
  const { data: itemOptionData, isLoading: isLoadingItemOptions } = useQuery(
    ['itemOptions'],
    () => getItemOptionQuery(displayAlert, 'Import export'),
    { refetchOnWindowFocus: false },
  );

  const { data: gatewayOptionData, isLoading: isLoadingGatewayOptions } = useQuery(
    ['gatewayOptions'],
    () => getGatewayOptionQuery(displayAlert, 'Import export'),
    { refetchOnWindowFocus: false },
  );

  const { data: productOptionData, isLoading: isLoadingProductOptions } = useQuery(
    ['productOptions'],
    () => getProductOptionQuery(displayAlert, 'Import export'),
    { refetchOnWindowFocus: false },
  );

  /**
   * API Response Query
   * Fetches sample data from configured endpoint
   */
  const { data: apiResponse, isLoading: isLoadingApiResponse } = useQuery(
    ['apiResponse'],
    () => getApiResponseQuery(finalUrl, reqHeader, displayAlert, 'Import export'),
    {
      enabled: !!(!provider.name && finalUrl && reqHeader),
      refetchOnWindowFocus: false,
    },
  );

  /**
   * Available data types for import
   * Maps internal data types to their configurations and external providers
   */
  const dataTypes = [
    {
      name: 'Items',
      value: 'item',
      option: itemOptionData,
      externalProvider: [],
    },
    {
      name: 'Products',
      value: 'product',
      option: productOptionData,
      externalProvider: [],
    },
    {
      name: 'Gateways',
      value: 'gateway',
      option: gatewayOptionData,
      externalProvider: ['Tive'],
    },
  ];

  /**
   * Updates dataTypes with latest option data
   */
  useEffect(() => {
    dataTypes[0].option = itemOptionData;
    dataTypes[1].option = productOptionData;
    dataTypes[2].option = gatewayOptionData;
  }, [itemOptionData, gatewayOptionData, productOptionData]);

  /**
   * Mutation for saving API configuration
   */
  const { mutate: addApiSetupMutation, isLoading: isAddingApiSetup } = useAddApiSetupMutation(displayAlert, 'Import export');

  /**
   * Handles form submission
   * Creates API configuration with mapped fields
   *
   * @param {Event} event Form submission event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const mapping = {};
    if (provider.name) {
      if (provider.name === 'Tive' && dataFor.value === 'gateway') {
        _.forEach(mapColumns, (col, key) => {
          mapping[key] = '';
        });
        mapping.name = 'name';
        mapping.imei_number = 'id';
      }
    } else {
      _.forEach(mapColumns, (col, key) => {
        mapping[key] = col.value;
      });
    }

    if ('organization_uuid' in mapping) {
      mapping.organization_uuid = organization;
    }

    const data = {
      url: apiURL.value,
      key_name: keyParamName.value,
      key_placement: keyParamPlace.value,
      key_value: apiKey.value,
      values_to_pick_response_from: apiResponseData.value ? apiResponseData.value : provider.apiResponseData,
      table_name: dataFor.value,
      mapping,
      platform_name: provider.name ? provider.name : 'Default',
    };

    addApiSetupMutation(data);
  };

  /**
   * Validates form fields and handles API configuration preview
   *
   * @param {Event} e Blur event
   * @param {String} validation Validation type
   * @param {Object} input Input field reference
   * @param {string} parentId Parent element ID
   */
  const handleBlur = (e, validation, input, parentId = '') => {
    // Field validation
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

    // Data type selection handling
    if (parentId === 'dataFor') {
      const table = _.find(dataTypes, { value: input.value });
      const cols = table.option.actions.POST;
      let mapCols = {};
      _.forEach(cols, (col, key) => {
        mapCols = {
          ...mapCols,
          [key]: {
            label: col.label,
            name: key,
            value: '',
            required: col.required,
          },
        };
      });

      if (_.isEmpty(apiColumns) && !provider.name) {
        setAPIColumns(apiResponse[0]);
      }

      setTableColumns(cols);
      setMapColumns(mapCols);
    }

    // API configuration preview
    if (
      apiURL.value
      && keyParamName.value
      && keyParamPlace.value
      && apiKey.value
    ) {
      const url = _.endsWith(apiURL.value, '/')
        ? apiURL.value
        : `${apiURL.value}/`;

      // External provider detection
      if (_.includes(url, 'tive.co')) {
        const providerDataType = _.filter(
          dataTypes,
          (item) => _.includes(item.externalProvider, 'Tive'),
        );
        setProvider({
          name: 'Tive',
          dataTypes: providerDataType,
          apiResponseData: 'result',
        });
      } else {
        setProvider({
          name: null,
          dataTypes: [],
          apiResponseData: '',
        });
      }

      // Preview modal content
      const queryUrl = (
        <>
          <Typography variant="body1">
            Is the below URL correct?
          </Typography>
          <Typography variant="body1" style={{ marginTop: '8px' }}>
            <strong>
              <em>
                {`'${url}?${keyParamName.value}=${apiKey.value}'`}
              </em>
            </strong>
          </Typography>
        </>
      );
      const headerUrl = (
        <>
          <Typography variant="body1">
            Is the below URL and Header correct?
          </Typography>
          <Typography variant="body1" style={{ marginTop: '8px' }}>
            <em>
              <strong>URL:  </strong>
              {`'${url}'`}
            </em>
          </Typography>
          <Typography variant="body1">
            <em>
              <strong>Header:  </strong>
              {`${keyParamName.value}='${apiKey.value}'`}
            </em>
          </Typography>
        </>
      );

      // Set final URL and headers
      const final = keyParamPlace.value === 'queryParam'
        ? {
          url: `${url}?${keyParamName.value}=${apiKey.value}`,
          title: queryUrl,
          header: '',
        }
        : {
          url,
          title: headerUrl,
          header: `${keyParamName.value}: ${apiKey.value}`,
        };

      if (
        (finalUrl !== final.url)
        || (reqHeader !== final.header)
      ) {
        setFinalUrl(final.url);
        setReqHeader(final.header);
        setModalTitle(final.title);
        setOpenModal(true);
      }
    }

    // API response data handling
    if (e.target.id === 'apiResponseData' && input.value) {
      const cols = apiResponse[input.value][0];

      if (_.isEmpty(apiColumns) || (apiColumns !== cols)) {
        setAPIColumns(cols);
      }
    }
  };

  /**
   * Validates form state for submission
   * @returns {boolean} True if form should be disabled
   */
  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    let check = (
      !apiURL.value
      || !keyParamName.value
      || !keyParamPlace.value
      || !apiKey.value
      || !dataFor.value
    );
    _.forEach(mapColumns, (col, index) => {
      if (col.required) {
        check = check || !mapColumns[index].value;
      }
    });

    if (check) {
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
   * Handles confirmation modal closure
   */
  const handleConfirmModal = () => {
    setOpenModal(false);
  };

  /**
   * Handles column mapping changes
   * Validates for duplicate mappings
   *
   * @param {Event} e Change event
   * @param {string} key Column key
   */
  const handleMapColumn = (e, key) => {
    const present = _.find(mapColumns, { value: e.target.value });

    if (present) {
      setMapColumns({
        ...mapColumns,
        [key]: { ...mapColumns[key], value: '' },
      });
      setFormError({
        ...formError,
        [key]: {
          error: true,
          message: `${_.startCase(e.target.value)} is already mapped to ${present.label}`,
        },
      });
    } else {
      setMapColumns({
        ...mapColumns,
        [key]: { ...mapColumns[key], value: e.target.value },
      });
      setFormError({
        ...formError,
        [key]: {
          error: false,
          message: '',
        },
      });
    }
  };

  return (
    <div>
      {/* Loading indicator */}
      {(isLoadingItemOptions
        || isLoadingProductOptions
        || isLoadingGatewayOptions
        || isLoadingApiResponse
        || isAddingApiSetup)
        && (
          <Loader open={isLoadingItemOptions
            || isLoadingProductOptions
            || isLoadingGatewayOptions
            || isLoadingApiResponse
            || isAddingApiSetup}
          />
        )}
      <form
        className="adminPanelFormRoot"
        noValidate
        onSubmit={handleSubmit}
      >
        <Grid container spacing={isDesktop2() ? 2 : 0}>
          {/* API Configuration Section */}
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              required
              id="apiURL"
              label="API Url to get data"
              name="apiURL"
              error={formError.apiURL && formError.apiURL.error}
              helperText={
                formError.apiURL ? formError.apiURL.message : ''
              }
              onBlur={(e) => handleBlur(e, 'required', apiURL)}
              {...apiURL.bind}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              required
              id="keyParamName"
              label="API Key Param Name"
              name="keyParamName"
              error={
                formError.keyParamName
                && formError.keyParamName.error
              }
              helperText={
                formError.keyParamName
                  ? formError.keyParamName.message
                  : ''
              }
              onBlur={(e) => handleBlur(e, 'required', keyParamName)}
              {...keyParamName.bind}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              required
              id="keyParamPlace"
              label="API Key Param Placement"
              select
              error={
                formError.keyParamPlace
                && formError.keyParamPlace.error
              }
              helperText={
                formError.keyParamPlace
                  ? formError.keyParamPlace.message
                  : ''
              }
              onBlur={(e) => handleBlur(e, 'required', keyParamPlace, 'keyParamPlace')}
              {...keyParamPlace.bind}
            >
              <MenuItem value="">--------</MenuItem>
              <MenuItem value="queryParam">Query Parameter</MenuItem>
              <MenuItem value="header">Header</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              required
              id="apiKey"
              label="API Key Value"
              name="apiKey"
              error={formError.apiKey && formError.apiKey.error}
              helperText={
                formError.apiKey ? formError.apiKey.message : ''
              }
              onBlur={(e) => handleBlur(e, 'required', apiKey)}
              {...apiKey.bind}
            />
          </Grid>

          {/* External Provider Section */}
          {provider.name
            && (
              <Grid item xs={12}>
                <Typography variant="body1">
                  External Provider :
                  {' '}
                  {provider.name}
                </Typography>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    required
                    id="dataFor"
                    label="Import Provider Data For"
                    select
                    error={formError.dataFor && formError.dataFor.error}
                    helperText={
                      formError.dataFor ? formError.dataFor.message : ''
                    }
                    onBlur={(e) => handleBlur(e, 'required', dataFor, 'dataFor')}
                    {...dataFor.bind}
                  >
                    <MenuItem value="">--------</MenuItem>
                    {_.map(
                      provider.dataTypes,
                      (type, index) => (
                        <MenuItem
                          key={index}
                          value={type.value}
                        >
                          {type.name}
                        </MenuItem>
                      ),
                    )}
                  </TextField>
                </Grid>
              </Grid>
            )}

          {/* API Response Preview Section */}
          {apiResponse
            && (
              <Grid item xs={12}>
                <Typography variant="h6">API Response</Typography>
                <pre className="adminPanelApiResponse">
                  {JSON.stringify(apiResponse)}
                </pre>
              </Grid>
            )}
          {apiResponse
            && (
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  id="apiResponseData"
                  label="Pick only this from response (Optional)"
                  name="apiResponseData"
                  error={
                    formError.apiResponseData
                    && formError.apiResponseData.error
                  }
                  helperText={
                    formError.apiResponseData
                      ? formError.apiResponseData.message
                      : ''
                  }
                  onBlur={(e) => handleBlur(e, '', apiResponseData)}
                  {...apiResponseData.bind}
                />
              </Grid>
            )}
          {apiResponse
            && (
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  id="dataFor"
                  label="Import Data For"
                  select
                  error={formError.dataFor && formError.dataFor.error}
                  helperText={
                    formError.dataFor ? formError.dataFor.message : ''
                  }
                  onBlur={(e) => handleBlur(e, 'required', dataFor, 'dataFor')}
                  {...dataFor.bind}
                >
                  <MenuItem value="">--------</MenuItem>
                  {_.map(dataTypes, (type, index) => (
                    <MenuItem key={index} value={type.value}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

          {/* Column Mapping Section */}
          {!_.isEmpty(tableColumns)
            && !_.isEmpty(mapColumns)
            && !_.isEmpty(apiColumns)
            && (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    className="adminPanelTitle"
                    variant="h6"
                  >
                    Our Columns
                  </Typography>
                  {_.map(tableColumns, (column, key) => (
                    <div key={key} className="adminPanelTableColumn">
                      <Typography variant="body1">
                        {column.label}
                      </Typography>
                      {column.help_text
                        && (
                          <CustomizedTooltips
                            toolTipText={column.help_text}
                          />
                        )}
                    </div>
                  ))}
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    className="adminPanelTitle"
                    variant="h6"
                  >
                    Mapping (From API Response)
                  </Typography>
                  {_.map(mapColumns, (col, key) => (
                    <TextField
                      key={key}
                      className="adminPanelMapCol"
                      variant="outlined"
                      fullWidth
                      required={col.required}
                      id={col.name}
                      label={col.label}
                      select
                      value={col.value}
                      onChange={(e) => handleMapColumn(e, key)}
                      error={formError[key] && formError[key].error}
                      helperText={
                        formError[key] ? formError[key].message : ''
                      }
                    >
                      <MenuItem value="">--------</MenuItem>
                      {_.map(apiColumns, (column, keyVal) => (
                        <MenuItem key={keyVal} value={keyVal}>
                          <div className="adminPanelApiMenuItem">
                            {_.startCase(keyVal)}
                          </div>
                        </MenuItem>
                      ))}
                    </TextField>
                  ))}
                </Grid>
              </Grid>
            )}

          {/* Form Actions */}
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={7} sm={6} md={4}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className="adminPanelSubmit"
                disabled={isLoadingItemOptions || isLoadingProductOptions || isLoadingGatewayOptions || isLoadingApiResponse || isAddingApiSetup || submitDisabled()}
              >
                Set Mapping and Import
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={openModal}
        setOpen={setOpenModal}
        submitAction={handleConfirmModal}
        title={modalTitle}
        submitText="Correct"
      />
    </div>
  );
};

export default AddFromAPI;
