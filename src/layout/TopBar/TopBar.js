// Core React & utility imports
import React, { useState, useEffect } from 'react';
import { useTimezoneSelect, allTimezones } from 'react-timezone-select';
import _ from 'lodash';
// MUI components for layout and icons
import {
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  AccountCircle,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
// Asset & custom components/hooks/utils/services
import logo from '@assets/tp-logo.png';
import Loader from '@components/Loader/Loader';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { oauthService } from '@modules/oauth/oauth.service';
import { routes } from '@routes/routesConstants';
import { checkForAdmin, checkForGlobalAdmin } from '@utils/utilMethods';
import { useStore } from '@zustand/timezone/timezoneStore';
import { useQuery } from 'react-query';
// React-query: API integrations
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery';
import { useUpdateUserMutation } from '@react-query/mutations/authUser/updateUserMutation';
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery';
import { getVersionNotesQuery } from '@react-query/queries/notifications/getVersionNotesQuery';
// Subcomponents used in TopBar
import AccountSettings from './components/AccountSettings';
import AlertNotifications from './components/AlertNotifications';
import WhatsNewModal from './components/WhatsNew/WhatsNewModal';
import WhatsNewSlider from './components/WhatsNew/WhatsNewSlider';
import AdminMenu from './AdminMenu';
import AccountMenu from './AccountMenu';
import OrganizationSelector from '@components/OrganizationSelector/OrganizationSelector';
// Constants & styles
import './TopBarStyles.css';
import { LANGUAGES } from '@utils/mock';
import i18n from '../../i18n/index';
import { useTranslation } from 'react-i18next';

// Main TopBar component
const TopBar = ({
  navHidden, // Boolean to toggle nav visibility
  setNavHidden, // Setter for nav visibility
  history, // React Router history object
}) => {
  const user = getUser();
  const isAdmin = checkForAdmin(user); // Check if user is admin
  const isSuperAdmin = checkForGlobalAdmin(user); // Check if user is super admin
  const org_uuid = user.organization.organization_uuid;

  const { t } = useTranslation();

  // Local UI state
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingEl, setSettingEl] = useState(null);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [language, setLanguage] = useState(null);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showWhatsNewModal, setShowWhatsNewModal] = useState(false);
  const [showWhatsNewSlider, setShowWhatsNewSlider] = useState(false);
  const [hideAlertBadge, setHideAlertBadge] = useState(true);
  const [showAlertNotifications, setShowAlertNotifications] = useState(false);
  const [mainMenuOpen, setMainMenuOpen] = useState(false);

  // Hook: alert display
  const { displayAlert } = useAlert();
  // Zustand store: timezone
  const { data, setTimezone } = useStore();
  // Timezone options from react-timezone-select
  const { options: tzOptions } = useTimezoneSelect({
    labelStyle: 'original',
    timezones: allTimezones,
  });

  // Initial user settings
  if (user) {
    if (!organization) setOrganization(user.organization.name);
    if (!language) {
      setLanguage(_.isEmpty(user.user_language) ? 'English' : user.user_language);
    }
  }

  useEffect(() => {
    if (!user) return;

    setOrganization((prev) => {
      if (prev == null) {
        const orgName = user && user.organization ? user.organization.name : null;
        return orgName != null ? orgName : null;
      }
      return prev;
    });

    setLanguage((prev) => {
      if (prev == null) {
        const userLang = _.isEmpty(user.user_language) ? 'English' : user.user_language;
        return userLang;
      }
      return prev;
    });
  }, []);

  // Show "What's New" modal only once (per localStorage)
  useEffect(() => {
    setShowWhatsNewModal(_.isEmpty(localStorage.getItem('isWhatsNewShown')));
  }, []);

  // Query: fetch organizations
  const { data: orgData, isLoading: isLoadingOrgs } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert, 'Top bar'),
    { refetchOnWindowFocus: false },
  );

  // Query: fetch unit data based on current organization
  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', org_uuid],
    () => getUnitQuery(org_uuid, displayAlert, 'Top bar'),
    { refetchOnWindowFocus: false },
  );

  // Query: fetch version notes for WhatsNew modal/slider
  const { data: versionNotesData, isLoading: isLoadingVersionNotes } = useQuery(
    ['versionNotes'],
    // eslint-disable-next-line no-undef
    () => getVersionNotesQuery(VERSION, displayAlert, 'Top bar'),
    { refetchOnWindowFocus: false },
  );

  // Mutation: update user preferences (e.g., language/org)
  const { mutate: updateUserMutation, isLoading: isUpdateUser } = useUpdateUserMutation(history, displayAlert, 'Top bar');

  /**
   * Handler: switch active organization for user.
   */
  const handleOrganizationChange = (e) => {
    const organization_name = e.target ? e.target.value : e;
    if (!_.isEqual(organization, organization_name)) {
      setOrganization(organization_name);
      const adminOrgs = JSON.parse(localStorage.getItem('adminOrgs'));
      const { organization_uuid } = isSuperAdmin
        ? _.filter(orgData, (org) => _.isEqual(org.name, organization_name))[0]
        : _.filter(adminOrgs, (org) => _.isEqual(org.name, organization_name))[0];
      const updateData = {
        id: user.id,
        organization_uuid,
        organization_name,
      };
      updateUserMutation(updateData);
    }
    setMainMenuOpen(false);
    setSubmenuAnchorEl(null);
  };

  /**
   * Handler: switch app language and update user preferences.
   */
  const handleLanguageChange = (e) => {
    const selected_language = e.target.value;
    if (!_.isEqual(language, selected_language)) {
      setLanguage(selected_language);
      const updateData = {
        id: user.id,
        organization_uuid: user.organization.organization_uuid,
        organization_name: user.organization.name,
        user_language: selected_language,
      };
      updateUserMutation(updateData);
    }
  };

  // Other click handlers for UI buttons
  const settingMenu = (event) => {
    setSettingEl(event.currentTarget);
  };

  const handleAdminPanelClick = () => {
    history.push(`${routes.ADMIN_PANEL}/configuration`);
    setSettingEl(null);
  };

  const handleUserManagementClick = () => {
    history.push(`${routes.USER_MANAGEMENT}/current-users`);
    setSettingEl(null);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountSettingsClick = () => {
    setShowAccountSettings(true);
    setAnchorEl(null);
  };

  const handleWhatsNewClick = () => {
    setShowWhatsNewSlider(true);
    setAnchorEl(null);
  };

  const handleAboutClick = () => {
    history.push(routes.ABOUT_PLATFORM);
    setAnchorEl(null);
  };

  const handlePrivacyClick = () => {
    history.push(routes.PRIVACY_POLICY);
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    oauthService.logout();
    history.push('/');
  };

  const handleNotificationsClick = () => {
    setShowAlertNotifications(true);
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" className="topbarAppBar">
      {/* Show loader when fetching critical data */}
      {(isLoadingOrgs || isUpdateUser || isLoadingUnits || isLoadingVersionNotes) && (
        <Loader open={isLoadingOrgs || isUpdateUser || isLoadingUnits || isLoadingVersionNotes} />
      )}
      <Toolbar>
        {/* Hamburger menu for mobile nav toggle */}
        <IconButton
          edge="start"
          className="topbarMenuButton"
          onClick={() => setNavHidden(!navHidden)}
          aria-label={t('topbar.menu')}
          sx={{
            display: {
              xs: 'block',
              md: 'none',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        {/* Company logo */}
        <img
          src={logo}
          className="topbarLogo"
          alt={t('topbar.companyLogoAlt')}
        />
        {/* Right side content: language, timezone, org, notifications, user */}
        <div className="topbarMenuRight">
          {/* Language selector */}
          <TextField
            className="topbarTimezone"
            variant="outlined"
            fullWidth
            id="language"
            label={t('topbar.language')}
            select
            value={language}
            onChange={handleLanguageChange}
          >
            {_.map(LANGUAGES, (item, index) => (
              <MenuItem key={`${item.value}-${index}`} value={item.label}>
                {t(`languages.${item.label}`)}
              </MenuItem>
            ))}
          </TextField>
          {/* Timezone selector */}
          <TextField
            className="topbarTimezone"
            variant="outlined"
            fullWidth
            id="timezone"
            label={t('topbar.timezone')}
            select
            value={data}
            onChange={(e) => setTimezone(e.target.value)}
          >
            {_.map(tzOptions, (tz, i) => (
              <MenuItem key={`${tz.value}-${i}`} value={tz.value}>
                {tz.label}
              </MenuItem>
            ))}
          </TextField>
          {/* Organization selector shown only for admins */}
          {(isSuperAdmin || isAdmin || (isAdmin && !_.isEmpty(JSON.parse(localStorage.getItem('adminOrgs'))))) && (
            <OrganizationSelector
              handleOrganizationChange={handleOrganizationChange}
              selectedOrg={organization}
              mainMenuOpen={mainMenuOpen}
              setMainMenuOpen={setMainMenuOpen}
              submenuAnchorEl={submenuAnchorEl}
              setSubmenuAnchorEl={setSubmenuAnchorEl}
            />
          )}
          {/* Notifications icon */}
          <IconButton
            aria-label={t('topbar.notifications')}
            aria-controls="menu-appbar"
            aria-haspopup="true"
            color="primary"
            onClick={handleNotificationsClick}
          >
            <Badge
              color="error"
              overlap="circular"
              badgeContent=" "
              variant="dot"
              invisible={hideAlertBadge}
              className="topBarNotifications"
            >
              <NotificationsIcon fontSize="large" />
            </Badge>
          </IconButton>
          {/* Admin settings icon */}
          {(isAdmin || isSuperAdmin) && (
            <IconButton
              aria-label={t('topbar.adminSection')}
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={settingMenu}
              color="primary"
            >
              <SettingsIcon fontSize="large" />
            </IconButton>
          )}
          {/* Admin submenu */}
          <AdminMenu
            settingEl={settingEl}
            setSettingEl={setSettingEl}
            handleAdminPanelClick={handleAdminPanelClick}
            handleUserManagementClick={handleUserManagementClick}
          />
          {/* User avatar & menu */}
          <IconButton
            aria-label={t('topbar.account')}
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="primary"
          >
            <AccountCircle fontSize="large" />
          </IconButton>
          {/* User dropdown menu */}
          <AccountMenu
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            user={user}
            organizationName={organization}
            handleAccountSettingsClick={handleAccountSettingsClick}
            handleWhatsNewClick={handleWhatsNewClick}
            handleAboutClick={handleAboutClick}
            handlePrivacyClick={handlePrivacyClick}
            handleLogoutClick={handleLogoutClick}
          />
        </div>
      </Toolbar>
      {/* Modals and drawers */}
      <AccountSettings open={showAccountSettings} setOpen={setShowAccountSettings} />
      <WhatsNewModal open={showWhatsNewModal} setOpen={setShowWhatsNewModal} data={versionNotesData} />
      <WhatsNewSlider open={showWhatsNewSlider} setOpen={setShowWhatsNewSlider} data={versionNotesData} />
      <AlertNotifications
        open={showAlertNotifications}
        setOpen={setShowAlertNotifications}
        setHideAlertBadge={setHideAlertBadge}
        history={history}
        timezone={data}
        unitOfMeasure={unitData}
      />
    </AppBar>
  );
};

export default TopBar;
