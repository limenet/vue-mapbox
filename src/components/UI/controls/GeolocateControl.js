import controlMixin from "./controlMixin";
import withEvents from "../../../lib/withEvents";
import withSelfEvents from "../withSelfEvents";

const geolocationEvents = {
  trackuserlocationstart: "trackuserlocationstart",
  trackuserlocationend: "trackuserlocationend",
  geolocate: "geolocate",
  error: "error"
};

export default {
  name: "GeolocateControl",
  mixins: [withEvents, withSelfEvents, controlMixin],

  props: {
    positionOptions: {
      type: Object,
      default() {
        return {
          enableHighAccuracy: false,
          timeout: 6000
        };
      }
    },
    fitBoundsOptions: {
      type: Object,
      default: () => ({ maxZoom: 15 })
    },
    trackUserLocation: {
      type: Boolean,
      default: false
    },
    showUserLocation: {
      type: Boolean,
      default: true
    }
  },

  created() {
    this.control = this.mapbox().GeolocateControl;
    this.$_addControl();
    this.$_bindSelfEvents(Object.keys(geolocationEvents), this.controlInstance);
  },

  methods: {
    trigger() {
      if (this.control) {
        return this.control.trigger();
      }
    }
  }
};
