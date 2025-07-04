/* eslint-disable no-alert */
import { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { routes } from '@routes/routesConstants'; // Adjust if necessary

export const useAutoLogout = (logoutFn, timeout, setIsSessionTimeout) => {
  const timerRef = useRef(null);
  const hasLoggedOutRef = useRef(false); // Prevent double logout
  const history = useHistory();
  const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];

  useEffect(() => {
    const resetTimer = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    const handleInactivity = () => {
      const lastActivity = parseInt(localStorage.getItem('lastActivity'), 10);
      if (!isNaN(lastActivity)) {
        const now = Date.now();
        if (now - lastActivity > timeout && !hasLoggedOutRef.current) {
          hasLoggedOutRef.current = true;

          // Clear session (cookies, tokens, etc.)
          logoutFn();

          // Set session timeout state (used in App.js for conditional redirect)
          setIsSessionTimeout(true);

          if ('caches' in window) {
            caches.keys().then((cacheNames) => {
              cacheNames.forEach((cacheName) => {
                if (cacheName.startsWith('workbox-precache')) {
                  caches.delete(cacheName); // ✅ always call as method of caches
                }
              });
            });
          }

          // Optional: show toast instead of alert
          // You could dispatch a global alert here
          alert('You have been logged out due to inactivity. Please log in again.');
        }
      }
    };

    // Attach activity listeners
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); // Set initial activity

    // Set periodic inactivity check
    timerRef.current = setInterval(handleInactivity, 60 * 1000); // every 1 minute

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [logoutFn, timeout, setIsSessionTimeout, history]);
};
