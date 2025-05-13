import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { getUser } from '@context/User.context';
import FormModal from '@components/Modal/FormModal';
import Loader from '@components/Loader/Loader';
import {
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowRight as ArrowRightIcon,
} from '@mui/icons-material';
import { isDesktop } from '@utils/mediaQuery';
import { validators } from '@utils/validators';
import { checkForAdmin, checkForGlobalAdmin } from '@utils/utilMethods';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import '../UserManagementStyles.css';
import { getCoreuserQuery } from '@react-query/queries/coreuser/getCoreuserQuery';
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery';
import { getCoregroupQuery } from '@react-query/queries/coregroup/getCoregroupQuery';
import { useInviteMutation } from '@react-query/mutations/authUser/inviteMutation';

/**
 * AddUser Component
 * This component provides a form to add new users to the system.
 * It allows administrators to invite users by email, assign roles, and associate them with organizations.
 */
const AddUser = ({ open, setOpen }) => {
  const { displayAlert } = useAlert(); // Hook to display alerts
  const user = getUser(); // Fetch the current logged-in user
  const isSuperAdmin = checkForGlobalAdmin(user); // Check if the user is a super admin
  const isAdmin = checkForAdmin(user); // Check if the user is an admin
  const { organization_uuid } = user.organization; // Get the organization UUID of the logged-in user

  // State variables
  const [openConfirmModal, setConfirmModal] = useState(false); // Controls the confirmation modal visibility
  const [emailData, setEmailData] = useState([]); // Stores existing user emails
  const [userEmails, setUserEmails] = useState([]); // Stores the emails entered in the form
  const [rolesData, setRolesData] = useState([]); // Stores available roles for the selected organization
  const [formError, setFormError] = useState({}); // Tracks form validation errors
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null); // Anchor element for submenu
  const [submenuOrg, setSubmenuOrg] = useState(null); // Stores the selected organization for the submenu
  const [displayOrgs, setDisplayOrgs] = useState(null); // Stores organizations to display in the dropdown
  const [mainMenuOpen, setMainMenuOpen] = useState(false); // Controls the main menu dropdown visibility

  // Input hooks for form fields
  const organization_name = useInput('', { required: true }); // Organization name input
  const user_role = useInput('', { required: true }); // User role input

  // Fetch core user data
  const { data: coreuserData, isLoading: isLoadingCoreuser } = useQuery(
    ['users'],
    () => getCoreuserQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  // Fetch organization data
  const { data: orgData, isLoading: isLoadingOrganizations } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  // Fetch core group data
  const { data: coregroupData, isLoading: isLoadingCoregroup } = useQuery(
    ['coregroup'],
    () => getCoregroupQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  // Effect to filter and display organizations
  useEffect(() => {
    if (orgData && !_.isEmpty(orgData)) {
      const producerOrgs = orgData.filter((org) => org.organization_type === 2); // Filter producer organizations
      const resellerOrgs = producerOrgs.filter((org) => org.is_reseller); // Filter reseller organizations
      const resellerCustomerOrgIds = resellerOrgs.reduce((ids, org) => {
        if (org.reseller_customer_orgs) {
          return ids.concat(org.reseller_customer_orgs);
        }
        return ids;
      }, []);
      const customerOrgs = orgData.filter((org) => resellerCustomerOrgIds.includes(org.id)); // Filter customer organizations
      setDisplayOrgs([...producerOrgs, ...customerOrgs]); // Combine producer and customer organizations
    }
  }, [orgData]);

  // Effect to extract email data from core user data
  useEffect(() => {
    if (coreuserData) {
      const edata = coreuserData.map((item) => item.email);
      setEmailData(edata);
    }
  }, [coreuserData]);

  // Effect to update roles based on the selected organization
  useEffect(() => {
    if (isSuperAdmin) {
      if (!_.isEmpty(organization_name.value)) {
        const selectedOrg = _.filter(orgData, (org) => org.name === organization_name.value);
        setRolesData(_.filter(coregroupData, (item) => item.organization === selectedOrg[0].organization_uuid));
      } else {
        setRolesData([]);
      }
    } else {
      setRolesData(_.filter(coregroupData, (item) => item.organization === organization_uuid));
    }
  }, [coregroupData, organization_name.value]);

  /**
   * Discard form data and reset the form.
   */
  const discardFormData = () => {
    setUserEmails([]);
    organization_name.clear();
    user_role.reset();
    setFormError({});
    setConfirmModal(false);
    setOpen(false);
  };

  /**
   * Close the form modal.
   * If form data has changed, show a confirmation modal; otherwise, close the modal directly.
   */
  const closeFormModal = () => {
    const dataHasChanged = !_.isEmpty(userEmails)
      || organization_name.hasChanged()
      || user_role.hasChanged();
    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setOpen(false);
    }
  };

  /**
   * Handle input blur event for validation.
   * Updates the form error state based on validation results.
   * @param {Event} e - The blur event.
   * @param {string} validation - The validation type.
   * @param {object} input - The input state object.
   * @param {boolean} extras - Whether extra validation is required.
   * @param {array} extraData - Additional data for validation.
   */
  const handleBlur = (e, validation, input, extras, extraData) => {
    let validateObj;
    if (extras) {
      validateObj = validators(validation, { value: input, required: true, extra: extraData });
    } else {
      validateObj = validators(validation, input);
    }
    const prevState = { ...formError };
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e.target.id]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [e.target.id]: {
          error: false,
          message: '',
        },
      });
    }
  };

  /**
   * Handle input change for user emails.
   * Splits the input string into an array of emails.
   * @param {Event} e - The input change event.
   */
  const handleInputChange = (e) => {
    const emails = e.target.value.split(',').map((email) => email.trim());
    setUserEmails(emails);
  };

  /**
   * Check if the submit button should be disabled.
   * Returns true if required fields are empty or there are validation errors.
   * @returns {boolean} - Whether the submit button should be disabled.
   */
  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (isSuperAdmin) {
      if (_.isEmpty(userEmails) || !organization_name.value || !user_role.value) {
        return true;
      }
    } else if (_.isEmpty(userEmails) || !user_role.value) {
      return true;
    }

    let errorExists = false;
    _.forEach(errorKeys, (key) => {
      if (formError[key].error) {
        errorExists = true;
      }
    });
    return errorExists;
  };

  // Mutation hook to invite users
  const { mutate: inviteMutation, isLoading: isInviting } = useInviteMutation(discardFormData, displayAlert);

  /**
   * Handle form submission.
   * Validates and submits the form data to invite new users.
   * @param {Event} event - The form submission event.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const lowercaseUserEmails = userEmails.map((email) => email.toLowerCase());

    if (!_.isEmpty(userEmails)
      || organization_name.hasChanged()
      || user_role.hasChanged()
    ) {
      const data = {
        emails: lowercaseUserEmails,
        org_data: {
          name: organization_name.value || user.organization.name,
        },
        user_role: user_role.value,
      };
      inviteMutation(data);
    }
  };

  /**
   * Handle submenu click for organizations.
   * Opens the submenu for the selected organization.
   * @param {Event} event - The click event.
   * @param {object} org - The selected organization.
   */
  const handleSubmenuClick = (event, org) => {
    event.stopPropagation();
    setSubmenuAnchorEl(event.currentTarget);
    setSubmenuOrg(org);
  };

  /**
   * Close the submenu.
   */
  const handleSubmenuClose = () => {
    setSubmenuAnchorEl(null);
  };

  /**
   * Handle submenu selection.
   * Sets the selected organization name and closes the submenu.
   * @param {object} org - The selected organization.
   */
  const handleSubmenuSelect = (org) => {
    organization_name.setValue(org.name);
    handleSubmenuClose();
    setMainMenuOpen(false);
  };

  return (
    <div>
      <FormModal
        open={open}
        handleClose={closeFormModal}
        title="Add Users"
        openConfirmModal={openConfirmModal}
        setConfirmModal={setConfirmModal}
        handleConfirmModal={discardFormData}
      >
        {(isLoadingCoreuser
          || isLoadingOrganizations
          || isLoadingCoregroup
          || isInviting)
          && (
            <Loader open={isLoadingCoreuser
              || isLoadingOrganizations
              || isLoadingCoregroup
              || isInviting}
            />
          )}
        <form
          className="addUserFormContainer"
          noValidate
          onSubmit={handleSubmit}
        >
          <Grid container spacing={isDesktop() ? 2 : 0}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="user_email"
                label="User Emails"
                name="user_email"
                autoComplete="user_email"
                error={formError.user_email && formError.user_email.error}
                helperText={
                  formError.user_email ? formError.user_email.message : ''
                }
                onBlur={(e) => handleBlur(e, 'duplicateEmail', userEmails, true, emailData)}
                onChange={handleInputChange}
                value={userEmails.toString()}
              />
            </Grid>
            {(isSuperAdmin || (isAdmin && user.organization.is_reseller && !_.isEmpty(user.organization.reseller_customer_orgs))) && (
              <>
                <Grid item xs={12}>
                  <TextField
                    className="notranslate"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    select
                    SelectProps={{
                      open: mainMenuOpen,
                    }}
                    id="organization_name"
                    name="organization_name"
                    label={(
                      <span className="translate">Organization Name</span>
                    )}
                    autoComplete="organization_name"
                    {...organization_name.bind}
                    onClick={(e) => setMainMenuOpen(!mainMenuOpen)}
                  >
                    {displayOrgs && !_.isEmpty(displayOrgs) && displayOrgs.map((org) => (
                      <MenuItem className="notranslate" key={org.id} value={org.name} style={{ display: org.organization_type === 1 && 'none' }}>
                        {org.name}
                        {org.reseller_customer_orgs && (
                          <IconButton
                            onClick={(event) => handleSubmenuClick(event, org)}
                            className="topBarOrgSelectInput"
                          >
                            <ArrowRightIcon />
                          </IconButton>
                        )}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Menu
                  anchorEl={submenuAnchorEl}
                  open={Boolean(submenuAnchorEl)}
                  onClose={handleSubmenuClose}
                >
                  {submenuOrg && !_.isEmpty(submenuOrg.reseller_customer_orgs)
                    && orgData.filter((org) => submenuOrg.reseller_customer_orgs.includes(org.organization_uuid)).map((org) => (
                      <MenuItem
                        key={org.organization_uuid}
                        onClick={() => handleSubmenuSelect(org)}
                      >
                        {org.name}
                      </MenuItem>
                    ))}
                </Menu>
              </>
            )}
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                select
                id="user_role"
                name="user_role"
                label="User Role"
                autoComplete="user_role"
                {...user_role.bind}
              >
                <MenuItem value="">Select</MenuItem>
                {!_.isEmpty(rolesData) && _.map(rolesData, (role) => (
                  <MenuItem
                    key={role.id}
                    value={role.name}
                  >
                    {role.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className="addOrganizationSubmit"
                disabled={submitDisabled()}
              >
                Register & Send
              </Button>
            </Grid>
          </Grid>
        </form>
      </FormModal>
    </div>
  );
};

export default AddUser;
