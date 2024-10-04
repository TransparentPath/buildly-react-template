import React, { useState } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
} from '@mui/material';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getTrackerOrderQuery } from '@react-query/queries/trackerorder/getTrackerOrderQuery';
import { routes } from '@routes/routesConstants';
import { getTrackerOrderColumns } from '@utils/constants';
import AddTrackerOrder from './forms/AddTrackerOrder';
import { isTablet } from '@utils/mediaQuery';

const TrackerOrder = ({ redirectTo, history }) => {
  const { organization_uuid, name } = getUser().organization;
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { displayAlert } = useAlert();

  const addPath = redirectTo
    ? `${redirectTo}/tracker-order`
    : `${routes.CONFIGURATION}/tracker-order/add`;

  const { data: trackerOrderData, isLoading: isLoadingTrackerOrder } = useQuery(
    ['trackerOrders', organization_uuid],
    () => getTrackerOrderQuery(organization_uuid, displayAlert),
    { refetchOnWindowFocus: false },
  );

  const onAddButtonClick = () => {
    history.push(`${addPath}`, {
      from: redirectTo || routes.CONFIGURATION,
    });
  };

  const onReOrder = (item) => {
    history.push(`${addPath}`, {
      type: 're-order',
      from: redirectTo || routes.CONFIGURATION,
      data: item,
    });
  };

  const onCloseOrderSummary = () => {
    setShowOrderSummary(!showOrderSummary);
    setSelectedOrder(null);
  };

  return (
    <>
      <DataTableWrapper
        noSpace
        loading={isLoadingTrackerOrder}
        rows={trackerOrderData || []}
        columns={getTrackerOrderColumns()}
        filename="TrackerOrders"
        addButtonHeading="Place an Order"
        onAddButtonClick={onAddButtonClick}
        tableHeight="300px"
      >
        <Route path={`${addPath}`} component={AddTrackerOrder} />
      </DataTableWrapper>
      <Dialog
        open={showOrderSummary}
        onClose={onCloseOrderSummary}
        fullWidthfullWidth
        fullScreen={false}
        aria-labelledby="order-summary"
        className="trackerOrderSummaryDialog"
      >
        <DialogContent className="trackerOrderSummaryDialogContent">
          <Grid container className="trackerOrderSummaryContent">
            <Grid item xs={12}>
              <Typography variant="h6">ORDER SUMMARY</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="h6">
                Date:
                {' '}
                <span>{selectedOrder.order_date}</span>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6">
                Order Number:
                {' '}
                <span>{selectedOrder.order_number}</span>
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="h6">
                Recipient:
                {' '}
                <span>{selectedOrder.order_recipient}</span>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6">
                Type:
                {' '}
                <span>{selectedOrder.order_type}</span>
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="h6">
                Customer:
                {' '}
                <span>{name}</span>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6">
                Quantity:
                {' '}
                <span>{selectedOrder.order_quantity}</span>
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="h6">
                Recipient Address:
                {' '}
                <span>{selectedOrder.order_address}</span>
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={onCloseOrderSummary}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TrackerOrder;
