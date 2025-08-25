import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import {
  VerifiedUser as ActivateIcon,
  VerifiedUserOutlined as DeactivateIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { IconButton, MenuItem, Select } from '@mui/material';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery';
import { useEditCoreuserMutation } from '@react-query/mutations/coreuser/editCoreuserMutation';
import { getCoregroupQuery } from '@react-query/queries/coregroup/getCoregroupQuery';
import { getCoreuserQuery } from '@react-query/queries/coreuser/getCoreuserQuery';
import { getGroupsFormattedRow, getUserFormattedRows, userColumns } from '@utils/constants';
import '../UserManagementStyles.css';
import { useDeleteCoreuserMutation } from 'react-query/mutations/coreuser/deleteCoreuserMutation';

/**
 * Component for displaying and managing user details and permissions.
 * Allows activation/deactivation, permission assignment, and user deletion.
 */
const Users = () => {
  const { t } = useTranslation();
  const user = getUser(); // Get the currently authenticated user
  const { displayAlert } = useAlert(); // Hook for displaying alert messages
  const [rows, setRows] = useState([]); // State to hold the formatted rows of user data
  const [groups, setGroups] = useState([]); // State to hold the list of available user groups

  /**
   * Fetch user data via a query hook from the backend.
   */
  const { data: coreuserData, isLoading: isLoadingCoreuser } = useQuery(
    ['users'],
    () => getCoreuserQuery(displayAlert, 'User'),
    { refetchOnWindowFocus: false },
  );

  /**
   * Fetch core group data to associate users with their respective groups.
   */
  const { data: coregroupData, isLoading: isLoadingCoregroup } = useQuery(
    ['coregroup'],
    () => getCoregroupQuery(displayAlert, 'User'),
    { refetchOnWindowFocus: false },
  );

  /**
   * Fetch organization data for associating users with specific organizations.
   */
  const { data: organizations, isLoading: isLoadingOrganizations } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert, 'User'),
    { refetchOnWindowFocus: false },
  );

  /**
   * Mutation to update a user's details (like their active status or assigned groups).
   */
  const { mutate: editUserMutation, isLoading: isEditingUser } = useEditCoreuserMutation(displayAlert, 'User');

  /**
   * Mutation to delete a user from the system.
   */
  const { mutate: deleteUserMutation, isLoading: isDeletingUser } = useDeleteCoreuserMutation(displayAlert, 'User');

  /**
   * Effect hook to format and update the list of users once data is fetched.
   * Excludes the currently logged-in user from the list.
   */
  useEffect(() => {
    if (!_.isEmpty(coreuserData)) {
      const formattedUsers = getUserFormattedRows(coreuserData); // Format the users data
      const signedInUser = _.remove(formattedUsers, { id: user.id }); // Remove the logged-in user from the list
      setRows([...signedInUser, ...formattedUsers]); // Update the rows state with formatted users
    }
  }, [coreuserData]);

  /**
   * Effect hook to format and update the list of available groups once data is available.
   */
  useEffect(() => {
    if (!_.isEmpty(coregroupData) && !_.isEmpty(organizations)) {
      setGroups(getGroupsFormattedRow(coregroupData, organizations)); // Format the group data
    }
  }, [coregroupData, organizations]);

  /**
   * Handler for toggling the active status of a user (activate/deactivate).
   */
  const activateDeactivateUser = (coreuser) => {
    const editData = { id: coreuser.id, is_active: !coreuser.is_active }; // Toggle the active status
    editUserMutation(editData); // Trigger the mutation to update user status
  };

  /**
   * Handler for deleting a user from the system.
   */
  const deleteUser = (coreuser) => {
    const deleteData = { id: coreuser.id }; // Prepare data for deletion
    deleteUserMutation(deleteData); // Trigger the mutation to delete the user
  };

  /**
   * Handler for updating a user's permissions by selecting a new group.
   */
  const updatePermissions = (e, coreuser) => {
    const editData = { id: coreuser.id, core_groups: [e.target.value] }; // Prepare the updated group data
    editUserMutation(editData); // Trigger the mutation to update user permissions
  };

  return (
    <div>
      <DataTableWrapper
        hideAddButton // Hide the button to add a new user
        filename={t('users.filename')} // Name used for export
        tableHeader={t('users.tableHeader')} // Title of the table
        loading={isLoadingCoreuser || isLoadingCoregroup || isLoadingOrganizations || isEditingUser || isDeletingUser} // Show loading spinner when data is loading
        rows={rows || []} // Display the user data in rows
        columns={[
          // Define the standard user columns (e.g., name, email) using a utility function
          ...userColumns(t),
          {
            // Column for selecting and displaying user permissions (assigned group)
            name: t('users.permissions'),
            options: {
              sort: true,
              sortThirdClickReset: true,
              filter: true,
              setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
              customBodyRenderLite: (dataIndex) => {
                const coreuser = rows[dataIndex]; // Get the user data for this row
                return (
                  <Select
                    fullWidth
                    id="coreuser-permissions"
                    disabled={_.isEqual(user.id, coreuser.id) || !coreuser.is_active} // Disable the select for the logged-in user or inactive users
                    value={coreuser.core_groups[0].id} // Display the current group for the user
                    onChange={(e) => updatePermissions(e, coreuser)} // Handle change in group assignment
                  >
                    {/* Map through available groups and render each as a MenuItem */}
                    {_.map(groups, (cg) => (
                      <MenuItem key={`coregorup-${cg.id}`} value={cg.id}>
                        {cg.display_permission_name}
                      </MenuItem>
                    ))}
                  </Select>
                );
              },
            },
          },
          {
            // Column for toggling user activation (activate/deactivate)
            name: t('users.activateDeactivateUser'),
            options: {
              filter: false,
              sort: false,
              empty: true,
              setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
              customBodyRenderLite: (dataIndex) => {
                const coreuser = rows[dataIndex]; // Get the user data for this row
                return (
                  <div className="usersIconDiv">
                    <IconButton
                      disabled={_.isEqual(user.id, coreuser.id)} // Disable for the logged-in user
                      className="usersIconButton"
                      onClick={(e) => activateDeactivateUser(coreuser)} // Toggle active status when clicked
                    >
                      {coreuser.is_active ? <ActivateIcon titleAccess={t('users.deactivate')} /> : <DeactivateIcon titleAccess={t('users.activate')} />}
                    </IconButton>
                  </div>
                );
              },
            },
          },
          {
            // Column for deleting a user
            name: t('users.deleteUser'),
            options: {
              filter: false,
              sort: false,
              empty: true,
              setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
              customBodyRenderLite: (dataIndex) => {
                const coreuser = rows[dataIndex]; // Get the user data for this row
                return (
                  <div className="usersIconDiv">
                    {coreuser.is_active ? null : (
                      <IconButton
                        className="usersIconButton"
                        onClick={(e) => deleteUser(coreuser)} // Delete the user when clicked
                      >
                        <DeleteIcon titleAccess={t('users.delete')} />
                      </IconButton>
                    )}
                  </div>
                );
              },
            },
          },
        ]}
        extraOptions={{
          setRowProps: (row, dataIndex, rowIndex) => {
            const coreuser = rows[dataIndex];
            const style = { backgroundColor: '#BEBEBA' }; // Apply background color for inactive users
            return !coreuser.is_active || _.isEqual(user.id, coreuser.id) ? { style } : {}; // Highlight inactive or logged-in user
          },
        }}
      />
    </div>
  );
};

export default Users;
