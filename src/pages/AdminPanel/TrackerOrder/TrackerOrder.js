import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { Repeat as RepeatIcon, Summarize as SummarizeIcon } from '@mui/icons-material';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getUnitQuery } from '@react-query/queries/items/getUnitQuery';
import { getTrackerOrderQuery } from '@react-query/queries/trackerorder/getTrackerOrderQuery';
import { routes } from '@routes/routesConstants';
import { getTrackerOrderColumns } from '@utils/constants';
import { isTablet } from '@utils/mediaQuery';
import { useStore } from '@zustand/timezone/timezoneStore';
import AddTrackerOrder from './forms/AddTrackerOrder';
import moment from 'moment-timezone';

const TrackerOrder = ({ redirectTo, history }) => {
  const { organization_uuid, name } = getUser().organization;
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rows, setRows] = useState([]);

  const { displayAlert } = useAlert();
  const { data } = useStore();

  const { data: unitData, isLoading: isLoadingUnits } = useQuery(
    ['unit', organization_uuid],
    () => getUnitQuery(organization_uuid, displayAlert),
    { refetchOnWindowFocus: false },
  );

  const { data: trackerOrderData, isLoading: isLoadingTrackerOrder } = useQuery(
    ['trackerOrders', organization_uuid],
    () => getTrackerOrderQuery(organization_uuid, displayAlert),
    { refetchOnWindowFocus: false },
  );

  const dateFormat = _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
    ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
    : '';

  const timeFormat = _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
    ? _.find(unitData, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
    : '';

  useEffect(() => {
    setRows(trackerOrderData);
  }, [trackerOrderData]);

  const onAddButtonClick = () => {
    history.push(`${routes.TRACKERORDER}/add`, {
      from: redirectTo || routes.TRACKERORDER,
    });
  };

  const onReOrder = (item) => {
    history.push(`${routes.TRACKERORDER}/add`, {
      type: 're-order',
      from: redirectTo || routes.TRACKERORDER,
      data: item,
    });
  };

  const onCloseOrderSummary = () => {
    setShowOrderSummary(!showOrderSummary);
    setSelectedOrder(null);
  };

  const finalColumns = [
    ...getTrackerOrderColumns(data, dateFormat, timeFormat),
    {
      name: 'Order Summary',
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
              <SummarizeIcon color="primary" />
            </IconButton>
          </div>
        ),
      },
    },
    {
      name: 'Repeat Order',
      options: {
        filter: false,
        sort: false,
        empty: true,
        setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
        customBodyRenderLite: (dataIndex) => (
          <div className="orderSummaryIconDiv">
            <IconButton onClick={(e) => onReOrder(rows[dataIndex])}>
              <RepeatIcon color="primary" />
            </IconButton>
          </div>
        ),
      },
    },
  ];

  return (
    <>
      <DataTableWrapper
        noSpace
        loading={isLoadingTrackerOrder || isLoadingUnits}
        rows={trackerOrderData || []}
        columns={finalColumns}
        filename="TrackerOrders"
        addButtonHeading="Place an Order"
        onAddButtonClick={onAddButtonClick}
        tableHeight="300px"
      >
        <Route path={`${routes.TRACKERORDER}/add`} component={AddTrackerOrder} />
      </DataTableWrapper>

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
              <Typography className="trackerOrderBold trackerOrderPrimaryColor">ORDER SUMMARY</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography className="trackerOrderBold">
                Date:
                {'  '}
                <span className="trackerOrderNormalFont">{selectedOrder && moment(selectedOrder.order_date).tz(data).format(`${dateFormat} ${timeFormat}`)}</span>
              </Typography>
            </Grid>

            <Grid item xs={12} md={6} className="orderSummaryOrderNumber">
              <Typography className="trackerOrderBold">
                Order Number:
                {'  '}
                <span className="trackerOrderNormalFont">{selectedOrder && selectedOrder.order_number}</span>
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography className="trackerOrderBold">
                Number of Devices:
                {'  '}
                <span className="trackerOrderNormalFont">{selectedOrder && selectedOrder.order_quantity}</span>
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography className="trackerOrderBold">
                Type:
                {'  '}
                <span className="trackerOrderNormalFont">{selectedOrder && selectedOrder.order_type}</span>
              </Typography>
            </Grid>

            <Grid item xs={12} mt={2}>
              <Typography className="trackerOrderBold">
                Recipient:
                {'  '}
                <span className="trackerOrderNormalFont">{selectedOrder && selectedOrder.order_recipient}</span>
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography className="trackerOrderBold">
                Customer:
                {'  '}
                <span className="trackerOrderNormalFont">{name}</span>
              </Typography>
            </Grid>

            <Grid item xs={12} mt={2}>
              <Typography className="trackerOrderBold">
                Recipient Address:
                {'  '}
                <span className="trackerOrderNormalFont">{selectedOrder && selectedOrder.order_address}</span>
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Grid container mb={2}>
            <Grid item xs={12} textAlign="center">
              <Button
                type="button"
                variant="contained"
                color="primary"
                size="medium"
                onClick={onCloseOrderSummary}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TrackerOrder;
