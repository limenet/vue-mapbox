import withEvents from "../../../lib/withEvents";
import withSelfEvents from "../withSelfEvents";

export default {
  mixins: [withEvents, withSelfEvents],

  inject: ["mapbox", "map", "actions"],

  props: {
    position: {
      type: String,
      default: "top-right"
    }
  },
  emits: ["added", "error"],

  beforeUnmount() {
    if (this.map() && this.controlInstance) {
      this.map().removeControl(this.controlInstance);
    }
  },

  methods: {
    $_addControl() {
      try {
        this.controlInstance = new this.control(this.$props);
        this.map().addControl(this.controlInstance, this.position);
      } catch (err) {
        this.$_emitEvent("error", { error: err });
        return;
      }
      this.$_emitEvent("added", { control: this.control });
    }
  },

  render() {}
};
