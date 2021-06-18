import React, {
  useContext, useEffect, useRef, useState,
} from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment-timezone';
import { UserContext } from '@context/User.context';
import { environment } from '@environments/environment';
import { getFormattedCustodyRows } from '@pages/Shipment/ShipmentConstants';
import { showAlert } from '@redux/alert/actions/alert.actions';

const PushNotification = ({
  dispatch,
  shipmentData,
  shipmentFlag,
  custodyData,
  custodianData,
}) => {
  const [alerts, setAlerts] = useState([]);
  const [openAlerts, setOpenAlerts] = useState([]);
  const alertsSocket = useRef(null);
  const { organization_uuid } = useContext(UserContext).organization;

  useEffect(() => {
    if (organization_uuid) {
      alertsSocket.current = new WebSocket(
        `${environment.ALERT_SOCKET_URL}${organization_uuid}/`,
      );
      alertsSocket.current.onopen = () => {
        if (shipmentData) {
          const ids = _.toString(
            _.map(shipmentData, 'partner_shipment_id'),
          );
          alertsSocket.current.send(JSON.stringify({
            command: 'fetch_alerts',
            organization_uuid,
            shipment_ids: ids,
            hours_range: 24,
          }));
        }
      };
      alertsSocket.current.onerror = (error) => {
        console.error(error);
      };
      alertsSocket.current.onclose = () => {
        console.log('Alerts Socket Closed');
      };

      alertsSocket.current.onmessage = (message) => {
        const msg = JSON.parse(message.data);
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
  }, [organization_uuid]);

  useEffect(() => {
    if (shipmentData && shipmentData.length > 0) {
      if (alerts && alerts.length === 0) {
        const ids = _.toString(
          _.map(shipmentData, 'partner_shipment_id'),
        );
        alertsSocket.current.send(JSON.stringify({
          command: 'fetch_alerts',
          organization_uuid,
          shipment_ids: ids,
          hours_range: 24,
        }));
      }
      if (alerts && alerts.length > 0) {
        let alertsArray = [];
        let custodyRows = [];
        const viewedAlerts = localStorage.getItem('viewedAlerts')
          ? JSON.parse(localStorage.getItem('viewedAlerts'))
          : [];

        if (
          custodyData
          && custodianData
          && custodyData.length > 0
          && custodianData.length > 0
        ) {
          custodyRows = getFormattedCustodyRows(custodyData, custodianData);
        }

        _.forEach(shipmentData, (shipment) => {
          const shipmentAlerts = _.filter(
            alerts,
            { shipment_id: shipment.partner_shipment_id },
          );
          let flags = [];

          _.forEach(shipment.flags, (shipFlag) => {
            const flag = _.find(shipmentFlag, { url: shipFlag });
            if (flag) {
              const alertType = flag.max_flag
                ? `max-${flag.type}`
                : `min-${flag.type}`;
              flags = [
                ...flags,
                {
                  ...flag,
                  alertType,
                },
              ];
            }
          });

          _.forEach(shipmentAlerts, (alert) => {
            if (alert.parameter_type === 'location') {
              const currentCustody = _.find(custodyRows, (custody) => (
                custody.shipment_id === shipment.shipment_uuid
                && _.includes(
                  alert.current_custody_id,
                  custody.custody_uuid,
                )
              ));
              if (
                currentCustody !== undefined
                && !_.includes(viewedAlerts, alert.id)
              ) {
                let message = '';
                switch (alert.alert_type) {
                  case 'present-start-geofence':
                    message = 'At start location';
                    break;

                  case 'left-start-geofence':
                    message = 'Left start location';
                    break;

                  case 'arriving-end-geofence':
                    message = 'Arriving end location';
                    break;

                  case 'present-end-geofence':
                    message = 'At end location';
                    break;

                  case 'reached-end-geofence':
                    message = 'Reached end location';
                    break;

                  case 'left-end-geofence':
                    message = 'Custody Handoff';
                    break;

                  default:
                    break;
                }

                alertsArray = [
                  ...alertsArray,
                  {
                    message: `${message} : ${
                      currentCustody.custodian_name
                    } | Shipment ${shipment.name}`,
                    severity: 'info',
                    id: alert.id,
                    date_time: alert.create_date,
                  },
                ];
              }
            } else {
              const flag = _.find(flags, (flg) => (
                alert.alert_type === flg.alertType
                && _.includes(
                  _.lowerCase(flg.name),
                  _.lowerCase(alert.parameter_type),
                )
              ));
              if (
                flag
                && !_.includes(viewedAlerts, alert.id)
              ) {
                const svrity = _.lowerCase(flag.type) === 'warning'
                  ? 'warning'
                  : 'error';

                alertsArray = [
                  ...alertsArray,
                  {
                    message: alert.recovered_alert_id
                      ? `Recovered - ${
                        flag.name
                      } | Shipment: ${shipment.name}`
                      : `${flag.name} | Shipment: ${shipment.name}`,
                    severity: alert.recovered_alert_id
                      ? 'success'
                      : svrity,
                    id: alert.id,
                    date_time: alert.create_date,
                  },
                ];
              }
            }
          });
        });

        if (alertsArray && alertsArray.length > 0) {
          const alert = alertsArray[0];
          dispatch(showAlert({
            type: alert.severity,
            open: true,
            message: `${alert.message} | ${moment(alert.date_time).fromNow()}`,
            id: alert.id,
            onClose: handleClose,
          }));
          setOpenAlerts(alertsArray);
        }
      }
    }
  }, [shipmentData, shipmentFlag, custodyData, custodianData, alerts]);

  const handleClose = (id) => {
    const present = _.find(alerts, { id });
    const open = _.filter(openAlerts, (a) => a.id !== id);

    let viewedAlerts = localStorage.getItem('viewedAlerts')
      ? JSON.parse(localStorage.getItem('viewedAlerts'))
      : [];
    if (present) {
      viewedAlerts = [...viewedAlerts, id];
    }
    localStorage.setItem(
      'viewedAlerts',
      JSON.stringify(viewedAlerts),
    );

    if (open.length > 0) {
      const alert = open[0];
      dispatch(showAlert({
        type: alert.severity,
        open: true,
        message: `${alert.message} | ${moment(alert.date_time).fromNow()}`,
        id: alert.id,
        onClose: handleClose,
      }));
      setOpenAlerts(open);
    }
  };

  return <></>;
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.shipmentReducer,
});

export default connect(mapStateToProps)(PushNotification);
