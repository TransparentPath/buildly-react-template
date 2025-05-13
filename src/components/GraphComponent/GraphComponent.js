import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import {
  CartesianGrid, // Adds grid lines to the chart for better readability
  Legend, // Displays the legend (labels for data series)
  Line, // Represents each individual data line on the chart
  LineChart, // The main chart component from Recharts to plot line graphs
  ResponsiveContainer, // Makes the chart responsive to parent container size
  Tooltip, // Shows values when hovering over points on the chart
  XAxis, // X-axis component for horizontal data labels
  YAxis, // Y-axis component for vertical values
} from 'recharts';
import { Typography, useTheme } from '@mui/material'; // MUI components
import './GraphComponentStyles.css'; // Custom CSS styles for styling the graph, tooltips, and legends

// Main functional component to display a line chart
const GraphComponent = ({
  data, // Array of data points to plot. Each point contains { x, y, max, [min] }
  selectedGraph, // The currently selected graph type (e.g., "temperature", "speed")
}) => {
  const theme = useTheme(); // Hook to access Material-UI theme (used for consistent color theming)

  // Custom legend content component for the top of the chart
  const legendContent = (
    <div className="graphLegendDiv">
      {/* Dot for normal line */}
      <div className="graphNormalColor" />
      {/* Label: Normal value */}
      {_.capitalize(selectedGraph)}
      {/* Dot for max line */}
      <div className="graphMaxColor" />
      {/* Label: Max value */}
      {`Max ${_.capitalize(selectedGraph)}`}
      {/* Conditionally show min dot + label if "min" key exists in the data */}
      {_.size(data) > 0 && _.includes(_.keysIn(data[0]), 'min') && (<div className="graphMinColor" />)}
      {_.size(data) > 0 && _.includes(_.keysIn(data[0]), 'min') && `Min ${_.capitalize(selectedGraph)}`}
    </div>
  );

  const customDot = <circle r="0.5" />; // Tiny dot (currently unused)

  // Custom tooltip for showing detailed info when hovering on points
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="graphTooltip">
          {/* x-axis label (e.g., timestamp) */}
          <div>{label}</div>
          {/* y-axis value */}
          <div>{payload[0].value}</div>
        </div>
      );
    }
    return null; // If no tooltip data, render nothing
  };

  return (
    <div>
      {/* If data exists and has items, render the graph */}
      {data && _.size(data) > 0 ? (
        <ResponsiveContainer width="100%" height={700}>
          <LineChart width="100%" height="100%" data={data}>
            {/* Dotted grid lines */}
            <CartesianGrid strokeDasharray="3 3" />
            {/* X-axis settings */}
            <XAxis
              dataKey="x" // Field to use for x-axis values
              angle={90} // Rotate labels for readability
              textAnchor="start"
              height={120}
              tick={{ fontSize: '8px' }} // Smaller font for dense data
              reversed // Reverse order (e.g., latest data on top)
            />
            {/* Y-axis with fixed width */}
            <YAxis width={30} />
            {/* Tooltip on hover */}
            <Tooltip content={<CustomTooltip />} />
            {/* Custom legend at top */}
            <Legend verticalAlign="top" height={36} content={legendContent} />
            {/* Main data line: "y" values */}
            <Line
              connectNulls // Connect points even if some values are null
              dot={false} // No visible dots for cleaner look
              type="monotone" // Smooth curved line
              dataKey="y"
              stroke={theme.palette.background.dark} // Line color from theme
              fill={theme.palette.background.dark}
              strokeWidth={3}
            />
            {/* Max value line */}
            <Line
              connectNulls
              dot={false}
              type="monotone"
              dataKey="max"
              stroke={theme.palette.error.main} // Error color for max (usually red)
              fill={theme.palette.error.main}
              strokeWidth={3}
            />
            {/* Min value line (conditionally shown only if "min" exists in data) */}
            {_.includes(_.keysIn(data[0]), 'min') && (
              <Line
                connectNulls
                dot={false}
                type="monotone"
                dataKey="min"
                stroke={theme.palette.info.main} // Info color for min (usually blue)
                fill={theme.palette.info.main}
                strokeWidth={3}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        // Fallback message if no data is available
        <Typography
          variant="body1"
          style={{ marginTop: theme.spacing(5), textAlign: 'center' }}
        >
          No data to display
        </Typography>
      )}
    </div>
  );
};

export default GraphComponent;
