// // import React, { useState, useEffect } from 'react';
// // import { Line } from 'react-chartjs-2';
// // import _ from 'lodash';
// // import moment from 'moment-timezone';
// // import { Typography, useTheme } from '@mui/material';

// // const GraphComponent = ({
// //   data,
// //   selectedGraph,
// //   unitOfMeasure,
// //   selectedShipment,
// //   timeGap,
// //   minColor,
// //   maxColor,
// // }) => {
// //   // console.log(data);
// //   const theme = useTheme();
// //   const [dataChart, setDataChart] = useState({});
// //   const dateFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
// //     ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
// //     : '';
// //   const timeFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
// //     ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
// //     : '';

// //   const options = {
// //     responsive: true,
// //     scales: {
// //       xAxes: [
// //         {
// //           type: 'time',
// //           time: {
// //             unit: 'minute',
// //             unitStepSize: timeGap,
// //             displayFormats: {
// //               minute: dateFormat,
// //             },
// //             tooltipFormat: `${dateFormat} ${timeFormat}`,
// //           },
// //         },
// //       ],
// //       yAxes: [
// //         {
// //           ticks: {
// //             beginAtZero: false,
// //           },
// //         },
// //       ],
// //     },
// //   };

// //   // useEffect(() => {
// //   //   if (data && data.length > 0 && selectedGraph) {
// //   //     const sortedData = _.orderBy(data, (item) => moment(item.x), ['asc']);
// //   //     const filteredData = sortedData.filter((entry) => entry.y !== null);
// //   //     let colorRanges;

// //   //     const maxEntry = filteredData && filteredData
// //   //       .reduce((max, entry) => (entry.y > max.y ? entry : max), filteredData[0]);
// //   //     const minEntry = filteredData && filteredData
// //   //       .reduce((min, entry) => (entry.y < min.y ? entry : min), filteredData[0]);

// //   //     if (_.isEqual(selectedGraph, 'temperature')) {
// //   //       colorRanges = [
// //   //         {
// //   //           max: maxEntry.y,
// //   //           min: selectedShipment.max_excursion_temp[0].value,
// //   //           color: maxColor,
// //   //           label: 'Max Temperature',
// //   //         },
// //   //         {
// //   //           max: selectedShipment.max_excursion_temp[0].value,
// //   //           min: selectedShipment.min_excursion_temp[0].value,
// //   //           color: theme.palette.background.dark,
// //   //           label: _.upperCase(selectedGraph),
// //   //         },
// //   //         {
// //   //           max: selectedShipment.min_excursion_temp[0].value,
// //   //           min: minEntry.y,
// //   //           color: minColor,
// //   //           label: 'Min Temperature',
// //   //         },
// //   //       ];
// //   //     } else if (_.isEqual(selectedGraph, 'humidity')) {
// //   //       colorRanges = [
// //   //         {
// //   //           max: maxEntry.y,
// //   //           min: selectedShipment.max_excursion_humidity[0].value,
// //   //           color: maxColor,
// //   //           label: 'Max Humidty',
// //   //         },
// //   //         {
// //   //           max: selectedShipment.max_excursion_humidity[0].value,
// //   //           min: selectedShipment.min_excursion_humidity[0].value,
// //   //           color: theme.palette.background.dark,
// //   //           label: _.upperCase(selectedGraph),
// //   //         },
// //   //         {
// //   //           max: selectedShipment.min_excursion_humidity[0].value,
// //   //           min: minEntry.y,
// //   //           color: minColor,
// //   //           label: 'Min Humidty',
// //   //         },
// //   //       ];
// //   //     } else if (_.isEqual(selectedGraph, 'shock')) {
// //   //       colorRanges = [
// //   //         {
// //   //           max: maxEntry.y,
// //   //           min: selectedShipment.shock_threshold[0].value,
// //   //           color: maxColor,
// //   //           label: 'Shock Threshold',
// //   //         },
// //   //         {
// //   //           max: selectedShipment.shock_threshold[0].value,
// //   //           min: minEntry.y,
// //   //           color: theme.palette.background.dark,
// //   //           label: _.upperCase(selectedGraph),
// //   //         },
// //   //       ];
// //   //     } else if (_.isEqual(selectedGraph, 'light')) {
// //   //       colorRanges = [
// //   //         {
// //   //           max: maxEntry.y,
// //   //           min: selectedShipment.light_threshold[0].value,
// //   //           color: maxColor,
// //   //           label: 'Light Threshold',
// //   //         },
// //   //         {
// //   //           max: selectedShipment.light_threshold[0].value,
// //   //           min: minEntry.y,
// //   //           color: theme.palette.background.dark,
// //   //           label: _.upperCase(selectedGraph),
// //   //         },
// //   //       ];
// //   //     } else {
// //   //       colorRanges = [
// //   //         {
// //   //           max: maxEntry.y,
// //   //           min: minEntry.y,
// //   //           color: theme.palette.background.dark,
// //   //           label: _.upperCase(selectedGraph),
// //   //         },
// //   //       ];
// //   //     }

