import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TableCell,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon, DeleteOutline as DeleteIcon, EditOutlined as EditIcon } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import DataTableWrapper from '../../../components/DataTableWrapper/DataTableWrapper';
import Loader from '../../../components/Loader/Loader';
import { deleteShipmentTemplate, editShipmentTemplate } from '../../../redux/shipment/actions/shipment.actions';
import { getTemplateFormattedRow } from '../../../utils/constants';

const useStyles = makeStyles((theme) => ({
  modal: {
    '& .MuiPaper-root': {
      maxWidth: 'inherit',
    },
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.background.dark,
  },
  dataTable: {
    '& .MuiTableCell-paddingCheckbox': {
      display: 'none',
    },
  },
  iconButton: {
    padding: 0,
    color: theme.palette.primary.dark,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
  },
}));

const TemplatesModal = ({
  open, setOpen, loading, dispatch, templates, columns, custodianData, itemData,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const [rows, setRows] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteID, setDeleteID] = useState('');

  useEffect(() => {
    if (!_.isEmpty(templates)) {
      setRows(getTemplateFormattedRow(templates, custodianData, itemData));
    }
  }, [templates, custodianData, itemData]);

  return (
    <div>
      <Dialog
        open={open}
        onClose={(e) => {
          setExpandedRows([]);
          setOpen(false);
        }}
        aria-labelledby="templates-modal-title"
        aria-describedby="templates-modal-description"
        className={classes.modal}
      >
        {loading && <Loader open={loading} />}
        <DialogTitle id="templates-modal-title">
          Saved Templates
          <IconButton
            aria-label="templates-modal-close"
            className={classes.closeButton}
            onClick={(e) => {
              setExpandedRows([]);
              setOpen(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} className={classes.dataTable}>
              <DataTableWrapper
                hideAddButton
                noOptionsIcon
                noSpace
                loading={loading}
                rows={rows}
                columns={[
                  ...columns,
                  {
                    name: '',
                    options: {
                      filter: false,
                      sort: false,
                      empty: true,
                      customBodyRenderLite: (dataIndex) => (
                        <IconButton
                          className={classes.iconButton}
                          onClick={() => {
                            const tmp = rows[dataIndex];
                            setTemplateName(tmp.name);
                            setExpandedRows([dataIndex]);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      ),
                    },
                  },
                ]}
                extraOptions={{
                  expandableRows: true,
                  expandableRowsHeader: false,
                  rowsExpanded: expandedRows,
                  renderExpandableRow: (rowData, rowMeta) => {
                    const colSpan = rowData.length + 1;
                    const template = rows[rowMeta.rowIndex];

                    return (
                      <TableRow>
                        <TableCell colSpan={colSpan}>
                          <Grid container spacing={2}>
                            <Grid item xs={0.8}>
                              <IconButton
                                style={{ height: '72.4%' }}
                                onClick={(e) => {
                                  setDeleteID(template.id);
                                  setConfirmDelete(true);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Grid>

                            <Grid item xs={6}>
                              <TextField
                                variant="outlined"
                                id="template-modal-name"
                                fullWidth
                                label="Template Name"
                                placeholder="32 characters maximum"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                helperText={
                                  _.find(rows, { name: templateName })
                                    ? (
                                      <span style={{ color: theme.palette.error.main }}>
                                        A template already has this name.
                                        Please use a different name.
                                      </span>
                                    ) : 'There is a 32-character limit on template names'
                                }
                                inputProps={{ maxLength: 32 }}
                              />
                            </Grid>

                            <Grid item xs={2}>
                              <Button
                                fullWidth
                                type="button"
                                variant="outlined"
                                color="primary"
                                style={{ height: '72.4%' }}
                                onClick={(e) => setExpandedRows([])}
                              >
                                Cancel
                              </Button>
                            </Grid>

                            <Grid item xs={2}>
                              <Button
                                fullWidth
                                type="button"
                                variant="contained"
                                color="primary"
                                style={{ height: '72.4%' }}
                                disabled={!!_.find(rows, { name: templateName })}
                                onClick={(e) => {
                                  dispatch(editShipmentTemplate({
                                    ...template,
                                    name: templateName,
                                  }));
                                  setExpandedRows([]);
                                }}
                              >
                                Save
                              </Button>
                            </Grid>
                          </Grid>
                        </TableCell>
                      </TableRow>
                    );
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDelete}
        onClose={(e) => setConfirmDelete(false)}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        {loading && <Loader open={loading} />}
        <DialogTitle id="delete-modal-title">
          Confirm delete
        </DialogTitle>

        <DialogContent>
          <Typography variant="h6" color={theme.palette.primary.main}>
            Are you sure you want to delete this template?
          </Typography>

          <Typography>
            {_.find(rows, { id: deleteID })
              ? _.find(rows, { id: deleteID }).name
              : ''}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={(e) => {
              setDeleteID('');
              setConfirmDelete(false);
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={(e) => {
              dispatch(deleteShipmentTemplate(deleteID));
              setDeleteID('');
              setConfirmDelete(false);
              setExpandedRows([]);
            }}
          >
            Delete template
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.shipmentReducer,
  ...state.custodianReducer,
  ...state.itemsReducer,
  loading: (
    state.shipmentReducer.loading
    || state.custodianReducer.loading
    || state.itemsReducer.loading
  ),
});

export default connect(mapStateToProps)(TemplatesModal);
