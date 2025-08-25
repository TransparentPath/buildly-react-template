import React from 'react';
// Route is used to define nested routes inside this component
import { Route } from 'react-router-dom';
// Lodash is imported for potential data manipulation (though not used in this file)
import _ from 'lodash';
// A custom wrapper around data table UI with extended functionality
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
// Utility to get the current authenticated user from global context
import { getUser } from '@context/User.context';
// Centralized route constants used throughout the application
import { routes } from '@routes/routesConstants';
// A utility function to dynamically create columns for the DataTable
import { getMappingOrg } from '@utils/constants';
// Component used for editing mappings of custodian organizations
import EditMapping from '../forms/EditMapping';
// React Query hook to fetch and manage server-side data
import { useQuery } from 'react-query';
// Query function to get all organizations for the current user
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery';
// Query function to get all custodians for a specific organization
import { getCustodianQuery } from '@react-query/queries/custodians/getCustodianQuery';
// Custom hook to show alert messages to the user
import useAlert from '@hooks/useAlert';
import { useTranslation } from 'react-i18next';

const MappingOrg = ({ history, redirectTo }) => {
  const { t } = useTranslation();

  // Retrieve the currently logged-in user's data
  const user = getUser();
  const organization = user.organization.organization_uuid;

  // Custom hook to show alerts when errors occur or feedback is needed
  const { displayAlert } = useAlert();

  // Define the base path for editing mappings
  // If a redirect path is passed via props, use that; otherwise, use default consortium path
  const editPath = redirectTo || `${routes.CONSORTIUM}/mapping-edit`;

  // Fetch all organizations, caching and preventing refetch on window focus
  const { data: orgData, isLoading: isLoadingOrgs } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert, 'Mapping organizations'),
    { refetchOnWindowFocus: false },
  );

  // Fetch custodians for the current user's organization
  const { data: custodianData, isLoading: isLoadingCustodians } = useQuery(
    ['custodians', organization],
    () => getCustodianQuery(organization, displayAlert, 'Mapping organizations'),
    { refetchOnWindowFocus: false },
  );

  /**
   * Navigates to the edit form for a specific custodian mapping
   * @param {Object} item - The custodian row data
   */
  const editData = (item) => {
    history.push(`${editPath}/:${item.id}`, {
      // Determine if the mapping is being edited or newly set
      type: item.custody_org_uuid ? 'edit' : 'set',
      // Indicate the source route for back navigation
      from: redirectTo || routes.CONSORTIUM,
      // Pass the custodian data and organization list to the edit component
      data: item,
      orgData,
    });
  };

  return (
    <DataTableWrapper
      noSpace // Remove default padding/margins
      hideAddButton // Hides the add button since this view is for mapping/editing
      loading={isLoadingOrgs || isLoadingCustodians} // Show loader until both queries are done
      rows={custodianData || []} // Populate the table rows with custodian data
      columns={getMappingOrg(orgData, t)} // Generate dynamic columns based on organization data
      filename={t('mappingOrg.tableTitle')} // Filename for exporting the table
      editAction={editData} // Function to trigger when editing a row
    >
      {/* Define a nested route to show the EditMapping form */}
      <Route path={`${editPath}/:id`} component={EditMapping} />
    </DataTableWrapper>
  );
};

export default MappingOrg;