// //   //     const datasets = colorRanges.map((range) => ({
// //   //       label: range.label,
// //   //       data: sortedData.map((d, i) => ({
// //   //         x: d.x,
// //   //         y: (d.y >= range.min && d.y <= range.max) ? d.y : null,
// //   //       })),
// //   //       fill: false,
// //   //       showLine: true,
// //   //       spanGaps: true,
// //   //       borderColor: range.color,
// //   //       backgroundColor: theme.palette.background.default,
// //   //       borderCapStyle: 'butt',
// //   //       borderDash: [],
// //   //       borderDashOffset: 0.0,
// //   //       borderJoinStyle: 'miter',
// //   //       pointBorderColor: range.color,
// //   //       pointBackgroundColor: theme.palette.background.default,
// //   //       pointBorderWidth: 1,
// //   //       pointHoverRadius: 5,
// //   //       pointHoverBackgroundColor: range.color,
// //   //       pointHoverBorderColor: theme.palette.background.light,
// //   //       pointHoverBorderWidth: 2,
// //   //       pointRadius: 1,
// //   //       pointHitRadius: 10,
// //   //     }));

// //   //     setDataChart({
// //   //       labels: _.map(data, 'x'),
// //   //       datasets,
// //   //     });
// //   //   }
// //   // }, [data, selectedGraph]);

// //   // useEffect(() => {
// //   //   if (data && data.length > 0 && selectedGraph) {
// //   //     const datasets = [{
// //   //       label: _.upperCase(selectedGraph),
// //   //       data: _.orderBy(
// //   //         data,
// //   //         (item) => moment(item.x),
// //   //         ['asc'],
// //   //       ),
// //   //       fill: false,
// //   //       showLine: true,
// //   //       spanGaps: true,
// //   //       borderColor: theme.palette.background.dark,
// //   //       backgroundColor: theme.palette.background.default,
// //   //       borderCapStyle: 'butt',
// //   //       borderDash: [],
// //   //       borderDashOffset: 0.0,
// //   //       borderJoinStyle: 'miter',
// //   //       pointBorderColor: theme.palette.background.dark,
// //   //       pointBackgroundColor: theme.palette.background.default,
// //   //       pointBorderWidth: 1,
// //   //       pointHoverRadius: 5,
// //   //       pointHoverBackgroundColor: theme.palette.background.dark,
// //   //       pointHoverBorderColor: theme.palette.background.light,
// //   //       pointHoverBorderWidth: 2,
// //   //       pointRadius: 1,
// //   //       pointHitRadius: 10,

// //   //     }];

