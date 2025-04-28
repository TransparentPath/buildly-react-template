import React from 'react';
// MUI components for layout, typography, cards, and buttons
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { routes } from '@routes/routesConstants'; // Route constants for navigation
import './ForbiddenStyles.css'; // Custom CSS styles for this component

/**
 * Forbidden Component - Renders a 403 Access Denied screen
 *
 * Props:
 * - history: Object from React Router used to programmatically navigate between routes
 */
const Forbidden = ({ history }) => (
  // Box provides spacing and layout. `mt={3}` gives margin-top, `textAlign="center"` centers content.
  <Box mt={3} textAlign="center">
    {/* Outlined card to display the 403 message */}
    <Card variant="outlined">
      <CardContent>
        {/* Main 403 heading */}
        <Typography className="forbiddenPageHeading" variant="h2">
          403
        </Typography>
        {/* Access denied message with a nested paragraph for details */}
        <Typography className="forbiddenPageHeading" variant="h5">
          Access Denied
          <p>You don't have permission to access this page</p>
        </Typography>
      </CardContent>
    </Card>
    {/* Button to navigate back to a known safe route: the Shipment page */}
    <Button
      type="button"
      variant="contained"
      color="primary"
      onClick={() => history.push(routes.SHIPMENT)} // Navigate to shipment route on click
      className="forbiddenBackButton"
    >
      Back To Shipment Page
    </Button>
  </Box>
);

export default Forbidden;
