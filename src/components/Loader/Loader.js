import React from 'react';
// Import Material UI components for UI structure and visual feedback
import {
  Backdrop,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import './LoaderStyles.css'; // Import custom styles for the loader

/**
 * Loader Component
 *
 * A full-screen loading spinner with an optional label message.
 * Commonly used during data fetching or page transitions.
 *
 * Props:
 * - open (boolean): Controls visibility of the loader.
 * - setOpen (function) [optional]: Not used in the current implementation but passed for potential control from parent.
 * - label (string): Optional loading text displayed below the spinner.
 */
const Loader = ({ open, setOpen, label }) => (
  <div>
    {/* Full-screen overlay that appears when 'open' is true */}
    <Backdrop className="loaderBackdrop" open={open}>
      {/* Spinning loader in the center of the screen */}
      <CircularProgress color="inherit" />
      {/* Absolute-positioned box that centers the label text over the spinner */}
      <Box
        top={-80} // Offset vertically above the spinner
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {/* Optional loading message shown below/near spinner */}
        <Typography variant="h6" color="inherit">
          {label}
        </Typography>
      </Box>
    </Backdrop>
  </div>
);

export default Loader;
