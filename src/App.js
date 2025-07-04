// Import React core
import * as React from 'react';
// Enables hot reloading during development to preserve state and avoid full page reloads
import { hot } from 'react-hot-loader';
// Importing React Router components for navigation
import {
  BrowserRouter as Router,
  Route,
  Redirect,
} from 'react-router-dom';
// MUI styling components for baseline CSS resets and style engine support
import {
  CssBaseline,
  StyledEngineProvider,
} from '@mui/material';
// Global alert component used across the application
import Alert from '@components/Alert/Alert';
import { useAutoLogout } from './hooks/useAutoLogout';
// App context and initialization object used for dependency injection or global app data
import { app, AppContext } from '@context/App.context';
// Main dashboard container (rendered after successful login)
import ContainerDashboard from '@layout/Container/Container';
// OAuth service handles login, logout, and token management
import { oauthService } from '@modules/oauth/oauth.service';
// Authentication-related page components
import Login from '@pages/Login/Login';
import Register from '@pages/Register/Register';
import EmailForm from '@pages/ResetPassword/EmailForm';
import Verification from '@pages/ResetPassword/Verification';
import NewPasswordForm from '@pages/ResetPassword/NewPasswordForm';
// A custom wrapper for protecting routes that require authentication
import { PrivateRoute } from '@routes/Private.route';
// Route path constants used throughout the app
import { routes } from '@routes/routesConstants';
// Custom MUI theme with typography, palette, and overrides
import theme from '@styles/theme';
// Experimental MUI theme provider that supports CSS variables
import {
  Experimental_CssVarsProvider as CssVarsProvider,
} from '@mui/material/styles';
// Global CSS file for additional custom styles
import './App.css';

/**
 * Main App component.
 * - Provides routing, theming, context, and structure for the entire application.
 * - Initializes with a router and conditional redirect based on auth token.
 * - Wraps components with MUI's theme and style providers.
 */
const App = () => {
  const [isSessionTimeout, setIsSessionTimeout] = React.useState(false);
  useAutoLogout(oauthService.logout, 15 * 60 * 1000, setIsSessionTimeout);

  return (
    <Router>
      {/* Provide global application context to child components */}
      <AppContext.Provider value={app}>
        {/* Ensures MUI styles are injected before other CSS for override priority */}
        <StyledEngineProvider injectFirst>
          {/* Apply MUI theme and enable dynamic color theming (light/dark mode support) */}
          <CssVarsProvider theme={theme} defaultMode="light">
            <div className="app">
              {/* MUI baseline CSS to normalize styles across browsers */}
              <CssBaseline />
              {/* Default root route: redirect based on authentication status */}
              <Route
                exact
                path="/"
                render={() => {
                  const hasToken = oauthService.hasValidAccessToken();
                  if (!hasToken || isSessionTimeout) {
                    return <Redirect to={routes.LOGIN} />; // Redirect to login if not authenticated
                  }
                  return <Redirect to={routes.SHIPMENT} />; // Redirect to main app route if logged in
                }}
              />
              {/* Publicly accessible routes */}
              <Route path={routes.LOGIN} component={Login} />
              <Route path={routes.REGISTER} component={Register} />
              <Route path={routes.RESET_PASSWORD} component={EmailForm} />
              <Route path={routes.VERIFICATION} component={Verification} />
              <Route path={routes.RESET_PASSWORD_CONFIRM} component={NewPasswordForm} />
              {/* Private route that requires a valid access token */}
              <PrivateRoute path={routes.APP} component={ContainerDashboard} />
            </div>
            {/* Global alert system for showing toast or modal alerts */}
            <Alert />
          </CssVarsProvider>
        </StyledEngineProvider>
      </AppContext.Provider>
    </Router>
  );
};

// Export the App component with hot module reloading support
export default hot(module)(App);
