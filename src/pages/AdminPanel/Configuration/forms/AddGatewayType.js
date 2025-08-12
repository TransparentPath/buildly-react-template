import React, { useState } from 'react';
import _ from 'lodash';
import {
  Grid,
  Button,
  TextField,
} from '@mui/material';
import Loader from '@components/Loader/Loader'; // Component to show loading state
import FormModal from '@components/Modal/FormModal'; // Modal wrapper component for the form
import { useInput } from '@hooks/useInput'; // Custom hook to manage form input state and change tracking
import { validators } from '@utils/validators'; // Custom validation utility
import { isDesktop } from '@utils/mediaQuery'; // Utility to detect desktop for responsive layout
import { useAddGatewayTypeMutation } from '@react-query/mutations/sensorGateways/addGatewayTypeMutation'; // Mutation hook to add a new gateway type
import { useEditGatewayTypeMutation } from '@react-query/mutations/sensorGateways/editGatewayTypeMutation'; // Mutation hook to edit existing gateway type
import useAlert from '@hooks/useAlert'; // Custom hook to display alerts
import '../../AdminPanelStyles.css'; // Styling
import { useTranslation } from 'react-i18next';

const AddGatewayType = ({ history, location }) => {
  const { t } = useTranslation();

  // State to manage form modal visibility
  const [openFormModal, setFormModal] = useState(true);
  // State to manage confirmation modal visibility when unsaved data exists
  const [openConfirmModal, setConfirmModal] = useState(false);

  const { displayAlert } = useAlert(); // Hook for alerting success or error messages

  // Determine if the page is in "edit" mode
  const editPage = location.state && location.state.type === 'edit';
  // Retrieve existing data if editing
  const editData = (editPage && location.state.data) || {};

  // Initialize input state with existing name (for edit) or empty string (for add)
  const name = useInput((editData && editData.name) || '', {
    required: true,
  });

  const [formError, setFormError] = useState({}); // State to track form input validation errors

  // UI texts depending on whether it's add or edit mode
  const buttonText = editPage ? t('addGatewayType.save') : t('addGatewayType.addTrackerType');
  const formTitle = editPage ? t('addGatewayType.editTrackerType') : t('addGatewayType.addTrackerType');

  /**
   * Closes the form modal with confirmation if there are unsaved changes
   */
  const closeFormModal = () => {
    if (name.hasChanged()) {
      setConfirmModal(true); // Show confirmation if changes detected
    } else {
      setFormModal(false); // Close form directly
      if (location && location.state) {
        history.push(location.state.from); // Navigate back to previous page
      }
    }
  };

  /**
   * Discards changes and closes both confirmation and form modals
   */
  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(location.state.from); // Navigate back
    }
  };

  // React Query mutations for add and edit
  const { mutate: addGatewayTypeMutation, isLoading: isAddingGatewayType } = useAddGatewayTypeMutation(history, location.state.from, displayAlert, 'Gateway type');
  const { mutate: editGatewayTypeMutation, isLoading: isEditingGatewayType } = useEditGatewayTypeMutation(history, location.state.from, displayAlert, 'Gateway type');

  /**
   * Handles form submission for both add and edit modes
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const currentDateTime = new Date();
    let data = {
      ...editData,
      name: name.value,
      edit_date: currentDateTime,
    };
    // Choose mutation based on mode
    if (editPage) {
      editGatewayTypeMutation(data);
    } else {
      data = {
        ...data,
        create_date: currentDateTime,
      };
      addGatewayTypeMutation(data);
    }
  };

  /**
   * Validates input field on blur event
   */
  const handleBlur = (e, validation, input, parentId) => {
    const validateObj = validators(validation, input);
    const prevState = { ...formError };
    // Update formError state depending on validation result
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

  /**
   * Determines whether the submit button should be disabled
   */
  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!name.value) return true; // Required field check
    // Check for any validation errors
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
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title={formTitle}
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          {(isAddingGatewayType || isEditingGatewayType) && (
            <Loader open={isAddingGatewayType || isEditingGatewayType} />
          )}
          <form
            className="adminPanelFormContainer"
            noValidate
            onSubmit={handleSubmit}
          >
            <Grid container spacing={isDesktop() ? 2 : 0}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  id="name"
                  label={t('addGatewayType.trackerType')}
                  name="name"
                  autoComplete="name"
                  error={formError.name && formError.name.error}
                  helperText={formError.name ? formError.name.message : ''}
                  onBlur={(e) => handleBlur(e, 'required', name)}
                  {...name.bind}
                />
              </Grid>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={6} sm={5.15} md={4}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className="adminPanelSubmit"
                    disabled={isAddingGatewayType || isEditingGatewayType || submitDisabled()}
                  >
                    {buttonText}
                  </Button>
                </Grid>
                <Grid item xs={6} sm={5.15} md={4}>
                  <Button
                    type="button"
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={discardFormData}
                    className="adminPanelSubmit"
                  >
                    {t('addGatewayType.cancel')}
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

export default AddGatewayType;
