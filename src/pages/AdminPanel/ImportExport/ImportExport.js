import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material'; // Material UI components for Accordion
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'; // Expand icon for accordion
import AddFromFile from './forms/AddFromFile'; // Component for importing data from a file
import AddFromAPI from './forms/AddFromAPI'; // Component for importing data from an API
import ExportData from './forms/ExportData'; // Component for exporting data
import '../AdminPanelStyles.css'; // Styles for the admin panel

/**
 * ImportExport component provides the functionality to manage the import and export
 * of data through file and API interactions. The component contains three accordion
 * sections for importing data from a file, importing data via an API, and exporting data.
 *
 * It utilizes Material UI's Accordion component for a collapsible UI structure.
 */
const ImportExport = (props) => (
  <div className="adminPanelRoot">
    {/* Accordion for Import from File */}
    <Accordion className="adminPanelAccordion">
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />} // Icon that toggles the accordion's open/close state
        aria-controls="import-file-content" // Controls the associated content section for accessibility
        id="import-file-header" // ID for the accordion summary (header)
      >
        <Typography variant="h5">
          Import from File
        </Typography>
      </AccordionSummary>
      {/* Content for "Import from File" accordion */}
      <AccordionDetails>
        {/* AddFromFile component for handling file imports */}
        <AddFromFile {...props} />
      </AccordionDetails>
    </Accordion>

    {/* Accordion for Import from API */}
    <Accordion className="adminPanelAccordion">
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />} // Icon for expanding the accordion
        aria-controls="import-api-content" // Controls the associated content section for accessibility
        id="import-api-header" // ID for the accordion summary (header)
      >
        <Typography variant="h5">
          Import from API
        </Typography>
      </AccordionSummary>
      {/* Content for "Import from API" accordion */}
      <AccordionDetails>
        {/* AddFromAPI component for handling API-based imports */}
        <AddFromAPI {...props} />
      </AccordionDetails>
    </Accordion>

    {/* Accordion for Export Data */}
    <Accordion className="adminPanelAccordion">
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />} // Icon to expand the accordion
        aria-controls="export-content" // Controls the associated content section for accessibility
        id="export-header" // ID for the accordion summary (header)
      >
        <Typography variant="h5">
          Export Data
        </Typography>
      </AccordionSummary>
      {/* Content for "Export Data" accordion */}
      <AccordionDetails>
        {/* ExportData component for handling data export functionality */}
        <ExportData {...props} />
      </AccordionDetails>
    </Accordion>
  </div>
);

export default ImportExport;
