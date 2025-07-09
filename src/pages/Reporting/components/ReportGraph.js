/* eslint-disable no-nested-ternary */
// React and third-party imports
import React, { useState, useEffect, forwardRef } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone'; // Not used here but might be in future or in reused code
import {
  Grid, List, ListItem, Typography, useTheme,
} from '@mui/material';

// Utility and component imports
import { getIcon, REPORT_TYPES } from '@utils/constants'; // Utility to get graph icons and types
import GraphComponent from '@components/GraphComponent/GraphComponent';

// ForwardRef allows parent component to attach a ref to this component's root element
const ReportGraph = forwardRef((props, ref) => {
  const {
    selectedShipment, // Object containing metadata about the selected shipment
    unitOfMeasure, // The measurement unit (e.g., Celsius, Fahrenheit, etc.)
    theme, // MUI theme object for accessing palette, spacing, etc.
    graphType, // Currently selected graph type (e.g., temperature, humidity)
    data, // Graph data categorized by graph type
  } = props;

  const reportTypes = REPORT_TYPES(unitOfMeasure);
  const hasValidGraphData = data && typeof data === 'object' && graphType in data && !_.isEmpty(data[graphType]);

  return (
    // Outer container for the entire graph view layout
    <Grid
      ref={ref} // Ref passed from parent for screenshotting or DOM access
      container
      className="reportingContainer2" // Custom class for styling
    >
      {/* Header section that shows "Graph View" with shipment name if available */}
      <div className="reportingSwitchViewSection">
        <Typography className="reportingSectionTitleHeading" variant="h5">
          {
            // Display shipment name dynamically if available
            !_.isEmpty(selectedShipment) && selectedShipment.name
              ? `Graph View - Shipment: ${selectedShipment.name}`
              : 'Graph View'
          }
        </Typography>
      </div>

      {/* Sidebar with vertical list of icons representing different graph types */}
      <Grid item xs={2} sm={1}>
        <List component="nav" aria-label="main graph-type" className="reportingGraphIconBar">
          {
            _.isArray(reportTypes) && reportTypes.length > 0 ? (
              _.map(reportTypes, (item, index) => {
                let iconElement;
                try {
                  iconElement = getIcon({ ...item, color: theme?.palette?.background?.dark || '#000' });
                } catch (e) {
                  iconElement = <Typography color="error">Icon Error</Typography>;
                }

                return (
                  <ListItem
                    key={`iconItem${index}${item.id}`}
                    style={{ paddingRight: '33px', marginTop: '12px' }}
                    selected={item.id === graphType}
                  >
                    {iconElement}
                  </ListItem>
                );
              })
            ) : (
              <Typography variant="body2" color="error" sx={{ pl: 2, pt: 2 }}>
                No graph types available.
              </Typography>
            )
          }
        </List>
      </Grid>

      {/* Main graph area that shows the graph based on selected type */}
      <Grid item xs={10} sm={11}>
        {
          !graphType || !data ? (
            <Typography variant="body1" color="error" sx={{ mt: 2 }}>
              Graph data is not available.
            </Typography>
          ) : hasValidGraphData ? (
            <GraphComponent
              key={graphType}
              data={data[graphType]}
              selectedGraph={graphType}
            />
          ) : (
            <Typography variant="body1" color="error" sx={{ mt: 2 }}>
              No data found for selected graph type:
              {' '}
              <strong>{graphType}</strong>
              .
            </Typography>
          )
        }
      </Grid>
    </Grid>
  );
});

// Exporting the component for use in other parts of the application
export default ReportGraph;
