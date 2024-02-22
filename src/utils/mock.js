import moment from 'moment-timezone';

export const DATE_DISPLAY_CHOICES = [
  { label: moment().format('MMM DD, YYYY'), value: 'MMM DD, YYYY' },
  { label: moment().format('DD MMM, YYYY'), value: 'DD MMM, YYYY' },
  { label: moment().format('MM/DD/YYYY'), value: 'MM/DD/YYYY' },
  { label: moment().format('DD/MM/YYYY'), value: 'DD/MM/YYYY' },
];

export const TIME_DISPLAY_CHOICES = [
  { label: '12 Hour clock', value: 'hh:mm:ss A' },
  { label: '24 Hour clock', value: 'HH:mm:ss' },
];

export const UOM_DISTANCE_CHOICES = ['Miles', 'Kilometers'];

export const UOM_TEMPERATURE_CHOICES = ['Fahrenheit', 'Celsius'];

export const UOM_WEIGHT_CHOICES = ['Pounds', 'Kilograms'];

export const TIVE_GATEWAY_TIMES = [
  { value: 5, label: '5 Minutes' },
  { value: 10, label: '10 Minutes' },
  { value: 20, label: '20 Minutes' },
  { value: 30, label: '30 Minutes' },
  { value: 60, label: '1 Hour' },
  { value: 120, label: '2 Hours' },
  { value: 360, label: '6 Hours' },
  { value: 720, label: '12 Hours' },
];

export const CREATE_SHIPMENT_STATUS = [
  { value: 'Planned', label: 'Planned' },
  { value: 'En route', label: 'En route' },
  { value: 'Arrived', label: 'Arrived' },
];
export const USER_SHIPMENT_STATUS = [
  { value: 'Planned', label: 'Planned' },
  { value: 'En route', label: 'En route' },
  { value: 'Arrived', label: 'Arrived' },
  { value: 'Cancelled', label: 'Cancelled' },
];
export const ADMIN_SHIPMENT_STATUS = [
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Damaged', label: 'Damaged' },
  { value: 'Battery Depleted', label: 'Battery Depleted' },
];

export const WHATS_NEW_MOCK = {
  new_update_version: '1.2',
  new_update_details: [
    {
      id: 1,
      icon: 'Notifications',
      title: 'Bell icon to track new alerts',
      desc: 'Click the bell icon to see exactly which shipments have new alerts that need your attention. It works similar to an inbox! Once you\'ve seen these alerts, the red dot in the upper right hand corner will disappear.',
    },
    {
      id: 2,
      icon: 'Lock',
      title: 'Privacy Policy update',
      desc: 'Worried about your data safety? Our platform meets compliance for the General Data Protection Regulation. Once you log into our updated platform, our privacy policy will pop-up asking for consent. Our privacy policy is also posted, just click on profile icon in the upper right hand corner for reference. Make sure you accept the newest version of the platform for access these changes.',
    },
    {
      id: 3,
      icon: 'Unsubscribe',
      title: 'Suppress certain types of alert emails',
      desc: 'Admin\'s now have the ability to suppress email alerts for specific environmental conditions. Don\'t want to receive shock alerts? You can suppress this feature by going to the "Admin Panel" when you click the settings icon. This will apply to the entire organization.',
    },
  ],
};
