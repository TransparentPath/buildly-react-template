import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useCustomAlertStore } from '@zustand/customAlert/customAlertStore';
// import './CustomAlertStyles.css';

/**
 * CustomAlert Component
 *
 * A modal dialog component that mimics the behavior of window.alert() but with
 * enhanced features including customizable title, message, and button text.
 *
 * Features:
 * - Modal overlay (blocks interaction with background)
 * - Customizable title
 * - Customizable button text
 * - Optional close button
 * - Promise-based API like window.alert()
 * - Keyboard support (Enter to confirm, Escape to close)
 */
const CustomAlert = () => {
  const { alertData, hideCustomAlert } = useCustomAlertStore();

  /**
   * Handles the confirmation action when user clicks the main button
   */
  const handleConfirm = () => {
    // Call the resolve function if provided (for Promise-based usage)
    if (alertData?.resolve) {
      alertData.resolve(true);
    }

    // Call custom onConfirm callback if provided
    if (alertData?.onConfirm) {
      alertData.onConfirm();
    }

    hideCustomAlert();
  };

  /**
   * Handles the close/cancel action
   */
  const handleClose = () => {
    // Call the resolve function with false (for Promise-based usage)
    if (alertData?.resolve) {
      alertData.resolve(false);
    }

    // Call custom onClose callback if provided
    if (alertData?.onClose) {
      alertData.onClose();
    }

    hideCustomAlert();
  };

  /**
   * Handle keyboard events
   */
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleConfirm();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (alertData?.allowEscapeClose !== false) {
        handleClose();
      }
    }
  };

  // Don't render anything if no alert data
  if (!alertData) {
    return null;
  }

  return (
    <Dialog
      open={!!alertData}
      onClose={undefined} // Disable backdrop clicks completely
      onKeyDown={handleKeyDown}
      maxWidth="sm"
      fullWidth
      className="customAlert"
      PaperProps={{
        className: 'customAlertPaper',
      }}
      // Prevent closing on backdrop click and escape key
      disableEscapeKeyDown={alertData?.allowEscapeClose === false}
    >
      {/* Dialog Title */}
      <DialogTitle className="customAlertTitle">
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {alertData.title || 'Alert'}
        </Typography>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent className="customAlertContent">
        <Typography variant="body1" className="customAlertMessage">
          {alertData.message}
        </Typography>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions className="customAlertActions">
        {/* Optional cancel/secondary button */}
        {alertData.showCancelButton && (
          <Button
            onClick={handleClose}
            color="inherit"
            variant="outlined"
            className="customAlertCancelButton"
          >
            {alertData.cancelButtonText || 'Cancel'}
          </Button>
        )}

        {/* Main confirm button */}
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
          autoFocus
          className="customAlertConfirmButton"
        >
          {alertData.buttonText || 'OK'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomAlert;
