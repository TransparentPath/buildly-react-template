import React from 'react';
import { Tooltip, Typography } from '@mui/material'; // Import Tooltip and Typography components from Material UI
import { Info as InfoIcon } from '@mui/icons-material'; // Import the Info icon from Material UI icons
import './TooltipStyles.css'; // Import custom CSS for styling the tooltip icon

/**
 * CustomizedTooltips Component
 *
 * A reusable component that displays an info icon with a customized tooltip.
 *
 * Props:
 * - toolTipText (string): The content to be shown inside the tooltip when hovered over the info icon.
 */
const CustomizedTooltips = ({ toolTipText }) => (
  <Tooltip
    arrow // Adds an arrow pointing from the tooltip to the icon
    title={(
      // The tooltip content is wrapped in Typography for consistent text styling
      <Typography color="inherit">
        {toolTipText}
      </Typography>
    )}
  >
    {/* The info icon that triggers the tooltip on hover */}
    <InfoIcon
      color="action" // Uses the 'action' color from the theme palette
      fontSize="small" // Sets the icon size to small
      className="infoToolTip" // Applies custom CSS styling to the icon
    />
  </Tooltip>
);

export default CustomizedTooltips;
