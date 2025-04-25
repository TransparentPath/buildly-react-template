import React from 'react';
import { Route, Redirect } from 'react-router-dom'; // Imports Route and Redirect for routing control
import { oauthService } from '@modules/oauth/oauth.service'; // OAuth service to check for auth status

/**
 * PrivateRoute is a wrapper around React Router's Route component.
 * It restricts access to routes that require authentication.
 *
 * If the user has a valid access token (checked using `oauthService.hasValidAccessToken()`),
 * the protected component will be rendered.
 * Otherwise, the user will be redirected to the login page.
 *
 * @param {object} props - Props passed to the route
 * @param {React.ComponentType} props.component - The component to render if authenticated
 * @returns {JSX.Element} - A Route component that conditionally renders based on auth
 */
export const PrivateRoute = ({
  component: Component, // The component to render if the user is authenticated
  ...rest // All other props such as `path`, `exact`, etc.
}) => (
  <Route
    {...rest} // Spread the rest of the route props
    render={(props) => (
      // Render the component only if a valid access token exists
      oauthService.hasValidAccessToken()
        ? <Component {...props} /> // If authenticated, render the protected component
        : (
          <Redirect
            to={{
              pathname: '/login', // Redirect to the login page
              state: { from: props.location }, // Store the current location for redirect after login
            }}
          />
        )
    )}
  />
);
