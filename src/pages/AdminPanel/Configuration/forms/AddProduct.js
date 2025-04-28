// Import necessary libraries and components
import React, { useState } from 'react';
import _ from 'lodash';
import { Grid, Button, TextField } from '@mui/material';
import Loader from '@components/Loader/Loader';
import FormModal from '@components/Modal/FormModal';
import { getUser } from '@context/User.context';
import { useInput } from '@hooks/useInput';
import { validators } from '@utils/validators';
import { isDesktop } from '@utils/mediaQuery';
import { useAddProductMutation } from '@react-query/mutations/items/addProductMutation';
import { useEditProductMutation } from '@react-query/mutations/items/editProductMutation';
import useAlert from '@hooks/useAlert';
import '../../AdminPanelStyles.css';

// Main component for adding or editing a product
const AddProduct = ({ history, location }) => {
  // Get the currently logged-in user's organization UUID
  const organization = getUser().organization.organization_uuid;

  // Form modal visibility states
  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);

  // Hook for displaying alert messages
  const { displayAlert } = useAlert();

  // Determine if the form is in edit mode
  const editPage = location.state && location.state.type === 'edit';
  const editData = (editPage && location.state.data) || {};

  // Initialize form fields with default or pre-filled edit data
  const name = useInput((editData && editData.name) || '', { required: true });
  const description = useInput((editData && editData.description) || '', { required: true });
  const value = useInput((editData && editData.value) || 0, { required: true });
  const grossWeight = useInput((editData && editData.gross_weight) || 0, { required: true });

  // State to track validation errors
  const [formError, setFormError] = useState({});

  // Form button and title text based on mode
  const buttonText = editPage ? 'Save' : 'Add Product';
  const formTitle = editPage ? 'Edit Product' : 'Add Product';

  /**
   * Close the form modal.
   * If the form has unsaved changes, show confirmation modal.
   */
  const closeFormModal = () => {
    const dataHasChanged = (
      name.hasChanged()
      || description.hasChanged()
      || value.hasChanged()
      || grossWeight.hasChanged()
    );

    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      if (location && location.state) {
        history.push(location.state.from);
      }
    }
  };

  /**
   * Discard changes and close both form and confirm modals
   */
  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(location.state.from);
    }
  };

  // React Query mutation hook for adding a product
  const { mutate: addProductMutation, isLoading: isAddingProduct } = useAddProductMutation(organization, history, location.state.from, displayAlert);

  // React Query mutation hook for editing a product
  const { mutate: editProductMutation, isLoading: isEditingProduct } = useEditProductMutation(organization, history, location.state.from, displayAlert);

  /**
   * Handle form submission: trigger add or edit mutation
   * @param {Event} event - form submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    const currentDateTime = new Date();
    let data = {
      ...editData,
      name: name.value,
      description: description.value,
      value: value.value,
      gross_weight: grossWeight.value,
      organization_uuid: organization,
      edit_date: currentDateTime,
    };

    // Conditional logic for add or edit mode
    if (editPage) {
      editProductMutation(data);
    } else {
      data = {
        ...data,
        create_date: currentDateTime,
      };
      addProductMutation(data);
    }
  };

  /**
   * Validate field on blur and update form error state
   * @param {Event} e - blur event
   * @param {String} validation - validation rule
   * @param {Object} input - input state object
   * @param {String} [parentId] - optional parent ID for composite components
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
   * Check if the submit button should be disabled
   * Returns true if fields are empty or have errors
   */
  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (
      !name.value || !description.value || !value.value || !grossWeight.value
    ) {
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

  // Render form inside modal
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
          {(isAddingProduct || isEditingProduct) && (
            <Loader open={isAddingProduct || isEditingProduct} />
          )}

          <form className="adminPanelFormContainer" noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isDesktop() ? 2 : 0}>
              {/* Product Name */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  id="name"
                  label="Name"
                  name="name"
                  autoComplete="name"
                  error={formError.name && formError.name.error}
                  helperText={formError.name ? formError.name.message : ''}
                  onBlur={(e) => handleBlur(e, 'required', name)}
                  {...name.bind}
                />
              </Grid>

              {/* Product Description */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  id="description"
                  label="Description"
                  name="description"
                  autoComplete="description"
                  error={formError.description && formError.description.error}
                  helperText={formError.description ? formError.description.message : ''}
                  onBlur={(e) => handleBlur(e, 'required', description)}
                  {...description.bind}
                />
              </Grid>

              {/* Product Value */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  type="number"
                  id="value"
                  label="Value"
                  name="value"
                  autoComplete="value"
                  error={formError.value && formError.value.error}
                  helperText={formError.value ? formError.value.message : ''}
                  onBlur={(e) => handleBlur(e, 'required', value)}
                  {...value.bind}
                />
              </Grid>

              {/* Product Gross Weight */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  type="number"
                  id="grossWeight"
                  label="Gross Weight"
                  name="grossWeight"
                  autoComplete="grossWeight"
                  error={formError.grossWeight && formError.grossWeight.error}
                  helperText={formError.grossWeight ? formError.grossWeight.message : ''}
                  onBlur={(e) => handleBlur(e, 'required', grossWeight)}
                  {...grossWeight.bind}
                />
              </Grid>

              {/* Form Buttons */}
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={6} sm={5.15} md={4}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className="adminPanelSubmit"
                    disabled={isAddingProduct || isEditingProduct || submitDisabled()}
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

export default AddProduct;
