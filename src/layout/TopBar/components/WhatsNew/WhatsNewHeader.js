/* eslint-disable no-undef */
// Disables the ESLint rule for "no-undef" to prevent warnings about the global `VERSION` variable.
// Make sure VERSION is defined globally or injected at build time.

import React from 'react'; // Import React to define a functional component using JSX.
import _ from 'lodash'; // Import lodash for utility functions (though it's unused here currently).
import { Grid, IconButton, Typography } from '@mui/material'; // Import Material UI components for layout, button, and text display.
import { Close as CloseIcon } from '@mui/icons-material'; // Import a close (X) icon from Material UI icons.
import '../../TopBarStyles.css'; // Import custom styles for the header component.

/**
 * WhatsNewHeader component displays a title bar for a "What's New" dialog or section.
 *
 * Props:
 * - closeIcon (boolean): whether to show the close (X) button.
 * - closeOnClick (function): handler function triggered when the close button is clicked.
 */
const WhatsNewHeader = ({ closeIcon, closeOnClick }) => (
  // Root Grid container that wraps the header content.
  <Grid container className="whatsNewTitleContainer">
    {closeIcon && (
      // Conditionally renders the close icon button if `closeIcon` prop is true.
      <Grid item xs={1}>
        <IconButton onClick={closeOnClick} className="whatsNewIcon">
          {/* Button with an 'X' icon for closing the dialog */}
          <CloseIcon fontSize="large" />
        </IconButton>
      </Grid>
    )}
    {/* Main title and version section */}
    <Grid item xs={closeIcon ? 11 : 12}>
      {/* Adjusts the width depending on whether the close icon is shown.
          - 11 columns if the close icon is shown (1 column reserved for it).
          - 12 columns (full width) if not. */}
      <Typography className="whatsNewTitle">What's New?</Typography>
      {/* Displays the main header title */}
      <Typography className="whatsNewSubTitle">
        Version
        {' '}
        {VERSION}
        {' '}
        Release
        {/* Displays the current version using a global variable `VERSION`.
            Spacing is preserved between the JSX expressions. */}
      </Typography>
    </Grid>
  </Grid>
);

export default WhatsNewHeader; // Exporting the component for use in other parts of the application.
