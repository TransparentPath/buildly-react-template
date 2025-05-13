// Import the React library to enable the creation of components, hooks, and context APIs.
import React from 'react';

// Import the oauthService, which is assumed to be a custom service that handles
// OAuth-related operations such as retrieving the currently authenticated user's data.
import { oauthService } from '@modules/oauth/oauth.service';

/**
 * A utility function that attempts to retrieve the currently authenticated user's data
 * from the `oauthService`. It checks whether a user object is returned, and if so,
 * it returns the `.data` property of that user. Otherwise, it returns `null`.
 *
 * This function is useful to extract and standardize the current user data throughout the app.
 *
 * @returns {Object|null} The user data object if authenticated, or `null` if not.
 */
export const getUser = () => (
  oauthService.getOauthUser() // Check if the OAuth service has a user object
    ? oauthService.getOauthUser().data // If so, return the user data
    : null // Otherwise, return null (user not authenticated)
);

/**
 * Creates a React Context named `UserContext`, which holds the current authenticated user's data.
 *
 * This context allows components in the application to access the authenticated user
 * without having to pass the user data manually through props.
 *
 * The default value is the result of calling `getUser()`, meaning it initializes with
 * the user data available at the time of context creation.
 *
 * Usage example:
 *   const user = useContext(UserContext);
 */
export const UserContext = React.createContext(getUser());
