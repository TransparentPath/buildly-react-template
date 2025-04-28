import React from 'react'; // Import React for JSX rendering
import _ from 'lodash'; // Lodash is imported for utility functions (though not used in this file)
import { Dialog, DialogContent } from '@mui/material'; // Import MUI components for modal and its content area
import '../../TopBarStyles.css'; // Import custom styles for the modal

// Import custom components for the header, content, and footer of the modal
import WhatsNewHeader from './WhatsNewHeader';
import WhatsNewContent from './WhatsNewContent';
import WhatsNewFooter from './WhatsNewFooter';

/**
 * WhatsNewModal Component
 *
 * This component renders a modal dialog to show "What's New?" information to the user.
 * It includes a custom header, HTML content, and a footer with a button to close the modal.
 *
 * Props:
 * - open (boolean): Controls whether the modal is open or closed.
 * - setOpen (function): Function to update the `open` state from the parent component.
 * - data (any): Content to be displayed inside the modal (expected to be HTML).
 */
const WhatsNewModal = ({ open, setOpen, data }) => {
  /**
   * closeWhatsNew
   *
   * Closes the modal and saves a flag in localStorage to indicate the content has been shown.
   * This can be used to prevent repeatedly showing the modal to the same user.
   */
  const closeWhatsNew = () => {
    setOpen(false); // Trigger parent state change to close the modal
    localStorage.setItem('isWhatsNewShown', true); // Set a flag to remember the modal has been viewed
  };

  return (
    <Dialog
      open={open} // Controls the visibility of the dialog
      onClose={closeWhatsNew} // Called when the dialog is dismissed (e.g., clicking outside or pressing Escape)
      fullWidth // Makes the dialog span the full width of its container
      fullScreen={false} // Dialog is not full screen (useful for larger screens)
      aria-labelledby="whats-new" // Accessibility: associates label with this dialog
      className="whatsNewDialogContainer" // Applies custom styling
    >
      {/* Renders the modal header, which shows the title and version information */}
      <WhatsNewHeader />
      {/* DialogContent wraps the main body of the modal, styled with padding and background */}
      <DialogContent className="whatsNewDialogContent">
        {/* Displays the provided HTML content via dangerouslySetInnerHTML */}
        <WhatsNewContent data={data} />
        {/* Footer with a button to close the modal and return to the platform */}
        <WhatsNewFooter buttonClick={closeWhatsNew} />
      </DialogContent>
    </Dialog>
  );
};

export default WhatsNewModal; // Export the component to be used elsewhere in the app
