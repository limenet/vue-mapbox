import withEvents from "../../lib/withEvents";
import withSelfEvents from "./withSelfEvents";
import { h } from "vue";

const markerEvents = {
  onDrag: "drag",
  onDagstart: "dragstart",
  onDragend: "dragend"
};

const markerDOMEvents = {
  click: "click",
  mouseenter: "mouseenter",
  mouseleave: "mouseleave"
};

export default {
  name: "MapMarker",
  mixins: [withEvents, withSelfEvents],

  inject: ["mapbox", "map"],

  provide() {
    const self = this;
    return {
      get marker() {
        return self.marker;
      }
    };
  },

  props: {
    // mapbox marker options
    offset: {
      type: [Object, Array],
      default: () => [0, 0]
    },
    coordinates: {
      type: Array,
      required: true
    },
    color: {
      type: String
    },
    anchor: {
      type: String,
      default: "center"
    },
    draggable: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      initial: true,
      marker: undefined
    };
  },

  watch: {
    coordinates(lngLat) {
      if (this.initial) return;
      this.marker.setLngLat(lngLat);
    },
    draggable(next) {
      if (this.initial) return;
      this.marker.setDraggable(next);
    }
  },

  mounted() {
    const markerOptions = {
      ...this.$props
    };
    if (this.$slots.marker) {
      markerOptions.element = this.$slots.marker[0].elm;
    }

    const marker = this.mapbox().Marker;

    this.marker = new marker(markerOptions);

    if (this.$attrs["onUpdate:coordinates"]) {
      this.marker.on("dragend", event => {
        let newCoordinates;
        if (this.coordinates instanceof Array) {
          newCoordinates = [event.target._lngLat.lng, event.target._lngLat.lat];
        } else {
          newCoordinates = event.target._lngLat;
        }
        this.$emit("update:coordinates", newCoordinates);
      });
    }

    this.$_bindSelfEvents(markerEvents, this.marker);

    this.initial = false;
    this.$_addMarker();
  },

  beforeUnmount() {
    if (this.map !== undefined && this.marker !== undefined) {
      this.marker.remove();
    }
  },

  methods: {
    $_addMarker() {
      this.marker.setLngLat(this.coordinates).addTo(this.map());
      this.$_bindMarkerDOMEvents();
      this.$_emitEvent("added", { marker: this.marker });
    },

    $_emitSelfEvent(event) {
      this.$_emitMapEvent(event, { marker: this.marker });
    },

    $_bindMarkerDOMEvents() {
      Object.keys(this.$attrs).forEach(key => {
        if (
          key.startsWith("on") &&
          Object.values(markerDOMEvents).includes(key)
        ) {
          this.marker._element.addEventListener(key, event => {
            this.$_emitSelfEvent(event);
          });
        }
      });
    },

    remove() {
      this.marker.remove();
      this.$_emitEvent("removed");
    },

    togglePopup() {
      return this.marker.togglePopup();
    }
  },

  render() {
    return h(
      "div",
      {
        style: {
          display: "none"
        }
      },
      [this.$slots.marker, this.marker ? this.$slots.default : null]
    );
  },
  emits: ["removed", "added"]
};
