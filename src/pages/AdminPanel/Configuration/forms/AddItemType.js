import React, { useState } from 'react';
import _ from 'lodash';
import { Grid, Button, TextField } from '@mui/material';
import Loader from '@components/Loader/Loader';
import FormModal from '@components/Modal/FormModal';
import { getUser } from '@context/User.context';
import { useInput } from '@hooks/useInput';
import { validators } from '@utils/validators';
import { isDesktop } from '@utils/mediaQuery';
import { useAddItemTypeMutation } from '@react-query/mutations/items/addItemTypeMutation';
import { useEditItemTypeMutation } from '@react-query/mutations/items/editItemTypeMutation';
import useAlert from '@hooks/useAlert';
import '../../AdminPanelStyles.css';
import { useTranslation } from 'react-i18next';

/**
 * AddItemType component
 * This component handles both adding and editing of Item Types within an organization's admin panel.
 * It uses a modal form with validation and conditional behavior based on the route state.
 */
const AddItemType = ({ history, location }) => {
  const { t } = useTranslation();

  // Get the organization UUID from the logged-in user's context
  const organization = getUser().organization.organization_uuid;

  // Modal control states
  const [openFormModal, setFormModal] = useState(true); // Controls the main form modal visibility
  const [openConfirmModal, setConfirmModal] = useState(false); // Controls the discard confirmation modal

  const { displayAlert } = useAlert(); // Alert utility for displaying messages

  // Determine if the current page is in "edit" mode
  const editPage = location.state && location.state.type === 'edit';
  const editData = (editPage && location.state.data) || {};

  // Controlled input for item name with validation
  const name = useInput((editData && editData.name) || '', {
    required: true,
  });

  // Error tracking for form fields
  const [formError, setFormError] = useState({});

  // Set button text and form title dynamically based on mode
  const buttonText = editPage ? t('addItemType.save') : t('addItemType.addItemType');
  const formTitle = editPage ? t('addItemType.editItemType') : t('addItemType.addItemType');

  /**
   * Handle closing the modal form.
   * If changes have been made, prompt a confirmation before discarding.
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
   * Discard any changes made in the form and close the modal
   */
  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(location.state.from);
    }
  };

  // Custom mutation hooks for adding and editing item types
  const { mutate: addItemTypeMutation, isLoading: isAddingItemType } = useAddItemTypeMutation(organization, history, location.state.from, displayAlert, 'Item type');
  const { mutate: editItemTypeMutation, isLoading: isEditingItemType } = useEditItemTypeMutation(organization, history, location.state.from, displayAlert, 'Item type');

  /**
   * Handle form submission logic.
   * Prepares payload and calls appropriate mutation.
   * @param {Event} event Form submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const currentDateTime = new Date();
    // Common data fields
    let data = {
      ...editData,
      name: name.value,
      organization_uuid: organization,
      edit_date: currentDateTime,
    };
    // Branch for edit or create
    if (editPage) {
      editItemTypeMutation(data);
    } else {
      data = {
        ...data,
        create_date: currentDateTime,
      };
      addItemTypeMutation(data);
    }
  };

  /**
   * Validate input fields on blur.
   * Updates form error state if validation fails.
   * @param {Event} e - blur event
   * @param {String} validation - validation type
   * @param {Object} input - input field handler
   * @param {String} parentId - optional fallback for target id
   */
  const handleBlur = (e, validation, input, parentId) => {
    const validateObj = validators(validation, input);
    const prevState = { ...formError };
    const key = e.target.id || parentId;
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [key]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [key]: {
          error: false,
          message: '',
        },
      });
    }
  };

  /**
   * Check if form submission should be disabled.
   * Disables if any required fields are empty or if there are validation errors.
   * @returns {boolean}
   */
  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!name.value) {
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
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title={formTitle}
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          {/* Loading spinner overlay during async operations */}
          {(isAddingItemType || isEditingItemType) && (
            <Loader open={isAddingItemType || isEditingItemType} />
          )}
          {/* Main form for adding/editing item types */}
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
                  label={t('addItemType.itemType')}
                  name="name"
                  autoComplete="name"
                  error={formError.name && formError.name.error}
                  helperText={formError.name ? formError.name.message : ''}
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
                    disabled={isAddingItemType || isEditingItemType || submitDisabled()}
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
                    {t('addItemType.cancel')}
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

export default AddItemType;
