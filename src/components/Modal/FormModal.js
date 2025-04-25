import React from 'react';
// MUI Components
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material'; // Close icon from MUI Icons
import ConfirmModal from './ConfirmModal'; // Importing a confirmation modal component
import { isMobile } from '@utils/mediaQuery'; // Utility function to check if the user is on a mobile device
import './ModalStyles.css'; // Custom CSS file for modal styling

// Functional component for the form modal
const FormModal = ({
  open, // Prop to control if the modal is open or not
  handleClose, // Function passed as prop to close the modal
  title, // Title for the modal, passed as a prop
  children, // Children components or content to be displayed inside the modal
  openConfirmModal, // Boolean to control if the confirmation modal is open
  setConfirmModal, // Function to set the state of the confirmation modal
  handleConfirmModal, // Function to handle the confirmation action in the confirmation modal
}) => (
  <div>
    {/* Dialog component to render the modal */}
    <Dialog
      open={open} // Controls the open/close state of the modal
      onClose={handleClose} // Handles closing of the modal when clicked outside or other actions
      fullWidth // Make the modal take the full width of the screen
      fullScreen={isMobile()} // If the screen size is mobile, make the modal full screen
      maxWidth="md" // Set the maximum width of the modal to "medium"
      aria-labelledby="form-dialog-title" // Accessibility: Set the ID for the dialog title
    >
      {/* DialogTitle is used to render the modal title */}
      <DialogTitle id="dialog-title" className="modalRoot">
        {/* Typography is used to render the modal's title text */}
        <Typography className="modalTitle" variant="inherit">
          {/* Title is dynamically passed as a prop */}
          {title}
        </Typography>
        {/* Conditional rendering of the close button */}
        {handleClose ? (
          <IconButton
            aria-label="close" // Accessibility: Label for the close button
            className="modalCloseButton" // Custom class for styling the close button
            onClick={handleClose} // Function to close the modal when the button is clicked
          >
            {/* Close icon to be displayed inside the IconButton */}
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      {/* DialogContent is used to render the content of the modal */}
      <DialogContent>
        {/* Children components or content passed as a prop to be displayed inside the modal */}
        {children}
      </DialogContent>
    </Dialog>
    {/* ConfirmModal is a separate modal displayed to confirm unsaved changes */}
    <ConfirmModal
      open={openConfirmModal} // Controls whether the confirmation modal is open or not
      setOpen={setConfirmModal} // Function to change the state of the confirmation modal
      submitAction={handleConfirmModal} // Function to handle the confirmation action (like navigating away)
      title="Your changes are unsaved and will be discarded. Are you sure to leave?" // Title of the confirmation modal
      submitText="Yes" // Text to display for the confirmation action button
    />
  </div>
);

export default FormModal;
