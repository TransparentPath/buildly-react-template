import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import Devices from './forms/Devices'; // Import the Devices component, which handles the devices form
import '../AdminPanelStyles.css'; // Import custom CSS styles for the admin panel

// The Configuration component renders the configuration section for device management
const Configuration = (props) => {
  const { t } = useTranslation();

  return (
    <div className="adminPanelRoot">
      {/* Accordion component to toggle between New Devices and Reuse Devices sections */}
      <Accordion className="adminPanelAccordion">
        {/* AccordionSummary is the clickable section that expands/collapses the accordion */}
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />} // Icon that indicates the expand/collapse action
          aria-controls="new-tracker-content" // For accessibility: controls the visibility of the accordion details
          id="new-tracker-header" // Unique ID for this section
        >
          <Typography variant="h5">{t('adminTrackers.newDevices')}</Typography>
        </AccordionSummary>

        {/* AccordionDetails contains the content that gets shown when the accordion is expanded */}
        <AccordionDetails>
          {/* Pass isNewDevices as true to the Devices component to manage new devices */}
          <Devices isNewDevices />
        </AccordionDetails>
      </Accordion>

      {/* Accordion component for Reuse Devices section */}
      <Accordion className="adminPanelAccordion">
        {/* AccordionSummary for the Reuse Devices section */}
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />} // Icon for expand/collapse functionality
          aria-controls="reuse-tracker-content" // For accessibility: controls the visibility of the accordion details
          id="reuse-tracker-header" // Unique ID for this section
        >
          <Typography variant="h5">{t('adminTrackers.reuseDevices')}</Typography>
        </AccordionSummary>

        {/* AccordionDetails containing the content for the Reuse Devices section */}
        <AccordionDetails>
          {/* Pass isNewDevices as false to the Devices component to manage reused devices */}
          <Devices isNewDevices={false} />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default Configuration;
