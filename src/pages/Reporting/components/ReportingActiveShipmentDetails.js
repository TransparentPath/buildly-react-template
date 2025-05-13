/* eslint-disable no-nested-ternary */

// Core and third-party imports
import React from 'react';
import _ from 'lodash'; // Utility library for object/array operations
import {
  Grid,
  Typography,
  CardContent,
  Card,
} from '@mui/material';

// Custom context and constants
import { getUser } from '@context/User.context'; // Get user data (like language)
import { SHIPMENT_OVERVIEW_COLUMNS } from '@utils/constants'; // Column definitions for shipment details

import '../ReportingStyles.css'; // Custom CSS for this component

// Functional component to render active shipment's details
const ReportingActiveShipmentDetails = ({
  selectedShipment, // The shipment selected by the user
  theme, // MUI theme for styling
  getShipmentValue, // Callback to extract value for a specific column
}) => {
  // Extract user's language from context to apply translation logic later
  const userLanguage = getUser().user_language;

  return (
    <div className="reportingInfoContainer">
      {/* Card wrapper for shipment details */}
      <Card>
        <CardContent>
          <Grid container>
            {
              // If a shipment is selected, render its details using configured columns
              selectedShipment
                ? (
                  // Loop through predefined columns and render each one
                  _.map(
                    SHIPMENT_OVERVIEW_COLUMNS,
                    (column, index) => (
                      <Grid
                        item
                        className="reportingInfoSection"
                        xs={12}
                        sm={6}
                        md={6}
                        key={`col${index}:${column.name}`} // Unique key for each column block
                      >
                        {/* Column title */}
                        <Typography variant="h6">
                          {column.label}
                        </Typography>

                        {
                          // Special case: Render current custodian info if column is "custody_info"
                          column.name === 'custody_info' && selectedShipment[column.name]
                            ? (
                              <div
                                key="custody_info_last"
                                style={{
                                  marginBottom: 10,
                                  color: theme.palette.background.dark,
                                }}
                              >
                                {/* Display custodian name with notranslate class if available */}
                                <Typography variant="body1">
                                  Name:
                                  {' '}
                                  <span className={
                                    _.find(selectedShipment[column.name], { has_current_custody: true })
                                    && 'notranslate'
                                  }
                                  >
                                    {
                                      // Find and show the name of the current custodian
                                      _.find(selectedShipment[column.name], { has_current_custody: true })
                                        ? _.find(selectedShipment[column.name], { has_current_custody: true }).custodian_name
                                        : 'N/A'
                                    }
                                  </span>
                                </Typography>

                                {/* Show custodian address using matching index in contact_info */}
                                <Typography variant="body1">
                                  {
                                    `Custodian Address: ${selectedShipment.contact_info[
                                      _.findIndex(selectedShipment[column.name], { has_current_custody: true })
                                    ]
                                      ? selectedShipment.contact_info[
                                        _.findIndex(selectedShipment[column.name], { has_current_custody: true })
                                      ].address
                                      : 'N/A'
                                    }`
                                  }
                                </Typography>
                              </div>
                            ) : (
                              // Default case: Render the value using the provided `getShipmentValue` function
                              <Typography
                                variant="body1"
                                className={
                                  column.className
                                    ? column.className
                                    : column.name === 'status'
                                      ? _.lowerCase(userLanguage) !== 'english'
                                        ? 'translate'
                                        : 'notranslate'
                                      : null
                                }
                              >
                                {getShipmentValue(column.name)}
                              </Typography>
                            )
                        }
                      </Grid>
                    ),
                  )
                )
                : (
                  // Fallback message when no shipment is selected
                  <Typography variant="h6" align="center">
                    Select a shipment to view reporting data
                  </Typography>
                )
            }
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

// Export the component for use in the app
export default ReportingActiveShipmentDetails;
