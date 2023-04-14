import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  useTheme,
  Button,
  TextField,
  CircularProgress,
  InputAdornment,
  Grid,
  MenuItem,
  useMediaQuery,
  Card,
  CardContent,
  Typography,
  Autocomplete,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import FormModal from '../../../components/Modal/FormModal';
import CustomizedTooltips from '../../../components/ToolTip/ToolTip';
import { UserContext } from '../../../context/User.context';
import { useInput } from '../../../hooks/useInput';
import { editItem, addItem } from '../../../redux/items/actions/items.actions';
import { validators } from '../../../utils/validators';

const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      width: '70%',
      margin: 'auto',
    },
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    borderRadius: '18px',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  loadingWrapper: {
    position: 'relative',
  },
  cardItems: {
    margin: theme.spacing(4, 0),
  },
  formTitle: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
  },
  inputWithTooltip: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const AddItems = ({
  dispatch,
  loading,
  history,
  location,
  itemTypeList,
  products,
  productType,
  productOptions,
  itemOptions,
}) => {
  const classes = useStyles();
  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);

  const redirectTo = location.state && location.state.from;
  const editPage = location.state && location.state.type === 'edit';
  const editData = (
    location.state
    && location.state.type === 'edit'
    && location.state.data
  ) || {};

  const item_name = useInput(editData.name || '', {
    required: true,
  });
  const [item_value, setItemValue] = useState(editData.value || 0);
  const [item_weight, setItemWeight] = useState(
    editData.gross_weight || 0,
  );
  const [units, setContainerUnits] = useState(
    editData.number_of_units || 0,
  );
  const item_type = useInput(editData.item_type || '', {
    required: true,
  });
  const [gtin, setGtin] = useState(editData.gtin || '');
  const [ean, setEan] = useState(editData.ean || '');
  const [upc, setUpc] = useState(editData.upc || '');
  const [paper_tag_no, setPaperTag] = useState(
    editData.paper_tag_number || '',
  );
  const [batch_id, setBatchId] = useState(editData.batch_run_id || '');
  const [bin_id, setBinId] = useState(editData.bin_id || '');
  const [product, setProduct] = useState('');
  const [product_url, setProductUrl] = useState(
    editData.product || '',
  );
  const [product_type, setProductType] = useState('');
  const [product_value, setProductValue] = useState('');
  const [product_desc, setProductDesc] = useState('');
  const [product_weight, setProductWeight] = useState(
    editData.product_weight || '',
  );

  const [formError, setFormError] = useState({});

  const buttonText = editPage ? 'Save' : 'Add Item';
  const formTitle = editPage ? 'Edit Item' : 'Add Item';

  const [itemMetData, setItemMetaData] = useState({});
  const [productMetData, productMetaData] = useState({});
  const organization = useContext(UserContext).organization.organization_uuid;
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  useEffect(() => {
    if (itemOptions && itemOptions.actions) {
      setItemMetaData(itemOptions.actions.POST);
    }
    if (productOptions && productOptions.actions) {
      productMetaData(productOptions.actions);
    }
  }, [productOptions, itemOptions]);

  useEffect(() => {
    if (
      editPage
      && editData
      && products
      && productType
    ) {
      let selectedProduct = '';
      _.forEach(products, (obj) => {
        if (obj.url === editData.product[0]) {
          selectedProduct = obj;
        }
      });
      if (selectedProduct) {
        onProductChange(selectedProduct);
      }
      setContainerUnits(editData.number_of_units);
      setItemWeight(editData.gross_weight);
      setItemValue(editData.value);
    }
  }, [editPage, editData, products, productType]);

  const closeFormModal = () => {
    const dataHasChanged = (
      item_name.hasChanged()
      || item_type.hasChanged()
      || ((product && product.url) !== (
        (editData.product && editData.product[0]) || ''))
      || (units !== (editData.number_of_units || 0))
    );

    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      if (location && location.state) {
        history.push(redirectTo);
      }
    }
  };

  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(redirectTo);
    }
  };

  /**
   * Submit The form and add/edit custodian
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const itemFormValue = {
      item_type: item_type.value,
      name: item_name.value,
      value: item_value,
      gross_weight: item_weight,
      number_of_units: units,
      ean,
      upc,
      gtin,
      bin_id,
      batch_run_id: batch_id,
      paper_tag_number: paper_tag_no,
      product_weight,
      product_value,
      product: [product_url],
      ...(editPage && editData && { id: editData.id }),
      organization_uuid: organization,
    };
    if (editPage) {
      dispatch(editItem(itemFormValue, history, redirectTo));
    } else {
      dispatch(addItem(itemFormValue, history, redirectTo));
    }
  };

  /**
   * Handle input field blur event
   * @param {Event} e Event
   * @param {String} validation validation type if any
   * @param {Object} input input field
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

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (
      !item_type.value
      || !item_name.value
      || !product
      || !units
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

  const onProductChange = (value) => {
    setProduct(value);
    setProductUrl(value.url);
    setProductDesc(value.description);
    setProductValue(value.value);
    setBinId(value.bin_id);
    setBatchId(value.batch_run_id);
    setEan(value.ean);
    setUpc(value.upc);
    setGtin(value.gtin);
    setPaperTag(value.paper_tag_number);
    setProductWeight(value.gross_weight);
    setContainerUnits(1);
    setItemWeight(value.gross_weight);
    setItemValue(value.value);
    if (productType && productType.length) {
      _.forEach(productType, (type) => {
        if (type.url === value.product_type) {
          setProductType(type.name);
        }
      });
    }
  };

  const onNumberOfUnitsChange = (e) => {
    const previousValue = product_value;
    const previousWeight = product_weight;
    setContainerUnits(e.target.value);
    setItemValue(Number(e.target.value * previousValue).toFixed(2));
    setItemWeight(Number(e.target.value * previousWeight).toFixed(2));
  };

  return (
    <div>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title={formTitle}
          titleClass={classes.formTitle}
          maxWidth="md"
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          <form
            className={classes.form}
            noValidate
            onSubmit={handleSubmit}
          >
            <Grid container spacing={isDesktop ? 2 : 0}>
              <Grid className={classes.inputWithTooltip} item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="item_name"
                  label="Item Name"
                  name="item_name"
                  autoComplete="item_name"
                  error={
                    formError.item_name
                    && formError.item_name.error
                  }
                  helperText={
                    formError.item_name
                      ? formError.item_name.message
                      : ''
                  }
                  onBlur={(e) => handleBlur(e, 'required', item_name)}
                  {...item_name.bind}
                />
                {itemMetData.name
                && itemMetData.name.help_text
                && (
                  <CustomizedTooltips
                    toolTipText={
                      itemMetData.name.help_text
                    }
                  />
                )}
              </Grid>
              <Grid className={classes.inputWithTooltip} item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  id="item_type"
                  select
                  label="Item Type"
                  error={
                    formError.item_type
                    && formError.item_type.error
                  }
                  helperText={
                    formError.item_type
                      ? formError.item_type.message
                      : ''
                  }
                  onBlur={(e) => handleBlur(e, 'required', item_type, 'item_type')}
                  {...item_type.bind}
                >
                  <MenuItem value="">Select</MenuItem>
                  {itemTypeList
                    && _.map(
                      _.orderBy(itemTypeList, ['name'], ['asc']),
                      (item, index) => (
                        <MenuItem
                          key={`itemType${index}:${item.id}`}
                          value={item.url}
                        >
                          {item.name}
                        </MenuItem>
                      ),
                    )}
                </TextField>
                {itemMetData.item_type
                && itemMetData.item_type.help_text
                && (
                  <CustomizedTooltips
                    toolTipText={
                      itemMetData.item_type.help_text
                    }
                  />
                )}
              </Grid>
            </Grid>
            <Card
              variant="outlined"
              className={classes.cardItems}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Info
                </Typography>
                <Grid container spacing={isDesktop ? 2 : 0}>
                  <Grid item xs={12}>
                    <div className={classes.inputWithTooltip}>
                      <Autocomplete
                        id="products"
                        options={products || []}
                        value={product}
                        onChange={(event, newValue) => onProductChange(newValue)}
                        style={{ flex: 1 }}
                        getOptionLabel={(option) => option && option.name}
                        isOptionEqualToValue={(option, value) => option.name === value.name}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required
                            label="Product"
                            variant="outlined"
                            margin="normal"
                            fullWidth
                          />
                        )}
                      />
                      {productMetData.name
                        && productMetData.name.help_text
                        && (
                          <CustomizedTooltips
                            toolTipText={
                              productMetData.name.help_text
                            }
                          />
                        )}
                    </div>
                  </Grid>

                  <Grid
                    className={classes.inputWithTooltip}
                    item
                    xs={12}
                  >
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      disabled
                      multiline
                      rows={4}
                      id="product_desc"
                      label="Product Description"
                      name="product_desc"
                      autoComplete="product_desc"
                      value={product_desc}
                    />
                    {productMetData.description
                    && productMetData.description.help_text
                    && (
                      <CustomizedTooltips
                        toolTipText={
                          productMetData.description.help_text
                        }
                      />
                    )}
                  </Grid>
                  <Grid
                    className={classes.inputWithTooltip}
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
                      label="Product Type"
                      value={product_type}
                    />
                    {productMetData.product_type
                    && productMetData.product_type.help_text
                    && (
                      <CustomizedTooltips
                        toolTipText={
                          productMetData.product_type.help_text
                        }
                      />
                    )}
                  </Grid>
                  <Grid
                    className={classes.inputWithTooltip}
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
                      label="Product Value"
                      value={product_value}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            $
                          </InputAdornment>
                        ),
                      }}
                    />
                    {productMetData.value
                    && productMetData.value.help_text
                    && (
                      <CustomizedTooltips
                        toolTipText={
                          productMetData.value.help_text
                        }
                      />
                    )}
                  </Grid>
                  <Grid
                    className={classes.inputWithTooltip}
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
                      label="Product Weight"
                      value={product_weight}
                    />
                    {productMetData.gross_weight
                    && productMetData.gross_weight.help_text
                    && (
                      <CustomizedTooltips
                        toolTipText={
                          productMetData.gross_weight.help_text
                        }
                      />
                    )}
                  </Grid>
                </Grid>
                <Grid container spacing={isDesktop ? 2 : 0}>
                  <Grid
                    className={classes.inputWithTooltip}
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
                      label="GTIN"
                      name="gtin"
                      autoComplete="gtin"
                      value={gtin}
                    />
                    {productMetData.gtin
                    && productMetData.gtin.help_text
                    && (
                      <CustomizedTooltips
                        toolTipText={
                          productMetData.gtin.help_text
                        }
                      />
                    )}
                  </Grid>
                  <Grid
                    className={classes.inputWithTooltip}
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
                      label="UPC"
                      name="upc"
                      autoComplete="upc"
                      value={upc}
                    />
                    {productMetData.upc
                    && productMetData.upc.help_text
                    && (
                      <CustomizedTooltips
                        toolTipText={
                          productMetData.upc.help_text
                        }
                      />
                    )}
                  </Grid>
                  <Grid
                    className={classes.inputWithTooltip}
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
                      label="EAN"
                      name="ean"
                      autoComplete="ean"
                      value={ean}
                    />
                    {productMetData.ean
                    && productMetData.ean.help_text
                    && (
                      <CustomizedTooltips
                        toolTipText={
                          productMetData.ean.help_text
                        }
                      />
                    )}
                  </Grid>
                  <Grid
                    className={classes.inputWithTooltip}
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
                      label="Paper Tag Number"
                      name="paper_tag_no"
                      autoComplete="paper_tag_no"
                      value={paper_tag_no}
                    />
                    {productMetData.paper_tag_number
                    && productMetData.paper_tag_number.help_text
                    && (
                      <CustomizedTooltips
                        toolTipText={
                          productMetData.paper_tag_number.help_text
                        }
                      />
                    )}
                  </Grid>
                  <Grid
                    className={classes.inputWithTooltip}
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
                      label="Batch/Run ID"
                      name="batch_id"
                      autoComplete="batch_id"
                      value={batch_id}
                    />
                    {productMetData.batch_run_id
                    && productMetData.batch_run_id.help_text
                    && (
                      <CustomizedTooltips
                        toolTipText={
                          productMetData.batch_run_id.help_text
                        }
                      />
                    )}
                  </Grid>
                  <Grid
                    className={classes.inputWithTooltip}
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
                      label="BIN ID"
                      name="bin_id"
                      autoComplete="bin_id"
                      value={bin_id}
                    />
                    {productMetData.bin_id
                    && productMetData.bin_id.help_text
                    && (
                      <CustomizedTooltips
                        toolTipText={
                          productMetData.bin_id.help_text
                        }
                      />
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Grid container spacing={isDesktop ? 2 : 0}>
              <Grid
                className={classes.inputWithTooltip}
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
                  label="# of Units"
                  value={units}
                  onChange={(e) => onNumberOfUnitsChange(e)}
                />
                {itemMetData.number_of_units
                && itemMetData.number_of_units.help_text
                && (
                  <CustomizedTooltips
                    toolTipText={
                      itemMetData.number_of_units.help_text
                    }
                  />
                )}
              </Grid>

              <Grid
                className={classes.inputWithTooltip}
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
                  label="Item Value"
                  value={item_value}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        $
                      </InputAdornment>
                    ),
                  }}
                />
                {itemMetData.value
                && itemMetData.value.help_text
                && (
                  <CustomizedTooltips
                    toolTipText={
                      itemMetData.value.help_text
                    }
                  />
                )}
              </Grid>
              <Grid
                className={classes.inputWithTooltip}
                item
                xs={12}
              >
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  disabled
                  type="number"
                  id="item_weight"
                  label="Item Weight"
                  value={item_weight}
                />
                {itemMetData.gross_weight
                && itemMetData.gross_weight.help_text
                && (
                  <CustomizedTooltips
                    toolTipText={
                      itemMetData.gross_weight.help_text
                    }
                  />
                )}
              </Grid>
            </Grid>

            <Grid
              container
              spacing={isDesktop ? 3 : 0}
              justifyContent="center"
            >
              <Grid item xs={12} sm={4}>
                <div className={classes.loadingWrapper}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    disabled={loading || submitDisabled()}
                  >
                    {buttonText}
                  </Button>
                  {loading && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </div>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={discardFormData}
                  className={classes.submit}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormModal>
      )}
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.itemsReducer,
  ...state.optionsReducer,
  loading: (
    state.itemsReducer.loading
    || state.optionsReducer.loading
  ),
});

export default connect(mapStateToProps)(AddItems);
