import React, { useContext } from 'react';
import { Link, Typography } from '@mui/material'; // MUI components for UI text and links
import { AppContext } from '@context/App.context'; // Custom app-wide context to access global properties (like the app title)

const Copyright = () => {
  // Access the `title` value from the global application context
  const { title } = useContext(AppContext);

  return (
    // Typography component used to render styled text
    <Typography variant="body2" align="center" mt={8} mb={1}>
      {/* Static text prefix */}
      {'Copyright © '}
      {/* Link to the application website (opens in a new tab) */}
      <Link
        className="notranslate" // Prevents browser from auto-translating the name
        color="primary" // Uses theme's primary color
        href="https://xparent.io/" // Target URL for the link
        target="_blank" // Opens link in a new browser tab
        sx={{
          textDecoration: 'none', // Removes underline by default
          '&:hover': {
            textDecoration: 'underline', // Adds underline on hover
          },
        }}
      >
        {/* Dynamically shows the app's title (e.g., company name) */}
        {title}
      </Link>
      {/* Displays the current year dynamically */}
      {` ${new Date().getFullYear()}.`}
    </Typography>
  );
};

export default Copyright;
