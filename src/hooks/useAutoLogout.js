/* eslint-disable no-alert */
/* eslint-disable prefer-const */
import { useEffect } from 'react';

export const useAutoLogout = (logoutFn, timeout, setIsSessionTimeout) => {
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    let timer;

    const resetTimer = () => {
      localStorage.setItem('lastActivity', Date.now());
    };

    const checkInactivity = () => {
      const lastActivity = parseInt(localStorage.getItem('lastActivity'), 10);
      const now = Date.now();

      if (now - lastActivity > timeout) {
        logoutFn();
        setIsSessionTimeout(true); // Set session timeout state
        alert('You have been logged out due to inactivity. Please log in again.');
      }
    };

    // Setup activity tracking
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); // initialize the last activity timestamp

    // Start interval checker
    timer = setInterval(checkInactivity, 60 * 1000); // check every 1 minute

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearInterval(timer);
    };
  }, [logoutFn, history, timeout]);
};
