import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemText,
  Divider,
} from '@mui/material';

import { withStyles } from '@mui/styles';

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
    padding: theme.spacing(2),
    textAlign: 'center',
  },
}))(MenuItem);

const AdminMenu = ({
  settingEl,
  setSettingEl,
  handleUserManagementClick,
  handleAdminPanelClick,
}) => {
  const handleClose = () => {
    setSettingEl(null);
  };

  return (
    <StyledMenu
      id="customized-admin"
      anchorEl={settingEl}
      keepMounted
      open={!!settingEl}
      onClose={handleClose}
    >
      <StyledMenuItem onClick={handleAdminPanelClick}>
        <ListItemText primary="Admin Panel" />
      </StyledMenuItem>
      <Divider />
      <StyledMenuItem onClick={handleUserManagementClick}>
        <ListItemText primary="User Management" />
      </StyledMenuItem>
    </StyledMenu>
  );
};

export default AdminMenu;
