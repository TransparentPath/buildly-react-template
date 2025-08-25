import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import {
  Grid,
  Button,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material';
import { CloudSync as CloudSyncIcon } from '@mui/icons-material';
import { useInput } from '@hooks/useInput';
import { GATEWAY_ACTIONS } from '@utils/mock';
import FormModal from '@components/Modal/FormModal';
import Loader from '@components/Loader/Loader';
import { validators } from '@utils/validators';
import { isDesktop } from '@utils/mediaQuery';
import { GATEWAY_STATUS, getCustodianFormattedRow } from '@utils/constants';
import { useTranslation } from 'react-i18next';

const GatewayActions = ({
  selectedRows, // Rows selected from a data grid
  custodianData, // List of available custodians
  contactInfo, // Contact information linked to custodians
  editGatewayMutation, // React Query mutation hook to update gateway data
  isEditingGateway, // Boolean flag for tracking mutation status
}) => {
  // Input hook for action selection and status change
  const gateway_action = useInput('');
  const change_status = useInput('', { required: true });

  const { t } = useTranslation();

  // Local state to manage modal behavior and form values
  const [assignShipper, setAssignShipper] = useState('');
  const [custodianList, setCustodianList] = useState([]);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const [showGatewayAction, setShowGatewayAction] = useState(false);
  const [formError, setFormError] = useState({});

  // Format custodian data when input props change
  useEffect(() => {
    if (!_.isEmpty(custodianData) && contactInfo) {
      setCustodianList(getCustodianFormattedRow(
        custodianData,
        contactInfo,
      ));
    }
  }, [custodianData, contactInfo]);

  // Close the modal, showing a confirmation if form data has changed
  const closeFormModal = () => {
    const dataHasChanged = (
      change_status.hasChanged()
      || !_.isEmpty(assignShipper)
    );
    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setShowGatewayAction(false);
    }
  };

  // Reset all form data and close confirmation modal
  const discardFormData = () => {
    gateway_action.reset();
    change_status.reset();
    setAssignShipper('');
    setFormError({});
    setConfirmModal(false);
    setShowGatewayAction(false);
  };

  // Handle submission based on selected action
  const handleSubmit = (event) => {
    event.preventDefault();
    if (_.isEqual(gateway_action.value, 'Change Status')) {
      const updatedRows = selectedRows.map((row) => ({
        ...row,
        gateway_status: change_status.value,
      }));
      editGatewayMutation(updatedRows);
    } else if (_.isEqual(gateway_action.value, 'Assign Shipper')) {
      const updatedRows = selectedRows.map((row) => ({
        ...row,
        custodian_uuid: assignShipper,
      }));
      editGatewayMutation(updatedRows);
    } else if (_.isEqual(gateway_action.value, 'Remove Tracker')) {
      const updatedRows = selectedRows.map((row) => ({
        ...row,
        organization_uuid: null,
        custodian_uuid: null,
        is_new: false,
      }));
      editGatewayMutation(updatedRows);
    }
  };

  // When editing is done, reset the form
  useEffect(() => {
    if (!isEditingGateway) {
      discardFormData();
    }
  }, [isEditingGateway]);

  // Validate form fields on blur
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

  // Determine if form submission should be disabled
  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!_.isEmpty(selectedRows)) {
      if (_.isEqual(gateway_action.value, 'Change Status')) {
        if (!change_status.value) {
          return true;
        }
      }
      if (_.isEqual(gateway_action.value, 'Assign Shipper')) {
        if (_.isEmpty(assignShipper)) {
          return true;
        }
      }
    } else {
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

  // Update assign shipper state based on dropdown selection
  const onInputChange = (e) => {
    const { value } = e.target;
    if (value) {
      setAssignShipper(value);
      if (custodianList.length > 0) {
        let selectedCustodian = '';
        _.forEach(custodianList, (list) => {
          if (list.uuid === value) {
            selectedCustodian = list;
          }
        });
      }
    } else {
      setAssignShipper(value);
    }
  };

  return (
    <>
      {/* Gateway Action Dropdown with OK Button */}
      <Grid item xs={12} sm={6} className="gatewayHeaderActionContainer">
        <TextField
          className={_.isEmpty(gateway_action.value) ? 'gatewayActions' : 'gatewayActionsValue'}
          variant="outlined"
          id="gateway_actions"
          select
          label={t('gatewayActions.actions')}
          {...gateway_action.bind}
        >
          <MenuItem value="">{t('common.select')}</MenuItem>
          {_.map(GATEWAY_ACTIONS, (item, index) => {
            if (_.isEqual(_.size(selectedRows), 1) && !_.isEqual(item.value, 'Remove Tracker')) {
              return null;
            }
            return (
              <MenuItem
                key={`gatewayAction${index}:${item.id}`}
                value={item.value}
              >
                {t(`gatewayActions.${item.label}`)}
              </MenuItem>
            );
          })}
        </TextField>
        <Button
          type="button"
          variant="contained"
          color="primary"
          style={{ marginLeft: '20px' }}
          disabled={!!_.isEmpty(gateway_action.value)}
          onClick={() => setShowGatewayAction(true)}
        >
          {t('common.ok')}
        </Button>
      </Grid>

      {/* Modal Form for Gateway Actions */}
      <FormModal
        open={showGatewayAction}
        handleClose={closeFormModal}
        title={t('gatewayActions.trackerAction')}
        openConfirmModal={openConfirmModal}
        setConfirmModal={setConfirmModal}
        handleConfirmModal={discardFormData}
      >
        {isEditingGateway && <Loader open={isEditingGateway} />}
        <form className="gatewayFormContainer" noValidate onSubmit={handleSubmit}>
          <Grid container spacing={isDesktop() ? 2 : 0}>
            {/* Disabled field showing selected tracker names */}
            <Grid className="gatewayInputWithTooltip" item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="selectedTrackers"
                label={t('gatewayActions.selectedTrackers')}
                disabled
                multiline
                value={selectedRows.map((tracker) => tracker.name).join('\n')}
                error={formError.selectedTrackers && formError.selectedTrackers.error}
                helperText={formError.selectedTrackers ? formError.selectedTrackers.message : ''}
                onBlur={(e) => handleBlur(e, 'required', { value: selectedRows, required: true })}
              />
            </Grid>

            {/* Conditionally render form fields based on selected action */}
            {_.isEqual(gateway_action.value, 'Change Status') && (
              <Grid className="gatewayInputWithTooltip" item xs={12} md={6} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  id="changeStatus"
                  select
                  label={t('gatewayActions.changeStatus')}
                  error={formError.changeStatus && formError.changeStatus.error}
                  helperText={formError.changeStatus ? formError.changeStatus.message : ''}
                  onBlur={(e) => handleBlur(e, 'required', change_status, 'changeStatus')}
                  {...change_status.bind}
                >
                  <MenuItem value="">{t('common.select')}</MenuItem>
                  {GATEWAY_STATUS
                    && _.map(
                      GATEWAY_STATUS,
                      (item, index) => (
                        <MenuItem
                          key={`gatewayStatus${index}:${item.value}`}
                          value={item.value}
                        >
                          {t(`gatewayActions.${item.name}`)}
                        </MenuItem>
                      ),
                    )}
                </TextField>
              </Grid>
            )}

            {_.isEqual(gateway_action.value, 'Assign Shipper') && (
              <Grid className="gatewayInputWithTooltip" item xs={12} md={6} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  id="assignShipper"
                  select
                  label={t('gatewayActions.assignShipper')}
                  error={formError.assignShipper && formError.assignShipper.error}
                  helperText={formError.assignShipper ? formError.assignShipper.message : ''}
                  onBlur={(e) => handleBlur(e, 'required', assignShipper, 'assignShipper')}
                  value={assignShipper}
                  onChange={onInputChange}
                >
                  <MenuItem value="">{t('common.select')}</MenuItem>
                  {custodianList
                    && _.map(
                      _.orderBy(
                        _.filter(custodianList, ['custodian_type', `${window.env.CUSTODIAN_URL}custodian_type/1/`]),
                        ['name'],
                        ['asc'],
                      ),
                      (item, index) => (
                        <MenuItem
                          key={`custodian${index}:${item.id}`}
                          value={item.custodian_uuid}
                        >
                          {item.name}
                        </MenuItem>
                      ),
                    )}
                </TextField>
              </Grid>
            )}

            {_.isEqual(gateway_action.value, 'Remove Tracker') && (
              <Typography ml={2}>
                {t('gatewayActions.removeConfirm')}
              </Typography>
            )}
          </Grid>

          {/* Save and Cancel buttons */}
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className="gatewaySubmit"
                disabled={isEditingGateway || submitDisabled()}
              >
                {t('gatewayActions.save')}
              </Button>
            </Grid>
            <Grid item xs={12} sm={4} className="gatewaySubmit2">
              <Button
                type="button"
                fullWidth
                variant="outlined"
                color="primary"
                onClick={discardFormData}
                className="gatewaySubmit"
              >
                {t('common.cancel')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </FormModal>
    </>
  );
};

export default GatewayActions;
