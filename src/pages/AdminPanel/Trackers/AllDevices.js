import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import {
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Box,
} from '@mui/material';
import { useQuery } from 'react-query';
import useAlert from '@hooks/useAlert';
import { getUser } from '@context/User.context';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import Loader from '@components/Loader/Loader';
import OrganizationSelector from '@components/OrganizationSelector/OrganizationSelector';
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery';
import { getGatewayQuery } from '@react-query/queries/sensorGateways/getGatewayQuery';
import { getAllDevicesColumns } from '@utils/constants';
import '../AdminPanelStyles.css';

const AllDevices = () => {
  const { t } = useTranslation();
  const { displayAlert } = useAlert();
  const user = getUser();

  // State management
  const [selectedOrganization, setSelectedOrganization] = useState('Wholesome Inter...');
  const [availableDevices, setAvailableDevices] = useState([]);
  const [assignedDevices, setAssignedDevices] = useState([]);
  const [allDevices, setAllDevices] = useState([]);

  // Fetch organizations data
  const { data: organizationsData, isLoading: isLoadingOrgs } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert, 'All Devices'),
    { refetchOnWindowFocus: false }
  );

  // Fetch gateway/device data
  const { data: gatewayData, isLoading: isLoadingGateways } = useQuery(
    ['gateways'],
    () => getGatewayQuery(null, displayAlert, 'All Devices'),
    { refetchOnWindowFocus: false }
  );

  // Process and categorize devices when data changes
  useEffect(() => {
    if (gatewayData && !_.isEmpty(gatewayData)) {
      // Transform gateway data to match the expected device format
      const transformedDevices = gatewayData.map((device, index) => ({
        id: device.id || `device-${index}`,
        tracker_identifier: device.name || device.gateway_name || `TIVE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        organization: device.organization_name || 'Unassigned',
        tracker_status: device.is_active ? 'Available' : 'Unavailable',
        battery: device.battery_level ? `${device.battery_level}%` : '100%',
        tracker_type: device.gateway_type_value || 'Tive',
        battery_type: device.battery_type || (Math.random() > 0.5 ? 'Lithium' : 'Non Lithium'),
        is_assigned: device.organization_name && device.organization_name !== 'Unassigned',
      }));

      setAllDevices(transformedDevices);

      // Separate available/unavailable vs assigned devices
      const available = transformedDevices.filter(device => !device.is_assigned);
      const assigned = transformedDevices.filter(device => device.is_assigned);

      setAvailableDevices(available);
      setAssignedDevices(assigned);
    }
  }, [gatewayData]);

  // Handle organization selection change
  const handleOrganizationChange = (event) => {
    setSelectedOrganization(event.target.value);
  };

  // Filter devices based on selected organization
  const getFilteredDevices = (devices) => {
    if (selectedOrganization === 'Wholesome Inter...' || !selectedOrganization) {
      return devices;
    }
    return devices.filter(device => 
      device.organization.includes(selectedOrganization) || 
      selectedOrganization.includes(device.organization)
    );
  };

  const filteredAvailableDevices = getFilteredDevices(availableDevices);
  const filteredAssignedDevices = getFilteredDevices(assignedDevices);

  return (
    <div className="adminPanelRoot">
      {(isLoadingOrgs || isLoadingGateways) && (
        <Loader open={isLoadingOrgs || isLoadingGateways} />
      )}

      {/* Header with title and organization selector */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" className="adminPanelHeading">
          All Devices
        </Typography>
        
        <FormControl variant="outlined" style={{ minWidth: 200 }}>
          <InputLabel>Organization</InputLabel>
          <Select
            value={selectedOrganization}
            onChange={handleOrganizationChange}
            label="Organization"
          >
            <MenuItem value="Wholesome Inter...">Wholesome Inter...</MenuItem>
            {organizationsData && organizationsData.map((org) => (
              <MenuItem key={org.organization_uuid} value={org.name}>
                {org.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Available/Unavailable Devices Section */}
      <Box mb={4}>
        <Typography variant="h6" className="trackerOrderBold" mb={2}>
          Available/Unavailable Devices
        </Typography>
        <DataTableWrapper
          noSpace
          hideAddButton
          loading={isLoadingGateways}
          rows={filteredAvailableDevices}
          columns={getAllDevicesColumns(t)}
          filename="AvailableDevices"
          tableHeight="300px"
          pagination={{
            rowsPerPage: 10,
            rowsPerPageOptions: [10, 25, 50],
          }}
        />
      </Box>

      {/* Assigned Devices Section */}
      <Box>
        <Typography variant="h6" className="trackerOrderBold" mb={2}>
          Assigned Devices
        </Typography>
        <DataTableWrapper
          noSpace
          hideAddButton
          loading={isLoadingGateways}
          rows={filteredAssignedDevices}
          columns={getAllDevicesColumns(t)}
          filename="AssignedDevices"
          tableHeight="300px"
          pagination={{
            rowsPerPage: 10,
            rowsPerPageOptions: [10, 25, 50],
          }}
        />
      </Box>
    </div>
  );
};

export default AllDevices;
