import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * ConfirmModal is a reusable modal dialog component used to prompt the user for confirmation.
 * Typically used when there are unsaved changes or irreversible actions.
 *
 * Props:
 * - open (boolean): Controls whether the modal is open or closed.
 * - setOpen (function): Function to update the open state of the modal.
 * - submitAction (function): Callback function to execute when the user confirms the action.
 * - title (string): Title displayed at the top of the modal.
 * - submitText (string): Text displayed on the confirmation button.
 * - msg1 (string, optional): Optional message to show as the first line in the modal content.
 * - msg2 (string, optional): Optional message to show as the second line in the modal content.
 */
const ConfirmModal = ({
  open, // Controls the visibility of the modal
  setOpen, // Function to set the open state (close the modal)
  submitAction, // Function to call when user confirms the action
  title, // Title displayed in the modal header
  submitText, // Label for the confirm (submit) button
  msg1, // Optional message to be displayed in the content area (line 1)
  msg2, // Optional message to be displayed in the content area (line 2)
}) => {
  const { t } = useTranslation();

  // Function to handle modal closing without confirming
  const handleClose = () => {
    setOpen(false); // Close the modal by updating the open state
  };

  return (
    <div>
      <Dialog
        open={open} // Controls whether the dialog is visible
        onClose={handleClose} // Called when user attempts to close the modal (e.g., outside click or Cancel button)
        aria-labelledby="alert-dialog-title" // Accessibility: ID for the dialog title
        aria-describedby="alert-dialog-description" // Accessibility: ID for the dialog content
      >
        {/* Modal Title Section */}
        <DialogTitle id="alert-dialog-title">
          {title}
        </DialogTitle>
        {/* Modal Content Section */}
        <DialogContent>
          {/* Display first optional message if provided */}
          {msg1 && (
            <Typography
              variant="body1"
              textAlign="center"
              width="100%"
            >
              {msg1}
            </Typography>
          )}
          {/* Display second optional message if provided */}
          {msg2 && (
            <Typography
              variant="body1"
              textAlign="center"
              width="100%"
            >
              {msg2}
            </Typography>
          )}
        </DialogContent>
        {/* Modal Action Buttons */}
        <DialogActions>
          {/* Cancel button - calls handleClose to close the modal */}
          <Button
            variant="outlined"
            onClick={handleClose}
            color="primary"
          >
            {t('common.cancel')}
          </Button>
          {/* Confirm button - calls submitAction to proceed */}
          <Button
            variant="contained"
            onClick={submitAction}
            color="primary"
            autoFocus // Auto-focuses this button for accessibility/usability
          >
            {submitText}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConfirmModal;
