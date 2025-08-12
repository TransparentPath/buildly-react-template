import React, { useEffect, useState } from 'react';
import { Route, useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Tab,
  Tabs,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getUser } from '@context/User.context'; // Retrieve the current authenticated user
import { checkForGlobalAdmin } from '@utils/utilMethods'; // Check if the user is a global admin
import { routes } from '@routes/routesConstants'; // Routing constants for the application
import Users from './Users/Users'; // Users component for managing users
import UserGroups from './UserGroups/UserGroups'; // UserGroups component for managing user groups
import AddOrganization from './forms/AddOrganization'; // Form to add a new organization
import AddUser from './forms/AddUser'; // Form to add a new user
import AddResellers from './forms/AddResellers'; // Form to add or update resellers

/**
 * Main user management component that controls the display of users, user groups, and organization management features.
 * This component is responsible for managing the UI for adding users, adding organizations, viewing users and groups, etc.
 */
const UserManagement = () => {
  const history = useHistory(); // React Router's history for programmatic navigation
  const { t } = useTranslation();

  // Navigation sub-tabs for user management
  const subNav = [
    { label: t('userManagement.currentUsers'), value: 'current-users' },
    { label: t('userManagement.userGroups'), value: 'groups' },
  ];

  // Determine which view should be displayed based on the current path
  const viewPath = (
    subNav.find((item) => location.pathname.endsWith(item.value)) || subNav[0]
  ).value;

  const [view, setView] = useState(viewPath); // State to manage the current active view (either 'current-users' or 'groups')

  // State variables to manage the visibility of the modal dialogs for adding items
  const [showAddOrganization, setShowAddOrganization] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddResellers, setShowAddResellers] = useState(false);

  const user = getUser(); // Retrieve the current authenticated user
  let isSuperAdmin = false; // Flag to determine if the user is a super admin

  // Effect hook to update the URL path when the view changes
  useEffect(() => {
    // Push the new route for the selected view into the history
    history.push(`/app/profile/users/${view || location.state}`);
  }, [view]); // This will run whenever the 'view' state changes

  /**
   * Handler function that updates the 'view' state when a tab is clicked.
   */
  const viewTabClicked = (event, newView) => {
    setView(newView); // Update the 'view' state when a new tab is selected
  };

  // Check if the current user is a global admin by using a utility function
  if (user) {
    isSuperAdmin = checkForGlobalAdmin(user); // Determine if the user is a super admin
  }

  return (
    <Box mt={5} mb={3}>
      {/* Show the "Add Organization" button only if the user is a super admin */}
      {isSuperAdmin && (
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={() => setShowAddOrganization(true)} // Open the Add Organization form when clicked
        >
          {t('userManagement.addOrganization')}
        </Button>
      )}

      {/* Show the "Add User" button, regardless of the user's role */}
      <Button
        type="button"
        variant="contained"
        color="primary"
        onClick={() => setShowAddUser(true)} // Open the Add User form when clicked
        style={{ marginLeft: isSuperAdmin ? '20px' : '0px' }} // Adjust the margin if the user is a super admin
      >
        {t('userManagement.addUsers')}
      </Button>

      {/* Show the "Create/Update Reseller Org." button only if the user is a super admin */}
      {isSuperAdmin && (
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={() => setShowAddResellers(true)} // Open the Add Resellers form when clicked
          style={{ marginLeft: '20px' }}
        >
          {t('userManagement.addResellerOrg')}
        </Button>
      )}

      {/* Tabs for navigation between different views (Current users, User groups) */}
      <Box mb={3} mt={2}>
        <Tabs value={view} onChange={viewTabClicked}>
          {subNav.map((itemProps, index) => (
            // Create a Tab for each sub-navigation item
            <Tab {...itemProps} key={`tab${index}:${itemProps.value}`} />
          ))}
        </Tabs>
      </Box>

      {/* Routes for different views */}
      {/* Route for displaying the users list */}
      <Route path={routes.CURRENT_USERS} component={Users} />
      {/* Route for displaying the user groups */}
      <Route path={routes.USER_GROUPS} component={UserGroups} />

      {/* Modal forms for adding different entities */}
      {/* Add Organization form */}
      <AddOrganization open={showAddOrganization} setOpen={setShowAddOrganization} />
      {/* Add User form */}
      <AddUser open={showAddUser} setOpen={setShowAddUser} />
      {/* Create/Update Resellers form */}
      <AddResellers open={showAddResellers} setOpen={setShowAddResellers} />
    </Box>
  );
};

export default UserManagement;
