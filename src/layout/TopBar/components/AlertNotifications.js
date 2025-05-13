/* eslint-disable consistent-return */
/* eslint-disable no-console */
import React, {
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Redirect } from 'react-router-dom';
import _ from 'lodash';
import addNotification from 'react-push-notification';
import { getUser } from '@context/User.context';
import { AppContext } from '@context/App.context';
import { useQueryClient } from 'react-query';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Slide,
  Typography,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { isTablet } from '@utils/mediaQuery';
import { routes } from '@routes/routesConstants';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getAlertNotificationsColumns } from '@utils/constants';
import { oauthService } from '@modules/oauth/oauth.service';
import moment from 'moment-timezone';
import { useStore } from '@zustand/timezone/timezoneStore';

// Transition component for the dialog animation
const Transition = forwardRef((props, ref) => <Slide direction="left" ref={ref} {...props} />);

const AlertNotifications = ({
  setHideAlertBadge, open, setOpen, history, timezone, unitOfMeasure,
}) => {
  const theme = useTheme();
  const user = getUser(); // Get the current user from context
  const queryClient = useQueryClient(); // Used to interact with React Query cache
  const alertsSocket = useRef(null); // Reference to the WebSocket for real-time alerts
  const [pushGrp, setPushGrp] = useState(''); // Group for push notifications (based on organization UUID)
  const [notifications, setNotifications] = useState([]); // State to hold notifications
  const [redirectToLogin, setRedirectToLogin] = useState(false); // State to redirect to login page
  const appTitle = useContext(AppContext).title; // Get the app title from context
  const { data: timeZone } = useStore(); // Access timezone data from Zustand store

  // Set the push group once user information is loaded
  useEffect(() => {
    if (!_.isEmpty(user)) {
      setPushGrp(user.organization.organization_uuid); // Set push group to user's organization UUID
    }
  }, [user]);

  // Establish the WebSocket connection to listen for alerts
  useEffect(() => {
    if (pushGrp) {
      connectSocket(); // Call function to connect to the socket once pushGrp is set
    }

    // Cleanup WebSocket connection on unmount or when pushGrp changes
    return () => {
      if (alertsSocket.current) {
        alertsSocket.current.close();
      }
    };
  }, [pushGrp]);

  // Handle incoming notifications and trigger push notifications for new alerts
  useEffect(() => {
    const notViewed = _.filter(notifications, { viewed: false });
    const oldNotifications = getViewedNotifications(); // Get previously viewed notifications
    let alerts = [];

    // Process new alerts that haven't been viewed
    _.forEach(notViewed, (value) => {
      alerts = [...alerts, ..._.filter(value.alerts, (a) => !_.includes(oldNotifications, a.id))];
    });

    if (_.size(notViewed) > 0) {
      setHideAlertBadge(false); // Show the badge for new alerts
      _.forEach(alerts, (value) => {
        addNotification({
          native: true,
          duration: window.env.hide_notification, // Notification duration from environment config
          title: appTitle,
          subtitle: '',
          message: `Shipment: ${value.shipment_name} | ${value.alert_message} ${moment(value.alert_time).tz(timeZone).toString()}`,
          onClick: (event) => {
            setOpen(true); // Open the dialog when a notification is clicked
            const viewedNoti = getViewedNotifications();
            localStorage.setItem(
              'viewedNotifications',
              JSON.stringify(_.uniq([...viewedNoti, value.id])), // Save the notification as viewed in local storage
            );
          },
        });
      });
    } else {
      setHideAlertBadge(true); // Hide the badge when no new alerts
    }

    alertSocketOnMessage(); // Listen for new messages from the WebSocket
  }, [notifications]);

  // Reload data if access token is still valid
  const reloadData = () => {
    if (oauthService.hasValidAccessToken()) {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['allGateways'] });
      queryClient.invalidateQueries({ queryKey: ['sensorAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['sensorReports'] });
      setRedirectToLogin(false);
    } else {
      oauthService.logout(); // Log out if the token is invalid
      setRedirectToLogin(true); // Redirect to login
    }
  };

  // Customizer function to merge alerts when combining notifications
  const customizer = (objValue, srcValue) => {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue); // Concatenate arrays for new alerts
    }
  };

  // Function to connect to WebSocket server for alert updates
  const connectSocket = () => {
    alertsSocket.current = new WebSocket(
      `${window.env.ALERT_SOCKET_URL}${pushGrp}/`, // WebSocket URL with the organization UUID
    );

    // WebSocket open event handler
    alertsSocket.current.onopen = () => {
      const fetch_payload = { command: 'fetch_alerts', organization_uuid: pushGrp }; // Fetch alerts from server
      alertsSocket.current.send(JSON.stringify(fetch_payload));
    };

    // WebSocket error event handler
    alertsSocket.current.onerror = (error) => {
      console.error(error); // Log any WebSocket errors
    };

    // WebSocket close event handler (reconnect if closed unexpectedly)
    alertsSocket.current.onclose = (event) => {
      if (event.wasClean) {
        console.log('Alerts socket closed.');
      } else {
        console.log('Alerts socket closed. Trying to reconnect.');
        connectSocket(); // Reconnect on error
      }
    };

    alertSocketOnMessage(); // Call to listen for incoming messages
  };

  // Function to handle messages received on the WebSocket
  const alertSocketOnMessage = () => {
    if (alertsSocket.current) {
      alertsSocket.current.onmessage = (message) => {
        const msg = JSON.parse(message.data); // Parse the incoming message
        const viewedNotifications = getViewedNotifications(); // Get viewed notifications

        let alerts = [];
        // Process the alerts from the message and categorize them based on severity
        _.forEach(msg.alerts, (a) => {
          const parameterType = _.toLower(_.split(a.alert_message, ' of ')[0]);
          const parameterValue = _.split(_.split(a.alert_message, ' of ')[1], ' at ')[0];
          let alertObj = { id: parameterType, color: 'green', title: `${_.capitalize(parameterType)} Excursion Recovered` };

          // Modify alert based on severity
          if (_.isEqual(a.severity, 'error')) {
            alertObj = { ...alertObj, color: theme.palette.error.main, title: `Maximum ${_.capitalize(parameterType)} Excursion` };
          }
          if (_.isEqual(a.severity, 'info')) {
            alertObj = { ...alertObj, color: theme.palette.info.main, title: `Minimum ${_.capitalize(parameterType)} Excursion` };
          }
          alerts = [...alerts, { ...a, alertObj, parameterValue }];
        });

        const shipments = _.uniqBy(_.map(alerts, (a) => ({ id: a.shipment_id, name: a.shipment_name })), 'id');

        let formattedAlerts = [];
        // Organize alerts by shipment ID
        _.forEach(shipments, (ship) => {
          const newAlerts = _.orderBy(_.filter(alerts, { shipment_id: ship.id }), ['alert_time', 'id'], ['desc', 'asc']);
          let isViewed = true;
          _.forEach(newAlerts, (a) => {
            isViewed = isViewed && _.includes(viewedNotifications, a.id);
          });

          formattedAlerts = [
            ...formattedAlerts,
            {
              shipment_id: ship.id,
              shipment_name: ship.name,
              alerts: newAlerts,
              viewed: isViewed,
            },
          ];
        });

        // If new alerts were fetched, update the state
        if (msg.command === 'fetch_alerts') {
          setNotifications(formattedAlerts);
        }
        // If a new alert is received, update the notification state
        if (msg.command === 'new_alert') {
          let finalNotifications = notifications;
          _.forEach(formattedAlerts, (fa) => {
            const alertIndex = _.findIndex(finalNotifications, (fn) => _.isEqual(fa.shipment_id, fn.shipment_id));
            const newNotification = _.mergeWith(finalNotifications[alertIndex], fa, customizer);
            finalNotifications = [..._.slice(finalNotifications, 0, alertIndex), newNotification, ..._.slice(finalNotifications, alertIndex + 1)];
          });
          setNotifications(finalNotifications);

          // Invalidate queries to reload data
          reloadData();
        }

        // Reload data if instructed
        if (msg.command === 'reload_data') {
          reloadData();
        }
      };
    }
  };

  // Close the alert notifications dialog and hide the alert badge
  const closeAlertNotifications = () => {
    setHideAlertBadge(true);
    setOpen(false);
  };

  // Retrieve previously viewed notifications from localStorage
  const getViewedNotifications = () => (
    localStorage.getItem('viewedNotifications')
      ? _.sortBy(JSON.parse(localStorage.getItem('viewedNotifications')))
      : []
  );

  // Handle when an alert count is clicked (mark as viewed)
  const handleAlertCountClick = (index) => {
    const notiAlerts = [..._.slice(notifications, 0, index), { ...notifications[index], viewed: true }, ..._.slice(notifications, index + 1)];
    setHideAlertBadge(true); // Hide the alert badge
    setNotifications(notiAlerts); // Update notifications state

    const viewed = getViewedNotifications();
    localStorage.setItem(
      'viewedNotifications',
      JSON.stringify(_.uniq([...viewed, ..._.map(notiAlerts[index].alerts, 'id')])), // Mark the clicked alerts as viewed
    );
  };

  return (
    <>
      {/* Redirect to login page if access token is invalid */}
      {redirectToLogin && <Redirect to="/login" />}
      <Dialog
        open={open}
        onClose={closeAlertNotifications}
        fullWidth
        fullScreen={isTablet()} // Make dialog fullscreen on tablet
        aria-labelledby="alert-notifications"
        TransitionComponent={Transition}
        className="alertNotificationsDialog"
      >
        <DialogTitle className="alertNotificationsDialogTitle">
          <Grid item xs={12} display="flex" alignItems="center">
            <Typography variant="h6" flex={1}>Shipment Notifications</Typography>
            <IconButton className="alertNotificationsCloseIcon" onClick={closeAlertNotifications}>
              <CloseIcon fontSize="large" />
            </IconButton>
          </Grid>
        </DialogTitle>
        <DialogContent>
          {/* Show a message if there are no new alerts */}
          {_.isEmpty(notifications) && (
            <Grid item xs={12} display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography variant="subtitle1">There are no new alerts for any active shipments</Typography>
            </Grid>
          )}
          {/* Display notifications in a list if they exist */}
          {!_.isEmpty(notifications) && (
            <Grid container spacing={2} mt={2}>
              {_.map(notifications, (noti, index) => (
                <React.Fragment key={noti.shipment_id}>
                  <Grid item xs={12}>
                    <Accordion>
                      <AccordionSummary
                        aria-controls={`${noti.shipment_id}-content`}
                        id={`${noti.shipment_id}-header`}
                        expandIcon={(
                          <Button
                            type="button"
                            color="error"
                            variant="contained"
                            className="alertNotificationsCount"
                            onClick={(e) => handleAlertCountClick(index)} // Handle alert click
                          >
                            {/* Display the number of alerts */}
                            {_.size(noti.alerts)}
                          </Button>
                        )}
                        className="alertNotificationsSummary"
                        onClick={(e) => handleAlertCountClick(index)} // Handle alert click
                      >
                        <div className={!noti.viewed ? 'alertNotificationsSummaryBadge' : ''} />
                        <Typography
                          variant="subtitle1"
                          className="alertNotificationsShipmentName"
                          onClick={(e) => {
                            history.push(`${routes.REPORTING}/?shipment=${noti.shipment_id}`); // Redirect to shipment report
                            closeAlertNotifications();
                          }}
                        >
                          {noti.shipment_name}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <DataTableWrapper
                          noSpace
                          hideAddButton
                          noOptionsIcon
                          rows={noti.alerts} // Display the alerts in a data table
                          columns={getAlertNotificationsColumns(
                            timezone,
                            _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
                              ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
                              : '',
                            _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
                              ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
                              : '',
                          )}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertNotifications;
