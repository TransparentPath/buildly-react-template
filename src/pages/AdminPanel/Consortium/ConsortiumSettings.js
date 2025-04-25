import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

// Importing child components for each section of the configuration
import MappingOrg from './components/MappingOrg';
import Consortium from './components/Consortium';

// Custom CSS for admin panel styling
import '../AdminPanelStyles.css';

/**
 * Configuration component renders two collapsible accordion panels:
 * 1. Mapping Custodian Organization
 * 2. Consortium
 *
 * Each section can expand/collapse and contains its respective component.
 * Props are passed down to the children to ensure reusability and dynamic rendering.
 */
const Configuration = (props) => (
  <div className="adminPanelRoot">

    {/* Accordion for "Mapping Custodian Organization" */}
    <Accordion className="adminPanelAccordion">

      {/* Header for the first accordion panel */}
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />} // MUI icon for expand/collapse
        aria-controls="mappingorg-content" // Accessibility: ID of the region this controls
        id="mappingorg-header" // Unique ID for this header
      >
        {/* Section title */}
        <Typography variant="h5">
          Mapping Custodian Organization
        </Typography>
      </AccordionSummary>

      {/* Content area of the accordion where MappingOrg component is rendered */}
      <AccordionDetails>
        <MappingOrg {...props} />
      </AccordionDetails>
    </Accordion>

    {/* Accordion for "Consortium" configuration */}
    <Accordion className="adminPanelAccordion">

      {/* Header for the second accordion panel */}
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />} // Expand/collapse icon
        aria-controls="consortium-content" // Accessibility: ID of the controlled region
        id="consortium-header" // Unique ID for the header
      >
        {/* Section title */}
        <Typography variant="h5">
          Consortium
        </Typography>
      </AccordionSummary>

      {/* Content area where Consortium component is rendered */}
      <AccordionDetails>
        <Consortium {...props} />
      </AccordionDetails>
    </Accordion>
  </div>
);

export default Configuration;
