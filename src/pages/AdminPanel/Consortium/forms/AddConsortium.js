import React, { useState } from 'react';
import _ from 'lodash';
import {
  Grid,
  Button,
  TextField,
  Chip,
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Loader from '@components/Loader/Loader'; // Loader component to show while submitting form
import FormModal from '@components/Modal/FormModal'; // Custom modal component for the form
import { useInput } from '@hooks/useInput'; // Custom hook for managing input fields
import { validators } from '@utils/validators'; // Validation utility
import { isDesktop } from '@utils/mediaQuery'; // Utility to check if the screen is desktop size
import { useAddConsortiumMutation } from '@react-query/mutations/consortium/addConsortiumMutation'; // React Query mutation for adding consortium
import { useEditConsortiumMutation } from '@react-query/mutations/consortium/editConsortiumMutation'; // React Query mutation for editing consortium
import useAlert from '@hooks/useAlert'; // Custom hook to display alert messages
import '../../AdminPanelStyles.css'; // Styles for the admin panel form

const AddConsortium = ({ history, location }) => {
  const { t } = useTranslation();

  // Controls visibility of the form modal
  const [openFormModal, setFormModal] = useState(true);
  // Controls visibility of confirmation modal when closing form with unsaved changes
  const [openConfirmModal, setConfirmModal] = useState(false);

  const { displayAlert } = useAlert();

  // Get organization list passed via route state
  const { orgData } = location.state || {};

  // Determine if form is in edit mode
  const editPage = location.state && location.state.type === 'edit';
  const editData = (editPage && location.state.data) || {};

  // Form input: consortium name, pre-filled if editing
  const name = useInput((editData && editData.name) || '', {
    required: true,
  });

  // State to track selected organizations, pre-filled if editing
  const [orgs, setOrgs] = useState((editData && editData.organization_uuids) || []);
  const [formError, setFormError] = useState({}); // Object to track validation errors

  const buttonText = editPage ? t('addConsortium.save') : t('addConsortium.addConsortium'); // Submit button label
  const formTitle = editPage ? t('addConsortium.editConsortium') : t('addConsortium.addConsortium'); // Modal title

  // Close the form modal and prompt confirmation if there are unsaved changes
  const closeFormModal = () => {
    if (name.hasChanged()) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      if (location && location.state) {
        history.push(location.state.from);
      }
    }
  };

  // Discard all changes and close the modal
  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(location.state.from);
    }
  };

  // Initialize add and edit mutations with success/error handlers
  const { mutate: addConsortiumMutation, isLoading: isAddingConsortium } = useAddConsortiumMutation(history, location.state.from, displayAlert, 'Consortium');
  const { mutate: editConsortiumMutation, isLoading: isEditingConsortium } = useEditConsortiumMutation(history, location.state.from, displayAlert, 'Consortium');

  /**
   * Handles the form submission, triggering either add or edit mutation
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const currentDateTime = new Date();

    let data = {
      ...editData,
      name: name.value,
      organization_uuids: orgs,
      edit_date: currentDateTime,
    };

    if (editPage) {
      editConsortiumMutation(data);
    } else {
      data = {
        ...data,
        create_date: currentDateTime,
      };
      addConsortiumMutation(data);
    }
  };

  /**
   * Validates input fields on blur using custom validators
   */
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
        [e.target.id || parentId]: { error: false, message: '' },
      });
    }
  };

  /**
   * Determines if form submission should be disabled
   */
  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!name.value) return true;

    let errorExists = false;
    _.forEach(errorKeys, (key) => {
      if (formError[key].error) {
        errorExists = true;
      }
    });
    return errorExists;
  };

  /**
   * Handles the selection change in the Autocomplete component
   */
  const onInputChange = (value) => {
    switch (true) {
      case value.length > orgs.length:
        setOrgs([...orgs, _.last(value).organization_uuid]);
        break;
      case value.length < orgs.length:
        setOrgs(value);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title={formTitle}
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          {/* Show loader when submitting form */}
          {(isAddingConsortium || isEditingConsortium) && (
            <Loader open={isAddingConsortium || isEditingConsortium} />
          )}

          <form
            className="adminPanelFormContainer"
            noValidate
            onSubmit={handleSubmit}
          >
            <Grid container spacing={isDesktop() ? 2 : 0}>
              {/* Consortium Name Input */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  id="name"
                  label={t('addConsortium.consortiumName')}
                  name="name"
                  autoComplete="name"
                  error={formError.name && formError.name.error}
                  helperText={formError.name ? formError.name.message : ''}
                  onBlur={(e) => handleBlur(e, 'required', name)}
                  {...name.bind}
                />
              </Grid>

              {/* Organization Selection Input */}
              <Grid item xs={12}>
                <Autocomplete
                  fullWidth
                  multiple
                  filterSelectedOptions
                  id="orgs"
                  options={orgData}
                  getOptionLabel={(option) => option && option.name}
                  isOptionEqualToValue={(option, value) => !value || (value && option.organization_uuid === value)}
                  value={orgs}
                  onChange={(e, newValue) => onInputChange(newValue)}
                  renderTags={(value, getTagProps) => _.map(value, (option, index) => (
                    <Chip
                      variant="default"
                      label={
                        !_.isEmpty(orgData)
                          && _.find(orgData, { organization_uuid: option })
                          ? _.find(orgData, { organization_uuid: option }).name
                          : ''
                      }
                      {...getTagProps({ index })}
                    />
                  ))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={t('addConsortium.custodianOrganizations')}
                      placeholder={t('addConsortium.attach')}
                      margin="normal"
                    />
                  )}
                />
              </Grid>

              {/* Submit and Cancel Buttons */}
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={6} sm={4}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className="adminPanelSubmit"
                    disabled={isAddingConsortium || isEditingConsortium || submitDisabled()}
                  >
                    {buttonText}
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    type="button"
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={discardFormData}
                    className="adminPanelSubmit"
                  >
                    {t('addConsortium.cancel')}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default AddConsortium;
