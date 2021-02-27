import "../../styles/index.css";
import withEvents from "../../lib/withEvents";
import mapEvents from "./events";
import options from "./options";
import withWatchers from "./mixins/withWatchers";
import withAsyncActions from "./mixins/withAsyncActions";
import { h } from "vue";

export default {
  name: "GlMap",
  emits: [
    "load",
    "update:center",
    "update:zoom",
    "update:bearing",
    "update:pitch",
    "update:bounds"
  ],

  mixins: [withWatchers, withAsyncActions, withEvents],

  props: {
    mapboxGl: {
      type: Object,
      default: null
    },
    ...options
  },

  provide() {
    return {
      mapbox: () => this.mapbox,
      map: () => this.map,
      actions: () => this.actions
    };
  },

  data() {
    return {
      initial: true,
      initialized: false,
      $_containerVNode: null,
      _watcher: {}
    };
  },

  computed: {
    loaded() {
      return this.map ? this.map.loaded() : false;
    },
    version() {
      return this.map ? this.map.version : null;
    },
    isStyleLoaded() {
      return this.map ? this.map.isStyleLoaded() : false;
    },
    areTilesLoaded() {
      return this.map ? this.map.areTilesLoaded() : false;
    },
    isMoving() {
      return this.map ? this.map.isMoving() : false;
    },
    canvas() {
      return this.map ? this.map.getCanvas() : null;
    },
    canvasContainer() {
      return this.map ? this.map.getCanvasContainer() : null;
    },
    images() {
      return this.map ? this.map.listImages() : null;
    }
  },

  created() {
    this.map = null;
    this.propsIsUpdating = {};
    this.$_containerVNode = null;
    this.mapboxPromise = this.mapboxGl
      ? Promise.resolve(this.mapboxGl)
      : import("mapbox-gl");
  },

  mounted() {
    this.$_loadMap().then(map => {
      this.map = map;
      if (
        this.RTLTextPluginUrl !== undefined &&
        this.mapbox.getRTLTextPluginStatus() !== "loaded"
      ) {
        this.mapbox.setRTLTextPlugin(
          this.RTLTextPluginUrl,
          this.$_RTLTextPluginError
        );
      }
      const eventNames = Object.keys(mapEvents);
      this.$_bindMapEvents(eventNames);
      this.$_registerAsyncActions(map);
      this.$_bindPropsUpdateEvents();
      this.initial = false;
      this.initialized = true;
      this.$emit("load", { map, component: this });
    });
  },

  beforeUnmount() {
    this.$nextTick(() => {
      if (this.map) this.map.remove();
    });
  },

  render() {
    if (!this.$_containerVNode) {
      this.$_containerVNode = h("div", {
        id: this.container,
        ref: "container"
      });
    }
    return h("div", { class: "mgl-map-wrapper" }, [
      this.$_containerVNode,
      this.initialized ? this.$slots.default() : null
    ]);
  },
  methods: {
    $_updateSyncedPropsFabric(prop, data) {
      return () => {
        this.propsIsUpdating[prop] = true;
        let info = typeof data === "function" ? data() : data;
        return this.$emit(`update:${prop}`, info);
      };
    },

    $_bindPropsUpdateEvents() {
      const syncedProps = [
        {
          events: ["moveend"],
          prop: "center",
          getter: this.map.getCenter.bind(this.map)
        },
        {
          events: ["zoomend"],
          prop: "zoom",
          getter: this.map.getZoom.bind(this.map)
        },
        {
          events: ["rotate"],
          prop: "bearing",
          getter: this.map.getBearing.bind(this.map)
        },
        {
          events: ["pitch"],
          prop: "pitch",
          getter: this.map.getPitch.bind(this.map)
        },
        {
          events: ["moveend", "zoomend", "rotate", "pitch"],
          prop: "bounds",
          getter: () => {
            let newBounds = this.map.getBounds();
            if (this.$props.bounds instanceof Array) {
              newBounds = newBounds.toArray();
            }
            return newBounds;
          }
        }
      ];
      syncedProps.forEach(({ events, prop, getter }) => {
        events.forEach(event => {
          if (this.$attrs[`onUpdate:${prop}`]) {
            this.map.on(event, this.$_updateSyncedPropsFabric(prop, getter));
          }
        });
      });
    },

    $_loadMap() {
      return this.mapboxPromise.then(mapbox => {
        this.mapbox = mapbox.default ? mapbox.default : mapbox;

        return new Promise(resolve => {
          if (this.accessToken) this.mapbox.accessToken = this.accessToken;
          const map = new this.mapbox.Map({
            ...this,
            container: this.$refs.container,
            style: this.mapStyle
          });
          map.on("load", () => resolve(map));
        });
      });
    },

    $_RTLTextPluginError(error) {
      this.$emit("rtl-plugin-error", { map: this.map, error: error });
    },

    $_bindMapEvents(events) {
      Object.keys(this.$attrs).forEach(eventName => {
        if (eventName.startsWith("on") && events.includes(eventName)) {
          this.map.on(eventName, this.$_emitMapEvent);
        }
      });
    },

    $_unbindEvents(events) {
      events.forEach(eventName => {
        this.map.off(eventName, this.$_emitMapEvent);
      });
    }
  }
};
