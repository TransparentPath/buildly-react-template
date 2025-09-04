/*
 * AddItems Component
 * -----------------
 * This component provides a form for adding and editing items in the inventory system.
 * It handles product selection, unit calculations, and integration with the backend API.
 * The form includes automatic value/weight calculations based on product data and unit count.
 */
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import {
  Button,
  TextField,
  InputAdornment,
  Grid,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Autocomplete,
} from '@mui/material';
import Loader from '@components/Loader/Loader';
import FormModal from '@components/Modal/FormModal';
import { getUser } from '@context/User.context';
import { useInput } from '@hooks/useInput';
import { validators } from '@utils/validators';
import { isMobile, isDesktop } from '@utils/mediaQuery';
import { useAddItemMutation } from '@react-query/mutations/items/addItemMutation';
import { useEditItemMutation } from '@react-query/mutations/items/editItemMutation';
import useAlert from '@hooks/useAlert';
import { useTranslation } from 'react-i18next';
import '../ItemStyles.css';

/**
 * AddItems Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.history - Router history object for navigation
 * @param {Object} props.location - Router location object containing state data
 * @returns {JSX.Element} The rendered component
 */
const AddItems = ({
  history, location,
}) => {
  // Modal visibility states
  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);

  // Alert display hook for notifications
  const { displayAlert } = useAlert();

  const { t } = useTranslation();

  // Extract navigation data from location state
  const redirectTo = location.state && location.state.from;
  const {
    itemTypesData, // Available item types for dropdown
    productData, // Available products for selection
    productTypesData, // Product type definitions
    unitData, // Unit measurements and currency info
    translatedCurrency, // Translated currency string
  } = location.state || {};

  // Determine if this is an edit operation and extract existing data
  const editPage = location.state && location.state.type === 'edit';
  const editData = (editPage && location.state.data) || {};

  // Basic item information
  const item_name = useInput(editData.name || '', { required: true });
  const item_type = useInput(editData.item_type || '', { required: true });

  // Product-related states
  const [product, setProduct] = useState('');
  const [product_url, setProductUrl] = useState(editData.product || '');
  const [product_desc, setProductDesc] = useState('');
  const [product_type, setProductType] = useState('');
  const [product_value, setProductValue] = useState('');
  const [product_weight, setProductWeight] = useState(_.round(editData.product_weight, 2) || '');

  // Product identification numbers
  const [gtin, setGtin] = useState(editData.gtin || '');
  const [upc, setUpc] = useState(editData.upc || '');
  const [ean, setEan] = useState(editData.ean || '');
  const [paper_tag_no, setPaperTag] = useState(editData.paper_tag_number || '');
  const [batch_id, setBatchId] = useState(editData.batch_run_id || '');
  const [bin_id, setBinId] = useState(editData.bin_id || '');

  // Item quantity and calculations
  const [units, setContainerUnits] = useState(editData.number_of_units || 0);
  const [item_value, setItemValue] = useState(editData.value || 0);
  const [item_weight, setItemWeight] = useState(_.round(editData.gross_weight, 2) || 0);

  // Form validation state
  const [formError, setFormError] = useState({});

  // UI text based on mode (add/edit)
  const buttonText = editPage ? t('addItems.save') : t('addItems.addItem');
  const formTitle = editPage ? t('addItems.editItem') : t('addItems.addItem');

  // Current user's organization
  const organization = getUser().organization.organization_uuid;

  /**
   * Effect hook to handle initial data population when editing
   * Sets up product data and calculates initial values
   */
  useEffect(() => {
    if (editPage && editData && productData && productTypesData) {
      // Find the selected product from the product list
      let selectedProduct = '';
      _.forEach(productData, (obj) => {
        if (obj.url === editData.product[0]) {
          selectedProduct = obj;
        }
      });

      // If product found, initialize form with its data
      if (selectedProduct) {
        onProductChange(selectedProduct);
      }

      // Set initial quantities and calculations
      setContainerUnits(editData.number_of_units);
      setItemWeight(_.round(editData.gross_weight, 2));
      setItemValue(editData.value);
    }
  }, [editPage, editData, productData, productTypesData]);

  /**
   * Handles closing the form modal
   * Shows confirmation dialog if form data has changed
   */
  const closeFormModal = () => {
    const dataHasChanged = item_name.hasChanged()
      || item_type.hasChanged()
      || (product && product.url) !== ((editData.product && editData.product[0]) || '')
      || units !== (editData.number_of_units || 0);

    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      if (location && location.state) {
        history.push(redirectTo);
      }
    }
  };

  /**
   * Handles discarding form data and closing form
   * Called when user confirms they want to discard changes
   */
  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(redirectTo);
    }
  };

  // Hook for adding a new item
  const { mutate: addItemMutation, isLoading: isAddingItem } = useAddItemMutation(organization, history, redirectTo, displayAlert, 'Item');

  // Hook for editing an existing item
  const { mutate: editItemMutation, isLoading: isEditingItem } = useEditItemMutation(organization, history, redirectTo, displayAlert, 'Item');

  /**
   * Handles form submission
   * Prepares and validates data before sending to the API
   *
   * @param {Event} event - Form submission event
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    // Prepare form data for submission
    const itemFormValue = {
      item_type: item_type.value,
      name: item_name.value,
      value: item_value,
      gross_weight: _.round(_.toNumber(item_weight), 2),
      number_of_units: units,
      ean,
      upc,
      gtin,
      bin_id,
      batch_run_id: batch_id,
      paper_tag_number: paper_tag_no,
      product_weight: _.round(_.toNumber(product_weight), 2),
      product_value,
      product: [product_url],
      ...(editPage && editData && { id: editData.id }),
      organization_uuid: organization,
    };

    // Call appropriate mutation based on mode
    if (editPage) {
      editItemMutation(itemFormValue);
    } else {
      addItemMutation(itemFormValue);
    }
  };

  /**
   * Handles field validation on blur
   * Updates form error state based on validation results
   *
   * @param {Event} e - Blur event
   * @param {string} validation - Type of validation to perform
   * @param {Object} input - Input field state object
   * @param {string} parentId - Parent element ID (for select fields)
   */
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

  /**
   * Determines if the submit button should be disabled
   * Based on required field completion and validation errors
   *
   * @returns {boolean} True if submit should be disabled
   */
  const submitDisabled = () => {
    // Check required fields
    if (!item_type.value || !item_name.value || !product || !units) {
      return true;
    }

    // Check for validation errors
    const errorKeys = Object.keys(formError);
    let errorExists = false;
    _.forEach(errorKeys, (key) => {
      if (formError[key].error) {
        errorExists = true;
      }
    });
    return errorExists;
  };

  /**
   * Handles product selection and updates related fields
   *
   * @param {Object} value - Selected product object
   */
  const onProductChange = (value) => {
    if (value) {
      // Update product information
      setProduct(value);
      setProductUrl(value.url);
      setProductDesc(value.description);
      setProductValue(value.value);
      setProductWeight(_.round(value.gross_weight, 2));

      // Update identification numbers
      setGtin(value.gtin);
      setUpc(value.upc);
      setEan(value.ean);
      setPaperTag(value.paper_tag_number);
      setBatchId(value.batch_run_id);
      setBinId(value.bin_id);

      // Set initial quantities
      setContainerUnits(1);
      setItemValue(value.value);
      setItemWeight(_.round(value.gross_weight, 2));

      // Update product type if available
      if (productTypesData && productTypesData.length) {
        _.forEach(productTypesData, (type) => {
          if (type.url === value.product_type) {
            setProductType(type.name);
          }
        });
      }
    }
  };

  /**
   * Handles changes to the number of units
   * Recalculates item value and weight based on unit count
   *
   * @param {Event} e - Change event
   */
  const onNumberOfUnitsChange = (e) => {
    const previousValue = product_value;
    const previousWeight = _.round(_.toNumber(product_weight), 2);
    setContainerUnits(e.target.value);
    setItemValue(_.round(_.toNumber(e.target.value * previousValue), 2));
    setItemWeight(_.round(_.toNumber(e.target.value * previousWeight), 2));
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
          {/* Loading indicator while API requests are in progress */}
          {(isAddingItem || isEditingItem) && (
            <Loader open={isAddingItem || isEditingItem} />
          )}

          {/* Main form */}
          <form className="itemFormContainer" noValidate onSubmit={handleSubmit}>
            {/* Basic item information section */}
            <Grid container spacing={isDesktop() ? 2 : 0}>
              <Grid className="itemInputWithTooltip" item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="item_name"
                  label={t('addItems.itemName')}
                  name="item_name"
                  autoComplete="item_name"
                  error={formError.item_name && formError.item_name.error}
                  helperText={
                    formError.item_name ? formError.item_name.message : ''
                  }
                  onBlur={(e) => handleBlur(e, 'required', item_name)}
                  {...item_name.bind}
                />
              </Grid>
              <Grid className="itemInputWithTooltip" item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  id="item_type"
                  select
                  label={t('addItems.itemType')}
                  error={formError.item_type && formError.item_type.error}
                  helperText={
                    formError.item_type ? formError.item_type.message : ''
                  }
                  onBlur={(e) => handleBlur(e, 'required', item_type, 'item_type')}
                  {...item_type.bind}
                >
                  <MenuItem value="">{t('common.select')}</MenuItem>
                  {itemTypesData && _.map(_.orderBy(itemTypesData, ['name'], ['asc']), (item, index) => (
                    <MenuItem
                      key={`itemType${index}:${item.id}`}
                      value={item.url}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Product information card */}
            <Card variant="outlined" className="itemCardItems">
              <CardContent>
                <Typography variant="h6" gutterBottom mt={1} mb={isMobile() ? 0 : 1.65}>
                  {t('addItems.productInfo')}
                </Typography>
                <Grid container spacing={isDesktop() ? 2 : 0}>
                  {/* Product selection autocomplete */}
                  <Grid item xs={12}>
                    <div className="itemInputWithTooltip">
                      <Autocomplete
                        id="products"
                        options={productData || []}
                        value={product}
                        onChange={(event, newValue) => onProductChange(newValue)}
                        style={{ flex: 1 }}
                        getOptionLabel={(option) => option && option.name}
                        isOptionEqualToValue={(option, value) => !value || (value && option.name === value.name)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required
                            label={t('addItems.product')}
                            variant="outlined"
                            margin="normal"
                            fullWidth
                          />
                        )}
                      />
                    </div>
                  </Grid>

                  {/* Product description */}
                  <Grid className="itemInputWithTooltip" item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      disabled
                      multiline
                      rows={4}
                      id="product_desc"
                      label={t('addItems.productDescription')}
                      name="product_desc"
                      autoComplete="product_desc"
                      value={product_desc}
                    />
                  </Grid>

                  {/* Product type and value */}
                  <Grid
                    className="itemInputWithTooltip"
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      disabled
                      id="product_type"
                      label={t('addItems.productType')}
                      value={product_type}
                    />
                  </Grid>
                  <Grid
                    className="itemInputWithTooltip"
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      disabled
                      type="number"
                      id="product_value"
                      label={t('addItems.productValue')}
                      value={product_value}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {translatedCurrency}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Product weight */}
                  <Grid
                    className="itemInputWithTooltip"
                    item
                    xs={12}
                  >
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      disabled
                      type="number"
                      id="product_weight"
                      label={t('addItems.productWeight')}
                      value={product_weight}
                    />
                  </Grid>
                </Grid>

                {/* Product identification numbers */}
                <Grid container spacing={isDesktop() ? 2 : 0} mt={0.1} pb={1}>
                  <Grid
                    className="itemInputWithTooltip"
                    item
                    xs={12}
                    md={6}
                    sm={6}
                  >
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      disabled
                      id="gtin"
                      label={t('addItems.gtin')}
                      name="gtin"
                      autoComplete="gtin"
                      value={gtin}
                    />
                  </Grid>
                  <Grid
                    className="itemInputWithTooltip"
                    item
                    xs={12}
                    md={6}
                    sm={6}
                  >
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      disabled
                      id="upc"
                      label={t('addItems.upc')}
                      name="upc"
                      autoComplete="upc"
                      value={upc}
                    />
                  </Grid>
                  <Grid
                    className="itemInputWithTooltip"
                    item
                    xs={12}
                    md={6}
                    sm={6}
                  >
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      disabled
                      id="ean"
                      label={t('addItems.ean')}
                      name="ean"
                      autoComplete="ean"
                      value={ean}
                    />
                  </Grid>
                  <Grid
                    className="itemInputWithTooltip"
                    item
                    xs={12}
                    md={6}
                    sm={6}
                  >
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      disabled
                      id="paper_tag_no"
                      label={t('addItems.paperTagNumber')}
                      name="paper_tag_no"
                      autoComplete="paper_tag_no"
                      value={paper_tag_no}
                    />
                  </Grid>
                  <Grid
                    className="itemInputWithTooltip"
                    item
                    xs={12}
                    md={6}
                    sm={6}
                  >
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      disabled
                      id="batch_id"
                      label={t('addItems.batchRunId')}
                      name="batch_id"
                      autoComplete="batch_id"
                      value={batch_id}
                    />
                  </Grid>
                  <Grid
                    className="itemInputWithTooltip"
                    item
                    xs={12}
                    md={6}
                    sm={6}
                  >
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      disabled
                      id="bin_id"
                      label={t('addItems.binId')}
                      name="bin_id"
                      autoComplete="bin_id"
                      value={bin_id}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Item calculations section */}
            <Grid container spacing={isDesktop() ? 2 : 0}>
              <Grid
                className="itemInputWithTooltip"
                item
                xs={12}
                md={6}
                sm={6}
              >
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  id="units"
                  type="number"
                  label={t('addItems.numberOfUnits')}
                  value={units}
                  onChange={(e) => onNumberOfUnitsChange(e)}
                />
              </Grid>
              <Grid
                className="itemInputWithTooltip"
                item
                xs={12}
                md={6}
                sm={6}
              >
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  disabled
                  type="number"
                  id="item_value"
                  label={t('addItems.itemValue')}
                  value={item_value}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {translatedCurrency}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid className="itemInputWithTooltip" item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  disabled
                  type="number"
                  id="item_weight"
                  label={t('addItems.itemWeight')}
                  value={item_weight}
                />
              </Grid>
            </Grid>

            {/* Form action buttons */}
            <Grid container spacing={2} justifyContent="center">
              {/* Submit button */}
              <Grid item xs={12} sm={4}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className="itemSubmit"
                  disabled={isAddingItem || isEditingItem || submitDisabled()}
                >
                  {buttonText}
                </Button>
              </Grid>

              {/* Cancel button */}
              <Grid item xs={12} sm={4} className="itemSubmit2">
                <Button
                  type="button"
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={discardFormData}
                  className="itemSubmit"
                >
                  {t('addItems.cancel')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default AddItems;
