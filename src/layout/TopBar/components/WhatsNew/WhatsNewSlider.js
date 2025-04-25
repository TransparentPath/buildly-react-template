import React, { forwardRef } from 'react'; // Import React and forwardRef for custom transition components
import _ from 'lodash'; // Lodash is imported for utility functions (not used here but possibly used in children)
import { Dialog, DialogContent, Slide } from '@mui/material'; // MUI components for modal and transitions
import { isTablet } from '@utils/mediaQuery'; // Utility function to check if the device is a tablet
import '../../TopBarStyles.css'; // Custom styles specific to the TopBar and modal appearance

// Import child components
import WhatsNewHeader from './WhatsNewHeader'; // Modal header with title and optional close icon
import WhatsNewContent from './WhatsNewContent'; // Component to render HTML content inside the modal

/**
 * Transition Component
 *
 * Creates a custom slide transition using MUI's Slide component.
 * The direction is set to "left", giving a sliding-in effect from the right.
 * Wrapped with forwardRef as required by MUI's TransitionComponent.
 */
const Transition = forwardRef((props, ref) => <Slide direction="left" ref={ref} {...props} />);

/**
 * WhatsNewSlider Component
 *
 * Displays a sliding dialog to show "What's New?" content.
 * Useful for showing updates or release notes in a modern, mobile-friendly format.
 *
 * Props:
 * - open (boolean): Determines whether the modal is open or not.
 * - setOpen (function): Function to set the `open` state (to close the modal).
 * - data (any): The HTML content or data to render inside the modal.
 */
const WhatsNewSlider = ({ open, setOpen, data }) => {
  /**
   * closeWhatsNew
   *
   * Closes the modal by updating parent state via `setOpen(false)`.
   */
  const closeWhatsNew = () => {
    setOpen(false); // Close the modal when the user takes an action
  };

  return (
    <Dialog
      open={open} // Control modal visibility
      onClose={closeWhatsNew} // Close modal when background or close button is clicked
      fullWidth // Makes the modal span full width of the screen
      fullScreen={isTablet()} // If on a tablet, the modal becomes fullscreen for a better experience
      aria-labelledby="whats-new" // Accessibility label for screen readers
      TransitionComponent={Transition} // Uses custom Slide transition from right to left
      className="whatsNewDialog" // Apply custom CSS class for further styling
    >
      {/* Header section with title and optional close icon */}
      <WhatsNewHeader closeIcon closeOnClick={closeWhatsNew} />
      {/* Dialog content section renders the provided HTML update content */}
      <DialogContent className="whatsNewDialogContent">
        <WhatsNewContent data={data} />
      </DialogContent>
    </Dialog>
  );
};

export default WhatsNewSlider; // Export the component for use in other parts of the app
