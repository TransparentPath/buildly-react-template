import React, { useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import {
  Grid,
  Button,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import tiveLithium from '@assets/tive_lithium.png';
import tiveNonLithium from '@assets/tive_non_lithium.png';
import Loader from '@components/Loader/Loader';
import FormModal from '@components/Modal/FormModal';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import { getRecipientAddressQuery } from '@react-query/queries/recipientaddress/getRecipientAddressQuery';
import { useAddTrackerOrderMutation } from '@react-query/mutations/trackerorder/addTrackerOrderMutation';
import { validators } from '@utils/validators';
import { isDesktop } from '@utils/mediaQuery';
import { ORDER_TYPES } from '@utils/mock';
import { FlightSafeIcon, FlightUnsafeIcon } from '@utils/constants';
import '../TrackerOrderStyles.css';

const AddTrackerOrder = ({ history, location }) => {
  const { organization_uuid } = getUser().organization;
  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);

  const { displayAlert } = useAlert();

  const reOrderPage = location.state && location.state.type === 're-order';
  const reOrderData = (reOrderPage && location.state.data) || {};

  const order_type = useInput((reOrderData && reOrderData.order_type) || '', { required: true });
  const order_quantity = useInput((reOrderData && reOrderData.order_quantity) || '', { required: true });
  const order_recipient = useInput((reOrderData && reOrderData.order_recipient) || '', { required: true });
  const order_address = useInput((reOrderData && reOrderData.order_address) || '', { required: true });
  const [formError, setFormError] = useState({});

  const { data: recipientAddressData, isLoading: isLoadingRecipientAddresses } = useQuery(
    ['recipientAddresses', organization_uuid],
    () => getRecipientAddressQuery(organization_uuid, displayAlert),
    { refetchOnWindowFocus: false },
  );

  const closeFormModal = () => {
    if (
      order_type.hasChanged()
      || order_quantity.hasChanged()
      || order_recipient.hasChanged()
      || order_address.hasChanged()
    ) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      if (location && location.state) {
        history.push(location.state.from);
      }
    }
  };

  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(location.state.from);
    }
  };

  const { mutate: addTrackerOrderMutation, isLoading: isAddingTrackerOrder } = useAddTrackerOrderMutation(history, location.state.from, displayAlert);

  /**
   * Submit The form and add/edit custodian type
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = {
      ...reOrderData,
      order_date: new Date(),
      order_type: order_type.value,
      order_quantity: _.toNumber(order_quantity.value),
      order_recipient: order_recipient.value,
      order_address: order_address.value,
      organization_uuid,
    };

    addTrackerOrderMutation(data);
  };

  /**
   * Handle input field blur event
   * @param {Event} e Event
   * @param {String} validation validation type if any
   * @param {Object} input input field
   */

  const handleBlur = (e, validation, input, parentId) => {
    const validateObj = validators(validation, input);
    const prevState = { ...formError };
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e.target.id || parentId]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [e.target.id || parentId]: {
          error: false,
          message: '',
        },
      });
    }
  };

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!order_type.value || !order_quantity.value || !order_recipient.value || !order_address.value) {
      return true;
    }
    let errorExists = false;
    _.forEach(errorKeys, (key) => {
      if (formError[key].error) {
        errorExists = true;
      }
    });
    return errorExists;
  };

  return (
    <div>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title="Place an Order"
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          {(isAddingTrackerOrder || isLoadingRecipientAddresses) && <Loader open={isAddingTrackerOrder || isLoadingRecipientAddresses} />}
          <form
            noValidate
            onSubmit={handleSubmit}
          >
            <Grid container columnGap={2}>
              <Grid item xs={12} md={5.8} className="addOrderContainer">
                <Grid container>
                  <Grid item xs={12} padding={2}>
                    <Typography className="trackerOrderBold">TRACKER</Typography>
                  </Grid>

                  <Grid item xs={12} className="addOrderTextField">
                    <TextField
                      variant="outlined"
                      fullWidth
                      id="order-type"
                      select
                      label="Tracker Type"
                      {...order_type.bind}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {_.map(ORDER_TYPES, (ot, index) => (
                        <MenuItem key={`${ot.value}-${index}`} value={ot.value}>
                          <Typography component="div" className="addOrderTypeWithIcon">
                            {ot.label}
                            <span>{_.includes(ot.label, 'Non') ? <FlightSafeIcon /> : <FlightUnsafeIcon />}</span>
                          </Typography>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} className="addOrderDeviceImage">
                    {order_type.value && _.includes(order_type.value, 'Non') && (
                      <img
                        src={tiveNonLithium}
                        alt={order_type.value}
                      />
                    )}
                    {order_type.value && !_.includes(order_type.value, 'Non') && (
                      <img
                        src={tiveLithium}
                        alt={order_type.value}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12} textAlign="center">
                    <TextField
                      variant="outlined"
                      margin="normal"
                      type="number"
                      className="addOrderNumberInput"
                      id="order-quantity"
                      name="order-quantity"
                      label="Tracker Quantity"
                      autoComplete="order-quantity"
                      {...order_quantity.bind}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={5.8} className="addOrderContainer addOrderContainerSmallScreen">
                <Grid container>
                  <Grid item xs={12} padding={2}>
                    <Typography className="trackerOrderBold">RECIPIENT</Typography>
                  </Grid>

                  <Grid item xs={12} className="addOrderTextField">
                    <TextField
                      variant="outlined"
                      fullWidth
                      select
                      required
                      id="order-recipient"
                      label="Order Recipient"
                      value={_.find(recipientAddressData, { name: order_recipient.value, address: order_address.value })}
                      onChange={(e) => {
                        order_recipient.setValue(e.target.value.name);
                        order_address.setValue(e.target.value.address);
                      }}
                    >
                      {_.map(recipientAddressData, (ra, index) => (
                        <MenuItem key={`${ra.name}-${index}`} value={ra}>
                          {ra.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} className="addOrderTextArea">
                    <TextField
                      disabled
                      fullWidth
                      multiline
                      variant="outlined"
                      margin="normal"
                      id="order-address"
                      name="order-address"
                      autoComplete="order-address"
                      {...order_address.bind}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid container spacing={2} justifyContent="center" className="addOrderActions">
                <Grid item xs={6} sm={5.15} md={4}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={isAddingTrackerOrder || isLoadingRecipientAddresses || submitDisabled()}
                  >
                    Place order
                  </Button>
                </Grid>

                <Grid item xs={6} sm={5.15} md={4}>
                  <Button
                    type="button"
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={discardFormData}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default AddTrackerOrder;