// //   //     // if (_.isEqual(selectedGraph, 'temperature')) {
// //   //     //   datasets = [
// //   //     //     ...datasets,
// //   //     //     {
// //   //     //       label: 'Max Temperature',
// //   //     //       data: _.chain(data)
// //   //     //         .filter((d) => d.y >= 60)
// //   //     //         .orderBy((item) => moment(item.x), ['asc'])
// //   //     //         .value(),
// //   //     //       fill: false,
// //   //     //       showLine: true,
// //   //     //       spanGaps: true,
// //   //     //       borderColor: maxColor,
// //   //     //       backgroundColor: maxColor,
// //   //     //       borderCapStyle: 'butt',
// //   //     //       borderDash: [],
// //   //     //       borderDashOffset: 0.0,
// //   //     //       borderJoinStyle: 'miter',
// //   //     //       pointBorderColor: maxColor,
// //   //     //       pointBackgroundColor: maxColor,
// //   //     //       pointBorderWidth: 1,
// //   //     //       pointHoverRadius: 0,
// //   //     //       pointHoverBackgroundColor: maxColor,
// //   //     //       pointHoverBorderColor: maxColor,
// //   //     //       pointHoverBorderWidth: 1,
// //   //     //       pointRadius: 1,
// //   //     //       pointHitRadius: 10,
// //   //     //     },
// //   //     //     {
// //   //     //       label: 'Min Temperature',
// //   //     //       data: _.chain(data)
// //   //     //         .filter((d) => d.y <= 40)
// //   //     //         .orderBy((item) => moment(item.x), ['asc'])
// //   //     //         .value(),
// //   //     //       fill: false,
// //   //     //       showLine: true,
// //   //     //       spanGaps: true,
// //   //     //       borderColor: minColor,
// //   //     //       backgroundColor: minColor,
// //   //     //       borderCapStyle: 'butt',
// //   //     //       borderDash: [],
// //   //     //       borderDashOffset: 0.0,
// //   //     //       borderJoinStyle: 'miter',
// //   //     //       pointBorderColor: minColor,
// //   //     //       pointBackgroundColor: minColor,
// //   //     //       pointBorderWidth: 1,
// //   //     //       pointHoverRadius: 0,
// //   //     //       pointHoverBackgroundColor: minColor,
// //   //     //       pointHoverBorderColor: minColor,
// //   //     //       pointHoverBorderWidth: 1,
// //   //     //       pointRadius: 1,
// //   //     //       pointHitRadius: 10,
// //   //     //     },
// //   //     //   ];
// //   //     // }

// //   //     // if (_.isEqual(selectedGraph, 'humidity')) {
// //   //     //   datasets = [
// //   //     //     ...datasets,
// //   //     //     {
// //   //     //       label: 'Max Humidity',
// //   //     //       data: maxHumidity,
// //   //     //       fill: false,
// //   //     //       showLine: true,
// //   //     //       spanGaps: true,
// //   //     //       borderColor: maxColor,
// //   //     //       backgroundColor: maxColor,
// //   //     //       borderCapStyle: 'butt',
// //   //     //       borderDash: [],
// //   //     //       borderDashOffset: 0.0,
// //   //     //       borderJoinStyle: 'miter',
// //   //     //       pointBorderColor: maxColor,
// //   //     //       pointBackgroundColor: maxColor,
// //   //     //       pointBorderWidth: 1,
// //   //     //       pointHoverRadius: 0,
// //   //     //       pointHoverBackgroundColor: maxColor,
// //   //     //       pointHoverBorderColor: maxColor,
// //   //     //       pointHoverBorderWidth: 1,
// //   //     //       pointRadius: 1,
// //   //     //       pointHitRadius: 10,
// //   //     //     },
// //   //     //     {
// //   //     //       label: 'Min Humidity',
// //   //     //       data: minHumidity,
// //   //     //       fill: false,
// //   //     //       showLine: true,
// //   //     //       spanGaps: true,
// //   //     //       borderColor: minColor,
// //   //     //       backgroundColor: minColor,
// //   //     //       borderCapStyle: 'butt',
// //   //     //       borderDash: [],
// //   //     //       borderDashOffset: 0.0,
// //   //     //       borderJoinStyle: 'miter',
// //   //     //       pointBorderColor: minColor,
// //   //     //       pointBackgroundColor: minColor,
// //   //     //       pointBorderWidth: 1,
// //   //     //       pointHoverRadius: 0,
// //   //     //       pointHoverBackgroundColor: minColor,
// //   //     //       pointHoverBorderColor: minColor,
// //   //     //       pointHoverBorderWidth: 1,
// //   //     //       pointRadius: 1,
// //   //     //       pointHitRadius: 10,
// //   //     //     },
// //   //     //   ];
// //   //     // }

