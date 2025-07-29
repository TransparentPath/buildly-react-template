import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import {
  Box,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import Forbidden from '@components/Forbidden/Forbidden'; // Component shown when the user doesn't have permission
import { getUser } from '@context/User.context'; // To fetch the current logged-in user
import { routes } from '@routes/routesConstants'; // Predefined routes for the app
import { checkForAdmin, checkForGlobalAdmin } from '@utils/utilMethods'; // Helper functions to check user roles
import Configuration from './Configuration/Configuration'; // Configuration page for device management
// import ImportExport from './ImportExport/ImportExport'; // Import/export functionality (currently commented out)
import ConsortiumSettings from './Consortium/ConsortiumSettings'; // Consortium settings page
import TrackerSettings from './Trackers/TrackerSettings'; // Tracker settings page
import TrackerOrder from './TrackerOrder/TrackerOrder'; // Order trackers page
import Invoices from './Invoices/Invoices'; // Invoices page
import './AdminPanelStyles.css'; // Custom styles for the admin panel

// Main AdminPanel component that controls the admin interface and user navigation
const AdminPanel = ({
  history, location, organizationData,
}) => {
  // Check if the current user is an admin or global admin
  const isAdmin = checkForAdmin(getUser()) || checkForGlobalAdmin(getUser());
  const superAdmin = checkForGlobalAdmin(getUser()); // Specifically checks if the user is a super admin

  // Define the navigation items (tabs) in the admin panel
  let subNav = [
    { label: 'Configuration', value: 'configuration' },
  ];

  // If the user is a super admin, show additional tabs
  if (superAdmin) {
    subNav = [
      ...subNav,
      { label: 'Consortium', value: 'consortium' },
      { label: 'Trackers', value: 'trackers' },
      { label: 'Order More Trackers', value: 'orders' },
      { label: 'Invoices', value: 'invoices' },
    ];
  }

  // Determine the current view based on the URL path or default to the first tab
  const viewPath = (_.find(
    subNav,
    (item) => _.endsWith(location.pathname, item.value), // Match the path with tab value
  ) || subNav[0]).value;

  // State to track the currently selected view (tab)
  const [view, setView] = useState(viewPath);

  // This effect is triggered whenever the selected view changes. It updates the URL to reflect the active tab.
  useEffect(() => {
    history.push(`${routes.ADMIN_PANEL}/${view || location.state}`);
  }, [view]);

  // Function to handle tab clicks and set the new selected view
  const viewTabClicked = (event, newView) => {
    setView(newView); // Update the selected view
  };

  return (
    <Box mt={5} mb={5}>
      {/* Check if the user is an admin before rendering the admin panel */}
      {isAdmin && (
        <Box mt={5} mb={5}>
          {/* Title of the admin panel */}
          <Box mb={3}>
            <Typography className="adminPanelHeading" variant="h4">
              Admin Panel
            </Typography>
          </Box>

          {/* Tabs for navigation between different admin sections */}
          <Box mb={3}>
            <Tabs value={view} onChange={viewTabClicked}>
              {/* Dynamically generate tabs based on subNav array */}
              {_.map(subNav, (itemProps, index) => (
                <Tab
                  {...itemProps} // Spread tab props (label, value)
                  key={`tab${index}:${itemProps.value}`} // Unique key for each tab
                />
              ))}
            </Tabs>
          </Box>

          {/* Define routes to render specific components based on selected tab */}
          <Route path={routes.CONFIGURATION} component={Configuration} />
          {/* Uncomment and enable the import-export route if it's needed */}
          {/* {organizationData && organizationData.allow_import_export && (
            <Route
              path={routes.IMPORT_EXPORT}
              component={ImportExport}
            />
          )} */}
          <Route path={routes.CONSORTIUM} component={ConsortiumSettings} />
          <Route path={routes.ADMIN_TRACKERS} component={TrackerSettings} />
          <Route path={routes.TRACKERORDER} component={TrackerOrder} />
          <Route path={routes.INVOICES} component={Invoices} />
        </Box>
      )}

      {/* If the user is not an admin, show the Forbidden component */}
      {!isAdmin && (
        <Forbidden
          history={history}
          location={location}
        />
      )}
    </Box>
  );
};

export default AdminPanel;
