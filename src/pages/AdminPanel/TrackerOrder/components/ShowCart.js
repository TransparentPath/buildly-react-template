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
} from '@mui/material';
import tiveLithium from '@assets/tive_lithium.png';
import tiveNonLithium from '@assets/tive_non_lithium.png';
import { getUser } from '@context/User.context';
import Loader from '@components/Loader/Loader';
import useAlert from '@hooks/useAlert';
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery';
import { isMobile } from '@utils/mediaQuery';
import { FlightSafeIcon, FlightUnsafeIcon } from '@utils/constants';
import { useStore } from '@zustand/timezone/timezoneStore';
import { useCartStore } from '@zustand/cart/cartStore';
import '../TrackerOrderStyles.css';

const ShowCart = ({ history, location }) => {
  const { organization_uuid, name } = getUser().organization;
  const [openCartModal, setCartModal] = useState(true);

  const { displayAlert } = useAlert();
  const { data: timeZone } = useStore();
  const { data: cartData, setCart } = useCartStore();

  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization_uuid],
    () => getUnitQuery(organization_uuid, displayAlert),
    { refetchOnWindowFocus: false },
  );

  const dateFormat = _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
    ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
    : '';

  const timeFormat = _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
    ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
    : '';

  const closeCart = () => {
    setCartModal(false);
    if (location && location.state) {
      history.push(location.state.from);
    }
  };

  const removeType = (cd) => {
    console.log(cd);
  };

  /**
   * Submit The form and add/edit custodian type
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div>
      {isLoadingUnits && <Loader open={isLoadingUnits} />}
      <Dialog
        open={openCartModal}
        onClose={closeCart}
        fullWidth
        fullScreen={isMobile()}
        maxWidth="md"
        aria-labelledby="form-dialog-title"
      >
        <DialogContent className="cartModalRoot">
          <form noValidate onSubmit={handleSubmit}>
            <Grid container className="cartContainer">
              <Grid item xs={12} textAlign="center">
                <Typography className="cartTitle">Cart</Typography>
              </Grid>

              {_.isEmpty(cartData) && (
                <Grid item xs={12} textAlign="center">
                  <Typography className="cartNoOrder">No orders to place</Typography>
                </Grid>
              )}

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
                    <Grid item xs={6}>
                      {_.map(cd.order_type, (cdot, idx) => (
                        <Grid container key={`${idx}-${cdot}`}>
                          <div className={idx > 0 ? 'cartTypeTopBorder' : ''} />
                          <Grid item xs={2.5} className="orderDeviceImage">
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
                              {_.includes(cdot, 'Non') ? <FlightSafeIcon /> : <FlightUnsafeIcon />}
                            </div>

                            <Typography>
                              <span className="trackerOrderBold">
                                Type:
                              </span>
                              {' '}
                              {cdot}
                            </Typography>

                            <Typography>
                              <span className="trackerOrderBold">
                                Quantity:
                              </span>
                              {' '}
                              {cd.order_quantity[idx]}
                            </Typography>

                            <Button
                              type="button"
                              variant="contained"
                              color="inherit"
                              size="small"
                              className="cartRemoveButton"
                              onClick={(e) => removeType(cd)}
                            >
                              Remove
                            </Button>
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>

                    <Grid item xs={6}>
                      <Typography className="trackerOrderBold">
                        Shipping Information
                      </Typography>

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
                        {cd.order_recipient}
                      </Typography>
                      <Typography>
                        <span className="trackerOrderBold">
                          Customer:
                        </span>
                        {' '}
                        {name}
                      </Typography>

                      <Typography className="cartMarginTop16">
                        <span className="trackerOrderBold">
                          Recipient Address:
                        </span>
                        {' '}
                        {cd.order_address}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2} justifyContent="center" className="cartActions">
              <Grid item xs={6} sm={5.15} md={4}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={_.isEmpty(cartData)}
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
