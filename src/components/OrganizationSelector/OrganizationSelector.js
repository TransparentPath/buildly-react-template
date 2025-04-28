import React, { useState, useEffect } from 'react';
import _ from 'lodash';
// Material UI components used for organization selector layout and styling
import {
  IconButton,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';
import { ArrowRight as ArrowRightIcon } from '@mui/icons-material'; // Right arrow icon for submenu
import { getUser } from '@context/User.context'; // Custom hook to get the current user
import useAlert from '@hooks/useAlert'; // Custom hook for alert display
import { checkForAdmin, checkForGlobalAdmin } from '@utils/utilMethods'; // Utility methods for role checks
import { useQuery } from 'react-query'; // React query hook for data fetching
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery'; // Query function to get organizations
import './OrganizationSelectorStyles.css'; // Custom CSS for styling

const OrganizationSelector = ({
  handleOrganizationChange, // Function passed as a prop to handle the change of selected organization
  selectedOrg, // Currently selected organization, passed as a prop
  mainMenuOpen, // State to manage the open/close status of the dropdown menu
  setMainMenuOpen, // Function to toggle the main menu open/close state
  submenuAnchorEl, // Anchor element for positioning the submenu (sub-level dropdown)
  setSubmenuAnchorEl, // Function to update the anchor element for submenu
}) => {
  const user = getUser(); // Retrieve current user context
  const isAdmin = checkForAdmin(user); // Check if the current user is an Admin
  const isSuperAdmin = checkForGlobalAdmin(user); // Check if the current user is a Super Admin

  // States to manage organizations data and submenu state
  const [submenuOrg, setSubmenuOrg] = useState(null); // Organization for the submenu
  const [custOrgs, setCustOrgs] = useState(null); // Customer organizations
  const [displayOrgs, setDisplayOrgs] = useState(null); // Organizations to be displayed in the dropdown

  const { displayAlert } = useAlert(); // Alert hook to display messages

  // React Query to fetch all organizations
  const { data: orgData, isLoading: isLoadingOrgs } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert),
    { refetchOnWindowFocus: false }, // Disable refetching when window refocuses
  );

  // Function to filter and set organizations based on type
  const filterAndSetDisplayOrgs = (orgs) => {
    if (orgs) {
      // Filter producer organizations (organization type 2)
      const producerOrgs = orgs.filter((org) => _.isEqual(org.organization_type, 2));
      // Filter reseller organizations
      const resellerOrgs = orgs.filter((org) => org.is_reseller);
      // Flatten reseller organizations' customer organizations
      const resellerCustomerOrgIds = resellerOrgs.flatMap((org) => org.reseller_customer_orgs || []);
      // Filter customer organizations
      const customerOrgs = orgs.filter((org) => resellerCustomerOrgIds.includes(org.id));
      // Filter out producer organizations that are customers
      const filteredProducerOrgs = producerOrgs.filter((producerOrg) => !customerOrgs.some((customerOrg) => _.lowerCase(customerOrg.name) === _.lowerCase(producerOrg.name)));
      // Set state for customer and producer organizations
      setCustOrgs(customerOrgs);
      setDisplayOrgs(filteredProducerOrgs);
    }
  };

  // Effect to handle the data when organizations data is available
  useEffect(() => {
    // If user is admin, save the org data in localStorage
    if (!_.isEmpty(orgData) && isAdmin) {
      localStorage.setItem('adminOrgs', JSON.stringify(orgData));
    }
    // If user is super admin, filter and display organizations differently
    if (isSuperAdmin) {
      localStorage.removeItem('adminOrgs');
      filterAndSetDisplayOrgs(orgData); // Super Admin can see all organizations
    } else if (isAdmin) {
      // For admin, use the saved organizations from localStorage
      const adminOrgs = JSON.parse(localStorage.getItem('adminOrgs'));
      filterAndSetDisplayOrgs(adminOrgs); // Admin can see only their organizations
    }
  }, [orgData]); // Effect runs when organization data changes

  // Function to handle submenu (reseller customer organizations) click
  const handleSubmenuClick = (event, org) => {
    event.stopPropagation(); // Prevent the click from propagating to the main menu
    setSubmenuAnchorEl(event.currentTarget); // Set the submenu anchor element
    setSubmenuOrg(org); // Set the organization for submenu
  };

  // Function to close the submenu
  const handleSubmenuClose = () => {
    setSubmenuAnchorEl(null); // Reset the submenu anchor element to close the menu
  };

  return (
    <>
      {/* Main TextField used to select organization */}
      <TextField
        className="organizationSelectorInput notranslate"
        variant="outlined"
        fullWidth
        id="org"
        label={<span className="translate">Organization</span>}
        select
        value={selectedOrg}
        onChange={(e) => {
          handleOrganizationChange(e); // Handle the change of selected organization
          handleSubmenuClose(); // Close the submenu when a selection is made
        }}
        SelectProps={{
          open: mainMenuOpen, // Control whether the main dropdown is open or closed
        }}
        onClick={(e) => setMainMenuOpen(!mainMenuOpen)} // Toggle dropdown menu visibility on click
      >
        {/* Render organizations dynamically */}
        {!_.isEmpty(displayOrgs) && [...displayOrgs, ...custOrgs].map((org) => (
          <MenuItem
            className="notranslate"
            key={org.id}
            value={org.name}
            style={{ display: custOrgs.includes(org) && 'none' }} // Hide customer orgs in the main list
          >
            {org.name}
            {/* Show submenu icon if the organization is a reseller with customer orgs */}
            {org.is_reseller && !_.isEmpty(org.reseller_customer_orgs) && (
              <IconButton
                onClick={(event) => handleSubmenuClick(event, org)} // Open submenu when clicked
                className="topBarOrgSelectInput"
              >
                <ArrowRightIcon />
              </IconButton>
            )}
          </MenuItem>
        ))}
      </TextField>
      {/* Submenu for reseller customer organizations */}
      <Menu
        anchorEl={submenuAnchorEl} // Anchor element for the submenu
        open={Boolean(submenuAnchorEl)} // Open the submenu if anchor element exists
        onClose={handleSubmenuClose} // Close submenu when clicked outside
      >
        {/* If submenu organization exists and has customer organizations, display them */}
        {
          submenuOrg && !_.isEmpty(submenuOrg.reseller_customer_orgs) && (
            isSuperAdmin
              ? orgData.filter((org) => submenuOrg.reseller_customer_orgs.includes(org.organization_uuid))
                .map((org) => (
                  <MenuItem
                    className="notranslate"
                    key={org.organization_uuid}
                    onClick={() => handleOrganizationChange(org.name)} // Change organization on click
                  >
                    {org.name}
                  </MenuItem>
                ))
              : !_.isEmpty(JSON.parse(localStorage.getItem('adminOrgs'))) && JSON.parse(localStorage.getItem('adminOrgs')).filter((org) => submenuOrg.reseller_customer_orgs.includes(org.organization_uuid))
                .map((org) => (
                  <MenuItem
                    className="notranslate"
                    key={org.organization_uuid}
                    onClick={() => handleOrganizationChange(org.name)} // Change organization for admin
                  >
                    {org.name}
                  </MenuItem>
                ))
          )
        }
      </Menu>
    </>
  );
};

export default OrganizationSelector;
