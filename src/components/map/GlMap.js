import "../../styles/index.css";
import withEvents from "../../lib/withEvents";
import mapEvents from "./events";
import options from "./options";
import withWatchers from "./mixins/withWatchers";
import withPrivateMethods from "./mixins/withPrivateMethods";
import withAsyncActions from "./mixins/withAsyncActions";
import { h } from "vue";

export default {
  name: "GlMap",

  mixins: [withWatchers, withAsyncActions, withPrivateMethods, withEvents],

  props: {
    mapboxGl: {
      type: Object,
      default: null
    },
    ...options
  },

  provide() {
    const self = this;
    return {
      get mapbox() {
        return self.mapbox;
      },
      get map() {
        return self.map;
      },
      get actions() {
        return self.actions;
      }
    };
  },

  data() {
    return {
      initial: true,
      initialized: false,
      $_containerVNode: null
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
    if (!this.$$_containerVNode) {
      this.$_containerVNode = h("div", {
        id: this.container,
        ref: "container"
      });
    }
    return h("div", { class: "mgl-map-wrapper" }, [
      this.$_containerVNode,
      this.initialized ? this.$slots.default : null
    ]);
  }
};
