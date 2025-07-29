import React, { useState } from 'react';
import _ from 'lodash';
import {
  Grid,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import Loader from '@components/Loader/Loader'; // Loader component for showing loading state
import { useInput } from '@hooks/useInput'; // Custom hook to handle form inputs
import { validators } from '@utils/validators'; // Utility for form validation
import { isDesktop2 } from '@utils/mediaQuery'; // Utility to check if the view is desktop-sized
import { useAddFromFileMutation } from '@react-query/mutations/importExport/addFromFileMutation'; // Mutation hook for file upload
import useAlert from '@hooks/useAlert'; // Custom hook to handle alert notifications
import '../../AdminPanelStyles.css';

/**
 * AddFromFile component provides a form to upload a file along with its type.
 * It includes form validation, loading state, and a button to submit the file.
 */
const AddFromFile = () => {
  // State to track the selected upload type (e.g., 'item' or 'product')
  const uploadType = useInput('', { required: true });

  // State to manage the file that the user selects to upload
  const [uploadFile, setUploadFile] = useState(null);

  // State to manage form validation errors
  const [formError, setFormError] = useState({});

  // Get the alert function from the useAlert hook
  const { displayAlert } = useAlert();

  // Mutation hook to handle the file upload process
  const { mutate: addFromFileMutation, isLoading: isAddingFromFile } = useAddFromFileMutation(uploadType.value, displayAlert, 'Import export');

  /**
   * Handles the form submission event.
   * It prepares the form data (including the file and selected upload type)
   * and triggers the file upload mutation.
   * @param {Event} event The form submission event.
   */
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submit action

    // Prepare form data with the file and upload type
    const formData = new FormData();
    formData.append('file', uploadFile, uploadFile.name);
    formData.append('model', uploadType.value);

    // Call the mutation to upload the file
    addFromFileMutation(formData);
  };

  /**
   * Handles the blur event for input fields.
   * Validates the input field and sets form errors if needed.
   * @param {Event} e The blur event triggered when the input loses focus.
   * @param {String} validation The type of validation to apply (e.g., 'required').
   * @param {Object} input The input field object from the useInput hook.
   * @param {String} parentId The parent field ID for error tracking.
   */
  const handleBlur = (e, validation, input, parentId) => {
    // Validate the input field using the validators utility
    const validateObj = validators(validation, input);
    const prevState = { ...formError }; // Store previous state of form errors

    // If validation fails, set the form error for the respective field
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e.target.id || parentId]: validateObj,
      });
    } else {
      // If validation passes, clear the error for the respective field
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
   * Determines if the submit button should be disabled.
   * It checks for the presence of errors and required field values.
   * @returns {boolean} True if the form is invalid or loading; false otherwise.
   */
  const submitDisabled = () => {
    const errorKeys = Object.keys(formError); // Get keys of form errors
    if (!uploadType.value || !uploadFile) {
      return true; // Disable submit if no file or upload type selected
    }

    let errorExists = false;

    // Check if there are any errors in the form
    _.forEach(errorKeys, (key) => {
      if (formError[key].error) {
        errorExists = true; // If any error exists, disable the submit button
      }
    });

    return errorExists;
  };

  return (
    <div>
      {/* Display loader while the file is being uploaded */}
      {isAddingFromFile && <Loader open={isAddingFromFile} />}

      {/* Form for file upload */}
      <form
        className="adminPanelFormRoot"
        encType="multipart/form-data" // Ensure the form can handle file uploads
        noValidate // Disable browser validation for custom validation
        onSubmit={handleSubmit} // Handle form submit with custom function
      >
        {/* Grid layout for the form */}
        <Grid container spacing={isDesktop2() ? 2 : 0}>

          {/* Upload Type Dropdown */}
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              required
              id="uploadType"
              label="Upload Type"
              select
              error={formError.uploadType && formError.uploadType.error} // Show error if any
              helperText={formError.uploadType ? formError.uploadType.message : ''} // Display error message
              onBlur={(e) => handleBlur(e, 'required', uploadType)} // Trigger blur validation
              {...uploadType.bind} // Bind the input field to useInput hook
            >
              <MenuItem value="">--------</MenuItem>
              <MenuItem value="item">Items</MenuItem>
              <MenuItem value="product">Products</MenuItem>
            </TextField>
          </Grid>

          {/* File Upload Input */}
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              required
              id="uploadFile"
              label="Upload File"
              type="file" // Specify file input type
              InputLabelProps={{ shrink: true }} // Shrink the label when the input is focused
              onChange={(e) => setUploadFile(e.target.files[0])} // Handle file selection
            />
          </Grid>

          {/* Submit and Cancel Buttons */}
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={7} sm={6} md={4}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className="adminPanelSubmit"
                disabled={isAddingFromFile || submitDisabled()} // Disable button if loading or form is invalid
              >
                Upload
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default AddFromFile;
