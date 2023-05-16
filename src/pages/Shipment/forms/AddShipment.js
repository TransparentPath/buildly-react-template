import React, { useState, useContext } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Grid, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import FormModal from '../../../components/Modal/FormModal';
import { UserContext } from '../../../context/User.context';
import { checkForGlobalAdmin } from '../../../utils/utilMethods';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
}));

const AddShipment = ({
  location, history, shipmentFormData, dispatch,
}) => {
  const classes = useStyles();
  const user = useContext(UserContext);

  const editPage = location.state && location.state.type === 'edit';
  const editData = location.state && location.state.data;
  // For non-admins the forms becomes view-only once the shipment status is no longer just planned
  const viewOnly = !checkForGlobalAdmin(user)
    && editPage
    && editData
    && editData.status
    && _.lowerCase(editData.status) !== 'planned';

  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);

  let formTitle;
  if (!editPage) {
    formTitle = 'Add Shipment';
  } else if (viewOnly) {
    formTitle = 'View Shipment';
  } else {
    formTitle = 'Edit Shipment';
  }

  const closeModal = () => {
    console.log('close modal');
    setFormModal(false);
  };

  const handleConfirmModal = () => {
    console.log('handle consfirm modal');
    setConfirmModal(false);
  };

  return (
    <div>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeModal}
          title={formTitle}
          titleClass={classes.formTitle}
          maxWidth="md"
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={handleConfirmModal}
        >
          <Grid container className={classes.root}>
            <Grid container spacing={2}>
              <Grid xs={6}>
                <Typography variant="h2" component="h2">
                  {formTitle}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </FormModal>
      )}
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
});

export default connect(mapStateToProps)(AddShipment);
