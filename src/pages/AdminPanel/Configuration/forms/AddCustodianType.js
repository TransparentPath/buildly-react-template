import React, { useState } from 'react';
import _ from 'lodash';
import { Grid, Button, TextField } from '@mui/material';
import Loader from '@components/Loader/Loader'; // Loader shown during API calls
import FormModal from '@components/Modal/FormModal'; // Reusable modal wrapper for the form
import useAlert from '@hooks/useAlert'; // Custom hook for displaying alerts
import { useInput } from '@hooks/useInput'; // Custom hook for managing input fields
import { useAddCustodianTypeMutation } from '@react-query/mutations/custodians/addCustodianTypeMutation'; // Mutation for adding new custodian type
import { useEditCustodianTypeMutation } from '@react-query/mutations/custodians/editCustodianTypeMutation'; // Mutation for editing existing custodian type
import { validators } from '@utils/validators'; // Utility for validating form input
import { isDesktop } from '@utils/mediaQuery'; // Utility to check if screen is desktop
import '../../AdminPanelStyles.css'; // Styles shared across admin panel
import { useTranslation } from 'react-i18next';

/**
 * Component to add or edit a custodian type.
 * Displays a form inside a modal with validations and mutation calls.
 */
const AddCustodianType = ({ history, location }) => {
  const { t } = useTranslation();

  // Form modal open state
  const [openFormModal, setFormModal] = useState(true);
  // Confirmation modal for unsaved changes
  const [openConfirmModal, setConfirmModal] = useState(false);
  const { displayAlert } = useAlert();
  // Check if the page is in edit mode
  const editPage = location.state && location.state.type === 'edit';
  // Data to edit (only used if editPage is true)
  const editData = (editPage && location.state.data) || {};
  // Input state for custodian type name
  const name = useInput((editData && editData.name) || '', {
    required: true,
  });
  // Object to track form validation errors
  const [formError, setFormError] = useState({});
  // Button label depending on whether it's an add or edit page
  const buttonText = editPage ? t('addCustodianType.save') : t('addCustodianType.addCustodianType');
  // Modal title depending on mode
  const formTitle = editPage ? t('addCustodianType.editCustodianType') : t('addCustodianType.addCustodianType');

  /**
   * Handle form modal close.
   * Shows confirmation if user made changes.
   */
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

  /**
   * Discard form changes and close modals
   */
  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(location.state.from);
    }
  };

  // Add mutation hook
  const { mutate: addCustodianTypeMutation, isLoading: isAddingCustodianType } = useAddCustodianTypeMutation(history, location.state.from, displayAlert, 'Custodian type');

  // Edit mutation hook
  const { mutate: editCustodianTypeMutation, isLoading: isEditingCustodianType } = useEditCustodianTypeMutation(history, location.state.from, displayAlert, 'Custodian type');

  /**
   * Handles form submit for adding/editing custodian type
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const currentDateTime = new Date();
    let data = {
      ...editData,
      name: name.value,
      edit_date: currentDateTime,
    };
    if (editPage) {
      editCustodianTypeMutation(data);
    } else {
      data = {
        ...data,
        create_date: currentDateTime,
      };
      addCustodianTypeMutation(data);
    }
  };

  /**
   * Handles validation on input blur
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
    if (!name.value) return true;
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
          {/* Show loader if mutation is in progress */}
          {(isAddingCustodianType || isEditingCustodianType) && (
            <Loader open={isAddingCustodianType || isEditingCustodianType} />
          )}
          {/* Main form */}
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
                  label={t('addCustodianType.custodianType')}
                  name="name"
                  autoComplete="name"
                  error={formError.name && formError.name.error}
                  helperText={
                    formError.name ? formError.name.message : ''
                  }
                  onBlur={(e) => handleBlur(e, 'required', name)}
                  {...name.bind}
                />
              </Grid>
              {/* Submit and Cancel buttons */}
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={6} sm={5.15} md={4}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className="adminPanelSubmit"
                    disabled={isAddingCustodianType || isEditingCustodianType || submitDisabled()}
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
                    {t('addCustodianType.cancel')}
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

export default AddCustodianType;
