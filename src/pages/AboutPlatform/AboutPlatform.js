import React from 'react';
import { Grid, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  version: {
    fontStyle: 'italic',
    textAlign: 'right',
    textDecoration: 'underline',
  },
}));

const AboutPlatform = () => {
  const classes = useStyles();
  // eslint-disable-next-line no-undef
  const ver = VERSION;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="caption" component="div" className={classes.version}>
          Platform Version:
          {' '}
          {ver}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h5" component="h5">
          Terms of use
        </Typography>
      </Grid>
    </Grid>
  );
};

export default AboutPlatform;
