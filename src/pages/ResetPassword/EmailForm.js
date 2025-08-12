// Importing React and hooks
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // For navigation link
// MUI components
import {
  Button,
  CssBaseline,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
// Static assets and custom components
import logo from '@assets/tp-logo.png';
import Copyright from '@components/Copyright/Copyright';
import Loader from '@components/Loader/Loader';
// Custom hooks and utilities
import useAlert from '@hooks/useAlert'; // For showing global alert messages
import { useInput } from '@hooks/useInput'; // For input state and validation
import { routes } from '@routes/routesConstants'; // App route paths
import { validators } from '@utils/validators'; // Input validators
import { useResetPasswordMutation } from '@react-query/mutations/authUser/resetPasswordMutation'; // React Query mutation for reset
import './ResetPasswordStyles.css'; // Component-specific styles

// EmailForm handles the reset password flow by capturing user email
const EmailForm = ({ history }) => {
  const { t } = useTranslation();

  // Input field management using custom useInput hook
  const email = useInput('', { required: true });

  // Error state for input validations
  const [error, setError] = useState({});

  // Custom alert system hook
  const { displayAlert } = useAlert();

  // Reset password mutation hook from React Query
  const { mutate: resetPasswordMutation, isLoading: isResetPassword } = useResetPasswordMutation(displayAlert, setError, history, 'Email Form');

  // Called when user submits the form
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent page reload
    const loginFormValue = {
      email: email.value.toLowerCase(), // Lowercase email before submission
    };
    resetPasswordMutation(loginFormValue); // Trigger password reset
  };

  // Input field blur handler to validate data using validators
  const handleBlur = (e, validation, input) => {
    const validateObj = validators(validation, input); // Run validation
    const prevState = { ...error }; // Clone current error state
    if (validateObj && validateObj.error) {
      // If error found, set error state for this field
      setError({
        ...prevState,
        [e.target.id]: validateObj,
      });
    } else {
      // Clear error for this field
      setError({
        ...prevState,
        [e.target.id]: {
          error: false,
          message: '',
        },
      });
    }
  };

  // Disable submit button based on input value and validation state
  const submitDisabled = () => {
    const errorKeys = Object.keys(error);
    if (!email.value) return true; // Email must be filled
    let errorExists = false;
    errorKeys.forEach((key) => {
      if (error[key].error) {
        errorExists = true; // If any error exists, disable submit
      }
    });
    return errorExists;
  };

  return (
    <Container component="main" maxWidth="xs" className="resetPasswordContainer">
      {/* Loader shown when mutation is in progress */}
      {isResetPassword && <Loader open={isResetPassword} />}
      {/* Normalize browser styles */}
      <CssBaseline />
      <Card variant="outlined">
        <CardContent>
          <div className="resetPasswordPaper">
            {/* Logo image */}
            <img src={logo} className="resetPasswordLogo" alt={t('resetPassword.companyLogoAlt')} />
            {/* Title */}
            <Typography component="h1" variant="h5" gutterBottom>
              {t('resetPassword.enterRegisteredEmail')}
            </Typography>
            {/* Reset password form */}
            <form className="resetPasswordForm" noValidate onSubmit={handleSubmit}>
              {/* Email input field */}
              <TextField
                className="resetPasswordTextField"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label={t('resetPassword.registeredEmailLabel')}
                name="email"
                autoComplete="email"
                error={error.email && error.email.error}
                helperText={error && error.email ? error.email.message : ''}
                onBlur={(e) => handleBlur(e, 'email', email)} // Trigger validation on blur
                {...email.bind} // Bind custom hook input handlers
              />
              {/* Submit button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                style={{ marginTop: 8, marginBottom: 16 }}
                disabled={isResetPassword || submitDisabled()}
              >
                {t('resetPassword.submitButton')}
              </Button>
              {/* Link to return to login page */}
              <Grid container>
                <Grid item xs>
                  <Link
                    to={routes.LOGIN}
                    variant="body2"
                    color="primary"
                  >
                    {t('resetPassword.goBackToSignIn')}
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
        </CardContent>
      </Card>
      {/* Footer */}
      <Copyright />
    </Container>
  );
};

// Export component for external use
export default EmailForm;
