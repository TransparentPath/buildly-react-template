import React from 'react';
import {
  Button,
  Grid,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import './PrivacyPolicyStyles.css';
import { routes } from '../../routes/routesConstants';

const PrivacyPolicy = ({ history }) => (
  <Grid container spacing={2} className="privacyPolicyAgreementContainer">
    <Grid item xs={12} textAlign="center">
      <Typography variant="h5">Privacy Policy</Typography>
    </Grid>
    <Grid item xs={12}>
      <Typography variant="body1" paragraph textAlign="justify">
        The Transparent Path website, application and proprietary software platform that tracks supply
        chains (the "Service") is owned and operated by Transparent Path spc ("Transparent Path") and
        made available to registered users who have an account to the Service.  This Privacy Policy
        describes:
      </Typography>
    </Grid>
    <Grid item xs={12}>
      <List
        sx={{
          listStyleType: 'disc',
          listStylePosition: 'inside',
        }}
      >
        <ListItem sx={{ display: 'list-item' }}>Why we collect personal information;</ListItem>
        <ListItem sx={{ display: 'list-item' }}>What personal information we collect and when it is collected;</ListItem>
        <ListItem sx={{ display: 'list-item' }}>How your information is used and protected;</ListItem>
        <ListItem sx={{ display: 'list-item' }}>When and with whom your information is shared; and</ListItem>
        <ListItem sx={{ display: 'list-item' }}>Your choices regarding your personal information.</ListItem>
      </List>
    </Grid>
    <Grid item xs={12}>
      <Typography variant="body1" paragraph textAlign="justify">
        We encourage you to read this Privacy Policy and our
        {' '}
        <Button onClick={() => history.push(routes.ABOUT_PLATFORM)} class="privacyPolicyButton">
          End User Agreement
        </Button>
        {' '}
        carefully. Capitalized terms used but not defined in this Privacy Policy have the meaning
        given them in the End User Agreement.  We will post notices of all changes that materially
        affect the way in which your personally identifiable information may be used or shared in
        updates to our Privacy Policy.
      </Typography>
    </Grid>
    <Grid item xs={12}>
      <Typography variant="body1" paragraph textAlign="justify">
        This policy does not apply to other service providers, advertising systems, networks or websites
        that Transparent Path has a relationship with or of other companies or individuals that
        Transparent Path does not own, employ, manage or control.
      </Typography>
    </Grid>
    <Grid item xs={12}>
      <Typography variant="body1" paragraph textAlign="justify">
        If you have any questions about this Privacy Policy, please feel free to contact us through our
        Service or write to us at Transparent Path SPC, 1700 Westlake Ave N Suite 200, Seattle WA,
        98109.
      </Typography>
    </Grid>
    <Grid item xs={12}>
      <Typography className="privacyPolicyHeading">Information We Collect</Typography>
    </Grid>
    <Grid item xs={12}>
      <Typography variant="body1" paragraph textAlign="justify">
        The information we learn from users helps us not only provide the Service but also to
        personalize and continually improve each user's experience with the Service. Here are the types
        of information we gather:
      </Typography>
    </Grid>
    <Grid item xs={12}>
      <List
        sx={{
          listStyleType: 'upper-alpha',
          listStylePosition: 'inside',
          fontWeight: 700,
          marginLeft: 5,
        }}
      >
        <ListItem sx={{ display: 'list-item' }}>Information You Give Us</ListItem>
        <Grid item xs={12} ml={-5}>
          <Typography variant="body1" paragraph textAlign="justify">
            <span style={{ fontStyle: 'italic' }}>Company Information:</span>
            {' '}
            When you create an account on the Transparent Path platform, we may
            ask you for certain limited personally identifiable information such as your name, email address
            and phone number, which we will use to contact or identify you. Most of this information is
            recommended but not required to be shared with us and can be adjusted or limited depending
            upon your preferences. You can choose not to provide us with any or all of the information we
            specify or request, but then you may not be able to register with us or to take advantage of
            some or all of our features.
          </Typography>
        </Grid>
        <ListItem sx={{ display: 'list-item' }}>Automatic Information Collected</ListItem>
        <Grid item xs={12} ml={-5}>
          <Typography variant="body1" paragraph textAlign="justify">
            To perform the Service, we also collect information through cookies and other automated
            means. Information of this sort includes:
          </Typography>
        </Grid>
        <Grid item xs={12} ml={-5}>
          <Typography variant="body1" paragraph textAlign="justify">
            <span style={{ fontStyle: 'italic' }}>Technical information about your browser and mobile device:</span>
            {' '}
            This information is used in the
            aggregate to help us optimize the Service for common browsers and devices.
          </Typography>
        </Grid>
        <Grid item xs={12} ml={-5}>
          <Typography variant="body1" paragraph textAlign="justify">
            <span style={{ fontStyle: 'italic' }}>Usage information, such as the features and emails from Transparent Path that you interact with:</span>
            {' '}
            We collect and use this behavioral information and may use it in anonymized and
            aggregate forms to generate statistics about users and how the Services are being used and to
            facilitate targeted communications and advertisements, but the information is not shared in
            any form that could be used to identify you personally.  Please see "How we use and share the
            information we collect," below, for further information and choices about sharing information
            with third parties.
          </Typography>
        </Grid>
        <Grid item xs={12} ml={-5}>
          <Typography variant="body1" paragraph textAlign="justify">
            <span style={{ fontStyle: 'italic' }}>IP address and log file information, cookies, tokens and device identifiers:</span>
            {' '}
            These are
            alphanumeric identifiers that help us to distinguish between unique browsers and devices in
            order to avoid showing you the same information twice, keep you logged into Transparent
            Path, prevent duplicate actions, prevent duplicate coupon redemptions and improve your
            experience. The information we collect from cookies may include your IP address, browser and
            device characteristics, referring URLs, and a record of your interactions with our Service. Most
            Web browsers can be set to inform you when a cookie has been sent to you and provide you
            with the opportunity to refuse that cookie. We will respect your choices relating to on-line
            tracking, whether you choose to reject individual cookies or set your web browser to reject
            cookies and other tracking technology. However, refusing a cookie may, in some cases,
            preclude you from using, or negatively impact the display or function of, the Service or certain
            areas or features of the Service.
          </Typography>
        </Grid>
        <Grid item xs={12} ml={-5}>
          <Typography variant="body1" paragraph textAlign="justify">
            <span style={{ fontStyle: 'italic' }}>Crashes and error reports:</span>
            {' '}
            If you encounter a crash or error while using our Service, we may
            generate a crash report that includes technical, usage and, if you are logged in, your account
            information so that we can diagnose and potentially prevent the problem in the future.
          </Typography>
        </Grid>
      </List>
    </Grid>
    <Grid item xs={12}>
      <Typography className="privacyPolicyHeading">How We Use and Share the Information We Collect</Typography>
    </Grid>
    <Grid item xs={12}>
      <Typography className="privacyPolicyHeading">Use</Typography>
    </Grid>
    <Grid item xs={12}>
      <Typography variant="body1" paragraph textAlign="justify">
        We use the information we collect to establish and manage your account and provide the
        Service to you, including by identifying you on our platform and communicating with you.
      </Typography>
    </Grid>
    {/* <Link
          color="primary"
          href="mailto:support@transparentpath.com"
          sx={{
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          support@transparentpath.com
        </Link> */}
  </Grid>
);

export default PrivacyPolicy;
