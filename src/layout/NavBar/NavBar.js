import React from 'react';
import { NavLink } from 'react-router-dom'; // Import NavLink for navigation with React Router
import _ from 'lodash'; // Import lodash for utility functions
import {
  Divider, // Divider component to add a separator between list items
  Drawer, // Drawer component to create a side navigation menu
  List, // List component to display a list of items
  ListItem, // ListItem component to represent each item in the list
  ListItemText, // ListItemText component for displaying text in the ListItem
  useTheme, // Hook to access Material-UI's theme object
} from '@mui/material';
import { isMobile } from '@utils/mediaQuery'; // Utility function to check if the device is mobile
import { NAVIGATION_ITEMS } from './NavBarConstants'; // Import navigation items for the menu
import './NavBarStyles.css'; // Import the styling for the NavBar

const NavBar = ({ navHidden, setNavHidden, data }) => {
  // Access the Material-UI theme to handle direction (RTL or LTR)
  const theme = useTheme();
  // Check if the current device is mobile using the isMobile utility function
  const isMobileDevice = isMobile();
  // Placeholder for the isAdmin flag (could be based on user role in a real-world scenario)
  const isAdmin = false;
  // Function to handle the click event for a ListItem (navigation item)
  const handleListItemClick = (event, index, item) => {
    // Close the navigation drawer if the device is mobile
    if (isMobileDevice) {
      setNavHidden(!navHidden); // Toggle the state of navHidden to show/hide the nav
    }
  };

  // Drawer content that includes the navigation items
  const drawer = (
    <div>
      {/* The toolbar section (could be a place for a logo or header) */}
      <div className="navbarToolbar" />
      {/* List to display the navigation items */}
      <List>
        {/* Iterate over the NAVIGATION_ITEMS array using lodash's map function */}
        {_.map(NAVIGATION_ITEMS, (item, index) => (
          <React.Fragment key={`navItem${index}${item.id}`}>
            {/* NavLink for navigation, activeClassName applies a class when the link is active */}
            <NavLink
              to={item.link} // Link destination
              activeClassName="navbarActive" // Class applied when link is active
              title={item.name} // Title text for the item
              className="navbarNavLink" // Class for styling the link
            >
              {/* ListItem that represents a clickable item in the nav */}
              <ListItem
                button
                className="navbarNavItems" // Class for styling the ListItem
                onClick={(event) => {
                  // Handle the click event to toggle the navigation visibility
                  handleListItemClick(event, index, item);
                }}
              >
                {/* Display the name of the navigation item */}
                <ListItemText primary={item.name} />
              </ListItem>
            </NavLink>
            {/* Divider component to separate each nav item */}
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  // Function to toggle the visibility of the Drawer (open or close)
  const handleDrawerToggle = () => {
    setNavHidden(!navHidden); // Toggle the state of navHidden
  };

  return (
    <nav className="navbarDrawer" aria-label="mailbox folders">
      {/* Temporary Drawer for mobile devices, only displayed on mobile */}
      <Drawer
        variant="temporary" // Temporary drawer that slides in/out
        anchor={theme.direction === 'rtl' ? 'right' : 'left'} // Set drawer direction based on the theme (RTL or LTR)
        open={navHidden} // Controlled by the navHidden state
        onClose={handleDrawerToggle} // Close the drawer when clicked outside
        classes={{
          paper: 'navbarDrawerPaper', // Styling class for the Drawer paper (background)
        }}
        ModalProps={{
          keepMounted: true, // Improve performance by keeping the modal mounted
        }}
        sx={{
          display: {
            xs: 'block', // Drawer is displayed on mobile devices (xs breakpoint)
            md: 'none', // Drawer is hidden on desktop devices (md breakpoint)
          },
        }}
      >
        {/* Render the drawer content */}
        {drawer}
      </Drawer>
      {/* Permanent Drawer for desktop devices, always visible on larger screens */}
      <Drawer
        classes={{
          paper: 'navbarDrawerPaper', // Styling class for the Drawer paper (background)
        }}
        variant="permanent" // Permanent drawer that is always visible
        open // The drawer is always open on desktop
        sx={{
          display: {
            xs: 'none', // Drawer is hidden on mobile devices (xs breakpoint)
            md: 'block', // Drawer is displayed on desktop devices (md breakpoint)
          },
        }}
      >
        {/* Render the drawer content */}
        {drawer}
      </Drawer>
    </nav>
  );
};

export default NavBar;
