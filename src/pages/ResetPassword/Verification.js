import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Grid,
  Typography,
} from '@mui/material';

import './ResetPasswordStyles.css';
import logo from '@assets/tp-logo.png'; // Company logo
import Copyright from '@components/Copyright/Copyright'; // Footer copyright
import Loader from '@components/Loader/Loader'; // Loader shown during network operations
import useAlert from '@hooks/useAlert'; // Custom hook to trigger alert messages
import { useResetPasswordMutation } from '@react-query/mutations/authUser/resetPasswordMutation'; // API mutation hook for requesting password reset
import { routes } from '@routes/routesConstants'; // Centralized route constants

// Component to show email verification status and handle resending password reset emails
const Verification = ({ location }) => {
  // Disable resend button initially
  const [isDisabled, setIsDisabled] = useState(true);

  // Countdown in seconds (5 minutes)
  const [countdown, setCountdown] = useState(300);

  // Max attempts allowed to resend the verification email
  const [attempts, setAttempts] = useState(3);

  const { displayAlert } = useAlert(); // Destructure method to display alert

  // Mutation hook to resend reset password email
  const { mutate: resetPasswordMutation, isLoading: isResetPassword } = useResetPasswordMutation(displayAlert);

  // Side effect to handle countdown timer when button is disabled
  useEffect(() => {
    if (isDisabled && attempts > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 0) {
            clearInterval(timer);
            setIsDisabled(false); // Enable the button after timeout
            return 0;
          }
          return prevCountdown - 1; // Decrease timer every second
        });
      }, 1000);

      // Cleanup timer when component unmounts or re-renders
      return () => clearInterval(timer);
    }
    return null;
  }, [isDisabled]);

  // Handles resending the verification email
  const handleResendVerification = () => {
    const loginFormValue = {
      email: location.state.email, // Email passed via route location state
    };

    resetPasswordMutation(loginFormValue); // Call the API to resend the email

    // Decrease allowed attempts and restart the countdown
    if (attempts > 0) {
      setAttempts(attempts - 1);
    }
    setIsDisabled(true); // Disable button again
    setCountdown(300); // Reset timer to 5 minutes

    // Safety timeout in case timer is not cleared correctly
    setTimeout(() => {
      setIsDisabled(false);
    }, 300000);
  };

  // Helper function to format seconds into MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Container component="main" maxWidth="xs" className="verificationContainer">
      {/* Show loader if mutation is in progress */}
      {isResetPassword && <Loader open={isResetPassword} />}
      <CssBaseline />

      <Card variant="outlined">
        <CardContent>
          <div className="verificationPaper">
            {/* Logo */}
            <img src={logo} className="resetPasswordLogo" alt="Company logo" />

            {/* Title */}
            <Typography component="h1" variant="h5" gutterBottom textAlign="center">
              Email Sent Successfully
            </Typography>

            {/* Description */}
            <Typography variant="body" gutterBottom textAlign="center">
              An email has been sent for verification. Click on the link in the email to change
              your 'Password'. If no email was received, check your junk/spam mail and add
              'alerts@transparentpath.com' to your safe sender list (check with your email provider
              on the proper method to enable this).
            </Typography>

            {/* Resend Email Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className="verificationButton"
              onClick={handleResendVerification}
              disabled={isDisabled || attempts <= 0}
            >
              Resend Verification Email
            </Button>

            {/* Remaining attempts and countdown timer */}
            <Grid container>
              <Grid item xs={11}>
                <Typography variant="body" fontSize={11} textAlign="left">
                  Total Attempts Remaining:
                  {' '}
                  {attempts}
                </Typography>
              </Grid>
              <Grid item xs={1}>
                {isDisabled && attempts > 0 && (
                  <Typography variant="body" fontSize={11} textAlign="right">
                    {formatTime(countdown)}
                  </Typography>
                )}
              </Grid>
            </Grid>

            {/* Link to go back to login page */}
            <Grid container mt={1}>
              <Grid item xs>
                <Link to={routes.LOGIN} variant="body2" color="primary">
                  Go back to Sign in
                </Link>
              </Grid>
            </Grid>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Copyright />
    </Container>
  );
};

export default Verification;
