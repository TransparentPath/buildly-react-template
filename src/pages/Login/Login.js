import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Box,
  Card,
  CircularProgress,
  CardContent,
  Typography,
  makeStyles,
  Container,
} from '@material-ui/core';
import { useInput } from '@hooks/useInput';
import {
  login,
  resetPasswordCheck,
} from '@redux/authuser/actions/authuser.actions';
import { validators } from '@utils/validators';
import logo from '@assets/tp-logo.png';
import { routes } from '@routes/routesConstants';
import Copyright from '@components/Copyright/Copyright';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(8),
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  logo: {
    maxWidth: '20rem',
    width: '100%',
    marginBottom: theme.spacing(3),
  },
  textField: {
    minHeight: '5rem',
    margin: theme.spacing(1, 0),
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  loadingWrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
}));

const Login = ({ dispatch, loading, history }) => {
  const classes = useStyles();
  const username = useInput('', { required: true });
  const password = useInput('', { required: true });
  const [error, setError] = useState({});

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
      dispatch(resetPasswordCheck(resetCheckValues, history));
    }
  }, []);

  /**
   * Submit the form to the backend and attempts to authenticate
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const loginFormValue = {
      username: username.value,
      password: password.value,
    };
    dispatch(login(loginFormValue, history));
  };

  /**
   * Handle input field blur event
   * @param {Event} e Event
   * @param {String} validation validation type if any
   * @param {Object} input input field
   */

  const handleBlur = (e, validation, input) => {
    const validateObj = validators(validation, input);
    const prevState = { ...error };
    if (validateObj && validateObj.error) {
      setError({
        ...prevState,
        [e.target.id]: validateObj,
      });
    } else {
      setError({
        ...prevState,
        [e.target.id]: {
          error: false,
          message: '',
        },
      });
    }
  };

  const submitDisabled = () => {
    const errorKeys = Object.keys(error);
    if (!username.value || !password.value) {
      return true;
    }
    let errorExists = false;
    errorKeys.forEach((key) => {
      if (error[key].error) {
        errorExists = true;
      }
    });
    return errorExists;
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      className={classes.container}
    >
      <CssBaseline />
      <Card variant="outlined">
        <CardContent>
          <div className={classes.paper}>
            <img
              src={logo}
              className={classes.logo}
              alt="Company logo"
            />
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <form
              className={classes.form}
              noValidate
              onSubmit={handleSubmit}
            >
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                error={error.username && error.username.error}
                helperText={
                  error && error.username
                    ? error.username.message
                    : ''
                }
                className={classes.textField}
                onBlur={(e) => handleBlur(e, 'required', username)}
                {...username.bind}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                error={error.password && error.password.error}
                helperText={
                  error && error.password
                    ? error.password.message
                    : ''
                }
                className={classes.textField}
                onBlur={(e) => handleBlur(e, 'required', password)}
                {...password.bind}
              />
              <div className={classes.loadingWrapper}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={loading || submitDisabled()}
                >
                  Sign in
                </Button>
                {loading && (
                  <CircularProgress
                    size={24}
                    className={classes.buttonProgress}
                  />
                )}
              </div>
              <Grid container>
                <Grid item xs>
                  <Link
                    href={routes.RESET_PASSWORD}
                    variant="body2"
                    color="secondary"
                  >
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    href={routes.REGISTER}
                    variant="body2"
                    color="secondary"
                  >
                    Don't have an account? Register
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
        </CardContent>
      </Card>
      <Box mt={8} mb={1}>
        <Copyright />
      </Box>
    </Container>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.authReducer,
});

export default connect(mapStateToProps)(Login);
