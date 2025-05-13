/* eslint-disable react/no-danger */
import React from 'react'; // Importing React for using JSX and component creation.
import _ from 'lodash'; // Importing lodash for utility functions, such as _.isEmpty to check if an object is empty.
import { useTheme } from '@mui/material'; // Importing MUI's useTheme hook to access the current theme for consistent styling.

const WhatsNewContent = ({ data }) => { // Functional component that takes `data` as a prop.
  const theme = useTheme(); // Accessing the current theme using MUI's `useTheme` hook. This allows access to typography, colors, etc.

  return (
    <>
      {/*
        The code below checks if `data` is not empty and if the first element of the `data` array is also not empty.
        If either is empty, nothing is rendered. If both are valid, the component renders the content inside a div.
      */}
      {!_.isEmpty(data) && !_.isEmpty(data[0]) ? (
        // Rendering the content if `data` is not empty and the first element of `data` is not empty.
        <div
          style={{ fontFamily: `${theme.typography.fontFamily} !important` }} // Applying the font family from the current theme to the div.
          dangerouslySetInnerHTML={{ __html: data }} // Using dangerouslySetInnerHTML to inject HTML content into the component. This is done because the data could contain HTML.
        />
      ) : null}
      {/* If the conditions are not met (empty data or empty first element), nothing will be rendered */}
    </>
  );
};

export default WhatsNewContent; // Exporting the WhatsNewContent component to be used elsewhere in the application.
