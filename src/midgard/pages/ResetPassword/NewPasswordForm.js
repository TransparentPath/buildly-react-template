import React, { useState } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CircularProgress from "@material-ui/core/CircularProgress";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { useInput } from "../../hooks/useInput";
import {
  register,
  login,
  confirmResetPassword,
} from "../../redux/authuser/actions/authuser.actions";
import Grid from "@material-ui/core/Grid";
import { validators } from "../../utils/validators";
import logo from "../../../assets/tp-logo.png";
import { isMobile } from "../../utils/mediaQuery";
import { routes } from "../../routes/routesConstants";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(8),
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  logo: {
    width: "100%",
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  loadingWrapper: {
    margin: theme.spacing(1),
    position: "relative",
  },
}));

function NewPassword({ dispatch, loading, history, loaded, error }) {
  const classes = useStyles();
  const password = useInput("", { required: true });
  const re_password = useInput("", {
    required: true,
    confirm: true,
    matchField: password,
  });

  const [formError, setFormError] = useState({});

  /**
   * Submit the form to the backend and attempts to authenticate
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const registerFormValue = {
      new_password1: password.value,
      new_password2: re_password,
      uid: "",
      token: "",
    };
    dispatch(confirmResetPassword(registerFormValue, history));
  };

  /**
   * Handle input field blur event
   * @param {Event} e Event
   * @param {String} validation validation type if any
   * @param {Object} input input field
   */

  const handleBlur = (e, validation, input) => {
    let validateObj = validators(validation, input);
    let prevState = { ...formError };
    if (validateObj && validateObj.error)
      setFormError({
        ...prevState,
        [e.target.id]: validateObj,
      });
    else
      setFormError({
        ...prevState,
        [e.target.id]: {
          error: false,
          message: "",
        },
      });
  };

  const submitDisabled = () => {
    let errorKeys = Object.keys(formError);
    let errorExists = false;
    if (!password.value || !re_password.value) return true;
    errorKeys.forEach((key) => {
      if (formError[key].error) errorExists = true;
    });
    return errorExists;
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Card className={classes.root} variant="outlined">
        <CardContent>
          <div className={classes.paper}>
            <img src={logo} className={classes.logo} />
            <Typography component="h1" variant="h5">
              Reset your Password
            </Typography>
            <form className={classes.form} noValidate onSubmit={handleSubmit}>
              <Grid container spacing={isMobile() ? 0 : 2}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="New Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    error={formError.password && formError.password.error}
                    helperText={
                      formError.password ? formError.password.message : ""
                    }
                    onBlur={(e) => handleBlur(e, "required", password)}
                    {...password.bind}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="re_password"
                    label="Confirm Password"
                    name="re_password"
                    type="password"
                    autoComplete="re_password"
                    error={formError.re_password && formError.re_password.error}
                    helperText={
                      formError.re_password ? formError.re_password.message : ""
                    }
                    onBlur={(e) => handleBlur(e, "confirm", re_password)}
                    {...re_password.bind}
                  />
                </Grid>
              </Grid>
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
                <Grid item>
                  <Link href={routes.LOGIN} variant="body2" color="secondary">
                    {"Go Back To Login"}
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.authReducer,
});

export default connect(mapStateToProps)(NewPassword);
