/* eslint-disable no-alert */
import { useEffect, useRef } from 'react';
import { routes } from '@routes/routesConstants'; // Adjust if necessary
import { useTranslation } from 'react-i18next';
import useCustomAlert from '@hooks/useCustomAlert';

export const useAutoLogout = (logoutFn, history) => {
  const timerRef = useRef(null);
  const hasLoggedOutRef = useRef(false); // Prevent double logout
  const { t } = useTranslation();
  const { showAlert } = useCustomAlert();

  useEffect(() => {
    const handleSessionExpiration = async () => {
      const timeout = sessionStorage.getItem('expires_at') || localStorage.getItem('expires_at');
      if (timeout) {
        const expiresAtTime = new Date(parseInt(timeout, 10)).getTime();
        const now = Date.now();
        if (now > expiresAtTime && !hasLoggedOutRef.current) {
          hasLoggedOutRef.current = true;

          // Show custom alert and wait for user acknowledgment
          await showAlert(
            t('alerts.sessionExpiredAlert'),
            t('alerts.sessionExpiredTitle'),
            t('alerts.sessionExpiredButton'),
          );

          // Clear session (cookies, tokens, etc.)
          logoutFn();

          if ('caches' in window) {
            caches.keys().then((cacheNames) => {
              cacheNames.forEach((cacheName) => {
                if (cacheName.startsWith('workbox-precache')) {
                  caches.delete(cacheName);
                }
              });
            });
          }

          // After user clicks OK, redirect to login
          history.push(routes.LOGIN);
        }
      }
    };

    timerRef.current = setInterval(handleSessionExpiration, 1 * 1000); // every 1 minute

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [logoutFn, history, showAlert, t]);
};
