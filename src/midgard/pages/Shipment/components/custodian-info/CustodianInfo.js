/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import moment from "moment";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import {
  Box,
  Checkbox,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
} from "@material-ui/core";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import DataTable from "../../../../components/Table/Table";
import { editShipment } from "../../../../redux/shipment/actions/shipment.actions";
import { routes } from "../../../../routes/routesConstants";
import DatePickerComponent from "../../../../components/DatePicker/DatePicker";
import Modal from "../../../../components/Modal/Modal";
import AddCustodyForm from "./AddCustodyForm";
import {
  getFormattedCustodianRow,
  custodianColumns,
  getFormattedCustodyRows,
  custodyColumns,
} from "../../ShipmentConstants";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > * + *": {
      marginTop: theme.spacing(3),
    },
  },
  buttonContainer: {
    margin: theme.spacing(8, 0),
    textAlign: "center",
    justifyContent: "center",
  },
  alignRight: {
    marginLeft: "auto",
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  loadingWrapper: {
    // margin: theme.spacing(1),
    position: "relative",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      width: "70%",
      margin: "auto",
    },
  },
  submit: {
    borderRadius: "18px",
    fontSize: 11,
  },
  formTitle: {
    fontWeight: "bold",
    marginTop: "1em",
    textAlign: "center",
  },
}));

function CustodianInfo(props) {
  const {
    custodianData,
    history,
    redirectTo,
    loading,
    handleNext,
    shipmentFormData,
    dispatch,
    contactInfo,
    custodyData,
  } = props;
  const [itemIds, setItemIds] = useState(
    (shipmentFormData && shipmentFormData.custodian_ids) || []
  );

  const classes = useStyles();

  const [openModal, setOpenModal] = useState(false);
  const [rows, setRows] = useState([]);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    if (
      custodyData &&
      custodyData.length &&
      custodianData &&
      custodianData.length &&
      shipmentFormData
    ) {
      let filteredCustodyData = custodyData.filter((data) => {
        return data.shipment_id === shipmentFormData.shipment_uuid;
      });
      let customizedRows = getFormattedCustodyRows(
        filteredCustodyData,
        custodianData
      );
      setRows(customizedRows);
    }
  }, [custodyData, custodianData, shipmentFormData]);

  const submitDisabled = () => {
    if (!itemIds || custodianData === null) return true;
  };

  /**
   * Submit The form and add/edit custodian
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const shipmentFormValue = {
      ...{ ...shipmentFormData, custodian_ids: itemIds },
    };
    dispatch(
      editShipment(
        shipmentFormValue,
        history,
        `${routes.SHIPMENT}/edit/:${shipmentFormData.id}`
      )
    );
    setOpenModal(false);
  };

  const deletItem = (item) => {
    let index = itemIds.indexOf(item.custodian_uuid);
    let newArr = itemIds.filter((item, idx) => idx !== index);
    const shipmentFormValue = {
      ...{ ...shipmentFormData, custodian_ids: newArr },
    };
    dispatch(
      editShipment(
        shipmentFormValue,
        history,
        `${routes.SHIPMENT}/edit/:${shipmentFormData.id}`
      )
    );
    setItemIds(newArr);
  };

  const oncloseModal = () => {
    setEditItem(null);
    setOpenModal(false);
  };

  const editCustody = (item) => {
    setEditItem(item);
    setOpenModal(true);
  };

  const actionsColumns = [
    // { id: "unlink", type: "unlink", action: deletItem, label: "Unassociate" },
    {
      id: "edit",
      type: "edit",
      action: editCustody,
      label: "Edit",
    },
  ];

  return (
    <Box mb={5} mt={3}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenModal(true)}
        className={classes.submit}
      >
        {`Add Custody`}
      </Button>
      <Box mt={3} mb={5}>
        <Grid container>
          {rows.length > 0 && (
            <Grid item xs={12}>
              <Box mt={5}>
                <Typography gutterBottom variant="h5">
                  Associated Custodians
                </Typography>
                <DataTable
                  rows={rows || []}
                  columns={custodyColumns}
                  actionsColumns={actionsColumns}
                  hasSearch={false}
                />
              </Box>
            </Grid>
          )}
        </Grid>
        {openModal && (
          <Modal
            open={openModal}
            setOpen={() => oncloseModal()}
            title={editItem ? "Edit Custody" : "Add Custody"}
            titleClass={classes.formTitle}
            maxWidth={"md"}
          >
            <AddCustodyForm
              setItemIds={setItemIds}
              itemIds={itemIds}
              setOpenModal={() => oncloseModal()}
              rows={rows}
              editItem={editItem}
              {...props}
            />
          </Modal>
        )}
      </Box>
      <Grid container spacing={3} className={classes.buttonContainer}>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleNext}
            className={classes.submit}
          >
            {`Next: Add Sensors & Gateways`}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.custodianReducer,
  ...state.shipmentReducer,
});

export default connect(mapStateToProps)(CustodianInfo);