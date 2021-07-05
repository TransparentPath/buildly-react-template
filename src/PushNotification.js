import React, {
  useContext, useEffect, useRef, useState,
} from 'react';
import { connect } from 'react-redux';
import addNotification from 'react-push-notification';
import _ from 'lodash';
import moment from 'moment-timezone';
import { AppContext } from '@context/App.context';
import { environment } from '@environments/environment';

const PushNotification = () => {
  const [alerts, setAlerts] = useState([]);
  const alertsSocket = useRef(null);
  const appTitle = useContext(AppContext).title;
  const alertGrp = localStorage.getItem('alertGrp');

  useEffect(() => {
    if (alertGrp) {
      alertsSocket.current = new WebSocket(
        `${environment.ALERT_SOCKET_URL}${alertGrp}/`,
      );
      alertsSocket.current.onopen = () => {
        alertsSocket.current.send(JSON.stringify({
          command: 'fetch_alerts',
          organization_uuid: alertGrp,
          hours_range: 24,
        }));
      };
      alertsSocket.current.onerror = (error) => {
        console.error(error);
      };
      alertsSocket.current.onclose = () => {
        console.log('Alerts Socket Closed');
      };

      alertsSocket.current.onmessage = (message) => {
        const msg = JSON.parse(message.data);
        if (msg.command === 'fetch_alerts') {
          const viewed = getViewedNotifications();
          const filteredAlerts = _.filter(
            [...msg.alerts],
            (alert) => !_.includes(viewed, alert.id),
          );
          setAlerts(filteredAlerts);
        }
        if (msg.command === 'new_alert') {
          setAlerts([...alerts, ...msg.alerts]);
        }
      };
    }

    return () => {
      if (alertsSocket.current) {
        alertsSocket.current.close();
      }
    };
  }, [alertGrp]);

  useEffect(() => {
    if (alerts.length > 0) {
      const alert = _.first(alerts);

      addNotification({
        native: true,
        duration: environment.hide_notification,
        title: appTitle,
        subtitle: '',
        message: `${alert.alert_message} | ${moment(alert.create_date).fromNow()}`,
        onClick: (event) => {
          closeNotification(alert.id);
        },
      });
      setTimeout(() => {
        const viewed = getViewedNotifications();
        if (!_.includes(viewed, alert.id)) {
          closeNotification(alert.id);
        }
      }, environment.hide_notification);

      const openAlerts = _.slice(alerts, 1);
      setAlerts(openAlerts);
    }
  }, [alerts]);

  const getViewedNotifications = () => (
    localStorage.getItem('viewedNotifications')
      ? JSON.parse(localStorage.getItem('viewedNotifications'))
      : []
  );

  const closeNotification = (id) => {
    const viewed = getViewedNotifications();
    localStorage.setItem(
      'viewedNotifications',
      JSON.stringify([...viewed, id]),
    );
  };

  return <></>;
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.shipmentReducer,
});

export default connect(mapStateToProps)(PushNotification);
