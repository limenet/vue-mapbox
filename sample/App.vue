<template>
  <mgl-map
    style="height:500px;"
    container="map-test"
    v-model:center="center"
    :accessToken="accessToken"
    :mapStyle="mapStyle"
    :zoom="zoom"
  >
    <mgl-attribution-control position="top-left" />
    <mgl-navigation-control position="top-right" />
    <mgl-geolocate-control position="top-right" />
    <mgl-fullscreen-control position="top-right" />
    <mgl-geolocate-control position="top-right" />
    <mgl-scale-control position="bottom-right" />
    <mgl-marker
      v-model:coordinates="markerCoordinates"
      color="green"
    />
    <mgl-geojson-layer
      type="fill"
      :sourceId="sourceId"
      :layerId="layerId"
      :source="geojson"
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
      geojson: {
        type: "Feature",
        properties: {
          name: "Coors Field",
          amenity: "Baseball Stadium",
          popupContent: "This is where the Rockies play!"
        },
        geometry: {
          type: "Point",
          coordinates: [-104.99404, 39.75621]
        }
      },
      layerId: "firstLayer",
      sourceId: "firstSource",
      markerCoordinates: [50, 50],
      center: [47, 9],
      zoom: 4
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
