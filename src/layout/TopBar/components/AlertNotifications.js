import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useTranslation } from 'react-i18next';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="left" ref={ref} {...props} />
));

const AlertNotifications = ({
  setHideAlertBadge,
  open,
  setOpen,
  history,
  timezone,
  unitOfMeasure,
}) => {
  const theme = useTheme();
  const user = getUser();
  const queryClient = useQueryClient();
  const appTitle = useContext(AppContext).title;
  const { data: timeZone } = useStore();

  const { t } = useTranslation();

  const [pushGrp, setPushGrp] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  // Track reload flag even if socket closed before executing
  const pendingReload = useRef(false);

  // Ref to always have latest pushGrp in callbacks
  const pushGrpRef = useRef(pushGrp);

  useEffect(() => {
    pushGrpRef.current = pushGrp;
  }, [pushGrp]);

  useEffect(() => {
    if (!_.isEmpty(user)) {
      const orgId = user.organization.organization_uuid;
      // Only update pushGrp if it is different to avoid infinite loop
      if (pushGrp !== orgId) {
        setPushGrp(orgId);
      }
    }
  }, [user]);

  const socketUrl = pushGrp
    ? `${window.env.ALERT_SOCKET_URL}${pushGrp}/`
    : null;

  const {
    lastJsonMessage,
    readyState,
    sendJsonMessage,
  } = useWebSocket(socketUrl, {
    share: false,
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    onOpen: () => {
      sendJsonMessage({ command: 'fetch_alerts', organization_uuid: pushGrpRef.current });
    },
    onClose: () => {
      if (pendingReload.current && oauthService.hasValidAccessToken()) {
        reloadData();
      }
    },
    onError: (event) => {
      // eslint-disable-next-line no-console
      console.error('WebSocket error:', event);
    },
  }, Boolean(pushGrp));

  const reloadData = useCallback(async () => {
    if (oauthService.hasValidAccessToken()) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['shipments'] }),
        queryClient.invalidateQueries({ queryKey: ['allGateways'] }),
        queryClient.invalidateQueries({ queryKey: ['sensorAlerts'] }),
        queryClient.invalidateQueries({ queryKey: ['sensorReports'] }),
      ]);
      setRedirectToLogin(false);
    } else {
      oauthService.logout();
      setRedirectToLogin(true);
    }
    pendingReload.current = false;
  }, [queryClient]);

  useEffect(() => {
    if (!lastJsonMessage) return;
    const msg = lastJsonMessage;
    if (msg.command === 'fetch_alerts' || msg.command === 'new_alert') {
      handleMessages(msg);
    }
    if (msg.command === 'reload_data') {
      if (!pendingReload.current) {
        pendingReload.current = true;
        if (readyState === ReadyState.OPEN) {
          reloadData();
        }
      }
    }
  }, [lastJsonMessage, readyState, reloadData]);

  const handleMessages = (msg) => {
    const viewed = getViewedNotifications();
    const alertsList = _.map(msg.alerts, (a) => {
      const [param, rest] = a.alert_message.split(' of ');
      const parameterType = _.toLower(param);
      const parameterValue = rest ? rest.split(' at ')[0] : '';
      let alertObj = {
        id: parameterType,
        color: 'green',
        title: t('alertNotifications.recovered', {
          parameter: _.capitalize(parameterType),
        }),
      };
      if (a.severity === 'error') {
        alertObj = {
          ...alertObj,
          title: t('alertNotifications.maxExcursion', {
            parameter: _.capitalize(parameterType),
          }),
          color: theme.palette.error.main,
        };
      } else if (a.severity === 'info') {
        alertObj = {
          ...alertObj,
          title: t('alertNotifications.minExcursion', {
            parameter: _.capitalize(parameterType),
          }),
          color: theme.palette.info.main,
        };
      }
      return { ...a, alertObj, parameterValue };
    });

    const shipments = _.uniqBy(alertsList, 'shipment_id');

    const formatted = shipments.map((ship) => {
      const shipAlerts = _.orderBy(
        alertsList.filter((a) => a.shipment_id === ship.shipment_id),
        ['alert_time', 'id'],
        ['desc', 'asc'],
      );
      const isViewed = shipAlerts.every((a) => viewed.includes(a.id));
      return {
        shipment_id: ship.shipment_id,
        shipment_name: ship.shipment_name,
        alerts: shipAlerts,
        viewed: isViewed,
      };
    });

    if (msg.command === 'fetch_alerts') {
      setNotifications(formatted);
    } else if (msg.command === 'new_alert') {
      setNotifications((prev) => formatted.map((fa) => {
        const existing = prev.find((p) => p.shipment_id === fa.shipment_id);
        return existing
          ? _.mergeWith({}, existing, fa, (objV, srcV) => (_.isArray(objV) ? objV.concat(srcV) : undefined))
          : fa;
      }));
      pendingReload.current = true;
      reloadData();
    }
  };

  useEffect(() => {
    const notViewed = notifications.filter((n) => !n.viewed);
    const unviewedAlerts = _.flatten(
      notViewed.map((n) => n.alerts.filter((a) => !getViewedNotifications().includes(a.id))),
    );
    if (unviewedAlerts.length > 0) {
      setHideAlertBadge(false);
      unviewedAlerts.forEach((a) => {
        addNotification({
          native: true,
          duration: window.env.hide_notification,
          title: appTitle,
          message: `${t('alertNotifications.shipment')}: ${a.shipment_name} | ${a.alert_message} ${moment(a.alert_time).tz(timeZone).toString()}`,
          onClick: () => {
            setOpen(true);
            const seen = getViewedNotifications();
            localStorage.setItem(
              'viewedNotifications',
              JSON.stringify(_.uniq([...seen, a.id])),
            );
          },
        });
      });
    } else {
      setHideAlertBadge(true);
    }
  }, [notifications, appTitle, timeZone, setHideAlertBadge, setOpen]);

  const getViewedNotifications = () => (localStorage.getItem('viewedNotifications')
    ? JSON.parse(localStorage.getItem('viewedNotifications'))
    : []);

  const handleAlertCountClick = (i) => {
    const newNoti = [...notifications];
    newNoti[i].viewed = true;
    setNotifications(newNoti);
    setHideAlertBadge(true);
    const seen = getViewedNotifications();
    const ids = newNoti[i].alerts.map((a) => a.id);
    localStorage.setItem('viewedNotifications', JSON.stringify(_.uniq([...seen, ...ids])));
  };

  return (
    <>
      {redirectToLogin && <Redirect to="/login" />}
      <Dialog
        open={open}
        onClose={() => { setOpen(false); setHideAlertBadge(true); }}
        fullWidth
        fullScreen={isTablet()}
        TransitionComponent={Transition}
      >
        <DialogTitle>
          <Grid container alignItems="center">
            <Typography variant="h6" flex={1}>{t('alertNotifications.shipmentNotifications')}</Typography>
            <IconButton
              onClick={() => {
                setOpen(false);
                setHideAlertBadge(true);
              }}
            >
              <CloseIcon fontSize="large" />
            </IconButton>
          </Grid>
        </DialogTitle>
        <DialogContent>
          {notifications.length === 0 ? (
            <Grid container justifyContent="center" alignItems="center" style={{ height: '200px' }}>
              <Typography>{t('alertNotifications.noNewAlerts')}</Typography>
            </Grid>
          ) : (
            notifications.map((noti, idx) => (
              <Grid item xs={12} key={noti.shipment_id}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={(
                      <Button color="error" variant="contained" onClick={() => handleAlertCountClick(idx)}>
                        {noti.alerts.length}
                      </Button>
                    )}
                    onClick={() => handleAlertCountClick(idx)}
                  >
                    {!noti.viewed && <span className="badge" />}
                    <Typography
                      onClick={() => {
                        history.push(`${routes.REPORTING}/?shipment=${noti.shipment_id}`);
                        setOpen(false);
                        setHideAlertBadge(true);
                      }}
                    >
                      {noti.shipment_name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DataTableWrapper
                      rows={noti.alerts}
                      columns={getAlertNotificationsColumns(
                        timezone,
                        _.find(unitOfMeasure, (u) => u.unit_of_measure_for.toLowerCase() === 'date')?.unit_of_measure || '',
                        _.find(unitOfMeasure, (u) => u.unit_of_measure_for.toLowerCase() === 'time')?.unit_of_measure || '',
                        t,
                      )}
                      noSpace
                      hideAddButton
                      noOptionsIcon
                    />
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertNotifications;
