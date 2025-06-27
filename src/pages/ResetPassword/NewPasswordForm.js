import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  CssBaseline,
  TextField,
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import logo from '@assets/tp-logo.png';
import Copyright from '@components/Copyright/Copyright';
import Loader from '@components/Loader/Loader';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import { routes } from '@routes/routesConstants';
import { validators } from '@utils/validators';
import { useResetPasswordConfirmMutation } from '@react-query/mutations/authUser/resetPasswordConfirmMutation';
import './ResetPasswordStyles.css';

const NewPassword = ({ history, location }) => {
  // State for new password field
  const [password, setPassword] = useState('');

  // Custom hook for confirm password input, includes validation
  const re_password = useInput('', {
    required: true,
    confirm: true,
  });

  // State for form validation errors
  const [formError, setFormError] = useState({});

  // Validation rules for password strength
  const [validations, setValidations] = useState({
    length: false,
    upperCase: false,
    lowerCase: false,
    digit: false,
    special: false,
  });

  // Toggles for showing/hiding password inputs
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Custom alert hook for displaying messages
  const { displayAlert } = useAlert();

  // Custom React Query mutation hook for confirming password reset
  const { mutate: resetPasswordConfirmMutation, isLoading: isResetPasswordConfirm } = useResetPasswordConfirmMutation(history, routes.LOGIN, displayAlert, 'Reset Password');

  // Handles form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    // Extract UID and token from the URL for backend validation
    if (location.pathname.includes(routes.RESET_PASSWORD_CONFIRM)) {
      const restPath = location.pathname.substring(
        location.pathname.indexOf(routes.RESET_PASSWORD_CONFIRM) + 1,
        location.pathname.lastIndexOf('/'),
      );
      const restPathArr = restPath.split('/');

      const registerFormValue = {
        new_password1: password,
        new_password2: re_password.value,
        uid: restPathArr[1],
        token: restPathArr[2],
      };

      // Call mutation with new password data
      resetPasswordConfirmMutation(registerFormValue);
    }
  };

  // Handles input blur validation
  const handleBlur = (e, validation, input) => {
    const validateObj = validators(validation, { ...input, password });
    const prevState = { ...formError };
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e.target.id]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [e.target.id]: {
          error: false,
          message: '',
        },
      });
    }
  };

  // Determines if the submit button should be disabled
  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!password || !re_password.value) {
      return true;
    }
    if (validations.length !== true || validations.upperCase !== true || validations.lowerCase !== true || validations.digit !== true || validations.special !== true) {
      return true;
    }
    let errorExists = false;
    errorKeys.forEach((key) => {
      if (formError[key].error) {
        errorExists = true;
      }
    });
    return errorExists;
  };

  // Validates password strength and updates validation state
  const validatePassword = (value) => {
    const lengthRegex = /^.{10,}$/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const digitRegex = /\d/;
    const specialCharacterRegex = /[!@#$%^&*]/;

    setValidations({
      length: lengthRegex.test(value),
      upperCase: uppercaseRegex.test(value),
      lowerCase: lowercaseRegex.test(value),
      digit: digitRegex.test(value),
      special: specialCharacterRegex.test(value),
    });
  };

  return (
    <Container component="main" maxWidth="xs" className="resetPasswordContainer">
      {isResetPasswordConfirm && <Loader open={isResetPasswordConfirm} />}
      <CssBaseline />
      <Card variant="outlined">
        <CardContent>
          <div className="resetPasswordPaper">
            <img src={logo} className="resetPasswordLogo" alt="Company logo" />
            <Typography component="h1" variant="h5">
              Reset your Password
            </Typography>
            <form className="resetPasswordForm" noValidate onSubmit={handleSubmit}>
              {/* New Password Field */}
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                className="resetPasswordTextField"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {/* Password Validation Feedback */}
              <Typography mt={-3} className={validations.length ? 'resetPasswordValidText' : 'resetPasswordInvalidText'}>
                {validations.length ? '✓' : '✗'}
                {' '}
                10-alphanumeric character length
              </Typography>
              <Typography className={validations.upperCase && validations.lowerCase ? 'resetPasswordValidText' : 'resetPasswordInvalidText'}>
                {validations.upperCase && validations.lowerCase ? '✓' : '✗'}
                {' '}
                Uppercase and lowercase letters
              </Typography>
              <Typography className={validations.digit ? 'resetPasswordValidText' : 'resetPasswordInvalidText'}>
                {validations.digit ? '✓' : '✗'}
                {' '}
                At least 1 digit number
              </Typography>
              <Typography className={validations.special ? 'resetPasswordValidText' : 'resetPasswordInvalidText'}>
                {validations.special ? '✓' : '✗'}
                {' '}
                At least 1 special character (!@#$%^&*, etc.)
              </Typography>

              {/* Confirm Password Field */}
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="re_password"
                label="Confirm Password"
                name="re_password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="re_password"
                className="resetPasswordTextField"
                error={formError.re_password && formError.re_password.error}
                helperText={formError.re_password ? formError.re_password.message : ''}
                onBlur={(e) => handleBlur(e, 'confirm', re_password)}
                {...re_password.bind}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                style={{ marginTop: 8, marginBottom: 16 }}
                disabled={isResetPasswordConfirm || submitDisabled()}
              >
                Submit
              </Button>

              {/* Navigation Link */}
              <Grid container>
                <Grid item>
                  <Link to={routes.LOGIN} variant="body2" color="primary">
                    Go back to Sign in
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
        </CardContent>
      </Card>
      <Copyright />
    </Container>
  );
};

export default NewPassword;