// //   //     // if (_.isEqual(selectedGraph, 'shock')) {
// //   //     //   datasets = [
// //   //     //     ...datasets,
// //   //     //     {
// //   //     //       label: 'Shock Threshold',
// //   //     //       data: shockThreshold,
// //   //     //       fill: false,
// //   //     //       showLine: true,
// //   //     //       spanGaps: true,
// //   //     //       borderColor: maxColor,
// //   //     //       backgroundColor: maxColor,
// //   //     //       borderCapStyle: 'butt',
// //   //     //       borderDash: [],
// //   //     //       borderDashOffset: 0.0,
// //   //     //       borderJoinStyle: 'miter',
// //   //     //       pointBorderColor: maxColor,
// //   //     //       pointBackgroundColor: maxColor,
// //   //     //       pointBorderWidth: 1,
// //   //     //       pointHoverRadius: 0,
// //   //     //       pointHoverBackgroundColor: maxColor,
// //   //     //       pointHoverBorderColor: maxColor,
// //   //     //       pointHoverBorderWidth: 1,
// //   //     //       pointRadius: 1,
// //   //     //       pointHitRadius: 10,
// //   //     //     },
// //   //     //   ];
// //   //     // }

// //   //     // if (_.isEqual(selectedGraph, 'light')) {
// //   //     //   datasets = [
// //   //     //     ...datasets,
// //   //     //     {
// //   //     //       label: 'Light Threshold',
// //   //     //       data: lightThreshold,
// //   //     //       fill: false,
// //   //     //       showLine: true,
// //   //     //       spanGaps: true,
// //   //     //       borderColor: maxColor,
// //   //     //       backgroundColor: maxColor,
// //   //     //       borderCapStyle: 'butt',
// //   //     //       borderDash: [],
// //   //     //       borderDashOffset: 0.0,
// //   //     //       borderJoinStyle: 'miter',
// //   //     //       pointBorderColor: maxColor,
// //   //     //       pointBackgroundColor: maxColor,
// //   //     //       pointBorderWidth: 1,
// //   //     //       pointHoverRadius: 0,
// //   //     //       pointHoverBackgroundColor: maxColor,
// //   //     //       pointHoverBorderColor: maxColor,
// //   //     //       pointHoverBorderWidth: 1,
// //   //     //       pointRadius: 1,
// //   //     //       pointHitRadius: 10,
// //   //     //     },
// //   //     //   ];
// //   //     // }

// //   //     setDataChart({
// //   //       labels: _.map(data, 'x'),
// //   //       datasets,
// //   //     });
// //   //   }
// //   // }, [data, selectedGraph]);

// //   return (
// //     <div>
// //       {data && data.length > 0 ? (
// //         <Line data={dataChart} options={options} />
// //       ) : (
// //         <Typography
// //           variant="body1"
// //           style={{ marginTop: theme.spacing(5), textAlign: 'center' }}
// //         >
// //           No data to display
// //         </Typography>
// //       )}
// //     </div>
// //   );
// // };

// // export default GraphComponent;

// import React, { useRef, useEffect } from 'react';
// import { Line } from 'react-chartjs-2';
// import _ from 'lodash';

