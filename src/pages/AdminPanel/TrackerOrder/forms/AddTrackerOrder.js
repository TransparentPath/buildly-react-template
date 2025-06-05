/**
 * @file AddTrackerOrder.jsx
 * @description Component for creating new tracker orders with multiple tracker types,
 * quantities, and recipient details. Supports re-ordering and cart management.
 */

import React, { useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import {
  Grid,
  Button,
  TextField,
  Typography,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import tiveLithium from '@assets/tive_lithium.png';
import tiveNonLithium from '@assets/tive_non_lithium.png';
import Loader from '@components/Loader/Loader';
import FormModal from '@components/Modal/FormModal';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import { getRecipientAddressQuery } from '@react-query/queries/recipientaddress/getRecipientAddressQuery';
import { validators } from '@utils/validators';
import { isDesktop } from '@utils/mediaQuery';
import { ORDER_TYPES } from '@utils/mock';
import { FlightSafeIcon, FlightUnsafeIcon } from '@utils/constants';
import { useCartStore } from '@zustand/cart/cartStore';
import '../TrackerOrderStyles.css';
import { routes } from '@routes/routesConstants';

/**
 * AddTrackerOrder Component
 *
 * Provides a form interface for creating new tracker orders with the following features:
 * - Multiple tracker type selection
 * - Quantity selection per tracker
 * - Recipient selection and address display
 * - Cart integration
 * - Re-order functionality
 * - Form validation
 *
 * @param {Object} props Component props
 * @param {Object} props.history React Router history object
 * @param {Object} props.location React Router location object
 */
const AddTrackerOrder = ({ history, location }) => {
  /**
   * Current user's organization UUID for API requests
   * @type {string}
   */
  const { organization_uuid } = getUser().organization;

  /**
   * Modal visibility states
   * @type {boolean}
   */
  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const [showAddMore, setShowAddMore] = useState(false);

  /**
   * Alert hook for displaying notifications
   */
  const { displayAlert } = useAlert();

  /**
   * Cart management from Zustand store
   */
  const { data: cartData, setCart } = useCartStore();

  /**
   * Retrieve any saved order data from localStorage
   * @type {Object|null}
   */
  const halfwayOrder = JSON.parse(localStorage.getItem('halfwayOrder'));

  /**
   * Check if this is a re-order operation and get associated data
   */
  const reOrderPage = location.state && _.isEqual(location.state.type, 're-order');
  const reOrderData = (reOrderPage && location.state.data) || {};

  /**
   * Form input states using custom useInput hook
   * Initializes with re-order data, halfway order data, or defaults
   */
  const placeholderType = useInput('', { required: true });
  const placeholderQuantity = useInput(0, { required: true });
  const order_type = useInput((reOrderData && reOrderData.order_type) || (halfwayOrder && halfwayOrder.order_type) || [], { required: true });
  const order_quantity = useInput((reOrderData && reOrderData.order_quantity) || (halfwayOrder && halfwayOrder.order_quantity) || [], { required: true });
  const order_recipient = useInput((reOrderData && reOrderData.order_recipient) || (halfwayOrder && halfwayOrder.order_recipient) || '', { required: true });
  const order_address = useInput((reOrderData && reOrderData.order_address) || (halfwayOrder && halfwayOrder.order_address) || '', { required: true });

  /**
   * Form validation error state
   * @type {Object}
   */
  const [formError, setFormError] = useState({});

  /**
   * Query to fetch recipient addresses for the organization
   */
  const { data: recipientAddressData, isLoading: isLoadingRecipientAddresses } = useQuery(
    ['recipientAddresses', organization_uuid],
    () => getRecipientAddressQuery(organization_uuid, displayAlert, 'Tracker order'),
    { refetchOnWindowFocus: false },
  );

  /**
   * Handles form modal closure
   * Checks for unsaved changes and prompts confirmation if needed
   */
  const closeFormModal = () => {
    localStorage.removeItem('halfwayOrder');
    if (
      order_type.hasChanged()
      || order_quantity.hasChanged()
      || order_recipient.hasChanged()
      || order_address.hasChanged()
      || !_.isEmpty(order_type.value)
      || !_.isEmpty(order_quantity.value)
      || order_recipient.value
      || order_address.value
    ) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      history.push(routes.TRACKERORDER);
    }
  };

  /**
   * Discards form data and navigates back to tracker order list
   */
  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    history.push(routes.TRACKERORDER);
  };

  /**
   * Handles form submission
   * Creates new order data and adds it to the cart
   *
   * @param {Event} event Form submission event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = {
      ...reOrderData,
      order_date: new Date(),
      order_type: order_type.value,
      order_quantity: order_quantity.value,
      order_recipient: order_recipient.value,
      order_address: order_address.value,
      organization_uuid,
    };

    setCart([...cartData, data]);
    displayAlert('success', 'Order has been added to the cart.');
    discardFormData();
  };

  /**
   * Validates form fields on blur
   *
   * @param {Event} e Blur event
   * @param {string} validation Validation type
   * @param {Object} input Input field reference
   * @param {string} parentId Parent element ID
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

  /**
   * Checks if form submission should be disabled
   * Validates required fields and error states
   *
   * @returns {boolean} True if submit should be disabled
   */
  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!order_type.value || _.isEmpty(order_type.value) || !order_quantity.value || _.isEmpty(order_quantity.value) || !order_recipient.value || !order_address.value) {
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

  /**
   * Handles navigation to add new recipient
   * Saves current form state to localStorage before navigating
   */
  const onAddRecipient = () => {
    if (!_.isEmpty(order_type.value) || !_.isEmpty(order_quantity.value) || order_recipient.value || order_address.value) {
      const newHalfwayOrder = {
        order_type: order_type.value,
        order_quantity: order_quantity.value,
        order_recipient: order_recipient.value,
        order_address: order_address.value,
      };
      localStorage.setItem('halfwayOrder', JSON.stringify(newHalfwayOrder));
    }

    const addPath = `${routes.CONFIGURATION}/recipient-address/add`;
    history.push(`${addPath}`, {
      from: `${routes.TRACKERORDER}/add`,
    });
  };

  return (
    <div>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          {isLoadingRecipientAddresses && <Loader open={isLoadingRecipientAddresses} />}
          <form noValidate onSubmit={handleSubmit}>
            <Grid container columnGap={2}>
              {/* Tracker Selection Section */}
              <Grid item xs={12} md={5.8} className="addOrderContainer">
                <Grid container>
                  <Grid item xs={12} padding={2}>
                    <Typography className="trackerOrderBold">TRACKER</Typography>
                  </Grid>

                  {/* Existing Tracker Selections */}
                  {!_.isEmpty(order_type.value) && !_.isEmpty(order_quantity.value) && _.map(order_type.value, (orty, idx) => (
                    <Grid container key={`${idx}-${orty}`}>
                      <Grid item xs={12} className={idx > 0 ? 'addOrderTypeContainer' : ''} />
                      <Grid item xs={10} className="addOrderTextFieldWithClose">
                        <TextField
                          className="notranslate"
                          variant="outlined"
                          fullWidth
                          id={`order-type-${idx}`}
                          select
                          label={<span className="translate">Tracker Type</span>}
                          value={orty}
                          onChange={(e) => {
                            const newList = _.map(
                              order_type.value,
                              (o, i) => (_.isEqual(i, idx) ? e.target.value : o),
                            );
                            order_type.setValue(newList);
                          }}
                        >
                          <MenuItem value="">Select</MenuItem>
                          {_.map(ORDER_TYPES, (ot, index) => (
                            <MenuItem className="notranslate" key={`${ot.value}-${index}`} value={ot.value}>
                              <Typography component="div" className="addOrderTypeWithIcon">
                                {ot.label}
                                <span>{_.includes(ot.label, 'Non') ? <FlightSafeIcon /> : <FlightUnsafeIcon />}</span>
                              </Typography>
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={1}>
                        <IconButton
                          className="addOrderClose"
                          onClick={(e) => {
                            order_type.setValue(_.filter(order_type.value, (otv, i) => !_.isEqual(i, idx)));
                            order_quantity.setValue(_.filter(order_quantity.value, (oqv, i) => !_.isEqual(i, idx)));
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Grid>

                      <Grid item xs={8} className="orderDeviceImage">
                        {orty && _.includes(orty, 'Non') && (
                          <img
                            src={tiveNonLithium}
                            alt={orty}
                          />
                        )}
                        {orty && !_.includes(orty, 'Non') && (
                          <img
                            src={tiveLithium}
                            alt={orty}
                          />
                        )}
                      </Grid>

                      <Grid item xs={12} textAlign="center">
                        <TextField
                          variant="outlined"
                          margin="normal"
                          type="number"
                          className="addOrderQuantityField"
                          id={`order-quantity-${idx}`}
                          name="order-quantity"
                          label="Tracker Quantity"
                          autoComplete="order-quantity"
                          select
                          value={order_quantity.value[idx]}
                          onChange={(e) => {
                            const newList = _.map(
                              order_quantity.value,
                              (oq, i) => (_.isEqual(i, idx) ? e.target.value : oq),
                            );
                            order_quantity.setValue(newList);
                          }}
                        >
                          <MenuItem value={0}>Select</MenuItem>
                          {_.map([25, 50, 75, 100], (quant, qidx) => (
                            <MenuItem key={`${qidx}-${quant}`} value={quant}>
                              {quant}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  ))}

                  {/* New Tracker Selection */}
                  {(showAddMore || (_.isEmpty(order_type.value) && _.isEmpty(order_quantity.value))) && (
                    <Grid container>
                      <Grid item xs={12} className={!_.isEmpty(order_type.value) ? 'addOrderTypeContainer' : ''} />
                      <Grid item xs={!_.isEmpty(order_type.value) ? 10 : 12} className={!_.isEmpty(order_type.value) ? 'addOrderTextFieldWithClose' : 'addOrderTextField'}>
                        <TextField
                          className="notranslate"
                          variant="outlined"
                          fullWidth
                          id="placeholder-order-type"
                          select
                          label={<span className="translate">Tracker Type</span>}
                          {...placeholderType.bind}
                        >
                          <MenuItem value="">Select</MenuItem>
                          {_.map(_.without(ORDER_TYPES, ..._.filter(ORDER_TYPES, (o) => _.includes(order_type.value, o.value))), (ot, index) => (
                            <MenuItem className="notranslate" key={`${ot.value}-${index}`} value={ot.value}>
                              <Typography component="div" className="addOrderTypeWithIcon">
                                {ot.label}
                                <span>{_.includes(ot.label, 'Non') ? <FlightSafeIcon /> : <FlightUnsafeIcon />}</span>
                              </Typography>
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      {!_.isEmpty(order_type.value) && (
                        <Grid item xs={1}>
                          <IconButton className="addOrderClose" onClick={(e) => setShowAddMore(false)}>
                            <CloseIcon />
                          </IconButton>
                        </Grid>
                      )}

                      <Grid item xs={12} className="orderDeviceImage">
                        {placeholderType.value && _.includes(placeholderType.value, 'Non') && (
                          <img
                            src={tiveNonLithium}
                            alt={placeholderType.value}
                          />
                        )}
                        {placeholderType.value && !_.includes(placeholderType.value, 'Non') && (
                          <img
                            src={tiveLithium}
                            alt={placeholderType.value}
                          />
                        )}
                      </Grid>

                      <Grid item xs={12} textAlign="center">
                        <TextField
                          variant="outlined"
                          margin="normal"
                          type="number"
                          className="addOrderQuantityField"
                          id="placeholder-order-quantity"
                          name="placeholder-order-quantity"
                          label="Tracker Quantity"
                          autoComplete="placeholder-order-quantity"
                          select
                          value={placeholderQuantity.value}
                          onChange={(e) => {
                            placeholderQuantity.setValue(e.target.value);
                            order_type.setValue([...order_type.value, placeholderType.value]);
                            order_quantity.setValue([...order_quantity.value, e.target.value]);
                            setShowAddMore(false);
                          }}
                        >
                          <MenuItem value={0}>Select</MenuItem>
                          {_.map([25, 50, 75, 100], (quant, qidx) => (
                            <MenuItem key={`${qidx}-${quant}`} value={quant}>
                              {quant}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              {/* Recipient Selection Section */}
              <Grid item xs={12} md={5.8} className="addOrderContainer">
                <Grid container>
                  <Grid item xs={12} padding={2}>
                    <Typography className="trackerOrderBold">RECIPIENT</Typography>
                  </Grid>

                  <Grid item xs={12} className="addOrderTextField">
                    <TextField
                      className="notranslate"
                      variant="outlined"
                      fullWidth
                      select
                      required
                      id="order-recipient"
                      label={<span className="translate">Order Recipient</span>}
                      value={_.find(recipientAddressData, { name: order_recipient.value, address: order_address.value })}
                      onChange={(e) => {
                        if (e.target.value) {
                          const formattedAddress = `${e.target.value.address1
                            && `${e.target.value.address1},`} ${e.target.value.address2
                            && `${e.target.value.address2},`} ${e.target.value.city
                            && `${e.target.value.city},`} ${e.target.value.state
                            && `${e.target.value.state},`} ${e.target.value.country
                            && `${e.target.value.country},`} ${e.target.value.postal_code
                            && `${e.target.value.postal_code}`}`;
                          order_recipient.setValue(e.target.value.name);
                          order_address.setValue(formattedAddress);
                        }
                      }}
                    >
                      {_.map(recipientAddressData, (ra, index) => (
                        <MenuItem className="notranslate" key={`${ra.name}-${index}`} value={ra}>
                          {ra.name}
                        </MenuItem>
                      ))}
                      <MenuItem
                        value={null}
                        className="addOrderNewRecipient"
                        onClick={onAddRecipient}
                      >
                        Add Recipient +
                      </MenuItem>
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

              {/* Add More Trackers Option */}
              <Grid item xs={12}>
                {(_.size(_.without(ORDER_TYPES, ..._.filter(ORDER_TYPES, (o) => _.includes(order_type.value, o.value)))) > 0) && (
                  <Typography
                    className="addOrderMoreTracker"
                    onClick={(e) => {
                      setShowAddMore(true);
                      placeholderType.setValue('');
                      placeholderQuantity.setValue(0);
                    }}
                  >
                    Add Tracker +
                  </Typography>
                )}
              </Grid>

              {/* Form Actions */}
              <Grid container spacing={2} justifyContent="center" className="addOrderActions">
                <Grid item xs={6} sm={5.15} md={4}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={isLoadingRecipientAddresses || submitDisabled()}
                  >
                    Add to cart
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
