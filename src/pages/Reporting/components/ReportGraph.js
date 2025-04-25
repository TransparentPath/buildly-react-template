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
            // Map over each available report type and render its icon
            _.map(REPORT_TYPES(unitOfMeasure), (item, index) => (
              <ListItem
                key={`iconItem${index}${item.id}`} // Unique key based on index and item ID
                style={{ paddingRight: '33px', marginTop: '12px' }} // Custom icon spacing
                selected={item.id === graphType} // Highlight icon if it's the selected graph type
              >
                {
                  // Dynamically get and render the icon component with themed color
                  getIcon({ ...item, color: theme.palette.background.dark })
                }
              </ListItem>
            ))
          }
        </List>
      </Grid>

      {/* Main graph area that shows the graph based on selected type */}
      <Grid item xs={10} sm={11}>
        <GraphComponent
          data={data[graphType]} // Pass the specific data for the selected graph type
          selectedGraph={graphType} // Let GraphComponent know what type to render
        />
      </Grid>
    </Grid>
  );
});

// Exporting the component for use in other parts of the application
export default ReportGraph;
