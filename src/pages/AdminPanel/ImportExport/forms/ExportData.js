import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  Grid,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import Loader from '@components/Loader/Loader';
import { isDesktop2 } from '@utils/mediaQuery';
import { useQuery, useQueryClient } from 'react-query';
import { getExportDataQuery } from '@react-query/queries/importExport/getExportDataQuery';
import useAlert from '@hooks/useAlert';
import '../../AdminPanelStyles.css';

const ExportData = () => {
  const [exportTable, setExportTable] = useState('');
  const [exportType, setExportType] = useState('');
  const [ready, setReady] = useState(false);

  const { displayAlert } = useAlert();
  const queryClient = useQueryClient();

  const { data: exportData, isLoading: isLoadingExportData } = useQuery(
    ['exportData'],
    () => getExportDataQuery(exportTable, exportType, displayAlert),
    {
      enabled: ready,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    setReady(false);
  }, []);

  useEffect(() => {
    if (exportData && ready) {
      const fileName = `${_.startCase(exportTable)} ${new Date().toLocaleDateString()}.${exportType}` || `export.${exportType}`;
      const blob = new Blob([exportData], { type: 'text/csv;charset=utf-8;' });
      if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, fileName);
      } else {
        const link = document.createElement('a');
        if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', fileName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      setReady(false);
      queryClient.invalidateQueries({
        queryKey: ['exportData'],
      });
    }
  }, [exportData, ready]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setReady(true);
  };

  return (
    <div>
      {isLoadingExportData && <Loader open={isLoadingExportData} />}
      <form
        className="adminPanelFormRoot"
        noValidate
        onSubmit={handleSubmit}
      >
        <Grid container spacing={isDesktop2() ? 2 : 0}>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              required
              id="exportTable"
              label="Data to export"
              select
              value={exportTable}
              onChange={(e) => setExportTable(e.target.value)}
            >
              <MenuItem value="">--------</MenuItem>
              <MenuItem value="item">Items</MenuItem>
              <MenuItem value="product">Products</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              required
              id="exportType"
              label="Export As"
              select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
            >
              <MenuItem value="">--------</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </TextField>
          </Grid>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={7} sm={6} md={4}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className="adminPanelSubmit"
                disabled={isLoadingExportData || !exportTable || !exportType}
              >
                Export
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default ExportData;
