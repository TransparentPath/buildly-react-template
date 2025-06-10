import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  Grid,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import Loader from '@components/Loader/Loader';
import FormModal from '@components/Modal/FormModal';
import { getUser } from '@context/User.context';
import { useInput } from '@hooks/useInput';
import { isDesktop } from '@utils/mediaQuery';
import { useEditCustodianMutation } from '@react-query/mutations/custodians/editCustodianMutation';
import useAlert from '@hooks/useAlert';
import '../../AdminPanelStyles.css';

const EditMapping = ({ history, location }) => {
  // Get the current user's organization UUID
  const organization = getUser().organization.organization_uuid;

  // Modal state control
  const [openFormModal, setFormModal] = useState(true); // Controls form modal visibility
  const [openConfirmModal, setConfirmModal] = useState(false); // Controls discard changes confirmation modal
  const [options, setOptions] = useState([]); // Dropdown options for selecting a custodian organization

  const { displayAlert } = useAlert(); // Hook to trigger global alert messages

  // Extract required data from router location state
  const { orgData } = location.state || {};
  const redirectTo = location.state && location.state.from;
  const pageType = location.state && location.state.type;
  const pageData = location.state && location.state.data;

  // UI strings based on whether the user is editing or setting a mapping
  const buttonText = _.isEqual(pageType, 'edit') ? 'Save' : 'Set Mapping';
  const formTitle = _.isEqual(pageType, 'edit') ? 'Edit Mapping' : 'Set Mapping';

  // Controlled input for the selected custodian organization
  const custodyOrg = useInput((pageData && pageData.custody_org_uuid) || '');

  // Setup dropdown options when component mounts or orgData/pageData changes
  useEffect(() => {
    if (orgData && pageData) {
      const opts = _.map(orgData, (org) => {
        // Suggest an org that matches the name of the custodian
        const suggest = _.lowerCase(org.name) === _.lowerCase(pageData.name);
        return {
          value: org.organization_uuid,
          name: org.name,
          order: suggest ? 1 : 0, // Prioritize suggested orgs
        };
      });

      // Order suggestions (suggested ones first, then alphabetical)
      const orderedOpts = _.orderBy(opts, ['order', 'name'], ['desc', 'asc']);
      setOptions(orderedOpts);
    }
  }, [orgData, pageData]);

  // Close the form modal, confirm if there are unsaved changes
  const closeFormModal = () => {
    if (custodyOrg.hasChanged()) {
      setConfirmModal(true); // Show confirmation modal
    } else {
      setFormModal(false); // Close without confirmation
      if (location && location.state) {
        history.push(redirectTo);
      }
    }
  };

  // Discard unsaved changes and close the modal
  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(redirectTo);
    }
  };

  // React Query mutation hook to submit the custodian update
  const { mutate: editCustodianMutation, isLoading: isEditingCustodian } = useEditCustodianMutation(organization, history, redirectTo, displayAlert, 'Mapping');

  // Form submission handler
  const handleSubmit = (event) => {
    event.preventDefault();

    // Construct payload for updating custodian
    const editData = {
      ...pageData,
      custody_org_uuid: custodyOrg.value || null,
      edit_date: new Date(), // Add timestamp
    };

    // Trigger mutation with data
    editCustodianMutation([editData, null]);
  };

  return (
    <div>
      {/* Show form modal if state is open */}
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title={formTitle}
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          {/* Loader while mutation is in progress */}
          {isEditingCustodian && <Loader open={isEditingCustodian} />}

          {/* Form contents */}
          <form className="adminPanelFormContainer" noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isDesktop() ? 2 : 0}>
              {/* Display custodian name (disabled input) */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  disabled
                  id="name"
                  label="Custodian Name"
                  name="name"
                  value={(pageData && pageData.name) || ''}
                />
              </Grid>

              {/* Dropdown to select custodian organization */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  id="custodyOrg"
                  label="Custodian Organization"
                  name="custodyOrg"
                  autoComplete="custodyOrg"
                  {...custodyOrg.bind}
                >
                  <MenuItem value="">Select</MenuItem>
                  {options && options.length > 0 && _.map(options, (option, index) => (
                    <MenuItem key={`org-option-${index}`} value={option.value}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Submit and Cancel buttons */}
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={6} sm={4}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className="adminPanelSubmit"
                    disabled={isEditingCustodian}
                  >
                    {buttonText}
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    type="button"
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={discardFormData}
                    className="adminPanelSubmit"
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default EditMapping;
