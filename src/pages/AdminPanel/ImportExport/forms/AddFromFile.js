import React, { useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  makeStyles,
  Grid,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from '@material-ui/core';
import { useInput } from '@hooks/useInput';
import { validators } from '@utils/validators';
import {
  addFromFile,
} from '@redux/importExport/actions/importExport.actions';

const useStyles = makeStyles((theme) => ({
  form: {
    width: '90%',
    margin: 'auto',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    borderRadius: '18px',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  loadingWrapper: {
    position: 'relative',
  },
}));

const AddFromFile = ({ loading, dispatch }) => {
  const classes = useStyles();
  const uploadType = useInput('', { required: true });
  const [uploadFile, setUploadFile] = useState(null);
  const [formError, setFormError] = useState({});

  /**
   * Submit The form and add/edit custodian type
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', uploadFile, uploadFile.name);
    formData.append('model', uploadType.value);

    dispatch(addFromFile(uploadType.value, formData));
  };

  /**
   * Handle input field blur event
   * @param {Event} e Event
   * @param {String} validation validation type if any
   * @param {Object} input input field
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

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!uploadType.value || !uploadFile) {
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
    <form
      className={classes.form}
      encType="multipart/form-data"
      noValidate
      onSubmit={handleSubmit}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            required
            id="uploadType"
            label="Upload Type"
            select
            error={
              formError.uploadType
              && formError.uploadType.error
            }
            helperText={
              formError.uploadType
                ? formError.uploadType.message
                : ''
            }
            onBlur={(e) => handleBlur(e, 'required', uploadType)}
            {...uploadType.bind}
          >
            <MenuItem value="">--------</MenuItem>
            <MenuItem value="item">Items</MenuItem>
            <MenuItem value="product">Products</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            required
            id="uploadFile"
            label="Upload File"
            type="file"
            InputLabelProps={{ shrink: true }}
            onChange={(e) => setUploadFile(e.target.files[0])}
          />
        </Grid>
        <Grid container spacing={2} justify="center">
          <Grid item xs={6} sm={4}>
            <div className={classes.loadingWrapper}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={loading || submitDisabled()}
              >
                Upload
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  className={classes.buttonProgress}
                />
              )}
            </div>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
});

export default connect(mapStateToProps)(AddFromFile);
