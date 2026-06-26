import { portalBus } from './portal-bus'

export default {
  name: 'PortalTarget',
  props: {
    name: {
      type: String,
      required: true
    },
    tag: {
      type: String,
      default: 'div'
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    vnodes() {
      return portalBus.portals[this.name] || []
    }
  },
  render(h) {
    const vnodes = this.vnodes
    
    // If we have vnodes, render them inside the tag
    // Otherwise render nothing (or empty tag if needed, but usually nothing is better)
    if (vnodes && vnodes.length > 0) {
      return h(this.tag, vnodes)
    }
    
    return h()
  }
}
