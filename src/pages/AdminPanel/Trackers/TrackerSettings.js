import React from 'react';
import { useTranslation } from 'react-i18next';
import AllDevices from './AllDevices'; // Import the new AllDevices component
import '../AdminPanelStyles.css'; // Import custom CSS styles for the admin panel

// The TrackerSettings component renders the new all devices interface
const TrackerSettings = (props) => {
  const { t } = useTranslation();

  return (
    <div className="adminPanelRoot">
      <AllDevices />
    </div>
  );
};

export default TrackerSettings;
