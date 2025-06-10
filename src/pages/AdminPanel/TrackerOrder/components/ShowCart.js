import React, { useState } from 'react';
import { useQuery } from 'react-query';
import _ from 'lodash';
import moment from 'moment-timezone';
import {
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  MenuItem,
} from '@mui/material'; // Importing Material UI components for layout and form elements
import tiveLithium from '@assets/tive_lithium.png'; // Image for lithium devices
import tiveNonLithium from '@assets/tive_non_lithium.png'; // Image for non-lithium devices
import { getUser } from '@context/User.context'; // Utility to get current user info from context
import Loader from '@components/Loader/Loader'; // Loader component for loading states
import useAlert from '@hooks/useAlert'; // Custom hook for showing alerts
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery'; // React Query to fetch unit data
import { useAddTrackerOrderMutation } from '@react-query/mutations/trackerorder/addTrackerOrderMutation'; // React Query hook for adding tracker orders
import { isMobile } from '@utils/mediaQuery'; // Utility for checking if the device is mobile
import { FlightSafeIcon, FlightUnsafeIcon } from '@utils/constants'; // Icons for safe and unsafe devices
import { useStore } from '@zustand/timezone/timezoneStore'; // Store for timezone state
import { useCartStore } from '@zustand/cart/cartStore'; // Store for cart state
import '../TrackerOrderStyles.css'; // Importing styles

/**
 * ShowCart component is used to display a modal with the contents of the user's cart.
 * Users can modify the quantities of items in the cart, remove items, and submit their order.
 */
