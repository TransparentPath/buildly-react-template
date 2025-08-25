import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Switch } from '@mui/material';
import { useQuery } from 'react-query';
import useAlert from '@hooks/useAlert';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getCoregroupQuery } from '@react-query/queries/coregroup/getCoregroupQuery';
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery';
import { getGroupsFormattedRow } from '@utils/constants';
import { useEditCoregroupMutation } from '@react-query/mutations/coregroup/editCoregroupMutation';
import { useTranslation } from 'react-i18next';

/**
 * Component for displaying and updating permissions for core user groups.
 */
const UserGroups = () => {
  const { t } = useTranslation();
  const { displayAlert } = useAlert(); // Hook to display alerts
  const [rows, setRows] = useState([]); // State to hold formatted group data

  /**
   * Query to fetch all core user groups.
   * The response is transformed for use in the table.
   */
  const { data: coregroupData, isLoading: isLoadingCoregroup } = useQuery(
    ['coregroups'],
    () => getCoregroupQuery(displayAlert, 'User groups'),
    { refetchOnWindowFocus: false }, // Avoid refetching on tab focus
  );

  /**
   * Query to fetch all organizations.
   * Used to associate groups with org-specific metadata.
   */
  const { data: organizations, isLoading: isLoadingOrganizations } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert, 'User groups'),
    { refetchOnWindowFocus: false },
  );

  /**
   * Mutation for updating group permissions.
   * Called when a permission switch is toggled.
   */
  const { mutate: editGroupMutation, isLoading: isEditingGroup } = useEditCoregroupMutation(displayAlert, 'User groups');

  /**
   * When both core groups and organization data are loaded,
   * format and filter them for display in the table.
   */
  useEffect(() => {
    if (!_.isEmpty(coregroupData) && !_.isEmpty(organizations)) {
      const grps = getGroupsFormattedRow(coregroupData, organizations); // Combine and format data
      setRows(_.filter(grps, (g) => !_.isEqual(g.id, 1))); // Exclude default/system group (id=1)
    }
  }, [coregroupData, organizations]);

  /**
   * Handler to update permissions for a specific group.
   * This is triggered when a permission switch is toggled.
   */
  const updatePermissions = (e, group) => {
    const editData = {
      id: group.id,
      permissions: {
        ...group.permissions,
        [e.target.name]: e.target.checked, // Toggle the targeted permission
      },
    };

    editGroupMutation(editData); // Trigger the mutation to update backend
  };

  return (
    <div>
      <DataTableWrapper
        hideAddButton // Do not show add new row button
        filename={t('userGroups.filename')} // Filename used when exporting
        tableHeader={t('userGroups.tableHeader')} // Title shown at top of table
        loading={isLoadingCoregroup || isLoadingOrganizations || isEditingGroup} // Show loading state
        rows={rows || []} // Table data
        columns={[
          // Column for displaying group name/type
          {
            name: 'display_permission_name',
            label: t('userGroups.groupType'),
            options: {
              sort: true,
              sortThirdClickReset: true,
              filter: true,
            },
          },
          // Permission toggle columns (Create, Read, Update, Delete)
          ...['Create', 'Read', 'Update', 'Delete'].map((permission) => ({
            name: permission,
            label: t(`userGroups.${permission.toLowerCase()}`),
            options: {
              sort: true,
              sortThirdClickReset: true,
              filter: true,
              setCellHeaderProps: () => ({ style: { textAlign: 'center' } }), // Center align column header
              customBodyRenderLite: (dataIndex) => {
                const coregroup = rows[dataIndex]; // Get row data
                return (
                  <Switch
                    name={permission.toLowerCase()} // Switch name corresponds to permission type
                    checked={coregroup.permissions[permission.toLowerCase()]} // Whether switch is on/off
                    onChange={(e) => updatePermissions(e, coregroup)} // Toggle permission on change
                  />
                );
              },
            },
          })),
        ]}
      />
    </div>
  );
};

export default UserGroups;
