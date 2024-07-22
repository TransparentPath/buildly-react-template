/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';
import _, { isArray } from 'lodash';
import moment from 'moment-timezone';
import {
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { CloudDownload as DownloadIcon } from '@mui/icons-material';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { SENSOR_REPORT_COLUMNS } from '@utils/constants';
import '../ReportingStyles.css';
import { getTimezone } from '@utils/utilMethods';
import ExcelJS from 'exceljs';

const SensorReport = ({
  sensorReport,
  shipmentName,
  selectedShipment,
  selectedMarker,
  unitOfMeasure,
  timezone,
}) => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const theme = useTheme();

  useEffect(() => {
    const sortedData = _.orderBy(
      sensorReport,
      (item) => moment(item.timestamp),
      ['desc'],
    );
    setRows(sortedData);
  }, [sensorReport]);

  useEffect(() => {
    if (selectedMarker) {
      const highlightIndex = _.findIndex(rows, {
        lat: selectedMarker.lat, lng: selectedMarker.lng,
      });
      setSelected([highlightIndex]);
    } else {
      setSelected([]);
    }
  }, [selectedMarker]);

  const customSort = (data, colIndex, order, meta) => {
    if (colIndex === 1) {
      return _.orderBy(
        data,
        (item) => moment(item.data[colIndex]),
        [order],
      );
    }
    return data.sort((a, b) => (a.data[colIndex].length < b.data[colIndex].length
      ? -1
      : 1
    ) * (order === 'desc' ? 1 : -1));
  };

  const downloadCSV = (columns, data) => {
    const escapeCSV = (text) => `"${text}"`;
    const csvHeader = columns.map((col) => {
      if (col.label === 'Date Time') {
        return escapeCSV(`${col.label} (${getTimezone(new Date(), timezone)})`);
      }
      return escapeCSV(col.label);
    }).join(',');
    const csvBody = data.map((row) => columns.map((col, colIndex) => {
      let cell = row[col.name];
      if (!row.location || row.location === 'Error retrieving address') {
        row.location = 'N/A';
      }
      if (_.isEqual(cell, null) || _.isEqual(cell, undefined)) {
        cell = '';
      }
      if (Array.isArray(cell) && cell[0] && cell[0].title) {
        const titles = cell.map((item) => item.title).join(', ');
        return escapeCSV(titles);
      }
      return escapeCSV(cell);
    }).join(',')).join('\n');

    const csvData = `${csvHeader}\n${csvBody}`;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'SensorReportData.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleMenuClose();
  };

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sensor Report Data');

    const borderStyle = {
      top: { style: 'thin', color: { argb: theme.palette.background.black2.replace('#', '') } },
      left: { style: 'thin', color: { argb: theme.palette.background.black2.replace('#', '') } },
      bottom: { style: 'thin', color: { argb: theme.palette.background.black2.replace('#', '') } },
      right: { style: 'thin', color: { argb: theme.palette.background.black2.replace('#', '') } },
    };

    const columns = SENSOR_REPORT_COLUMNS(unitOfMeasure, selectedShipment);

    let maxTempExcursionsCount = 0;
    let maxHumExcursionsCount = 0;
    let maxShockExcursionsCount = 0;
    let maxLightExcursionsCount = 0;
    let minTempExcursionsCount = 0;
    let minHumExcursionsCount = 0;
    let minShockExcursionsCount = 0;
    let minLightExcursionsCount = 0;

    const descriptionRow = worksheet.addRow([
      'Color Key',
      'Tracker ID',
      'Shipment Name',
      'Temp. Excursions',
      'Hum. Excursions',
      'Shock Excursions',
      'Light Excursions',
    ]);

    const descriptionRow1 = worksheet.addRow([
      'Red, Blue indicate Excursions',
      selectedShipment.tracker,
      selectedShipment.name,
      '',
      '',
      '',
      '',
    ]);

    const descriptionRow2 = worksheet.addRow([
      'Green indicates Recovery',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);

    const descriptionRow3 = worksheet.addRow([
      'Grey indicates Transit',
    ]);

    worksheet.addRow([]);

    const headerRow = worksheet.addRow(columns.map((col) => {
      if (col.label === 'Date Time') {
        return `Date Time (${getTimezone(new Date(), timezone)})`;
      }
      return col.label;
    }));

    descriptionRow.eachCell((cell) => {
      cell.font = {
        color: { argb: theme.palette.background.black2.replace('#', '') },
        bold: true,
      };
    });

    descriptionRow1.getCell(1).value = {
      richText: [
        { text: 'Red', font: { color: { argb: theme.palette.error.main.replace('#', '') } } },
        { text: ', ', font: { color: { argb: theme.palette.background.black2.replace('#', '') } } },
        { text: 'Blue', font: { color: { argb: theme.palette.info.main.replace('#', '') } } },
        { text: ' indicate Excursions', font: { color: { argb: theme.palette.background.black2.replace('#', '') } } },
      ],
    };

    descriptionRow2.getCell(1).value = {
      richText: [
        { text: 'Green', font: { color: { argb: theme.palette.success.main.replace('#', '') } } },
        { text: ' indicates Recovery', font: { color: { argb: theme.palette.background.black2.replace('#', '') } } },
      ],
    };

    descriptionRow3.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: theme.palette.background.light6.replace('#', '') },
      };
    });

    headerRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: theme.palette.warning.dark.replace('#', '') },
      };
      cell.font = {
        color: { argb: theme.palette.background.black2.replace('#', '') },
        bold: true,
      };
      if ([6, 7, 8, 9, 10, 11, 12, 13].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });

    const dateTimeColIndex = columns.findIndex((col) => col.label === 'Date Time') + 1;
    const departureTime = moment(selectedShipment.actual_time_of_departure).unix();
    const arrivalTime = moment(selectedShipment.actual_time_of_arrival).unix();

    rows.forEach((row, rowIndex) => {
      const dataRow = columns.map((col) => {
        let cellValue = row[col.name];
        if (col.name === 'location') {
          if (!cellValue || cellValue === 'Error retrieving address') {
            cellValue = 'N/A';
          }
        }
        if (col.name === 'allAlerts' && Array.isArray(cellValue)) {
          cellValue = cellValue.map((item) => item.title).join(', ');
        }
        return cellValue;
      });

      const rowRef = worksheet.addRow(dataRow);
      rowRef.eachCell((cell, colNumber) => {
        if (columns[colNumber - 1].name === 'allAlerts' && Array.isArray(row.allAlerts)) {
          const alerts = row.allAlerts;
          const richText = [];
          alerts.forEach((alert) => {
            richText.push({ text: alert.title, font: { color: { argb: _.includes(alert.color, 'green') ? theme.palette.success.main.replace('#', '') : alert.color.replace('#', '') } } });
            richText.push({ text: ', ' });
          });
          richText.pop();
          cell.value = { richText };
        }
        if (typeof cell.value === 'number') {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });

      if (Array.isArray(row.allAlerts)) {
        row.allAlerts.forEach((alert) => {
          const alertTitle = alert.title.toLowerCase();
          let colName;
          let fillColor;
          if (alertTitle.includes('maximum temperature excursion')) {
            colName = 'temperature';
            fillColor = theme.palette.error.light.replace('#', '');
            maxTempExcursionsCount++;
          } else if (alertTitle.includes('maximum humidity excursion')) {
            colName = 'humidity';
            fillColor = theme.palette.error.light.replace('#', '');
            maxHumExcursionsCount++;
          } else if (alertTitle.includes('maximum shock excursion')) {
            colName = 'shock';
            fillColor = theme.palette.error.light.replace('#', '');
            maxShockExcursionsCount++;
          } else if (alertTitle.includes('maximum light excursion')) {
            colName = 'light';
            fillColor = theme.palette.error.light.replace('#', '');
            maxLightExcursionsCount++;
          } else if (alertTitle.includes('minimum temperature excursion')) {
            colName = 'temperature';
            fillColor = theme.palette.info.light.replace('#', '');
            minTempExcursionsCount++;
          } else if (alertTitle.includes('minimum humidity excursion')) {
            colName = 'humidity';
            fillColor = theme.palette.info.light.replace('#', '');
            minHumExcursionsCount++;
          } else if (alertTitle.includes('minimum shock excursion')) {
            colName = 'shock';
            fillColor = theme.palette.info.light.replace('#', '');
            minShockExcursionsCount++;
          } else if (alertTitle.includes('minimum light excursion')) {
            colName = 'light';
            fillColor = theme.palette.info.light.replace('#', '');
            minLightExcursionsCount++;
          }
          if (colName) {
            const colIndex = columns.findIndex((col) => col.name === colName);
            if (colIndex !== -1) {
              const cell = worksheet.getCell(rowIndex + 7, colIndex + 1);
              if (cell.value) {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: fillColor },
                };
              }
            }
          }
        });
      }

      const dateValue = moment(row[columns[dateTimeColIndex - 1].name]).unix();
      if (dateValue > departureTime && dateValue < arrivalTime) {
        rowRef.eachCell((cell) => {
          if (!cell.fill) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: theme.palette.background.light6.replace('#', '') },
            };
          }
        });
      }
    });

    descriptionRow1.getCell(4).value = {
      richText: [
        { text: maxTempExcursionsCount, font: { color: { argb: theme.palette.error.main.replace('#', '') } } },
      ],
    };
    descriptionRow1.getCell(5).value = {
      richText: [
        { text: maxHumExcursionsCount, font: { color: { argb: theme.palette.error.main.replace('#', '') } } },
      ],
    };
    descriptionRow1.getCell(6).value = {
      richText: [
        { text: maxShockExcursionsCount, font: { color: { argb: theme.palette.error.main.replace('#', '') } } },
      ],
    };
    descriptionRow1.getCell(7).value = {
      richText: [
        { text: maxLightExcursionsCount, font: { color: { argb: theme.palette.error.main.replace('#', '') } } },
      ],
    };
    descriptionRow2.getCell(4).value = {
      richText: [
        { text: minTempExcursionsCount, font: { color: { argb: theme.palette.info.main.replace('#', '') } } },
      ],
    };
    descriptionRow2.getCell(5).value = {
      richText: [
        { text: minHumExcursionsCount, font: { color: { argb: theme.palette.info.main.replace('#', '') } } },
      ],
    };
    descriptionRow2.getCell(6).value = {
      richText: [
        { text: minShockExcursionsCount, font: { color: { argb: theme.palette.info.main.replace('#', '') } } },
      ],
    };
    descriptionRow2.getCell(7).value = {
      richText: [
        { text: minLightExcursionsCount, font: { color: { argb: theme.palette.info.main.replace('#', '') } } },
      ],
    };

    [4, 5, 6, 7].forEach((colIndex) => {
      descriptionRow.getCell(colIndex).alignment = { vertical: 'middle', horizontal: 'center' };
      descriptionRow1.getCell(colIndex).alignment = { vertical: 'middle', horizontal: 'center' };
      descriptionRow2.getCell(colIndex).alignment = { vertical: 'middle', horizontal: 'center' };
    });

    const totalRows = rows.length + 6;
    const totalCols = columns.length;
    for (let rowIndex = 1; rowIndex <= totalRows; rowIndex++) {
      for (let colIndex = 1; colIndex <= totalCols; colIndex++) {
        const cell = worksheet.getCell(rowIndex, colIndex);
        if (!cell.border) {
          cell.border = borderStyle;
        }
      }
    }

    worksheet.columns.forEach((column, index) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value
          ? cell.value.richText
            ? cell.value.richText.map((obj) => obj.text).join('')
            : cell.value.toString()
          : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'SensorReportData.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleMenuClose();
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid className="reportingSensorRoot" container spacing={2}>
      <Grid item xs={12}>
        <div className="reportingSensorTooltip">
          <Typography
            className="reportingSensorReportTitle"
            variant="h5"
          >
            {shipmentName
              ? `Sensor Report - Shipment: ${shipmentName}`
              : 'Sensor Report'}
          </Typography>
        </div>
        <DataTableWrapper
          noSpace
          hideAddButton
          filename="SensorReportData"
          rows={rows}
          columns={SENSOR_REPORT_COLUMNS(
            unitOfMeasure,
            selectedShipment,
          )}
          selectable={{
            rows: 'multiple',
            rowsHeader: false,
            rowsHideCheckboxes: true,
          }}
          selected={selected}
          customSort={customSort}
          extraOptions={{
            customToolbar: () => (
              <>
                <Typography variant="caption" className="reportingSensorTableTitle">
                  <span style={{ fontStyle: 'italic', fontWeight: '700' }}>bold/italic alerts</span>
                  {' '}
                  indicates alerts outside of selected transmission
                </Typography>
                <Tooltip title="Download Options" placement="bottom">
                  <IconButton className="reportingSensorTableExcelDownload" onClick={handleMenuOpen}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem onClick={() => downloadCSV(SENSOR_REPORT_COLUMNS(unitOfMeasure, selectedShipment), rows)}>Download CSV</MenuItem>
                  <MenuItem onClick={downloadExcel}>Download Excel</MenuItem>
                </Menu>
              </>
            ),
          }}
          className="reportingSensorDataTable"
          shouldUseAllColumns
        />
      </Grid>
    </Grid>
  );
};

export default SensorReport;
