/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import {
  Grid,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import Loader from '@components/Loader/Loader';
import FormModal from '@components/Modal/FormModal';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import { useAddRecipientAddressMutation } from '@react-query/mutations/recipientaddress/addRecipientAddressMutation';
import { useEditRecipientAddressMutation } from '@react-query/mutations/recipientaddress/editRecipientAddressMutation';
import { validators } from '@utils/validators';
import { isDesktop } from '@utils/mediaQuery';
import '../../AdminPanelStyles.css';
import usePlacesService from 'react-google-autocomplete/lib/usePlacesAutocompleteService';
import Geocode from 'react-geocode';
import { useTranslation } from 'react-i18next';

// Component for adding or editing recipient addresses
const AddRecipientAddress = ({ history, location }) => {
  const { t } = useTranslation();

  // Get organization UUID from logged in user
  const { organization_uuid } = getUser().organization;

  // Modal open/close states
  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);

  // Show alert toast
  const { displayAlert } = useAlert();

  // Set up Geocode with API key and language
  Geocode.setApiKey(window.env.GEO_CODE_API);
  Geocode.setLanguage('en');

  // Autocomplete service for address suggestions
  const {
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: window.env.MAP_API_KEY,
  });

  // Determine if we're in edit mode and get existing data
  const editPage = location.state && location.state.type === 'edit';
  const editData = (editPage && location.state.data) || {};

  // Controlled form fields with validation
  const name = useInput((editData && editData.name) || '', { required: true });
  const country = useInput((editData && editData.country) || '', { required: true });
  const state = useInput((editData && editData.state) || '', { required: true });
  const [address1, setAddress1] = useState((editData && editData.address1) || '');
  const address_2 = useInput((editData && editData.address2) || '');
  const city = useInput((editData && editData.city) || '', { required: true });
  const zip = useInput((editData && editData.postal_code) || '', { required: true });
  const [formError, setFormError] = useState({});

  // Button text and modal title based on mode
  const buttonText = editPage ? t('addRecipientAddress.save') : t('addRecipientAddress.addRecipientAddress');
  const formTitle = editPage ? t('addRecipientAddress.editRecipientAddress') : t('addRecipientAddress.addRecipientAddress');

  // Handles modal close, prompts confirm modal if data was changed
  const closeFormModal = () => {
    const dataHasChanged = (
      name.hasChanged()
      || country.hasChanged()
      || state.hasChanged()
      || !_.isEqual(address1, '')
      || address_2.hasChanged()
      || city.hasChanged()
      || zip.hasChanged()
    );
    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      if (location && location.state) {
        history.push(location.state.from);
      }
    }
  };

  // Discard form changes and close modal
  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(location.state.from);
    }
  };

  // Mutation hooks for adding and editing recipient addresses
  const { mutate: addRecipientAddressMutation, isLoading: isAddingRecipientAddress } = useAddRecipientAddressMutation(history, location.state.from, displayAlert);

  const { mutate: editRecipientAddressMutation, isLoading: isEditingRecipientAddress } = useEditRecipientAddressMutation(history, location.state.from, displayAlert, 'Recipient address');

  // Handle form submit
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = {
      ...editData,
      name: name.value,
      country: country.value,
      state: state.value,
      address1,
      address2: address_2.value,
      city: city.value,
      postal_code: zip.value,
      organization_uuid,
    };
    if (editPage) {
      editRecipientAddressMutation(data);
    } else {
      addRecipientAddressMutation(data);
    }
  };

  // Handle blur events for validation
  const handleBlur = (e, validation, input, parentId) => {
    const validateObj = validators(validation, input);
    const prevState = { ...formError };
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e.target.id || parentId]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [e.target.id || parentId]: {
          error: false,
          message: '',
        },
      });
    }
  };

  // Disable submit button if validation fails
  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (
      !name.value || !country.value || !state.value || _.isEqual(address1, '') || !address_2.value || !city.value || !zip.value
    ) {
      return true;
    }
    let errorExists = false;
    _.forEach(errorKeys, (key) => {
      if (formError[key].error) {
        errorExists = true;
      }
    });
    return errorExists;
  };

  // On selecting an address prediction, fetch and autofill other fields
  const handleSelectAddress = (address) => {
    const addressDesc = address.description.split(', ');
    Geocode.fromAddress(address.description)
      .then(({ results }) => {
        const { lat, lng } = results[0].geometry.location;
        Geocode.fromLatLng(lat, lng)
          .then((response) => {
            const addressComponents = response.results[0].address_components;
            const localityTypes = [
              'administrative_area_level_3',
              'locality',
              'administrative_area_level_1',
              'administrative_area_level_2',
            ];
            const locality = localityTypes.reduce((result, type) => result || addressComponents.find((component) => component.types.includes(type))?.long_name, '');
            const zipCode = addressComponents.find((component) => component.types.includes('postal_code'))?.long_name;
            let filteredAddressDesc = addressDesc.slice(0, -2);
            filteredAddressDesc = filteredAddressDesc.filter((item) => item !== locality);
            setAddress1(filteredAddressDesc.join(', '));
            city.setValue(locality);
            state.setValue(addressDesc[_.size(addressDesc) - 2]);
            country.setValue(addressDesc[_.size(addressDesc) - 1]);
            zip.setValue(zipCode);
          })
          .catch(console.error);
      })
      .catch(console.error);
  };

  return (
    <div>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title={formTitle}
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          {(isAddingRecipientAddress || isEditingRecipientAddress) && (
            <Loader open={isAddingRecipientAddress || isEditingRecipientAddress} />
          )}
          <form className="adminPanelFormContainer" noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isDesktop() ? 2 : 0}>
              {/* Recipient Name Field */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  id="recipient-name"
                  label={t('addRecipientAddress.recipientName')}
                  {...name.bind}
                  error={formError.name && formError.name.error}
                  helperText={formError.name ? formError.name.message : ''}
                  onBlur={(e) => handleBlur(e, 'required', name)}
                />
              </Grid>

              {/* Address Line 1 with autocomplete */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="address_1"
                  label={t('addRecipientAddress.addressLine1')}
                  value={address1}
                  onChange={(e) => {
                    getPlacePredictions({ input: e.target.value });
                    setAddress1(e.target.value);
                  }}
                />
              </Grid>

              {/* Address prediction dropdown */}
              <div className={!_.isEmpty(placePredictions) ? 'recipientAddressPredictions' : ''}>
                {placePredictions && _.map(placePredictions, (value, index) => (
                  <MenuItem
                    key={`recipientState${index}${value}`}
                    value={value.description}
                    onClick={() => {
                      handleSelectAddress(value);
                      getPlacePredictions({ input: '' });
                    }}
                    className="recipientAddressPredictionsItem"
                  >
                    {value.description}
                  </MenuItem>
                ))}
              </div>

              {/* Address Line 2 */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="address_2"
                  label={t('addRecipientAddress.addressLine2')}
                  {...address_2.bind}
                />
              </Grid>

              {/* Autofilled location fields */}
              <Grid item xs={12} md={6}>
                <TextField label={t('addRecipientAddress.city')} disabled fullWidth {...city.bind} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label={t('addRecipientAddress.state')} disabled fullWidth {...state.bind} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label={t('addRecipientAddress.country')} disabled fullWidth {...country.bind} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label={t('addRecipientAddress.zip')} disabled fullWidth {...zip.bind} />
              </Grid>

              {/* Form action buttons */}
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={6} sm={5.15} md={4}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className="adminPanelSubmit"
                    disabled={isAddingRecipientAddress || isEditingRecipientAddress || submitDisabled()}
                  >
                    {buttonText}
                  </Button>
                </Grid>
                <Grid item xs={6} sm={5.15} md={4}>
                  <Button
                    type="button"
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={discardFormData}
                    className="adminPanelSubmit"
                  >
                    {t('addRecipientAddress.cancel')}
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

export default AddRecipientAddress;
