<template>
  <mgl-map
    style="height:500px;"
    container="map-test"
    v-model:center="center"
    :accessToken="accessToken"
    :mapStyle="mapStyle"
    :zoom="zoom"
  >
    <mgl-scale-control position="bottom-right" />
    <mgl-attribution-control position="top-left" />

    <mgl-navigation-control position="top-right" />
    <mgl-fullscreen-control position="top-right" />
    <mgl-geolocate-control position="top-right" />
    <mgl-marker
      v-model:coordinates="markerCoordinates"
      color="green"
    />
    <mgl-geojson-layer
      type="fill"
      :source="points"
      :source-id="points.data.id"
      layer-id="pointsLayer"
      :layer="pointsLayer"
      @click="handleClick"
    />
  </mgl-map>
</template>

<script>
import {
  MglMap,
  MglMarker,
  MglGeojsonLayer,
  MglNavigationControl,
  MglAttributionControl,
  MglGeolocateControl,
  MglFullscreenControl,
  MglScaleControl
} from "./../src/main";

export default {
  name: "App",
  components: {
    MglMap,
    MglMarker,
    MglGeojsonLayer,
    MglAttributionControl,
    MglNavigationControl,
    MglGeolocateControl,
    MglFullscreenControl,
    MglScaleControl
  },
  data() {
    return {
      mapStyle: "mapbox://styles/mapbox/streets-v11",
      points: {
        data: {
          features: [
            {
              properties: {},
              geometry: {
                coordinates: [
                  [
                    [9.19830322265625, 47.35184985856322],
                    [9.5416259765625, 47.35184985856322],
                    [9.5416259765625, 47.54965238525127],
                    [9.19830322265625, 47.54965238525127],
                    [9.19830322265625, 47.35184985856322]
                  ]
                ],
                type: "Polygon"
              },
              type: "Feature"
            }
          ],
          id: "points",
          type: "FeatureCollection"
        },
        type: "geojson"
      },
      pointsLayer: {
        id: "pointsLayer",
        type: "fill",
        paint: { "fill-color": "#ff0000", "fill-opacity": 0.1 }
      },
      markerCoordinates: [9.3, 47.5],
      center: [9.3, 47.5],
      zoom: 8
    };
  },
  computed: {
    accessToken() {
      return process.env.VUE_APP_MAPBOX_TOKEN;
    }
  },
  methods: {
    handleClick: function () {
      console.log("clicked");
    }
  }
};
</script>
