import React, { useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import _ from 'lodash';
import { Container } from '@mui/material';
import { UserContext, getUser } from '@context/User.context';
import NavBar from '../NavBar/NavBar';
import TopBar from '../TopBar/TopBar';
import AboutPlatform from '@pages/AboutPlatform/AboutPlatform';
import AdminPanel from '@pages/AdminPanel/AdminPanel';
import Custodians from '@pages/Custodians/Custodians';
import Items from '@pages/Items/Items';
import Reporting from '@pages/Reporting/Reporting';
import Gateway from '@pages/SensorsGateway/Gateway';
import CreateShipment from '@pages/Shipment/CreateShipment';
import Shipment from '@pages/Shipment/Shipment';
import UserManagement from '@pages/UserManagement/UserManagement';
import { routes } from '@routes/routesConstants';
import { checkForAdmin, checkForGlobalAdmin } from '@utils/utilMethods';
import { isMobile } from '@utils/mediaQuery';
import './ContainerStyles.css';
import PrivacyPolicy from '@pages/PrivacyPolicy/PrivacyPolicy';
import CookieConsent from '@components/CookieConsent/CookieConsent';
import { useAutoLogout } from '@hooks/useAutoLogout';
import { oauthService } from '@modules/oauth/oauth.service';
import { LANGUAGES } from '@utils/mock';
import i18n from '../../i18n/index';

const ContainerDashboard = ({ location, history }) => {
  // Fetching the current user data using the getUser function from context
  const userData = getUser();

  // Set localStorage language based on LANGUAGES and userData.user_language
  // Set localStorage language and i18n language based on LANGUAGES and userData.user_language
  useEffect(() => {
    if (userData && userData.user_language) {
      const langObj = LANGUAGES.find((l) => l.label === userData.user_language);
      if (langObj && langObj.value) {
        const currentLang = localStorage.getItem('language');
        if (currentLang !== langObj.value) {
          localStorage.setItem('language', langObj.value);
          // Set i18n language directly only if different
          if (i18n && typeof i18n.changeLanguage === 'function' && i18n.language !== langObj.value) {
            i18n.changeLanguage(langObj.value);
          }
        }
      }
    }
  }, [userData]);

  // useState hook to manage the visibility of the navigation bar (whether it's hidden or not)
  const [navHidden, setNavHidden] = useState(false);

  useAutoLogout(oauthService.logout, history);

  return (
    <div className="containerRoot">
      {/* Providing the user data to all child components via UserContext */}
      <UserContext.Provider value={getUser()}>
        {/* TopBar component, passing navHidden state and setNavHidden function as props to toggle visibility */}
        <TopBar
          navHidden={navHidden}
          setNavHidden={setNavHidden}
          history={history}
        />
        {/* NavBar component for displaying the navigation menu. It also uses navHidden to hide/show the menu */}
        <NavBar
          navHidden={navHidden}
          setNavHidden={setNavHidden}
          location={location}
          history={history}
        />
        {/* Container for the main content of the dashboard, adjusting the layout based on the screen size */}
        <Container
          className={`containerContent ${!isMobile() && 'containerContentMaxWidth'}`}
        >
          {/* Default route to redirect from APP to SHIPMENT */}
          <Route
            exact
            path={routes.APP}
            render={() => <Redirect to={routes.SHIPMENT} />}
          />
          {/* Conditionally rendering routes for admin users or global admins */}
          {(checkForAdmin(userData) || checkForGlobalAdmin(userData)) && (
            <Route
              path={routes.USER_MANAGEMENT}
              component={UserManagement}
            />
          )}
          {/* Rendering routes for various pages of the application */}
          <Route
            path={routes.CUSTODIANS}
            component={Custodians}
          />
          <Route
            path={routes.ABOUT_PLATFORM}
            component={AboutPlatform}
          />
          <Route
            path={routes.PRIVACY_POLICY}
            component={PrivacyPolicy}
          />
          <Route
            path={routes.ITEMS}
            component={Items}
          />
          <Route
            path={routes.TRACKERS}
            component={Gateway}
          />
          <Route
            path={routes.SHIPMENT}
            component={Shipment}
          />
          <Route
            path={routes.REPORTING}
            component={Reporting}
          />
          <Route
            path={routes.ADMIN_PANEL}
            component={AdminPanel}
          />
          <Route
            path={routes.CREATE_SHIPMENT}
            component={CreateShipment}
          />
        </Container>
      </UserContext.Provider>
      {/* Cookie consent banner component */}
      <CookieConsent />
    </div>
  );
};

export default ContainerDashboard;
