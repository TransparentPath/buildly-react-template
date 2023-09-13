import { routes } from '../../routes/routesConstants';

export const ADMIN_NAVIGATION_ITEMS = [
  {
    id: 'shipment',
    name: 'Shipments',
    link: routes.SHIPMENT,
  },
  {
    id: 'items',
    name: 'Items',
    link: routes.ITEMS,
  },
  {
    id: 'custodians',
    name: 'Custodians',
    link: routes.CUSTODIANS,
  },
  {
    id: 'trackers',
    name: 'Trackers',
    link: routes.TRACKERS,
  },
  {
    id: 'reporting',
    name: 'Reporting',
    link: routes.REPORTING,
  },
];

export const USER_NAVIGATION_ITEMS = [
  {
    id: 'shipment',
    name: 'Shipments',
    link: routes.SHIPMENT,
  },
  {
    id: 'reporting',
    name: 'Reporting',
    link: routes.REPORTING,
  },
];
