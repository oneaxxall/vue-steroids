import { portalBus } from './portal-bus'

export default {
  name: 'Portal',
  props: {
    to: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    to(newTo, oldTo) {
      if (oldTo) {
        this.$delete(portalBus.portals, oldTo)
      }
      this.sendToBus()
    },
    disabled() {
      this.sendToBus()
    }
  },
  methods: {
    sendToBus() {
      if (this.disabled) {
        if (this.to) {
          this.$delete(portalBus.portals, this.to)
        }
      } else {
        this.$set(portalBus.portals, this.to, this.$slots.default)
      }
    }
  },
  mounted() {
    this.sendToBus()
  },
  updated() {
    this.sendToBus()
  },
  beforeDestroy() {
    if (this.to) {
      this.$delete(portalBus.portals, this.to)
    }
  },
  render(h) {
    return h()
  }
}
