import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import _ from 'lodash';
import moment from 'moment-timezone';
import { Typography, useTheme } from '@mui/material';

const GraphComponent = ({ data, selectedGraph, unitOfMeasure }) => {
  const classes = useStyles();
  const [dataChart, setDataChart] = useState({});
  const dateFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure;
  const timeFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure;

  const options = {
    responsive: true,
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            unit: 'minute',
            unitStepSize: 1,
            displayFormats: {
              minute: dateFormat,
            },
            tooltipFormat: `${dateFormat} ${timeFormat}`,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };

  useEffect(() => {
    if (data && data.length > 0 && selectedGraph) {
      setDataChart({
        labels: _.map(data, 'x'),
        datasets: [
          {
            label: _.upperCase(selectedGraph),
            data: _.orderBy(
              data,
              (item) => moment(item.x),
              ['asc'],
            ),
            fill: false,
            showLine: true,
            spanGaps: true,
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.background.default,
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: theme.palette.background.dark,
            pointBackgroundColor: theme.palette.background.default,
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: theme.palette.background.dark,
            pointHoverBorderColor: theme.palette.primary.main,
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
          },
        ],
      });
    }
  }, [data, selectedGraph]);

  return (
    <div>
      {data && data.length > 0 ? (
        <Line data={dataChart} options={options} />
      ) : (
        <Typography
          variant="body1"
          style={{ marginTop: theme.spacing(5), textAlign: 'center' }}
        >
          No data to display
        </Typography>
      )}
    </div>
  );
};

export default GraphComponent;
