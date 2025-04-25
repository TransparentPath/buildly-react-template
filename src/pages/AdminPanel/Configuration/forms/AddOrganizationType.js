import React, { useState } from 'react';
import _ from 'lodash';
import { Grid, Button, TextField } from '@mui/material';
import Loader from '@components/Loader/Loader'; // Loader spinner component
import FormModal from '@components/Modal/FormModal'; // Reusable modal wrapper for forms
import { useInput } from '@hooks/useInput'; // Custom hook for managing input fields
import { validators } from '@utils/validators'; // Utility for validating form fields
import { isDesktop } from '@utils/mediaQuery'; // Helper to check if viewport is desktop-sized
import { useAddOrganizationTypeMutation } from '@react-query/mutations/authUser/addOrganizationTypeMutation'; // React Query mutation to add a new organization type
import { useEditOrganizationTypeMutation } from '@react-query/mutations/authUser/editOrganizationTypeMutation'; // React Query mutation to edit existing organization type
import useAlert from '@hooks/useAlert'; // Custom hook for showing alerts
import '../../AdminPanelStyles.css'; // Custom styles for the admin panel

const AddOrganizationType = ({ history, location }) => {
  // State to control the visibility of the main form modal
  const [openFormModal, setFormModal] = useState(true);

  // State to control the visibility of confirmation modal when discarding changes
  const [openConfirmModal, setConfirmModal] = useState(false);

  // Extract the alert handler from custom hook
  const { displayAlert } = useAlert();

  // Determine if the page is in "edit" mode based on the route state
  const editPage = location.state && location.state.type === 'edit';

  // Pre-fill form data if in edit mode
  const editData = (editPage && location.state.data) || {};

  // Controlled input field for organization type name
  const name = useInput((editData && editData.name) || '', {
    required: true,
  });

  // Object to store any form-level validation errors
  const [formError, setFormError] = useState({});

  // Dynamic text for the submit button based on mode
  const buttonText = editPage ? 'Save' : 'Add Organization Type';

  // Dynamic title for the modal form based on mode
  const formTitle = editPage ? 'Edit Organization Type' : 'Add Organization Type';

  /**
   * Handler for closing the form modal.
   * If there are unsaved changes, open confirmation modal.
   */
  const closeFormModal = () => {
    if (name.hasChanged()) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      if (location && location.state) {
        history.push(location.state.from); // Redirect to previous page
      }
    }
  };

  /**
   * Handler for discarding changes and closing the modal.
   */
  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(location.state.from);
    }
  };

  // React Query mutation hook to add a new organization type
  const { mutate: addOrganizationTypeMutation, isLoading: isAddingOrganizationType } = useAddOrganizationTypeMutation(history, location.state.from, displayAlert);

  // React Query mutation hook to edit an existing organization type
  const { mutate: editOrganizationTypeMutation, isLoading: isEditingOrganizationType } = useEditOrganizationTypeMutation(history, location.state.from, displayAlert);

  /**
   * Handles the form submission for adding or editing organization types.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const currentDateTime = new Date();
    // Construct payload object
    let data = {
      ...editData,
      name: name.value,
      edit_date: currentDateTime,
    };
    // Use appropriate mutation based on mode
    if (editPage) {
      editOrganizationTypeMutation(data);
    } else {
      data = {
        ...data,
        create_date: currentDateTime,
      };
      addOrganizationTypeMutation(data);
    }
  };

  /**
   * Field-level validation handler on blur event.
   * @param {Event} e - Input event
   * @param {String} validation - Validation type (e.g., 'required')
   * @param {Object} input - Input field object
   * @param {String} parentId - Optional parent field ID
   */
  const handleBlur = (e, validation, input, parentId) => {
    const validateObj = validators(validation, input);
    const prevState = { ...formError };

    if (validateObj && validateObj.error) {
      // Set validation error
      setFormError({
        ...prevState,
        [e.target.id || parentId]: validateObj,
      });
    } else {
      // Clear validation error
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
   * Disable the submit button if there are validation errors or empty required fields.
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

  // Component JSX
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
          {(isAddingOrganizationType || isEditingOrganizationType) && (
            <Loader open={isAddingOrganizationType || isEditingOrganizationType} />
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
                  label="Organization Type"
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
                    disabled={isAddingOrganizationType || isEditingOrganizationType || submitDisabled()}
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
                    Cancel
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

export default AddOrganizationType;
