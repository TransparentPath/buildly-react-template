import {
  useTheme,
  useMediaQuery,
} from '@mui/material';

/**
 * Detects if the current screen size falls under the "mobile" breakpoint.
 *
 * This function:
 * - Uses MUI's `useTheme` to access the current theme's breakpoint values.
 * - Uses `useMediaQuery` to check if the screen width is **less than or equal to "sm"** breakpoint (typically 600px).
 *
 * @returns {boolean} `true` if the screen is mobile-sized, otherwise `false`.
 */
export const isMobile = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useTheme();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMediaQuery(theme.breakpoints.down('sm'));
};

/**
 * Detects if the current screen size falls under the "tablet" breakpoint.
 *
 * This function:
 * - Uses the theme's breakpoints to determine if the screen width is **less than or equal to "md"** (typically 960px).
 * - Useful for adjusting layouts or components for tablets and smaller devices.
 *
 * @returns {boolean} `true` if screen size is considered tablet or smaller, otherwise `false`.
 */
export const isTablet = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useTheme();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMediaQuery(theme.breakpoints.down('md'));
};

/**
 * Detects if the current screen size qualifies as "desktop" (including tablets in landscape).
 *
 * This function:
 * - Checks if the screen width is **greater than or equal to the "sm"** breakpoint (typically 600px).
 * - This means everything **except very small mobile screens** will return `true`.
 *
 * @returns {boolean} `true` if the screen is desktop-sized or larger, otherwise `false`.
 */
export const isDesktop = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useTheme();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMediaQuery(theme.breakpoints.up('sm'));
};

/**
 * Detects if the current screen size is **strictly desktop-sized and above**, excluding tablets.
 *
 * This function:
 * - Returns `true` only if the screen width is **greater than or equal to "md"** breakpoint (typically 960px).
 * - Use this for full desktop-only UI elements that shouldn't appear on tablets or smaller.
 *
 * @returns {boolean} `true` if screen is full desktop-sized or larger, otherwise `false`.
 */
export const isDesktop2 = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useTheme();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMediaQuery(theme.breakpoints.up('md'));
};
