import React, { useState } from "react";
import { Snackbar, Slide, IconButton } from "@mui/material";
import { makeStyles } from "@mui/styles";
import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
    "& .MuiSnackbarContent-root": {
      backgroundColor: "transparent",
    },
  },
  success: {
    backgroundColor: theme.palette.success.main,
  },
  info: {
    backgroundColor: theme.palette.info.main,
  },
  warning: {
    backgroundColor: theme.palette.warning.main,
  },
  error: {
    backgroundColor: theme.palette.error.main,
  },
}));

const CustomAlert = ({ data }) => {
  const classes = useStyles();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    data = null;
    if (data && data.onClose) {
      data.onClose(data.id);
    }
  };

  return (
    <div className={classes.root}>
      <Snackbar
        key={`${data.type}-${data.message}`}
        open={data.open || false}
        autoHideDuration={1000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        message={data.message}
        TransitionComponent={(props) => <Slide {...props} direction="left" />}
        classes={{
          root: classes[data.type],
        }}
        action={
          <>
            <IconButton
              aria-label="close"
              color="inherit"
              sx={{ p: 0.5 }}
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </>
        }
      />
    </div>
  );
};

export default CustomAlert;
