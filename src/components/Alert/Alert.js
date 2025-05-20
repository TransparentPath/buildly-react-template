import React from 'react';
import { Snackbar, Slide, IconButton } from '@mui/material'; // MUI components for displaying Snackbar alerts and icons
import CloseIcon from '@mui/icons-material/Close';
import { useStore } from '@zustand/alert/alertStore'; // Custom Zustand store for global alert state
import './AlertStyles.css'; // Custom styles for alert

const Alert = () => {
  // Destructure the current alert `data` and `hideAlert` action from Zustand store
  const { data, hideAlert } = useStore();

  /**
   * Handles closing of the Snackbar alert.
   * Prevents closing when user clicks outside the alert (clickaway).
   * Also triggers any custom `onClose` callback provided in the alert data.
   *
   * @param {object} event - Event object from the Snackbar.
   * @param {string} reason - Reason for closing (e.g., 'timeout', 'clickaway').
   */
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return; // Prevent Snackbar from closing on clickaway
    }
    // Hide the alert via Zustand action
    hideAlert();
    // If a custom onClose callback exists, call it with the alert's id
    if (data && data.onClose) {
      data.onClose(data.id);
    }
  };

  return (
    // Root container with a custom class for styling
    <div className="alertRoot">
      {/* Render the Snackbar only when alert `data` is available */}
      {data && (
        <Snackbar
          // Unique key for React reconciliation based on alert type and message
          key={`${data.type}-${data.message}`}
          open={data.open || false} // Control open state of Snackbar
          autoHideDuration={5000} // Auto close after 5 seconds
          onClose={handleClose} // Function to handle closing of Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Positioning of Snackbar
          message={data.message} // Alert message to display
          // Slide transition animation from the left
          TransitionComponent={(props) => <Slide {...props} direction="left" />}
          // Apply dynamic styling based on alert type via CSS class
          classes={{
            root: `${data.type}`,
          }}
          // Optional action element (Close button)
          action={(
            <>
              <IconButton
                aria-label="close" // Accessibility label
                color="inherit" // Inherit color from parent
                sx={{ p: 0.5 }} // Padding for spacing
                onClick={handleClose} // Manually close Snackbar when button clicked
              >
                <CloseIcon />
              </IconButton>
            </>
          )}
        />
      )}
    </div>
  );
};

export default Alert;
