/* eslint-disable no-undef */
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Link,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import './AboutPlatformStyles.css';

/**
 * AboutPlatform Component
 *
 * This component renders information about the platform version, build date,
 * and displays the end user agreement text. It uses MUI components to maintain
 * a consistent UI structure.
 *
 * This is a static informational component typically found in an "About" or
 * "Legal" section of the application.
 */
const AboutPlatform = () => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      {/* Displays the platform version from global constant VERSION */}
      <Grid item xs={12}>
        <Typography variant="caption" component="span" className="aboutPlatformVersion">
          {t('aboutPlatform.platformVersion')}
          {': '}
          {VERSION}
        </Typography>
      </Grid>
      {/* Displays the build date from global constant BUILDDATE */}
      <Grid item xs={12}>
        <Typography variant="caption" component="span" className="aboutPlatformVersion">
          {t('aboutPlatform.buildDate')}
          {': '}
          {BUILDDATE}
        </Typography>
      </Grid>
      <Grid container spacing={2} className="aboutPlatformAgreementContainer">
        <Grid item xs={12} textAlign="center">
          <Typography variant="h5">Transparent Path spc</Typography>
        </Grid>
        <Grid item xs={12} textAlign="center">
          <Typography variant="h5">{t('aboutPlatform.endUserAgreement')}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.intro')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.termsIntro')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.termsModification')}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">{t('aboutPlatform.userEligibilityTitle')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.userEligibilityBody')}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">{t('aboutPlatform.accessingServiceTitle')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.accessingServiceBody')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.accessingServiceBody2')}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">{t('aboutPlatform.guidelinesTitle')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.guidelinesBody')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <List
            sx={{
              listStyleType: 'lower-alpha',
              listStylePosition: 'inside',
            }}
          >
            <ListItem sx={{ display: 'list-item' }}>{t('aboutPlatform.guidelinesList1')}</ListItem>
            <ListItem sx={{ display: 'list-item' }}>{t('aboutPlatform.guidelinesList2')}</ListItem>
            <ListItem sx={{ display: 'list-item' }}>{t('aboutPlatform.guidelinesList3')}</ListItem>
          </List>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.guidelinesBody2')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.guidelinesBody3')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.guidelinesBody4')}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">{t('aboutPlatform.permittedUseTitle')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.permittedUseBody')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" paragraph>{t('aboutPlatform.permittedUseBody2')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <List
            sx={{
              listStyleType: 'disc',
              listStylePosition: 'inside',
            }}
          >
            <ListItem sx={{ display: 'list-item' }}>{t('aboutPlatform.permittedUseList1')}</ListItem>
            <ListItem sx={{ display: 'list-item' }}>{t('aboutPlatform.permittedUseList2')}</ListItem>
            <ListItem sx={{ display: 'list-item' }}>{t('aboutPlatform.permittedUseList3')}</ListItem>
            <ListItem sx={{ display: 'list-item' }}>{t('aboutPlatform.permittedUseList4')}</ListItem>
            <ListItem sx={{ display: 'list-item' }}>{t('aboutPlatform.permittedUseList5')}</ListItem>
            <ListItem sx={{ display: 'list-item' }}>{t('aboutPlatform.permittedUseList6')}</ListItem>
            <ListItem sx={{ display: 'list-item' }}>{t('aboutPlatform.permittedUseList7')}</ListItem>
            <ListItem sx={{ display: 'list-item' }}>{t('aboutPlatform.permittedUseList8')}</ListItem>
            <ListItem sx={{ display: 'list-item' }}>{t('aboutPlatform.permittedUseList9')}</ListItem>
            <ListItem sx={{ display: 'list-item' }}>{t('aboutPlatform.permittedUseList10')}</ListItem>
          </List>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.permittedUseBody3')}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">{t('aboutPlatform.ipTitle')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.ipBody1')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.ipBody2')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.ipBody3')}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">{t('aboutPlatform.thirdPartyTitle')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.thirdPartyBody')}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">{t('aboutPlatform.disclaimerTitle')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.disclaimerBody1')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.disclaimerBody2')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.disclaimerBody3')}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">{t('aboutPlatform.terminationTitle')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.terminationBody')}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">{t('aboutPlatform.jurisdictionTitle')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.terminationBody')}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">{t('aboutPlatform.jurisdictionTitle')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.jurisdictionBody1')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.jurisdictionBody2')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.jurisdictionBody3')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>{t('aboutPlatform.jurisdictionBody4')}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">{t('aboutPlatform.contactTitle')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>
            {t('aboutPlatform.contactBody1')}
            <Link
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
            </Link>
            {t('aboutPlatform.contactBody2')}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AboutPlatform;
