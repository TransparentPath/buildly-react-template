import React from 'react';
import _ from 'lodash';
import { Grid, Typography } from '@mui/material';
import '../../TopBarStyles.css';
import { WHATS_NEW_MOCK } from '@utils/mock';

export default function WhatsNewContent() {
  const renderIcon = (iconName) => {
    // eslint-disable-next-line global-require
    const Icons = require('@mui/icons-material');
    const IconComponent = Icons[iconName];
    return <IconComponent className="whatsNewDialogItemIcon" />;
  };

  return (
    <>
      {
        WHATS_NEW_MOCK.new_update_details.map((item) => (
          <Grid key={item.id} container className="whatsNewDialogItemContainer">
            <Grid item xs={2}>
              {renderIcon(item.icon)}
            </Grid>
            <Grid item xs={10}>
              <Typography className="whatsNewDialogItemTitle">{item.title}</Typography>
              <Typography className="whatsNewDialogItemDesc">{item.desc}</Typography>
            </Grid>
          </Grid>
        ))
      }
    </>
  );
}
