import controlMixin from "./controlMixin";

export default {
  name: "FullscreenControl",
  mixins: [controlMixin],

  props: {
    container: {
      type: HTMLElement,
      default: undefined
    }
  },

  created() {
    this.control = this.mapbox().FullscreenControl;
    this.$_addControl();
  }
};
