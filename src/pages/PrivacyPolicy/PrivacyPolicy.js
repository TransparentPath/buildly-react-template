import React from 'react';
import { useTranslation } from 'react-i18next';
// Import MUI components used for layout, styling, and interactivity
import {
  Button,
  Grid,
  Link,
  List,
  ListItem,
  Typography,
} from '@mui/material';

// Import custom CSS for this component
import './PrivacyPolicyStyles.css';

// Import route constants for navigation
import { routes } from '../../routes/routesConstants';

// Functional component for rendering the Privacy Policy
const PrivacyPolicy = ({ history }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2} className="privacyPolicyAgreementContainer">
      {/* Title Header */}
      <Grid item xs={12} textAlign="center">
        <Typography variant="h5">{t('privacyPolicy.title')}</Typography>
      </Grid>

      {/* Introduction to the policy */}
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.intro')}</Typography>
      </Grid>

      {/* List of topics covered in the privacy policy */}
      <Grid item xs={12}>
        <List sx={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
          <ListItem sx={{ display: 'list-item' }}>{t('privacyPolicy.topics.why')}</ListItem>
          <ListItem sx={{ display: 'list-item' }}>{t('privacyPolicy.topics.what')}</ListItem>
          <ListItem sx={{ display: 'list-item' }}>{t('privacyPolicy.topics.how')}</ListItem>
          <ListItem sx={{ display: 'list-item' }}>{t('privacyPolicy.topics.when')}</ListItem>
          <ListItem sx={{ display: 'list-item' }}>{t('privacyPolicy.topics.choices')}</ListItem>
        </List>
      </Grid>

      {/* Encouragement to read the privacy and user agreement */}
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">
          {t('privacyPolicy.encourageRead1')}
          {' '}
          <Button
            onClick={() => history.push(routes.ABOUT_PLATFORM)}
            className="privacyPolicyButton"
          >
            {t('privacyPolicy.endUserAgreementBtn')}
          </Button>
          {' '}
          {t('privacyPolicy.encourageRead2')}
        </Typography>
      </Grid>

      {/* Third party and external data handling disclaimer */}
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.thirdPartyDisclaimer')}</Typography>
      </Grid>

      {/* Contact info for privacy concerns */}
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.contactInfo')}</Typography>
      </Grid>

      {/* Section header */}
      <Grid item xs={12}>
        <Typography className="privacyPolicyHeading">{t('privacyPolicy.infoWeCollectTitle')}</Typography>
      </Grid>

      {/* Explanation of why data is collected */}
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.infoWeCollectIntro')}</Typography>
      </Grid>

      {/* List of data types collected, split into subtypes */}
      <Grid item xs={12}>
        <List
          sx={{
            listStyleType: 'upper-alpha',
            listStylePosition: 'inside',
            fontWeight: 700,
            marginLeft: 5,
          }}
        >
          {/* User-provided info */}
          <ListItem sx={{ display: 'list-item' }}>{t('privacyPolicy.infoTypes.given')}</ListItem>
          <Grid item xs={12} ml={-5}>
            <Typography variant="body1" paragraph textAlign="justify">
              <span style={{ fontStyle: 'italic' }}>{t('privacyPolicy.infoTypes.companyInfoTitle')}</span>
              {' '}
              {t('privacyPolicy.infoTypes.companyInfoBody')}
            </Typography>
          </Grid>

          {/* Automatically collected info */}
          <ListItem sx={{ display: 'list-item' }}>{t('privacyPolicy.infoTypes.automatic')}</ListItem>
          <Grid item xs={12} ml={-5}>
            {/* Technical info about devices */}
            <Typography variant="body1" paragraph textAlign="justify">
              {t('privacyPolicy.infoTypes.automaticBody')}
            </Typography>
          </Grid>

          {/* Usage tracking */}
          <Grid item xs={12} ml={-5}>
            <Typography variant="body1" paragraph textAlign="justify">
              <span style={{ fontStyle: 'italic' }}>{t('privacyPolicy.infoTypes.techInfoTitle')}</span>
              {' '}
              {t('privacyPolicy.infoTypes.techInfoBody')}
            </Typography>
          </Grid>

          {/* Device identifiers and cookies */}
          <Grid item xs={12} ml={-5}>
            <Typography variant="body1" paragraph textAlign="justify">
              <span style={{ fontStyle: 'italic' }}>{t('privacyPolicy.infoTypes.usageInfoTitle')}</span>
              {' '}
              {t('privacyPolicy.infoTypes.usageInfoBody')}
            </Typography>
          </Grid>

          {/* Crash/error tracking */}
          <Grid item xs={12} ml={-5}>
            <Typography variant="body1" paragraph textAlign="justify">
              <span style={{ fontStyle: 'italic' }}>{t('privacyPolicy.infoTypes.ipTitle')}</span>
              {' '}
              {t('privacyPolicy.infoTypes.ipBody')}
            </Typography>
          </Grid>
          <Grid item xs={12} ml={-5}>
            <Typography variant="body1" paragraph textAlign="justify">
              <span style={{ fontStyle: 'italic' }}>{t('privacyPolicy.infoTypes.crashTitle')}</span>
              {' '}
              {t('privacyPolicy.infoTypes.crashBody')}
            </Typography>
          </Grid>
        </List>
      </Grid>

      {/* Usage of collected data */}
      <Grid item xs={12}>
        <Typography className="privacyPolicyHeading">{t('privacyPolicy.useShareTitle')}</Typography>
      </Grid>

      {/* Subsection: Use */}
      <Grid item xs={12}>
        <Typography className="privacyPolicyHeading">{t('privacyPolicy.useTitle')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.useBody')}</Typography>
      </Grid>

      {/* Subsection: Share */}
      <Grid item xs={12}>
        <Typography className="privacyPolicyHeading">{t('privacyPolicy.shareTitle')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.shareBody1')}</Typography>
      </Grid>

      {/* Additional sharing details with legal and corporate scenarios */}
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.shareBody2')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.shareBody3')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.shareBody4')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.shareBody5')}</Typography>
      </Grid>

      {/* Data security practices */}
      <Grid item xs={12}>
        <Typography className="privacyPolicyHeading">{t('privacyPolicy.storeProtectTitle')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.storeProtectBody1')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.storeProtectBody2')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.storeProtectBody3')}</Typography>
      </Grid>

      {/* User rights and preferences section */}
      <Grid item xs={12}>
        <Typography className="privacyPolicyHeading">{t('privacyPolicy.choicesTitle')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.choicesIntro')}</Typography>
      </Grid>

      {/* How users can contact to make these choices */}
      <Grid item xs={12}>
        <List sx={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
          <ListItem sx={{ display: 'list-item' }}>{t('privacyPolicy.choicesList.update')}</ListItem>
          <ListItem sx={{ display: 'list-item' }}>{t('privacyPolicy.choicesList.object')}</ListItem>
          <ListItem sx={{ display: 'list-item' }}>{t('privacyPolicy.choicesList.delete')}</ListItem>
          <ListItem sx={{ display: 'list-item' }}>{t('privacyPolicy.choicesList.portability')}</ListItem>
          <ListItem sx={{ display: 'list-item' }}>{t('privacyPolicy.choicesList.cancel')}</ListItem>
        </List>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.choicesNotify')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <List
          sx={{
            listStyleType: 'disc',
            listStylePosition: 'inside',
          }}
        >
          <ListItem sx={{ display: 'list-item' }}>{t('privacyPolicy.choicesNotifyList.unsubscribe')}</ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            {t('privacyPolicy.choicesNotifyList.email1')}
            {' '}
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
          </ListItem>
        </List>
      </Grid>

      {/* Retention policy */}
      <Grid item xs={12}>
        <Typography className="privacyPolicyHeading">{t('privacyPolicy.dataRetentionTitle')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.dataRetentionBody')}</Typography>
      </Grid>

      {/* Third-party and external site policy disclaimer */}
      <Grid item xs={12}>
        <Typography className="privacyPolicyHeading">{t('privacyPolicy.thirdPartyServicesTitle')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.thirdPartyServicesBody1')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.thirdPartyServicesBody2')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography className="privacyPolicyHeading">{t('privacyPolicy.childrenTitle')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.childrenBody')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography className="privacyPolicyHeading">{t('privacyPolicy.outsideUSTitle')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.outsideUSBody')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography className="privacyPolicyHeading">{t('privacyPolicy.changesTitle')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">{t('privacyPolicy.changesBody')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph textAlign="justify">
          {t('privacyPolicy.changesContact')}
          {' '}
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
          .
        </Typography>
      </Grid>
    </Grid>
  );
};

export default PrivacyPolicy;
