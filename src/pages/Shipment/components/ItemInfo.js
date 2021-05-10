import React, { useState, useContext } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  makeStyles,
  TextField,
  Box,
  Checkbox,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckBox as CheckBoxIcon,
} from '@material-ui/icons';
import DataTable from '@components/Table/Table';
import { UserContext } from '@context/User.context';
import { getFormattedRow } from '@pages/Items/ItemsConstants';
import { editShipment } from '@redux/shipment/actions/shipment.actions';
import { routes } from '@routes/routesConstants';
import { itemColumns } from '../ShipmentConstants';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > * + *': {
      marginTop: theme.spacing(3),
    },
  },
  buttonContainer: {
    margin: theme.spacing(8, 0),
    textAlign: 'center',
    justifyContent: 'center',
  },
  alignRight: {
    marginLeft: 'auto',
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
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      width: '70%',
      margin: 'auto',
    },
  },
  submit: {
    borderRadius: '18px',
    fontSize: 11,
  },
}));

// eslint-disable-next-line import/no-mutable-exports
export let checkIfItemInfoEdited;

const ItemsInfo = ({
  itemData,
  itemTypeList,
  history,
  loading,
  handleNext,
  handleCancel,
  shipmentFormData,
  dispatch,
  unitsOfMeasure,
  viewOnly,
  setConfirmModal,
  setConfirmModalFor,
}) => {
  const classes = useStyles();
  const [itemIds, setItemIds] = useState(
    (shipmentFormData && shipmentFormData.items) || [],
  );
  const organization = useContext(UserContext).organization.organization_uuid;

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
  let rows = [];
  const columns = itemColumns;
  if (itemData && itemData.length) {
    const selectedRows = [];
    itemData.forEach((element) => {
      if (itemIds.indexOf(element.url) !== -1) {
        selectedRows.push(element);
      }
    });
    rows = getFormattedRow(selectedRows, itemTypeList, unitsOfMeasure);
  }

  const onInputChange = (value) => {
    const itemIdArray = [];
    value.forEach((val) => {
      itemIdArray.push(val.url);
    });
    setItemIds(itemIdArray);
  };

  const submitDisabled = () => itemIds.length === 0 || itemData === null;

  checkIfItemInfoEdited = () => Boolean(itemIds.length !== shipmentFormData.items.length);
  /**
   * Submit The form and add/edit custodian
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const shipmentFormValue = {
      ...{ ...shipmentFormData, items: itemIds },
    };
    dispatch(
      editShipment(
        shipmentFormValue,
        history,
        `${routes.SHIPMENT}/edit/:${shipmentFormData.id}`,
        organization,
      ),
    );
  };

  const onNextClick = (event) => {
    if (checkIfItemInfoEdited()) {
      // setConfirmModalFor('next');
      // setConfirmModal(true);
      handleSubmit(event);
    }
    handleNext();
  };

  const onCancelClick = () => {
    if (checkIfItemInfoEdited()) {
      setConfirmModalFor('close');
      setConfirmModal(true);
    } else {
      handleCancel();
    }
  };

  return (
    <Box mb={5} mt={3}>
      <form noValidate onSubmit={handleSubmit}>
        <Card variant="outlined" className={classes.form}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  id="tags-outlined"
                  disabled={viewOnly}
                  options={
                    (itemData && _.orderBy(itemData, ['name'], ['asc'])) || []
                  }
                  getOptionLabel={(option) => option && option.name}
                  filterSelectedOptions
                  onChange={(event, newValue) => onInputChange(newValue)}
                  defaultValue={rows}
                  renderOption={(option, { selected }) => (
                    <>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.name}
                    </>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      disabled={viewOnly}
                      variant="outlined"
                      label="Select items to be associated"
                      placeholder="Select an item"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Box mt={3} mb={5}>
          <Grid container>
            {rows.length > 0 && (
              <Grid item xs={12}>
                <Box mt={5}>
                  <Typography gutterBottom variant="h5">
                    Associated Items
                  </Typography>
                  <DataTable
                    rows={rows || []}
                    columns={columns}
                    hasSearch={false}
                    showTotal
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
        <Grid container spacing={3} className={classes.buttonContainer}>
          <Grid item xs={6} sm={2}>
            {viewOnly ? (
              <Button
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={onCancelClick}
              >
                Done
              </Button>
            ) : (
                <div className={classes.loadingWrapper}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    disabled={loading || submitDisabled()}
                  >
                    Save
                </Button>
                  {loading && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </div>
              )}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={onNextClick}
              className={classes.submit}
            >
              Next: Custodians
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.itemsReducer,
  ...state.shipmentReducer,
});

export default connect(mapStateToProps)(ItemsInfo);