// // const data = {
// //   labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
// //   datasets: [
// //     {
// //       label: 'My First dataset',
// //       data: [65, 59, 80, 81, 56, 55, 40, 45, 56, 60, 80, 81],
// //       fill: false,
// //       showLine: true,
// //       spanGaps: true,
// //       // borderColor: (context) => {
// //       //   let color = 'blue';
// //       //   // eslint-disable-next-line no-plusplus
// //       //   for (let i = 0; i < _.size(context.dataset.data); i++) {
// //       //     const value = context.dataset.data[i];
// //       //     if (value > 75) {
// //       //       color = 'red';
// //       //     } else if (value >= 50 && value < 75) {
// //       //       color = 'black';
// //       //     }
// //       //     console.log(color);
// //       //   }
// //       //   return color;
// //       // },
// //       // backgroundColor: (context) => {
// //       //   const index = context.dataIndex;
// //       //   const value = context.dataset.data[index];
// //       //   if (value < 50) return 'red';
// //       //   if (value >= 50 && value < 75) return 'blue';
// //       //   return 'black';
// //       // },
// //       borderCapStyle: 'butt',
// //       borderDash: [],
// //       borderDashOffset: 0.0,
// //       borderJoinStyle: 'miter',
// //       // pointBorderColor: (context) => {
// //       //   const index = context.dataIndex;
// //       //   const value = context.dataset.data[index];
// //       //   if (value < 50) return 'red';
// //       //   if (value >= 50 && value < 75) return 'blue';
// //       //   return 'black';
// //       // },
// //       // pointBackgroundColor: (context) => {
// //       //   const index = context.dataIndex;
// //       //   const value = context.dataset.data[index];
// //       //   if (value < 50) return 'red';
// //       //   if (value >= 50 && value < 75) return 'blue';
// //       //   return 'black';
// //       // },
// //       pointBorderWidth: 1,
// //       pointHoverRadius: 5,
// //       // pointHoverBackgroundColor: (context) => {
// //       //   const index = context.dataIndex;
// //       //   const value = context.dataset.data[index];
// //       //   if (value < 50) return 'red';
// //       //   if (value >= 50 && value < 75) return 'blue';
// //       //   return 'black';
// //       // },
// //       // pointHoverBorderColor: (context) => {
// //       //   const index = context.dataIndex;
// //       //   const value = context.dataset.data[index];
// //       //   if (value < 50) return 'red';
// //       //   if (value >= 50 && value < 75) return 'blue';
// //       //   return 'black';
// //       // },
// //       pointHoverBorderWidth: 2,
// //       pointRadius: 3,
// //       pointHitRadius: 10,
// //     },
// //   ],
// // };

// // const options = {
// //   responsive: true,
// //   plugins: {
// //     legend: {
// //       position: 'top',
// //     },
// //     title: {
// //       display: true,
// //       text: 'Chart.js Line Chart with Multiple Colors',
// //     },
// //     beforeRender: (x, option) => {
// //       const c = x.chart;
// //       const dataset = x.data.datasets[0];
// //       const yScale = x.scales['y-axis-0'];
// //       const yPos = yScale.getPixelForValue(0);

// //       const gradientFill = c.ctx.createLinearGradient(0, 0, 0, c.height);
// //       gradientFill.addColorStop(0, 'rgb(86,188,77)');
// //       gradientFill.addColorStop(yPos / c.height, 'rgb(86,188,77)');
// //       gradientFill.addColorStop(yPos / c.height, 'rgb(229,66,66)');
// //       gradientFill.addColorStop(1, 'rgb(229,66,66)');

// //       const model = x.data.datasets[0]._meta[Object.keys(dataset._meta)[0]].dataset._model;
// //       model.borderColor = gradientFill;
// //     },
// //   },
// // };

// const GraphComponent = () => {
//   const chartRef = useRef(null);

//   useEffect(() => {
//     if (chartRef.current) {
//       chartRef.current.chartInstance.update();
//     }
//   }, []);

//   return (
//     <Line
//       data={{
//         labels: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
//         datasets: [
//           {
//             label: 'My red line',
//             fill: false,
//             borderColor: 'red',
//             data: [null, null, 2, 0, 3, 6, null, null, null, null],
//           },
//           {
//             label: 'My black line',
//             fill: false,
//             borderColor: 'black',
//             data: [2, 4, 2, null, null, null, null, 1, 4, 3],
//           },
//           {
//             label: 'My blue line',
//             fill: false,
//             borderColor: 'blue',
//             data: [null, null, null, null, null, 6, 4, 1, null, null],
//           },
//         ],
//       }}
//     />
//   );
// };

// export default GraphComponent;

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import _ from 'lodash';
import moment from 'moment-timezone';
import { Typography, useTheme } from '@mui/material';

