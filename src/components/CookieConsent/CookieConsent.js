import React from 'react';
import {
  Grid, Box, Button, Typography,
} from '@mui/material';
import { useStore } from '../../zustand/cookie/cookieStore';

function CookieConsent() {
  const { setCookie } = useStore();

  const acceptCookie = () => {
    setCookie('accepted');
    sessionStorage.setItem(
      'cookie',
      'accepted',
    );
  };

  const rejectCookie = () => {
    setCookie('rejected');
    sessionStorage.setItem(
      'cookie',
      'rejected',
    );
  };

  return (
    <Grid
      container
      position="sticky"
      bottom={0}
      left={0}
      zIndex={9999}
      padding={5}
      alignItems="center"
      boxShadow="0px -1px 10px #ddd"
      bgcolor="white"
    >
      <Grid flexDirection="column" mr={5} flex={1} justifyContent="center">
        <Typography variant="body1" fontWeight={700} fontSize={18} pb={2}>
          We value your privacy
        </Typography>
        <Typography variant="body1">
          We use cookies to improve your experience on our website. We may store and/or access information
          on a device and process personal data. Additionally, we may utilize precise geolocation data and
          identification. Please note that your consent will be valid across all our subdomains. We respect
          your choices and are committed to providing you with a transparent and secure browsing experience.
        </Typography>
      </Grid>
      <Button variant="outlined" color="primary" onClick={rejectCookie}>
        Decline
      </Button>
      <Box pl={2} />
      <Button variant="contained" color="primary" onClick={acceptCookie}>
        Accept
      </Button>
    </Grid>
  );
}

export default CookieConsent;