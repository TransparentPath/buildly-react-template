import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Button,
  CssBaseline,
  TextField,
  Grid,
  Card,
  CardContent,
  Checkbox,
  InputAdornment,
  IconButton,
  Typography,
  Container,
  FormControlLabel,
} from '@mui/material';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import logo from '@assets/tp-logo.png';
import Copyright from '@components/Copyright/Copyright';
import Loader from '@components/Loader/Loader';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import useTimezone from '@hooks/useTimezone';
import { routes } from '@routes/routesConstants';
import { validators } from '@utils/validators';
import { useResetPasswordCheckMutation } from '@react-query/mutations/authUser/resetPasswordCheckMutation';
import { useLoginMutation } from '@react-query/mutations/authUser/loginMutation';
import './LoginStyles.css';

const Login = ({ history }) => {
  // Manage the input fields for email and password using custom hooks
  const email = useInput(localStorage.getItem('email') || '', { required: true });
  const password = useInput('', { required: true });

  // Manage error state for validation messages
  const [error, setError] = useState({});

  // State to toggle visibility of the password input field
  const [showPassword, setShowPassword] = useState(false);

  // State to manage whether the "Remember Email" checkbox is checked
  const [isChecked, setChecked] = useState(!!localStorage.getItem('email') || false);

  // Get the current location from the router for URL-related functionality
  const location = useLocation();

  // Custom hook for managing alerts
  const { displayAlert } = useAlert();

  // Custom hook to get the current user's timezone
  const { timezone } = useTimezone();

  // Mutation hook for resetting password check (for password recovery)
  const { mutate: resetPasswordCheckMutation, isLoading: isPasswordCheck } = useResetPasswordCheckMutation(
    history, routes.RESET_PASSWORD_CONFIRM, routes.LOGIN, displayAlert, 'Login',
  );

  // Mutation hook for logging in a user
  const { mutate: loginMutation, isLoading: islogin, isError: isLoginError } = useLoginMutation(
    history, (location.state && location.state.from) || routes.SHIPMENT, displayAlert, timezone, 'Login',
  );

  // useEffect hook to handle reset password check based on the URL path when resetting a password
  useEffect(() => {
    if (location.pathname.includes(routes.RESET_PASSWORD_CONFIRM)) {
      const restPath = location.pathname.substring(
        location.pathname.indexOf(routes.RESET_PASSWORD_CONFIRM) + 1,
        location.pathname.lastIndexOf('/'),
      );
      const restPathArr = restPath.split('/');
      const resetCheckValues = {
        uid: restPathArr[1],
        token: restPathArr[2],
      };
      // Call the mutation function to check the reset password confirmation
      resetPasswordCheckMutation(resetCheckValues);
    }
  }, []);

  // Form submit handler
  const handleSubmit = (event) => {
    event.preventDefault();

    // Create an object with email and password to be sent for login
    const loginFormValue = {
      username: email.value.toLowerCase(),
      password: password.value,
    };

    // Store email in localStorage if "Remember Email" is checked
    if (isChecked) {
      localStorage.setItem('email', email.value);
    } else {
      localStorage.removeItem('email');
    }

    // Trigger the login mutation
    loginMutation(loginFormValue);
  };

  // Blur handler for field validation on losing focus
  const handleBlur = (e, validation, input) => {
    // Validate the input field based on the provided validation rules
    const validateObj = validators(validation, input);
    const prevState = { ...error };

    if (validateObj && validateObj.error) {
      setError({
        ...prevState,
        [e.target.id]: validateObj, // Add error message for the specific input field
      });
    } else {
      setError({
        ...prevState,
        [e.target.id]: {
          error: false,
          message: '',
        }, // Reset error state if validation passes
      });
    }
  };

  // Function to disable the submit button if form fields are invalid
  const submitDisabled = () => {
    const errorKeys = Object.keys(error);
    if (!email.value || !password.value) {
      return true; // Disable submit if email or password is empty
    }

    let errorExists = false;
    errorKeys.forEach((key) => {
      if (error[key].error) {
        errorExists = true; // Disable submit if there are any validation errors
      }
    });
    return errorExists;
  };

  return (
    <Container component="main" maxWidth="xs" className="loginContainer">
      {/* Show loader if password check or login is in progress */}
      {(isPasswordCheck || islogin) && <Loader open={isPasswordCheck || islogin} />}
      <CssBaseline />
      <Card variant="outlined">
        <CardContent>
          <div className="loginPaper">
            {/* Logo image for the login page */}
            <img src={logo} className="loginLogo" alt="Company logo" />
            {/* Login heading */}
            <Typography component="h1" variant="h5">Sign in</Typography>
            <form className="loginForm" noValidate onSubmit={handleSubmit}>
              {/* Email input field */}
              <TextField
                className="loginTextField notranslate"
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label={<span className="translate">Email</span>}
                name="email"
                autoComplete="email"
                error={isLoginError || (error.email && error.email.error)} // Show error if login failed or validation failed
                helperText={error && error.email ? error.email.message : ''} // Show error message if validation fails
                onBlur={(e) => handleBlur(e, 'required', email)} // Trigger validation on blur
                {...email.bind} // Bind the input to the email hook
              />
              {/* Password input field */}
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'} // Toggle between password and text field
                id="password"
                autoComplete="current-password"
                error={isLoginError || (error.password && error.password.error)} // Show error if login failed or validation failed
                helperText={error && error.password ? error.password.message : ''} // Show error message if validation fails
                className="loginTextField"
                onBlur={(e) => handleBlur(e, 'required', password)} // Trigger validation on blur
                {...password.bind} // Bind the input to the password hook
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {/* Password visibility toggle button */}
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()} // Prevent default behavior on mouse down
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {/* Error message for incorrect email/password */}
              {isLoginError && (
                <Typography className="loginErrorText">
                  Incorrect email or password. Try again!
                </Typography>
              )}
              {/* Submit button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                style={{ marginTop: 8, marginBottom: 16 }}
                disabled={isPasswordCheck || islogin || submitDisabled()} // Disable button if loading or validation fails
              >
                Sign in
              </Button>
              <Grid container alignItems="center">
                <Grid item xs={7}>
                  {/* Remember email checkbox */}
                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={isChecked}
                        onChange={() => setChecked(!isChecked)} // Toggle the checkbox state
                        color="primary"
                      />
                    )}
                    label="Remember Email"
                  />
                </Grid>
                <Grid item xs={5} style={{ textAlign: 'end' }}>
                  {/* Forgot password link */}
                  <Link
                    to={routes.RESET_PASSWORD}
                    variant="body2"
                    color="primary"
                  >
                    Forgot Password?
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
        </CardContent>
      </Card>
      {/* Footer with copyright information */}
      <Copyright />
    </Container>
  );
};

export default Login;
