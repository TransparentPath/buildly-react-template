import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Card,
  CircularProgress,
  CardContent,
  Typography,
  makeStyles,
  Container,
} from '@material-ui/core';
import logo from '@assets/tp-logo.png';
import { useInput } from '@hooks/useInput';
import {
  resetPassword,
} from '@redux/authuser/actions/authuser.actions';
import { routes } from '@routes/routesConstants';
import { validators } from '@utils/validators';

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
    marginTop: theme.spacing(1),
  },
  textField: {
    minHeight: '5rem',
    margin: theme.spacing(1, 0),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  logo: {
    maxWidth: '20rem',
    width: '100%',
    marginBottom: theme.spacing(3),
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

const EmailForm = ({ dispatch, loading }) => {
  const classes = useStyles();
  const email = useInput('', { required: true });
  const [error, setError] = useState({});

  /**
   * Submit the form to the backend and attempts to authenticate
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const loginFormValue = {
      email: email.value,
    };
    dispatch(resetPassword(loginFormValue));
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
    if (!email.value) {
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
            <Typography component="h1" variant="h5" gutterBottom>
              Enter your registered Email
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
                id="email"
                label="Registered email"
                name="email"
                autoComplete="email"
                className={classes.textField}
                error={error.email && error.email.error}
                helperText={
                  error && error.email
                    ? error.email.message
                    : ''
                }
                onBlur={(e) => handleBlur(e, 'email', email)}
                {...email.bind}
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
                  Submit
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
                    href={routes.LOGIN}
                    variant="body2"
                    color="secondary"
                  >
                    Go back to Sign in
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.authReducer,
});

export default connect(mapStateToProps)(EmailForm);
