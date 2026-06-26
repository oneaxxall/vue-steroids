/**
 * Vue 2 Built-in Portal Component
 * Adapted from portal-vue by LinusBorg  
 * https://github.com/LinusBorg/portal-vue
 * License: MIT
 */

type VNode = any

// Wormhole transport system
const transports: Record<string, Transport[]> = {}
const targets: Record<string, any[]> = {}
const sources: Record<string, any[]> = {}

interface Transport {
  to: string
  from: string
  passengers: VNode[]
  order: number
}

interface TransportInput {
  to: string
  from: string
  passengers: VNode[]
  order?: number
}

let sourceId = 1
let Wormhole: any = null

/**
 * Create Portal and PortalTarget components
 */
export function createPortalComponents(Vue: any) {
  // Initialize Wormhole
  if (!Wormhole) {
    Wormhole = {
      transports,
      targets,
      sources,

      open(transport: TransportInput) {
        const { to, from, passengers, order = Infinity } = transport
        if (!to || !from || !passengers) return

        const newTransport: Transport = { to, from, passengers, order }

        if (!this.transports[to]) {
          Vue.set(this.transports, to, [])
        }

        const currentIndex = this.getTransportIndex({ to, from })
        const newTransports = this.transports[to].slice(0)

        if (currentIndex === -1) {
          newTransports.push(newTransport)
        } else {
          newTransports[currentIndex] = newTransport
        }

        this.transports[to] = newTransports.sort((a: Transport, b: Transport) => a.order - b.order)
      },

      close(transport: { to: string; from: string }, force = false) {
        const { to, from } = transport
        if (!to || (!from && !force)) return
        if (!this.transports[to]) return

        if (force) {
          this.transports[to] = []
        } else {
          const index = this.getTransportIndex({ to, from })
          if (index >= 0) {
            const newTransports = this.transports[to].slice(0)
            newTransports.splice(index, 1)
            this.transports[to] = newTransports
          }
        }
      },

      registerTarget(name: string, vm: any) {
        if (this.targets[name]) {
          console.warn(`[portal-vue]: Target ${name} already exists`)
        }
        Vue.set(this.targets, name, [vm])
      },

      unregisterTarget(name: string) {
        Vue.delete(this.targets, name)
      },

      registerSource(name: string, vm: any) {
        if (this.sources[name]) {
          console.warn(`[portal-vue]: Source ${name} already exists`)
        }
        Vue.set(this.sources, name, [vm])
      },

      unregisterSource(name: string) {
        Vue.delete(this.sources, name)
      },

      hasTarget(name: string): boolean {
        return !!(this.targets[name] && this.targets[name][0])
      },

      hasSource(name: string): boolean {
        return !!(this.sources[name] && this.sources[name][0])
      },

      hasContentFor(name: string): boolean {
        return !!this.transports[name] && this.transports[name].length > 0
      },

      getTransportsFor(name: string): Transport[] {
        return this.transports[name] || []
      },

      getTransportIndex({ to, from }: { to: string; from: string }): number {
        if (!this.transports[to]) return -1
        for (let i = 0; i < this.transports[to].length; i++) {
          if (this.transports[to][i].from === from) {
            return i
          }
        }
        return -1
      }
    }
  }

  // Portal Component
  const PortalComponent = Vue.extend({
    name: 'Portal',

    props: {
      disabled: { type: Boolean, default: false },
      name: { type: String, default: () => String(sourceId++) },
      order: { type: Number, default: 0 },
      slim: { type: Boolean, default: false },
      slotProps: { type: Object, default: () => ({}) },
      tag: { type: String, default: 'DIV' },
      to: { type: String, default: () => String(Math.round(Math.random() * 10000000)) }
    },

    created() {
      this.$nextTick(() => {
        Wormhole.registerSource(this.name, this)
      })
    },

    mounted() {
      if (!this.disabled) {
        this.sendUpdate()
      }
    },

    updated() {
      if (this.disabled) {
        this.clear()
      } else {
        this.sendUpdate()
      }
    },

    beforeDestroy() {
      Wormhole.unregisterSource(this.name)
      this.clear()
    },

    watch: {
      to(newValue: string, oldValue: string) {
        if (oldValue && oldValue !== newValue) {
          this.clear(oldValue)
        }
        this.sendUpdate()
      },
      disabled(newVal: boolean) {
        if (newVal) {
          this.clear()
        } else {
          this.sendUpdate()
        }
      }
    },

    methods: {
      clear(target?: string) {
        const closer = {
          from: this.name,
          to: target || this.to
        }
        Wormhole.close(closer)
      },

      normalizeSlots(): VNode[] | undefined {
        const slots = (this as any).$scopedSlots.default
          ? [(this as any).$scopedSlots.default]
          : this.$slots.default
        return slots
      },

      normalizeOwnChildren(children: VNode[] | Function): VNode[] {
        return typeof children === 'function'
          ? (children as Function)(this.slotProps)
          : (children as VNode[])
      },

      sendUpdate() {
        const slotContent = this.normalizeSlots()
        console.log(`[Portal ${this.name}] sendUpdate called`)
        console.log('[Portal] Slot content:', slotContent)
        console.log('[Portal] Slot content length:', slotContent ? slotContent.length : 0)
        
        if (slotContent) {
          const transport: TransportInput = {
            from: this.name,
            to: this.to,
            passengers: [...slotContent],
            order: this.order
          }
          console.log('[Portal] Opening transport:', transport)
          Wormhole.open(transport)
        } else {
          console.log('[Portal] No slot content, clearing')
          this.clear()
        }
      }
    },

    render(h: any): VNode | VNode[] | null {
      const children: VNode[] | Function[] | undefined =
        this.$slots.default || (this as any).$scopedSlots.default || []

      const Tag = this.tag

      if (children && this.disabled) {
        const normalized = this.normalizeOwnChildren(children as VNode[])
        return normalized.length <= 1 && this.slim
          ? normalized[0]
          : h(Tag, normalized)
      } else {
        return this.slim
          ? h()
          : h(Tag, {
              class: { 'v-portal': true },
              style: { display: 'none' },
              key: 'v-portal-placeholder'
            })
      }
    }
  })

  // PortalTarget Component
  const PortalTargetComponent = Vue.extend({
    name: 'PortalTarget',

    props: {
      name: { type: String, required: true },
      multiple: { type: Boolean, default: false },
      slim: { type: Boolean, default: false },
      tag: { type: String, default: 'DIV' },
      slotProps: { type: Object, default: () => ({}) }
    },

    created() {
      Wormhole.registerTarget(this.name, this)
    },

    beforeDestroy() {
      Wormhole.unregisterTarget(this.name)
    },

    computed: {
      transports(): Transport[] {
        return Wormhole.getTransportsFor(this.name)
      }
    },

    watch: {
      transports() {
        this.$emit('change', this.transports)
      }
    },

    methods: {
      getPassengers(): VNode[] {
        if (!Wormhole.hasContentFor(this.name)) return []

        const transports = this.transports
        const passengers: VNode[] = []

        transports.forEach((transport: Transport) => {
          // Flatten all passengers from this transport
          transport.passengers.forEach((passenger: VNode) => {
            if (Array.isArray(passenger)) {
              passengers.push(...passenger)
            } else if (passenger) {
              passengers.push(passenger)
            }
          })
        })

        return passengers
      }
    },

    render(h: any): VNode | VNode[] | null {
      const passengers = this.getPassengers()

      // Debug logging
      if (passengers.length > 0) {
        console.log(`[PortalTarget ${this.name}] Rendering ${passengers.length} passengers`)
        console.log('[PortalTarget] Passengers:', passengers)
      }

      if (passengers.length === 0) {
        return this.slim ? null : h(this.tag)
      }

      // If only one passenger and slim, render it directly
      if (passengers.length === 1 && this.slim) {
        const passenger = passengers[0]
        console.log('[PortalTarget] Single passenger:', passenger)
        return passenger
      }

      // Multiple passengers - wrap in tag
      // Use children as the second argument to h()
      return h(this.tag, passengers)
    }
  })

  return { PortalComponent, PortalTargetComponent, Wormhole }
}

/**
 * Install Portal plugin
 */
export function installPortal(VueInstance: any): void {
  const { PortalComponent, PortalTargetComponent, Wormhole: WormholeInstance } = createPortalComponents(VueInstance)

  VueInstance.component('Portal', PortalComponent)
  VueInstance.component('PortalTarget', PortalTargetComponent)
  VueInstance.component('portal', PortalComponent)
  VueInstance.component('portal-target', PortalTargetComponent)

  VueInstance.Wormhole = WormholeInstance
  VueInstance.Portal = PortalComponent
  VueInstance.PortalTarget = PortalTargetComponent

  console.log('[Portal] Plugin installed (adapted from portal-vue)')
}
