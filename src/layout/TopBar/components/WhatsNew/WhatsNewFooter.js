import React from 'react'; // Importing React to create a functional component using JSX.
import _ from 'lodash'; // Importing lodash, though it's not used in the current code. This may be for potential future use.
import { Button, Grid, Typography } from '@mui/material'; // Importing Material UI components for layout and styling.
import '../../TopBarStyles.css'; // Importing custom CSS for additional styling.

const WhatsNewFooter = ({ buttonClick }) => (
  // Functional component WhatsNewFooter that accepts a `buttonClick` prop function for the button click handler.
  <Grid container flexDirection="column" alignItems="center" justifyContent="center">
    {/* The Grid component is being used to create a flexible layout.
        - `container` makes this a flexbox container.
        - `flexDirection="column"` arranges the child components vertically.
        - `alignItems="center"` centers the children horizontally.
        - `justifyContent="center"` centers the children vertically. */}
    <Grid item xs={8}>
      {/* This Grid item is used to wrap the Typography component for the reference text.
          - `xs={8}` means it will take up 8 of the 12 available columns on small screen sizes. */}
      <Typography className="whatsNewDialogReferenceText">
        {/* Typography component is used to render styled text. */}
        To reference this page again, click on the 'Whats New?' section listed under the profile icon
      </Typography>
    </Grid>
    <Button
      type="submit" // This makes the button act like a form submit button, though there is no form in the code.
      variant="contained" // Applies the 'contained' style for a filled button.
      color="primary" // Uses the primary color from the MUI theme.
      className="whatsNewDialogButton" // Applies custom CSS class for additional styling.
      onClick={buttonClick} // This attaches the `buttonClick` function to the button's `onClick` event.
    >
      Return to Platform
    </Button>
  </Grid>
);

export default WhatsNewFooter; // Exporting the WhatsNewFooter component to be used elsewhere in the app.
