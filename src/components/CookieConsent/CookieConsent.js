import React, { useState, useEffect } from 'react';
import _ from 'lodash'; // Utility library for deep checks and object handling
import moment from 'moment-timezone'; // Library for date/time manipulation with timezone support
import { Grid, Typography, Button } from '@mui/material'; // MUI components for layout and UI
import { useHistory } from 'react-router-dom'; // React Router hook for programmatic navigation
import Loader from '@components/Loader/Loader'; // Loader component to indicate async operations
import { getUser } from '@context/User.context'; // Function to retrieve current user info (likely from context)
import { useUpdateUserMutation } from '@react-query/mutations/authUser/updateUserMutation'; // React Query mutation hook to update user details (e.g. GDPR acceptance)
import useAlert from '@hooks/useAlert'; // Custom hook to show alert messages
import { routes } from '@routes/routesConstants'; // Predefined route constants used throughout the app
import './CookieConsentStyles.css'; // Custom styles for this component

const CookieConsent = () => {
  const history = useHistory(); // Used for navigating to privacy policy
  const user = getUser(); // Get current logged-in user object
  const [visible, setVisible] = useState(false); // State to toggle visibility of the cookie banner

  const { displayAlert } = useAlert(); // Alert function to show success/error messages

  /**
   * useEffect runs once user info is available.
   * It determines whether the GDPR consent banner should be shown based on:
   * - If the `last_gdpr_shown` exists and is older than a year
   * - If it's missing, we show the banner
   */
  useEffect(() => {
    if (user) {
      if (!_.isEmpty(user.last_gdpr_shown)) {
        const nextGdprShown = moment(user.last_gdpr_shown).add(1, 'year');
        if (moment().unix() > nextGdprShown.unix()) {
          // Show banner if last shown date is older than a year
          setVisible(true);
        } else {
          // Otherwise hide it
          setVisible(false);
        }
      } else {
        // Show banner if `last_gdpr_shown` is empty
        setVisible(true);
      }
    } else {
      // Show banner if user data isn't loaded yet
      setVisible(true);
    }
  }, [user]);

  // React Query mutation for updating user data
  const { mutate: updateUserMutation, isLoading: isUpdateUser } = useUpdateUserMutation(history, displayAlert, 'Cookie consent');

  /**
   * Handle user consent by submitting an update to their profile.
   * It updates the `last_gdpr_shown` date to current time in user's timezone.
   */
  const handleSubmit = () => {
    const data = {
      id: user.id,
      organization_uuid: user.organization.organization_uuid,
      organization_name: user.organization.name,
      last_gdpr_shown: moment().tz(user.user_timezone).toISOString(),
    };
    updateUserMutation(data); // Trigger the mutation to update the backend
  };

  return (
    <>
      {visible ? (
        <Grid container className="cookieConsentContainer">
          {/* Show loader while the update mutation is running */}
          {isUpdateUser && <Loader open={isUpdateUser} />}
          {/* Header Text */}
          <Grid item xs={12}>
            <Typography variant="h6">We value your privacy</Typography>
          </Grid>
          {/* Main GDPR Explanation */}
          <Grid item xs={12}>
            <Typography variant="body1" paragraph>
              We use necessary cookies to make our site work and improve your experience on our website.
              Necessary cookies enable core functionality such as security, network management, and
              accessibility. We may store and/or access information on a device and process personal
              data. Additionally, we may utilize precise geolocation data and identification. You may
              disable these by changing your browser settings, but this may affect how the website
              functions.
            </Typography>
          </Grid>
          {/* Privacy Policy Link */}
          <Grid item xs={12}>
            <Typography variant="body1" paragraph>
              For more information about the cookies we collect, see our
              {' '}
              <Button className="cookieButton" onClick={() => history.push(routes.PRIVACY_POLICY)}>
                Privacy Policy
              </Button>
              .
            </Typography>
          </Grid>
          {/* Accept Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => handleSubmit()}
          >
            Accept
          </Button>
          {/* Decline Button (currently behaves the same as accept — can be enhanced later) */}
          <Button
            type="submit"
            variant="outlined"
            color="primary"
            onClick={() => handleSubmit()}
            style={{ marginLeft: 16 }}
          >
            Decline
          </Button>
        </Grid>
      ) : null}
    </>
  );
};

export default CookieConsent;
