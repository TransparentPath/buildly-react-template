import React, { useState, useEffect, forwardRef } from 'react';
import _ from 'lodash';
import { Box, Grid, Typography } from '@mui/material';
import MapComponent from '@components/MapComponent/MapComponent';

const ReportMap = forwardRef((props, ref) => {
  const {
    hidden,
    selectedShipment,
    markers,
    setSelectedMarker,
    unitData,
  } = props;

  return (
    <Grid
      ref={ref}
      container
      // className={hidden ? 'reportingContainer2' : ''}
      className="reportingcontainer2"
      sx={{ marginTop: 4 }}
    >
      <div className="reportingSwitchViewSection">
        <Typography className="reportingSectionTitleHeading" variant="h5">
          {!_.isEmpty(selectedShipment) && selectedShipment.name ? (
            <>
              <span>Map View - Shipment: </span>
              <span className="notranslate">{selectedShipment.name}</span>
            </>
          ) : 'Map View'}
        </Typography>
      </div>
      <Grid item xs={12}>
        <MapComponent
          isMarkerShown={!_.isEmpty(markers)}
          showPath
          screenshotMapCenter
          markers={markers}
          googleMapURL={window.env.MAP_API_URL}
          zoom={_.isEmpty(markers) ? 4 : 7}
          setSelectedMarker={setSelectedMarker}
          loadingElement={<div style={{ height: '100%' }} />}
          containerElement={<div style={{ height: '625px' }} />}
          mapElement={<div style={{ height: '100%' }} />}
          unitOfMeasure={unitData}
        />
      </Grid>
    </Grid>
  );
});

export default ReportMap;
