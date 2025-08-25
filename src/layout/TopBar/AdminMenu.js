import React from 'react';
// Importing necessary Material-UI components for creating the menu
import {
  Menu,
  MenuItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
// Importing custom styles for the component
import './TopBarStyles.css';

// AdminMenu component, used to display a menu with admin-related options (Admin Panel, User Management)
const AdminMenu = ({
  settingEl, // The anchor element for the menu, which determines where the menu is positioned
  setSettingEl, // A function used to set the anchor element (to close the menu)
  handleUserManagementClick, // Function to handle clicks on the "User Management" menu item
  handleAdminPanelClick, // Function to handle clicks on the "Admin Panel" menu item
}) => {
  const { t } = useTranslation();

  // handleClose function, used to close the menu when called (sets settingEl to null)
  const handleClose = () => {
    setSettingEl(null); // Reset the anchor element to null, which closes the menu
  };

  return (
    <Menu
      id="customized-admin" // A unique ID for the menu
      anchorEl={settingEl} // The anchor element where the menu will be positioned
      keepMounted // Ensures the menu remains mounted in the DOM even when it is not visible
      open={!!settingEl} // Checks if the menu should be open, if settingEl is not null, open is true
      onClose={handleClose} // A function to be called when the menu is closed
      elevation={0} // Removes the shadow for a flat menu
      anchorOrigin={{
        vertical: 'bottom', // The vertical alignment of the menu relative to the anchor element
        horizontal: 'right', // The horizontal alignment of the menu relative to the anchor element
      }}
      transformOrigin={{
        vertical: 'top', // The vertical origin for the menu transformation
        horizontal: 'right', // The horizontal origin for the menu transformation
      }}
    >
      {/* Admin Panel menu item */}
      <MenuItem onClick={handleAdminPanelClick} className="topbarAdminMenuRoot">
        {/* The text displayed for this menu item */}
        <ListItemText primary={t('adminMenu.adminPanel')} />
      </MenuItem>
      {/* Divider to separate menu items */}
      <Divider />
      {/* User Management menu item */}
      <MenuItem onClick={handleUserManagementClick} className="topbarAdminMenuRoot">
        {/* The text displayed for this menu item */}
        <ListItemText primary={t('adminMenu.userManagement')} />
      </MenuItem>
    </Menu>
  );
};

export default AdminMenu;
