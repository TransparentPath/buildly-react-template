import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow,
  Polyline,
  Polygon,
  Circle,
} from 'react-google-maps';
import MarkerClusterer from 'react-google-maps/lib/components/addons/MarkerClusterer';
import _ from 'lodash';
import { Grid, useTheme } from '@mui/material';
import {
  AccessTime as ClockIcon,
  BatteryStd as BatteryIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import {
  MARKER_DATA,
  getIcon,
} from '../../utils/constants';

export const MapComponent = (props) => {
  const {
    allMarkers, markers, setSelectedMarker, geofence, unitOfMeasure,
  } = props;
  const [center, setCenter] = useState({
    lat: 47.606209,
    lng: -122.332069,
  });
  const [showInfoIndex, setShowInfoIndex] = useState({});
  const [polygon, setPolygon] = useState({});

  useEffect(() => {
    if (!_.isEmpty(markers) && _.last(markers).lat && _.last(markers).lng) {
      setCenter({
        lat: _.last(markers).lat,
        lng: _.last(markers).lng,
      });
      setShowInfoIndex(_.last(markers));
      if (setSelectedMarker) {
        setSelectedMarker(_.last(markers));
      }
    }

    if (_.isEmpty(markers)) {
      setCenter({ lat: 47.606209, lng: -122.332069 });
    }
  }, [markers]);

  useEffect(() => {
    if (geofence && !_.isEmpty(geofence.coordinates)) {
      const coordinates = geofence.coordinates[0];
      const polygonPoints = [];
      _.forEach(coordinates, (coordinate) => {
        polygonPoints.push({
          lat: coordinate[0],
          lng: coordinate[1],
        });
      });
      setPolygon(polygonPoints);
    }
  }, [geofence]);

  const onMarkerDrag = (e, onMarkerDragAction) => {
    if (onMarkerDragAction) {
      onMarkerDragAction(`${e.latLng.lat()},${e.latLng.lng()}`);
      setPolygon({});
    }
  };

  const onMarkerSelect = (marker) => {
    setShowInfoIndex(marker);
    if (setSelectedMarker) {
      setSelectedMarker(marker);
    }
  };

  return (
    <RenderedMap
      {...props}
      theme={useTheme()}
      onMarkerDrag={onMarkerDrag}
      center={center}
      polygon={polygon}
      showInfoIndex={showInfoIndex}
      onMarkerSelect={onMarkerSelect}
      unitOfMeasure={unitOfMeasure}
    />
  );
};

const RenderedMap = withScriptjs(
  withGoogleMap((props) => (
    <GoogleMap zoom={props.zoom} center={props.center}>
      {!props.isMarkerShown && props.allMarkers && !_.isEmpty(props.allMarkers)
      && _.map(props.allMarkers, (shipMarkers, idx) => (
        <MarkerClusterer
          key={idx}
          averageCenter
          enableRetinaIcons
          gridSize={60}
        >
          {_.map(shipMarkers, (marker, inx) => (
            <Marker key={`${marker.lat}-${marker.lng}-${inx}`} position={marker} />
          ))}
        </MarkerClusterer>
      ))}
      {props.isMarkerShown && props.markers && _.map(
        props.markers,
        (mark, index) => (mark.label ? (
          <Marker
            key={index}
            position={{ lat: mark.lat, lng: mark.lng }}
            icon={{
              path:
                'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
              fillColor: `${mark.color}`,
              fillOpacity: 1,
              strokeColor: props.theme.palette.background.dark,
              scale: 1.4,
              anchor: { x: 12, y: 24 },
            }}
            label={`${index + 1}`}
            onClick={() => props.onMarkerSelect(mark)}
          >
            {_.isEqual(props.showInfoIndex, mark) && (
            <InfoWindow onCloseClick={() => props.onMarkerSelect(null)}>
              {_.isEqual(mark.label, 'Clustered')
                ? (
                  <Grid
                    container
                    spacing={1}
                    style={{
                      height: props.theme.spacing(13),
                      width: props.theme.spacing(38),
                      color: props.theme.palette.background.dark,
                      fontSize: props.theme.spacing(1.25),
                    }}
                    alignItems="center"
                  >
                    {/* <Grid item xs={12}>
                      {JSON.stringify(mark)}
                    </Grid> */}
                    {_.map(MARKER_DATA(props.unitOfMeasure), (item, idx) => (
                      <Grid
                        item
                        xs={6}
                        key={`${item.id}-${idx}`}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        {getIcon({
                          ...item,
                          color: _.isEqual(mark.alertFor, item.id)
                            ? mark.color
                            : 'inherit',
                        })}
                        {mark[item.id] ? (
                          <div
                            style={{
                              marginLeft: props.theme.spacing(0.5),
                              color: _.isEqual(mark.alertFor, item.id)
                                ? mark.color
                                : 'inherit',
                            }}
                          >
                            {` ${mark[item.id]} ${item.unit}`}
                          </div>
                        ) : (
                          <div
                            style={{
                              marginLeft: props.theme.spacing(0.5),
                              color: _.isEqual(mark.alertFor, item.id)
                                ? mark.color
                                : 'inherit',
                            }}
                          >
                            {' NA'}
                          </div>
                        )}
                      </Grid>
                    ))}
                    <Grid item xs={12} style={{ borderTop: `1px solid ${props.theme.palette.background.light}`, marginTop: props.theme.spacing(1.5) }}>
                      <Grid container spacing={1}>
                        <Grid item xs={5} style={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon />
                          <div style={{ marginLeft: props.theme.spacing(0.5) }}>{mark.date}</div>
                        </Grid>
                        <Grid item xs={5} style={{ display: 'flex', alignItems: 'center' }}>
                          <ClockIcon />
                          <div style={{ marginLeft: props.theme.spacing(0.5) }}>{mark.time}</div>
                        </Grid>
                        <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
                          <BatteryIcon />
                          <div>{`${mark.battery}%`}</div>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                ) : (
                  <div style={{ color: props.theme.palette.background.default }}>
                    {mark.label}
                  </div>
                )}
            </InfoWindow>
            )}
          </Marker>
        ) : (
          <Marker
            draggable={mark.draggable}
            key={
              mark.lat && mark.lng
                ? `marker${index}:${mark.lat},${mark.lng}`
                : `marker${index}`
              }
            position={
              mark.lat && mark.lng
                ? { lat: mark.lat, lng: mark.lng }
                : props.center
              }
            onDragEnd={(e) => {
              props.onMarkerDrag(e, mark.onMarkerDrag);
            }}
          />
        )),
      )}
      {props.isMarkerShown && !_.isEmpty(props.markers) && props.showPath && (
        <Polyline
          path={_.map(props.markers, (marker) => ({
            lat: marker.lat,
            lng: marker.lng,
          }))}
          geodesic
          options={{
            strokeColor: props.theme.palette.background.dark,
            strokeOpacity: 0.75,
            strokeWeight: 1,
          }}
        />
      )}
      {props.isMarkerShown && props.markers && !_.isEmpty(props.polygon) && _.map(
        props.markers,
        (mark, index) => (mark.radius ? (
          <Marker
            key={
            mark.lat && mark.lng
              ? `marker${index}:${mark.lat},${mark.lng}`
              : `marker${index}`
          }
            position={
            mark.lat && mark.lng
              ? { lat: mark.lat, lng: mark.lng }
              : props.center
          }
          >
            <Circle
              defaultCenter={{
                lat: mark.lat,
                lng: mark.lng,
              }}
              radius={mark.radius * 1000}
              options={{
                strokeColor: props.theme.palette.error.main,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: props.theme.palette.error.main,
                fillOpacity: 0.35,
              }}
            />
            <InfoWindow>
              <div style={{ color: props.theme.palette.background.dark }}>
                {`Geofence of ${mark.radius} ${_.toLower(
                  _.find(props.unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'distance'))
                    ? _.find(props.unitOfMeasure, (unit) => (_.toLower(unit.unit_of_measure_for) === 'distance')).unit_of_measure
                    : '',
                )}`}
              </div>
            </InfoWindow>
          </Marker>
        ) : (
          <Marker
            key={
            mark.lat && mark.lng
              ? `marker${index}:${mark.lat},${mark.lng}`
              : `marker${index}`
          }
            position={
            mark.lat && mark.lng
              ? { lat: mark.lat, lng: mark.lng }
              : props.center
          }
          >
            <InfoWindow>
              <div style={{ color: props.theme.palette.background.dark }}>
                Configure radius for geofence
              </div>
            </InfoWindow>
          </Marker>
        )),
      )}
      {!_.isEmpty(props.polygon) && (
        <Polygon
          path={props.polygon}
          editable={false}
          options={{
            strokeColor: props.theme.palette.background.dark,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: props.theme.palette.background.dark,
            fillOpacity: 0.35,
            polygonKey: 1,
          }}
        />
      )}
    </GoogleMap>
  )),
);

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.itemsReducer,
});

export default connect(mapStateToProps)(MapComponent);
