// Import necessary dependencies
import React, { useState } from 'react';
import _ from 'lodash';
import { Grid, Button, TextField } from '@mui/material';
import Loader from '@components/Loader/Loader';
import FormModal from '@components/Modal/FormModal';
import { getUser } from '@context/User.context';
import { useInput } from '@hooks/useInput';
import { validators } from '@utils/validators';
import { isDesktop } from '@utils/mediaQuery';
import { useAddProductTypeMutation } from '@react-query/mutations/items/addProductTypeMutation';
import { useEditProductTypeMutation } from '@react-query/mutations/items/editProductTypeMutation';
import useAlert from '@hooks/useAlert';
import '../../AdminPanelStyles.css';
import { useTranslation } from 'react-i18next';

// Main component for adding or editing a product type
const AddProductType = ({ history, location }) => {
  const { t } = useTranslation();

  // Get the organization UUID from the logged-in user context
  const organization = getUser().organization.organization_uuid;

  // State to control form modal visibility
  const [openFormModal, setFormModal] = useState(true);

  // State to control confirmation modal visibility when closing form with unsaved changes
  const [openConfirmModal, setConfirmModal] = useState(false);

  // Destructure alert hook
  const { displayAlert } = useAlert();

  // Determine if the form is in edit mode and load existing data if so
  const editPage = location.state && location.state.type === 'edit';
  const editData = (editPage && location.state.data) || {};

  // Input field hook for product type name, with prefill if editing
  const name = useInput((editData && editData.name) || '', {
    required: true,
  });

  // State to track form validation errors
  const [formError, setFormError] = useState({});

  // Dynamic button and modal title text based on mode
  const buttonText = editPage ? t('addProductType.save') : t('addProductType.addProductType');
  const formTitle = editPage ? t('addProductType.editProductType') : t('addProductType.addProductType');

  /**
   * Function to close the form modal.
   * Prompts confirmation modal if form data has changed.
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
   * Discard any unsaved data and close modal.
   */
  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(location.state.from);
    }
  };

  // Custom mutation hook to handle product type creation
  const { mutate: addProductTypeMutation, isLoading: isAddingProductType } = useAddProductTypeMutation(organization, history, location.state.from, displayAlert, 'Product type');

  // Custom mutation hook to handle product type editing
  const { mutate: editProductTypeMutation, isLoading: isEditingProductType } = useEditProductTypeMutation(organization, history, location.state.from, displayAlert, 'Product type');

  /**
   * Handle form submission to create or edit a product type
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const currentDateTime = new Date();

    let data = {
      ...editData,
      name: name.value,
      organization_uuid: organization,
      edit_date: currentDateTime,
    };

    // If editing, call edit mutation; else, add creation date and call add mutation
    if (editPage) {
      editProductTypeMutation(data);
    } else {
      data = {
        ...data,
        create_date: currentDateTime,
      };
      addProductTypeMutation(data);
    }
  };

  /**
   * Handle blur event on input fields to trigger validation
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

    // If the name is empty, disable
    if (!name.value) return true;

    // Check for any existing validation errors
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
      {/* Render form modal if open */}
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title={formTitle}
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          {/* Show loader during mutation calls */}
          {(isAddingProductType || isEditingProductType) && (
            <Loader open={isAddingProductType || isEditingProductType} />
          )}

          {/* Form contents */}
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
                  label={t('addProductType.productType')}
                  name="name"
                  autoComplete="name"
                  error={formError.name && formError.name.error}
                  helperText={formError.name ? formError.name.message : ''}
                  onBlur={(e) => handleBlur(e, 'required', name)}
                  {...name.bind}
                />
              </Grid>

              {/* Submit and Cancel Buttons */}
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={6} sm={5.15} md={4}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className="adminPanelSubmit"
                    disabled={isAddingProductType || isEditingProductType || submitDisabled()}
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
                    {t('addProductType.cancel')}
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

// Export component for use
export default AddProductType;
