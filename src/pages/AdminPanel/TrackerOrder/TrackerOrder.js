import React, { useState } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@mui/material';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getTrackerOrderQuery } from '@react-query/queries/trackerorder/getTrackerOrderQuery';
import { routes } from '@routes/routesConstants';
import { getTrackerOrderColumns } from '@utils/constants';
import AddTrackerOrder from '../forms/AddTrackerOrder';
import { isTablet } from '@utils/mediaQuery';

const TrackerOrder = ({ redirectTo, history }) => {
  const organization = getUser().organization.organization_uuid;
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { displayAlert } = useAlert();

  const addPath = redirectTo
    ? `${redirectTo}/tracker-order`
    : `${routes.CONFIGURATION}/tracker-order/add`;

  const { data: trackerOrderData, isLoading: isLoadingTrackerOrder } = useQuery(
    ['trackerOrders', organization],
    () => getTrackerOrderQuery(organization, displayAlert),
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
          Content
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
