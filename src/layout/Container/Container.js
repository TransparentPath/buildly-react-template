import React, { useState } from 'react';
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

const ContainerDashboard = ({ location, history }) => {
  // Fetching the current user data using the getUser function from context
  const userData = getUser();
  // useState hook to manage the visibility of the navigation bar (whether it's hidden or not)
  const [navHidden, setNavHidden] = useState(false);

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
