// Import the routes constants from a centralized routes file
import { routes } from '@routes/routesConstants';

// Define an array of navigation items, each representing a section in the app
export const NAVIGATION_ITEMS = [
  {
    // Each item in the navigation menu has a unique 'id' for identification
    id: 'shipment', // Unique identifier for the shipment menu item
    link: routes.SHIPMENT, // The route URL for the shipment page, sourced from the routes constants
  },
  {
    id: 'items', // Unique identifier for the items menu item
    link: routes.ITEMS, // The route URL for the items page, sourced from the routes constants
  },
  {
    id: 'custodians', // Unique identifier for the custodians menu item
    link: routes.CUSTODIANS, // The route URL for the custodians page, sourced from the routes constants
  },
  {
    id: 'trackers', // Unique identifier for the trackers menu item
    link: routes.TRACKERS, // The route URL for the trackers page, sourced from the routes constants
  },
  {
    id: 'reporting', // Unique identifier for the reporting menu item
    link: routes.REPORTING, // The route URL for the reporting page, sourced from the routes constants
  },
];
