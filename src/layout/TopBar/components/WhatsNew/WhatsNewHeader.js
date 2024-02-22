import React from 'react';
import _ from 'lodash';
import { Grid, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import '../../TopBarStyles.css';
import { WHATS_NEW_MOCK } from '@utils/mock';

export default function WhatsNewHeader({ closeIcon, closeOnClick }) {
  return (
    <Grid container className="whatsNewTitleContainer">
      {closeIcon && (
        <Grid item xs={1}>
          <IconButton onClick={closeOnClick} className="whatsNewIcon">
            <CloseIcon fontSize="large" />
          </IconButton>
        </Grid>
      )}
      <Grid item xs={closeIcon ? 11 : 12}>
        <Typography className="whatsNewTitle">What's New?</Typography>
        <Typography className="whatsNewSubTitle">
          {`Version ${WHATS_NEW_MOCK.new_update_version} Release`}
        </Typography>
      </Grid>
    </Grid>
  );
}
