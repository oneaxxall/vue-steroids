import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'
import { defineDynamicComponent, debugLog } from '../util/options'
import { initHttpClient } from '../util/http'
import { initHttp } from '../instance/http'
import { Store, createStore, mapState, mapGetters, mapMutations, mapActions } from '../util/store'
import { loadAsyncComponent } from '../util/dynamic-component-loader'
import { installStorage } from '../util/storage'
import { installHooks } from '../util/hooks'
import { initReactive } from '../util/reactive'
import { initRouter } from '../util/router'
import { initRtcClient, getRtcClient } from '../util/rtc'
import { initRtc } from '../instance/rtc'
import { LoadingDirective } from '../directives/loading'
import { initRequire } from '../util/require'
import { initHMR } from '../util/hmr'


import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'
import type { GlobalAPI } from 'types/global-api'

export function initGlobalAPI(Vue: GlobalAPI) {
  // config
  const configDef: Record<string, any> = {}
  configDef.get = () => config
  if (__DEV__) {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }

  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  extend(Vue.options.components, builtInComponents)

  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
  
  // Initialize HTTP client with config
  initHttpClient()
  
  // Add HTTP methods to Vue prototype
  initHttp(Vue as any)
  
  // Initialize RTC client (will auto-poll for config)
  initRtcClient()
  
  // Add RTC methods to Vue prototype
  initRtc(Vue as any)
  
  // Expose RTC client globally as Vue.rtc
  ;(Vue as any).rtc = getRtcClient()
  
  // Initialize global store if config.store is provided
  if (config.store) {
    createStore(config.store)
    debugLog('[Vue.initGlobalAPI] Global store initialized')
  }

  // Expose Store class and helpers globally
  ;(Vue as any).Store = Store
  ;(Vue as any).createStore = createStore
  ;(Vue as any).mapState = mapState
  ;(Vue as any).mapGetters = mapGetters
  ;(Vue as any).mapMutations = mapMutations
  ;(Vue as any).mapActions = mapActions

  // Expose loadAsyncComponent globally
  ;(Vue as any).loadAsyncComponent = loadAsyncComponent
  
  // Install Storage plugin
  installStorage(Vue)
  debugLog('[Vue.initGlobalAPI] Storage plugin installed')

  // Install Hooks plugin
  installHooks(Vue)
  debugLog('[Vue.initGlobalAPI] Hooks plugin installed')
  
  // Add defineDynamicComponent as a global API
  // This allows components to be registered dynamically, even after Vue instance init
  Vue.defineDynamicComponent = defineDynamicComponent
  ;(Vue as any).dynamicComponent = defineDynamicComponent
  debugLog('[Vue.initGlobalAPI] Vue.defineDynamicComponent registered')

  // Initialize standalone reactive system
  initReactive(Vue)
  debugLog('[Vue.initGlobalAPI] Standalone Reactive system initialized')

  // Initialize built-in router
  initRouter(Vue)
  debugLog('[Vue.initGlobalAPI] Built-in Router initialized')

  // Register global directives
  Vue.directive('loading', LoadingDirective)
  debugLog('[Vue.initGlobalAPI] v-loading directive registered')

  // Initialize require functionality
  initRequire()
  debugLog('[Vue.initGlobalAPI] Require system initialized')

  // Initialize HMR client (will auto-connect if config.hmr = true)
  initHMR(Vue as any)
  debugLog('[Vue.initGlobalAPI] HMR client initialized')

  // Register Portal components directly to avoid circular dependency issues
  const portalBusState = Vue.observable({ portals: {} as any })
  ;(Vue as any).portalBus = portalBusState

  Vue.component('Portal', {
    props: {
      to: String,
      disabled: Boolean
    },
    watch: {
      to(newTo, oldTo) {
        if (oldTo && portalBusState.portals[oldTo]?.owner === this) {
          this.$delete(portalBusState.portals, oldTo)
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
          if (this.to && portalBusState.portals[this.to]?.owner === this) {
            this.$delete(portalBusState.portals, this.to)
          }
        } else {
          this.$nextTick(() => {
            if (this.to) {
              this.$set(portalBusState.portals, this.to, {
                vnodes: this.$slots.default,
                owner: this
              })
            }
          })
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
      if (this.to && portalBusState.portals[this.to]?.owner === this) {
        this.$delete(portalBusState.portals, this.to)
      }
    },
    render(h: any) {
      return h()
    }
  })

  Vue.component('PortalTarget', {
    props: {
      name: {
        type: String,
        required: true
      },
      tag: {
        type: String,
        default: 'div'
      }
    },
    data() {
      return {
        ownVNodes: []
      }
    },
    created() {
      this.$watch(
        () => portalBusState.portals[this.name],
        (portalData) => {
          this.ownVNodes = portalData ? portalData.vnodes : []
        },
        { immediate: true, deep: true }
      )
    },
    render(h: any) {
      const vnodes = (this as any).ownVNodes
      if (vnodes && vnodes.length > 0) {
        return h(this.tag, vnodes)
      }
      return h()
    }
  })

  debugLog('[Vue.initGlobalAPI] Portal components registered')
}
