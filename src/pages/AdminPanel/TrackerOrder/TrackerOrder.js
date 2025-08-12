import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import { useQuery } from 'react-query';
import _ from 'lodash';
import moment from 'moment-timezone';
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Repeat as RepeatIcon,
  ShoppingCart as ShoppingCartIcon,
  Summarize as SummarizeIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import orderReorderPng from '@assets/order_reorder.png';
import orderSummaryPng from '@assets/order_summary.png';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery';
import { getTrackerOrderQuery } from '@react-query/queries/trackerorder/getTrackerOrderQuery';
import { routes } from '@routes/routesConstants';
import { getTrackerOrderColumns } from '@utils/constants';
import { isTablet } from '@utils/mediaQuery';
import { useStore } from '@zustand/timezone/timezoneStore';
import { useCartStore } from '@zustand/cart/cartStore';
import AddTrackerOrder from './forms/AddTrackerOrder';
import ShowCart from './components/ShowCart';

const TrackerOrder = ({ redirectTo, history }) => {
  const { t } = useTranslation();

  // Fetching user data (organization_uuid and name) from context
  const { organization_uuid, name } = getUser().organization;

  // State variables for controlling order summary modal
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State for holding tracker order rows
  const [rows, setRows] = useState([]);

  // Alert handling
  const { displayAlert } = useAlert();

  // Time zone and cart data from zustand store
  const { data: timeZone } = useStore();
  const { data: cartData } = useCartStore();

  // Fetch unit data (time and date format) using react-query
  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization_uuid],
    () => getUnitQuery(organization_uuid, displayAlert, 'Tracker order'),
    { refetchOnWindowFocus: false },
  );

  // Fetch tracker order data using react-query
  const { data: trackerOrderData, isLoading: isLoadingTrackerOrder } = useQuery(
    ['trackerOrders', organization_uuid],
    () => getTrackerOrderQuery(organization_uuid, displayAlert, 'Tracker order'),
    { refetchOnWindowFocus: false },
  );

  // Setting date and time formats based on the unit data
  const dateFormat = _.find(unitData, (unit) => _.isEqual(_.toLower(unit.unit_of_measure_for), 'date'))
    ? _.find(unitData, (unit) => _.isEqual(_.toLower(unit.unit_of_measure_for), 'date')).unit_of_measure
    : '';

  const timeFormat = _.find(unitData, (unit) => _.isEqual(_.toLower(unit.unit_of_measure_for), 'time'))
    ? _.find(unitData, (unit) => _.isEqual(_.toLower(unit.unit_of_measure_for), 'time')).unit_of_measure
    : '';

  // Setting rows when tracker order data is updated
  useEffect(() => {
    setRows(trackerOrderData);
  }, [trackerOrderData]);

  // Navigating to Add Tracker Order page
  const onAddButtonClick = () => {
    history.push(`${routes.TRACKERORDER}/add`, {
      from: redirectTo || routes.TRACKERORDER,
    });
  };

  // Handling reorder functionality (navigate with order data)
  const onReOrder = (item) => {
    history.push(`${routes.TRACKERORDER}/add`, {
      type: 're-order',
      from: redirectTo || routes.TRACKERORDER,
      data: item,
    });
  };

  // Closing the order summary dialog
  const onCloseOrderSummary = () => {
    setShowOrderSummary(false);
    setSelectedOrder(null);
  };

  // Navigating to cart page
  const onCartClick = () => {
    history.push(`${routes.TRACKERORDER}/cart`, {
      from: redirectTo || routes.TRACKERORDER,
    });
  };

  // Defining columns for the DataTable (including actions for reorder and order summary)
  const finalColumns = [
    {
      name: t('trackerOrder.repeatOrder'),
      options: {
        filter: false,
        sort: false,
        empty: true,
        setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
        customBodyRenderLite: (dataIndex) => (
          <div className="orderSummaryIconDiv">
            <IconButton onClick={(e) => onReOrder(rows[dataIndex])}>
              <img src={orderReorderPng} alt={t('trackerOrder.reorderAlt')} />
            </IconButton>
          </div>
        ),
      },
    },
    ...getTrackerOrderColumns(timeZone, dateFormat, timeFormat, t), // Adding the dynamic tracker order columns
    {
      name: t('trackerOrder.orderSummaryCol'),
      options: {
        filter: false,
        sort: false,
        empty: true,
        setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
        customBodyRenderLite: (dataIndex) => (
          <div className="orderSummaryIconDiv">
            <IconButton
              onClick={(e) => {
                setSelectedOrder(rows[dataIndex]);
                setShowOrderSummary(true);
              }}
            >
              <img src={orderSummaryPng} alt="Summary" />
            </IconButton>
          </div>
        ),
      },
    },
  ];

  return (
    <div>
      {/* DataTableWrapper to display tracker orders */}
      <DataTableWrapper
        noSpace
        loading={isLoadingTrackerOrder || isLoadingUnits} // Loading indicator while fetching data
        rows={trackerOrderData || []} // Displaying the tracker order data
        columns={finalColumns} // Columns with order actions
        filename="TrackerOrders"
        addButtonHeading={t('trackerOrder.newOrder')} // Heading for add button
        onAddButtonClick={onAddButtonClick} // Action when add button is clicked
        tableHeight="300px" // Table height for better visibility
        customIconButtonRight={(
          // Cart icon with badge showing the number of items in the cart
          <IconButton onClick={onCartClick}>
            <Badge color="error" showZero badgeContent={_.size(cartData)} className={_.size(cartData) > 0 ? 'orderCartBadge' : 'orderCartBadge orderCartGrey'}>
              <ShoppingCartIcon fontSize="large" color="primary" />
            </Badge>
          </IconButton>
        )}
      >
        {/* Route to AddTrackerOrder and ShowCart pages */}
        <Route path={`${routes.TRACKERORDER}/add`} component={AddTrackerOrder} />
        <Route path={`${routes.TRACKERORDER}/cart`} component={ShowCart} />
      </DataTableWrapper>

      {/* Dialog for showing order summary */}
      <Dialog
        open={showOrderSummary}
        onClose={onCloseOrderSummary}
        fullWidth
        fullScreen={false}
        aria-labelledby="order-summary"
      >
        <DialogContent className="orderSummaryDialogContent">
          <Grid container className="orderSummaryContent">
            <Grid item xs={12} mb={2} textAlign="center">
              <Typography className="trackerOrderBold trackerOrderPrimaryColor">{t('trackerOrder.orderSummary')}</Typography>
            </Grid>

            {/* Displaying order details such as date, order number, quantity, type, recipient, etc. */}
            <Grid item xs={12} md={6}>
              <Typography className="trackerOrderBold">
                {t('trackerOrder.date')}
                {' '}
                <span className="trackerOrderNormalFont">{selectedOrder && moment(selectedOrder.order_date).tz(timeZone).format(`${dateFormat} ${timeFormat}`)}</span>
              </Typography>
            </Grid>

            <Grid item xs={12} md={6} className="orderSummaryOrderNumber">
              <Typography className="trackerOrderBold">
                {t('trackerOrder.orderNumber')}
                {' '}
                <span className="trackerOrderNormalFont">{selectedOrder && selectedOrder.order_number}</span>
              </Typography>
            </Grid>

            {/* Loop through the order types and quantities */}
            {selectedOrder && _.map(selectedOrder.order_type, (sot, index) => (
              <Grid item xs={12} mt={1} key={`${index}-${sot}`}>
                <Typography className="trackerOrderBold">
                  {t('trackerOrder.numberOfDevices')}
                  {' '}
                  <span className="trackerOrderNormalFont">{selectedOrder && selectedOrder.order_quantity[index]}</span>
                </Typography>

                <Typography className="trackerOrderBold">
                  {t('trackerOrder.type')}
                  {' '}
                  <span className="trackerOrderNormalFont">{sot}</span>
                </Typography>
              </Grid>
            ))}

            {/* Recipient and address details */}
            <Grid item xs={12} mt={2}>
              <Typography className="trackerOrderBold">
                {t('trackerOrder.recipient')}
                {' '}
                <span className="trackerOrderNormalFont">{selectedOrder && selectedOrder.order_recipient}</span>
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography className="trackerOrderBold">
                {t('trackerOrder.customer')}
                {' '}
                <span className="trackerOrderNormalFont">{name}</span>
              </Typography>
            </Grid>

            <Grid item xs={12} md={6} mt={2}>
              <Typography className="trackerOrderBold">
                {t('trackerOrder.recipientAddress')}
                {' '}
                <span className="trackerOrderNormalFont">{selectedOrder && selectedOrder.order_address}</span>
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>

        {/* Dialog actions (Close button) */}
        <DialogActions>
          <Grid container mb={2}>
            <Grid item xs={12} textAlign="center">
              <Button
                type="button"
                variant="contained"
                color="primary"
                size="medium"
                onClick={onCloseOrderSummary} // Close the order summary dialog
              >
                {t('common.close')}
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TrackerOrder;
