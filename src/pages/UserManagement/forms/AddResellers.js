import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useQuery, useQueryClient } from 'react-query';
import FormModal from '@components/Modal/FormModal';
import Loader from '@components/Loader/Loader';
import {
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  DisabledByDefault as CancelIcon,
} from '@mui/icons-material';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import '../UserManagementStyles.css';
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery';
import { getCustodianQuery } from '@react-query/queries/custodians/getCustodianQuery';
import { useUpdateOrganizationMutation } from '@react-query/mutations/authUser/updateOrganizationMutation';

const AddResellers = ({ open, setOpen }) => {
  const { displayAlert } = useAlert();

  const queryClient = useQueryClient();

  const [isAddResellerOpen, setAddResellerOpen] = useState(false);
  const [isAddResellerCustomerOpen, setAddResellerCustomerOpen] = useState(false);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const resellerOrganization = useInput({}, { required: true });
  const selectedResellerOrganization = useInput({}, { required: true });
  const resellerCustomerOrganization = useInput([], { required: true });
  const alreadyCustomerOrgs = useInput([]);

  const { data: orgData, isLoading: isLoadingOrgs } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  const { data: custodianData, isLoading: isLoadingCustodians } = useQuery(
    ['custodians', selectedResellerOrganization.value],
    () => getCustodianQuery(selectedResellerOrganization.value.organization_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedResellerOrganization.value) },
  );

  useEffect(() => {
    if (open && !!open) {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    }
  }, [open]);

  useEffect(() => {
    const alreadyCustomers = _.omit(_.map(_.flatMap(_.filter(orgData, (org) => org.is_reseller), (o) => o.reseller_customer_orgs)), null);
    alreadyCustomerOrgs.setValue(alreadyCustomers);
  }, [orgData]);

  useEffect(() => {
    if (!_.isEmpty(orgData) && !_.isEmpty(selectedResellerOrganization.value) && !_.isEmpty(selectedResellerOrganization.value.reseller_customer_orgs)) {
      const selectedOrgs = _.filter(orgData, (org) => _.includes(selectedResellerOrganization.value.reseller_customer_orgs, org.organization_uuid));
      resellerCustomerOrganization.setValue(selectedOrgs);
    }
  }, [selectedResellerOrganization.value, orgData]);

  const discardFormData = () => {
    resellerOrganization.clear();
    selectedResellerOrganization.clear();
    resellerCustomerOrganization.clear();
    setConfirmModal(false);
    setAddResellerOpen(false);
    setAddResellerCustomerOpen(false);
    setOpen(false);
  };

  const closeFormModal = () => {
    const dataHasChanged = !_.isEmpty(resellerOrganization.value) || !_.isEmpty(selectedResellerOrganization.value);
    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setAddResellerOpen(false);
      setAddResellerCustomerOpen(false);
      setOpen(false);
    }
  };

  const addResellerSubmitDisabled = () => {
    if (_.isEmpty(resellerOrganization.value)) {
      return true;
    }
    return null;
  };

  const addCustomerSubmitDisabled = () => {
    if (_.isEmpty(resellerCustomerOrganization.value)) {
      return true;
    }
    return null;
  };

  const { mutate: updateOrganizationMutation, isLoading: isUpdatingOrganization } = useUpdateOrganizationMutation(discardFormData, displayAlert);

  const handleAddResellerSubmit = (event) => {
    event.preventDefault();
    const data = {
      ...resellerOrganization.value,
      is_reseller: true,
    };
    updateOrganizationMutation(data);
  };

  const handleAddCustomerSubmit = (event) => {
    event.preventDefault();
    const customerUuids = resellerCustomerOrganization.value.map((item) => item.organization_uuid);
    const data = {
      ...selectedResellerOrganization.value,
      reseller_customer_orgs: customerUuids,
    };
    updateOrganizationMutation(data);
  };

  return (
    <div>
      <FormModal
        open={open}
        handleClose={closeFormModal}
        title="Create/Update Reseller Organization"
        openConfirmModal={openConfirmModal}
        setConfirmModal={setConfirmModal}
        handleConfirmModal={discardFormData}
      >
        {(isLoadingOrgs || isLoadingCustodians || isUpdatingOrganization) && <Loader open={isLoadingOrgs || isLoadingCustodians || isUpdatingOrganization} />}
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={() => setAddResellerOpen(true)}
        >
          + Add Reseller
        </Button>
        {isAddResellerOpen && (
          <>
            <Typography variant="body1" className="addResellerTitle">
              Create New Reseller Organization
            </Typography>
            <Grid container>
              <Grid item xs={12} sm={7}>
                <TextField
                  className="notranslate"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  id="resellerOrganization"
                  label={(
                    <span className="translate">Select Reseller Organization</span>
                  )}
                  value={resellerOrganization.value.name || ''}
                  onChange={(e) => {
                    const selectedOrg = !_.isEmpty(orgData) && orgData.find((org) => _.isEqual(org.name, e.target.value));
                    resellerOrganization.setValue(selectedOrg);
                  }}
                >
                  <MenuItem value="">Select</MenuItem>
                  {!_.isEmpty(orgData) && _.map(
                    _.filter(orgData, (org) => _.isEqual(org.organization_type, 2) && !org.is_reseller),
                    (org) => (
                      <MenuItem
                        key={`organization-${org.id}`}
                        value={org.name || ''}
                        className="notranslate"
                      >
                        {org.name}
                      </MenuItem>
                    ),
                  )}
                </TextField>
              </Grid>
              <Grid container mt={2.25} justifyContent="center">
                <Grid item sm={5} md={3.5} mr={2}>
                  <Button
                    type="button"
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={(e) => {
                      resellerOrganization.setValue({});
                      setAddResellerOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item sm={5} md={3.5}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={isLoadingOrgs || addResellerSubmitDisabled()}
                    onClick={handleAddResellerSubmit}
                  >
                    Save Reseller
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </>
        )}
        {!_.isEmpty(orgData) && !_.isEmpty(orgData.filter((org) => org.is_reseller)) && (
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" className="addResellerTitle">
                Select Reseller Organization
              </Typography>
              <TextField
                className="notranslate"
                variant="outlined"
                margin="normal"
                fullWidth
                select
                id="selectedResellerOrganization"
                label={(
                  <span className="translate">Select Reseller Organization</span>
                )}
                value={selectedResellerOrganization.value.name || ''}
                onChange={(e) => {
                  const selectedOrg = !_.isEmpty(orgData) && orgData.find((org) => _.isEqual(org.name, e.target.value));
                  resellerCustomerOrganization.setValue([]);
                  selectedResellerOrganization.setValue(selectedOrg);
                }}
              >
                <MenuItem value="">Select</MenuItem>
                {!_.isEmpty(orgData) && _.map(
                  _.filter(orgData, (org) => _.isEqual(org.organization_type, 2) && org.is_reseller),
                  (org) => (
                    <MenuItem
                      key={`organization-${org.id}`}
                      value={org.name || ''}
                      className="notranslate"
                    >
                      {org.name}
                    </MenuItem>
                  ),
                )}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" className="addResellerTitle">
                Reseller Customer Organization
              </Typography>
              {!_.isEmpty(resellerCustomerOrganization.value)
                && _.map(resellerCustomerOrganization.value, (item, index) => (
                  <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item xs={10.8}>
                      <TextField
                        className="notranslate"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        contentEditable={false}
                        id={`reseller-customer-${index}`}
                        label={(
                          <span className="translate">{`Reseller Customer Organization ${index + 1}`}</span>
                        )}
                        value={item.name}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <Button
                        type="button"
                        onClick={(e) => {
                          const newList = _.filter(
                            resellerCustomerOrganization.value,
                            (cust, idx) => (!_.isEqual(idx, index)),
                          );
                          resellerCustomerOrganization.setValue(newList);
                        }}
                      >
                        <CancelIcon fontSize="large" className="addResellerCustomersCancel" />
                      </Button>
                    </Grid>
                  </Grid>
                ))}
              {isAddResellerCustomerOpen && (
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item xs={10.8}>
                    <TextField
                      className="notranslate"
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      select
                      id="resellerCustomerOrganization"
                      label={(
                        <span className="translate">Select Reseller Customer Organization</span>
                      )}
                      onChange={(e) => {
                        const selectedOrg = !_.isEmpty(orgData) && orgData.find((org) => _.isEqual(org.name, e.target.value));
                        resellerCustomerOrganization.setValue([...resellerCustomerOrganization.value, selectedOrg]);
                        setAddResellerCustomerOpen(false);
                      }}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {!_.isEmpty(orgData) && _.map(
                        _.filter(orgData, (o) => (
                          !o.is_reseller
                          && _.isEqual(o.organization_type, 2)
                          && !_.includes(alreadyCustomerOrgs.value, o.organization_uuid)
                          && !_.includes(_.map(resellerCustomerOrganization.value, 'organization_uuid'), o.organization_uuid)
                        )),
                        (org) => (
                          <MenuItem key={`organization-${org.id}`} value={org.name || ''} className="notranslate">
                            {org.name}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  </Grid>
                  <Grid item xs={1}>
                    <Button
                      type="button"
                      onClick={(e) => setAddResellerCustomerOpen(false)}
                    >
                      <CancelIcon fontSize="large" className="addResellerCustomersCancel" />
                    </Button>
                  </Grid>
                </Grid>
              )}
              {!isAddResellerCustomerOpen && _.size(_.filter(orgData, (o) => (
                !o.is_reseller
                && _.isEqual(o.organization_type, 2)
                && !_.includes(alreadyCustomerOrgs.value, o.organization_uuid)
                && !_.includes(_.map(resellerCustomerOrganization.value, 'organization_uuid'), o.organization_uuid)
              ))) > 0 && (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={(e) => setAddResellerCustomerOpen(true)}
                  style={{ marginTop: 16 }}
                  disabled={_.isEmpty(selectedResellerOrganization.value)}
                >
                  + Add Reseller Customer Orgnization
                </Button>
              )}
              {!_.isEmpty(resellerCustomerOrganization.value) && (
                <Grid container justifyContent="center" mt={3}>
                  <Grid item sm={5} md={3.5} mr={2}>
                    <Button
                      type="button"
                      fullWidth
                      variant="outlined"
                      color="primary"
                      onClick={closeFormModal}
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item sm={5} md={3.5}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={isLoadingOrgs || addCustomerSubmitDisabled()}
                      onClick={handleAddCustomerSubmit}
                    >
                      Save Reseller
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
      </FormModal>
    </div>
  );
};

export default AddResellers;
