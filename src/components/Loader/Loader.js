import React from 'react';
import {
  Backdrop,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import './LoaderStyles.css';

const Loader = ({ open, setOpen, label }) => (
  <div>
    <Backdrop className="loaderBackdrop" open={open}>
      <CircularProgress color="inherit" />
      <Box
        top={-80}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h6" color="inherit">
          {label}
        </Typography>
      </Box>
    </Backdrop>
  </div>
);

export default Loader;