const ShowCart = ({ history, location }) => {
  // Retrieving organization information from the user context
  const { organization_uuid, name } = getUser().organization;
  // State for controlling the visibility of the cart modal
  const [openCartModal, setCartModal] = useState(true);

  // Alert hook for showing alerts
  const { displayAlert } = useAlert();
  // Retrieving timezone data from the store
  const { data: timeZone } = useStore();
  // Retrieving cart data and setter from the cart store
  const { data: cartData, setCart } = useCartStore();

  // Fetching unit data (e.g., date and time formats) using React Query
  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization_uuid],
    () => getUnitQuery(organization_uuid, displayAlert, 'Cart'),
    { refetchOnWindowFocus: false },
  );

  // Extracting date and time formats from unit data
  const dateFormat = _.find(unitData, (unit) => _.isEqual(_.toLower(unit.unit_of_measure_for), 'date'))
    ? _.find(unitData, (unit) => _.isEqual(_.toLower(unit.unit_of_measure_for), 'date')).unit_of_measure
    : '';

  const timeFormat = _.find(unitData, (unit) => _.isEqual(_.toLower(unit.unit_of_measure_for), 'time'))
    ? _.find(unitData, (unit) => _.isEqual(_.toLower(unit.unit_of_measure_for), 'time')).unit_of_measure
    : '';

  // Mutation hook for adding a tracker order
  const { mutate: addTrackerOrderMutation, isLoading: isAddingTrackerOrder } = useAddTrackerOrderMutation(history, location.state.from, displayAlert, setCart, 'Cart');

  // Close cart modal and navigate to the previous page
  const closeCart = () => {
    setCartModal(false);
    if (location && location.state) {
      history.push(location.state.from); // Navigate back to the referring page
    }
  };

  /**
   * Update the quantity of a specific item in the cart
   * @param {number} cartIndex - Index of the cart item
   * @param {number} itemIndex - Index of the item in the order type list
   * @param {number} newValue - New quantity value
   */
  const updateOrderQuantity = (cartIndex, itemIndex, newValue) => {
    const newCartData = _.map(cartData, (cd, index) => {
      let newCd = cd;
      if (_.isEqual(index, cartIndex)) {
        const newOQ = _.map(newCd.order_quantity, (oq, idx) => (_.isEqual(idx, itemIndex) ? newValue : oq));
        newCd = { ...newCd, order_quantity: newOQ };
      }

      return newCd;
    });

    setCart(newCartData);
  };

  /**
   * Remove a specific item from the cart
   * @param {number} cartIndex - Index of the cart item
   * @param {number} itemIndex - Index of the item in the order type list
   */
  const removeType = (cartIndex, itemIndex) => {
    const newCartData = _.map(cartData, (cd, index) => {
      let newCd = cd;
      if (_.isEqual(index, cartIndex)) {
        const newOQ = _.filter(newCd.order_quantity, (oq, idx) => !_.isEqual(idx, itemIndex));
        const newOT = _.filter(newCd.order_type, (ot, idx) => !_.isEqual(idx, itemIndex));

        if (_.size(newOQ) > 0) {
          newCd = { ...newCd, order_quantity: newOQ, order_type: newOT };
        } else {
          newCd = null; // If the order type is empty, remove the cart item
        }
      }

      return newCd;
    });

    setCart(_.without(newCartData, null)); // Remove null entries
  };

  /**
   * Submit the form and add the tracker order to the system
   * @param {Event} event - The form submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    addTrackerOrderMutation(cartData); // Call mutation to add tracker order
  };

  return (
    <div>
      {/* Cart modal dialog */}
      <Dialog
        open={openCartModal} // Modal is open if this is true
        onClose={closeCart} // Close the modal when clicked outside
        fullWidth
        fullScreen={isMobile()} // If the screen is mobile, make the modal fullscreen
        maxWidth="md"
        aria-labelledby="form-dialog-title"
      >
        <DialogContent className="cartModalRoot">
          {/* Show loader if data is loading */}
          {(isLoadingUnits || isAddingTrackerOrder) && <Loader open={isLoadingUnits || isAddingTrackerOrder} />}

          <form noValidate onSubmit={handleSubmit}>
            {/* Cart content layout */}
            <Grid container className="cartContainer">
              <Grid item xs={12} textAlign="center">
                <Typography className="cartTitle">Cart</Typography>
              </Grid>

              {/* Display message if the cart is empty */}
              {_.isEmpty(cartData) && (
                <Grid item xs={12} textAlign="center">
                  <Typography className="cartNoOrder">No orders to place</Typography>
                </Grid>
              )}

              {/* Display cart items */}
              {!_.isEmpty(cartData) && _.map(cartData, (cd, index) => (
                <Grid
                  item
                  xs={12}
                  pt={3}
                  pb={3}
                  key={`${index}-${cd.order_recipient}`}
                  className={index > 0 ? 'cartTopBorder' : ''}
                >
                  <Grid container>
                    {/* Displaying the order type and quantity */}
                    <Grid item xs={6} alignContent="center">
                      {_.map(cd.order_type, (cdot, idx) => (
                        <Grid container key={`${idx}-${cdot}`} alignItems="center">
                          <div className={idx > 0 ? 'cartTypeTopBorder' : ''} />
                          <Grid item xs={2.5} className="orderDeviceImage">
                            {/* Display image for lithium or non-lithium device */}
                            {cdot && _.includes(cdot, 'Non') && (
                              <img
                                src={tiveNonLithium}
                                alt={cdot}
                              />
                            )}
                            {cdot && !_.includes(cdot, 'Non') && (
                              <img
                                src={tiveLithium}
                                alt={cdot}
                              />
                            )}
                          </Grid>

                          <Grid item xs={9.5}>
                            <div style={{ height: '20px' }}>
                              {/* Display appropriate icon based on the type of device */}
                              {_.includes(cdot, 'Non') ? <FlightSafeIcon /> : <FlightUnsafeIcon />}
                            </div>

                            <Typography>
                              <span className="trackerOrderBold">
                                Type:
                              </span>
                              {' '}
                              <span className="notranslate">{cdot}</span>
                            </Typography>

                            {/* Quantity display and update */}
                            <Grid item className="cartQuantityDisplay">
                              <Typography className="trackerOrderBold">Quantity:</Typography>

                              <TextField
                                variant="outlined"
                                margin="normal"
                                type="number"
                                id="cart-order-quantity"
                                name="cart-order-quantity"
                                autoComplete="cart-order-quantity"
                                select
                                value={cd.order_quantity[idx]}
                                onChange={(e) => updateOrderQuantity(index, idx, e.target.value)}
                              >
                                <MenuItem value={0}>Select</MenuItem>
                                {/* Options for quantity selection */}
                                {_.map([25, 50, 75, 100], (quant, qidx) => (
                                  <MenuItem key={`${qidx}-${quant}`} value={quant}>
                                    {quant}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>

                            {/* Remove button */}
                            <Button
                              type="button"
                              variant="contained"
                              color="inherit"
                              size="small"
                              className="cartRemoveButton"
                              onClick={(e) => removeType(index, idx)}
                            >
                              Remove
                            </Button>
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Shipping information */}
                    <Grid item xs={6}>
                      <Typography className="trackerOrderBold">Shipping Information</Typography>
                      <Typography className="cartMarginTop32">
                        <span className="trackerOrderBold">
                          Date:
                        </span>
                        {' '}
                        {moment(cd.order_date).tz(timeZone).format(`${dateFormat} ${timeFormat}`)}
                      </Typography>
                      <Typography>
                        <span className="trackerOrderBold">
                          Total Quantity:
                        </span>
                        {' '}
                        {_.sum(cd.order_quantity)}
                      </Typography>

                      <Typography className="cartMarginTop16">
                        <span className="trackerOrderBold">
                          Recipient:
                        </span>
                        {' '}
                        <span className="notranslate">{cd.order_recipient}</span>
                      </Typography>
                      <Typography>
                        <span className="trackerOrderBold">
                          Customer:
                        </span>
                        {' '}
                        <span className="notranslate">{name}</span>
                      </Typography>

                      <Typography className="cartMarginTop16">
                        <span className="trackerOrderBold">
                          Recipient Address:
                        </span>
                        {' '}
                        <span>{cd.order_address}</span>
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>

            {/* Cart action buttons */}
            <Grid container spacing={2} justifyContent="center" className="cartActions">
              <Grid item xs={6} sm={5.15} md={4}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={_.isEmpty(cartData)} // Disable submit button if cart is empty
                >
                  Submit
                </Button>
              </Grid>

              <Grid item xs={6} sm={5.15} md={4}>
                <Button
                  type="button"
                  fullWidth
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={closeCart}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShowCart;