const GraphComponent = ({
  data,
  selectedGraph,
  unitOfMeasure,
  minTemp,
  maxTemp,
  minHumidity,
  maxHumidity,
  shockThreshold,
  lightThreshold,
  timeGap,
  minColor,
  maxColor,
}) => {
  const theme = useTheme();
  const [dataChart, setDataChart] = useState({});
  const dateFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date'))
    ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'date')).unit_of_measure
    : '';
  const timeFormat = _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time'))
    ? _.find(unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'time')).unit_of_measure
    : '';

  const options = {
    responsive: true,
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            unit: 'minute',
            unitStepSize: timeGap,
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

  const generateDatasets = (type) => {
    let datasets = [{
      label: _.upperCase(selectedGraph),
      data: _.orderBy(
        data,
        (item) => moment(item.x),
        ['asc'],
      ),
      fill: false,
      showLine: true,
      spanGaps: true,
      borderColor: theme.palette.background.dark,
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
      pointHoverBorderColor: theme.palette.background.light,
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
    }];

    if (_.isEqual(selectedGraph, 'temperature')) {
      datasets = [
        ...datasets,
        {
          label: 'Max Temperature',
          data: maxTemp,
          fill: false,
          showLine: true,
          spanGaps: true,
          borderColor: maxColor,
          backgroundColor: maxColor,
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: maxColor,
          pointBackgroundColor: maxColor,
          pointBorderWidth: 1,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: maxColor,
          pointHoverBorderColor: maxColor,
          pointHoverBorderWidth: 1,
          pointRadius: 1,
          pointHitRadius: 10,
        },
        {
          label: 'Min Temperature',
          data: minTemp,
          fill: false,
          showLine: true,
          spanGaps: true,
          borderColor: minColor,
          backgroundColor: minColor,
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: minColor,
          pointBackgroundColor: minColor,
          pointBorderWidth: 1,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: minColor,
          pointHoverBorderColor: minColor,
          pointHoverBorderWidth: 1,
          pointRadius: 1,
          pointHitRadius: 10,
        },
      ];
    }

    if (_.isEqual(selectedGraph, 'humidity')) {
      datasets = [
        ...datasets,
        {
          label: 'Max Humidity',
          data: maxHumidity,
          fill: false,
          showLine: true,
          spanGaps: true,
          borderColor: maxColor,
          backgroundColor: maxColor,
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: maxColor,
          pointBackgroundColor: maxColor,
          pointBorderWidth: 1,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: maxColor,
          pointHoverBorderColor: maxColor,
          pointHoverBorderWidth: 1,
          pointRadius: 1,
          pointHitRadius: 10,
        },
        {
          label: 'Min Humidity',
          data: minHumidity,
          fill: false,
          showLine: true,
          spanGaps: true,
          borderColor: minColor,
          backgroundColor: minColor,
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: minColor,
          pointBackgroundColor: minColor,
          pointBorderWidth: 1,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: minColor,
          pointHoverBorderColor: minColor,
          pointHoverBorderWidth: 1,
          pointRadius: 1,
          pointHitRadius: 10,
        },
      ];
    }

    if (_.isEqual(selectedGraph, 'shock')) {
      datasets = [
        ...datasets,
        {
          label: 'Shock Threshold',
          data: shockThreshold,
          fill: false,
          showLine: true,
          spanGaps: true,
          borderColor: maxColor,
          backgroundColor: maxColor,
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: maxColor,
          pointBackgroundColor: maxColor,
          pointBorderWidth: 1,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: maxColor,
          pointHoverBorderColor: maxColor,
          pointHoverBorderWidth: 1,
          pointRadius: 1,
          pointHitRadius: 10,
        },
      ];
    }

    if (_.isEqual(selectedGraph, 'light')) {
      datasets = [
        ...datasets,
        {
          label: 'Light Threshold',
          data: lightThreshold,
          fill: false,
          showLine: true,
          spanGaps: true,
          borderColor: maxColor,
          backgroundColor: maxColor,
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: maxColor,
          pointBackgroundColor: maxColor,
          pointBorderWidth: 1,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: maxColor,
          pointHoverBorderColor: maxColor,
          pointHoverBorderWidth: 1,
          pointRadius: 1,
          pointHitRadius: 10,
        },
      ];
    }

    return datasets;
  };

  useEffect(() => {
    if (data && data.length > 0 && selectedGraph) {
      setDataChart({
        labels: _.map(data, 'x'),
        datasets: generateDatasets(selectedGraph),
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
