import React from 'react';
// Importing necessary Material-UI components for building the menu
import {
  Menu,
  MenuItem,
  ListItemText,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
// Importing custom styles for the component
import './TopBarStyles.css';

// AccountMenu component: This component renders a dropdown menu with user-related options (Account Settings, What's New, About Platform, Privacy Policy, Logout)
const AccountMenu = ({
  anchorEl, // The element that anchors the menu, determining its position
  setAnchorEl, // A function to set the anchor element to null, which closes the menu
  user, // The user object containing details like first name, last name, and email
  handleLogoutClick, // Function to handle clicking on the "Logout" menu item
  handleAccountSettingsClick, // Function to handle clicking on the "Account & Settings" menu item
  handleWhatsNewClick, // Function to handle clicking on the "What's New?" menu item
  handleAboutClick, // Function to handle clicking on the "About Platform" menu item
  handlePrivacyClick, // Function to handle clicking on the "Privacy Policy" menu item
  organizationName, // The name of the organization the user works at
}) => {
  const { t } = useTranslation();

  // handleClose function: This is used to close the menu by setting the anchor element to null
  const handleClose = () => {
    setAnchorEl(null); // Close the menu by resetting the anchor element
  };

  return (
    <div>
      {/* The Menu component from Material-UI is used to display the dropdown menu */}
      <Menu
        id="customized-menu" // A unique ID for the menu
        anchorEl={anchorEl} // The anchor element that positions the menu
        keepMounted // Keeps the menu mounted even when it's not visible (for better performance)
        open={!!anchorEl} // The menu is open if the anchorEl is not null
        onClose={handleClose} // Closes the menu when it loses focus or the close event is triggered
        elevation={0} // Flat menu with no shadow
        anchorOrigin={{
          vertical: 'bottom', // Positions the menu below the anchor element
          horizontal: 'left', // Aligns the menu to the left of the anchor element
        }}
        transformOrigin={{
          vertical: 'top', // The top of the menu will align with the anchor element
          horizontal: 'left', // The left of the menu will align with the left of the anchor element
        }}
      >
        {/* User information section */}
        <Box
          mb={2} // Margin-bottom
          p={2} // Padding inside the box
          justifyContent="center" // Centers the content inside the Box horizontally
          textAlign="center" // Centers the text inside the Box
        >
          {/* Display user's full name (first and last) */}
          <Typography variant="h6">
            {/* Display user's full name if user data is available */}
            {user && `${user.first_name} ${user.last_name}`}
          </Typography>
          {/* Display user's email */}
          <Typography variant="body2">
            {/* Display user's email if user data is available */}
            {user && `${user.email}`}
          </Typography>
          {/* Display organization name if available */}
          {organizationName && (
            <Typography variant="body1">
              {`${t('accountMenu.worksAt')} ${organizationName}`}
            </Typography>
          )}
        </Box>
        {/* Divider to separate user info from menu items */}
        <Divider />
        {/* MenuItem for "Account & Settings" */}
        <MenuItem onClick={handleAccountSettingsClick} className="topbarAdminMenuRoot">
          {/* Text for the menu item */}
          <ListItemText primary={t('accountMenu.accountSettings')} />
        </MenuItem>
        {/* Divider between menu items */}
        <Divider />
        {/* MenuItem for "What's New?" */}
        <MenuItem onClick={handleWhatsNewClick} className="topbarAdminMenuRoot">
          {/* Text for the menu item */}
          <ListItemText primary={t('accountMenu.whatsNew')} />
        </MenuItem>
        {/* Divider between menu items */}
        <Divider />
        {/* MenuItem for "About Platform" */}
        <MenuItem onClick={handleAboutClick} className="topbarAdminMenuRoot">
          {/* Text for the menu item */}
          <ListItemText primary={t('accountMenu.aboutPlatform')} />
        </MenuItem>
        {/* Divider between menu items */}
        <Divider />
        {/* MenuItem for "Privacy Policy" */}
        <MenuItem onClick={handlePrivacyClick} className="topbarAdminMenuRoot">
          {/* Text for the menu item */}
          <ListItemText primary={t('accountMenu.privacyPolicy')} />
        </MenuItem>
        {/* Divider between menu items */}
        <Divider />
        {/* MenuItem for "Logout" */}
        <MenuItem onClick={handleLogoutClick} className="topbarAdminMenuRoot">
          {/* Text for the menu item */}
          <ListItemText primary={t('accountMenu.logout')} />
        </MenuItem>
      </Menu>
    </div>
  );
};

export default AccountMenu;
