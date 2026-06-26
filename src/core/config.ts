import { no, noop, identity } from 'shared/util'

import { LIFECYCLE_HOOKS } from 'shared/constants'
import type { Component } from 'types/component'

/**
 * @internal
 */
export interface Config {
  // user
  optionMergeStrategies: { [key: string]: Function }
  silent: boolean
  productionTip: boolean
  performance: boolean
  devtools: boolean
  errorHandler?: (err: Error, vm: Component | null, info: string) => void
  warnHandler?: (msg: string, vm: Component | null, trace: string) => void
  ignoredElements: Array<string | RegExp>
  keyCodes: { [key: string]: number | Array<number> }

  // axios/http config
  axiosBaseURL?: string
  axiosToken?: string
  axiosTimeout?: number
  axiosHeaders?: Record<string, string>
  axiosRequestInterceptor?: (config: any) => any
  axiosResponseInterceptor?: (response: any) => any
  axiosRequestErrorInterceptor?: (error: any) => any
  axiosResponseErrorInterceptor?: (error: any) => any

  // dynamic component loader config
  componentPath?: string
  componentExtension?: string
  componentFallback?: string
  autoFetchComponents?: boolean
  serverSide?: boolean
  serverSideURL?: string
  
  // global store config
  store?: any

  // socket/rtc config
  socket?: {
    enabled?: boolean
    broadcaster?: string
    key?: string
    host?: string
    port?: number
    forceTLS?: boolean
    authEndpoint?: string
  }

  // hmr config
  hmr?: boolean
  hmrFiles?: string[]
  hmrPort?: number
  hmrHost?: string
  hmrSecure?: boolean

  // platform
  isReservedTag: (x: string) => boolean | undefined
  isReservedAttr: (x: string) => true | undefined
  parsePlatformTagName: (x: string) => string
  isUnknownElement: (x: string) => boolean
  getTagNamespace: (x: string) => string | undefined
  mustUseProp: (tag: string, type?: string | null, name?: string) => boolean

  // private
  async: boolean

  // legacy
  _lifecycleHooks: Array<string>
}

export default {
  /**
   * Option merge strategies (used in core/util/options)
   */
  // $flow-disable-line
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: __DEV__,

  /**
   * Whether to enable devtools
   */
  devtools: __DEV__,

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Axios default base URL
   */
  axiosBaseURL: '',

  /**
   * Axios default token
   */
  axiosToken: '',

  /**
   * Axios default timeout (ms)
   */
  axiosTimeout: 0,

  /**
   * Axios default headers
   */
  axiosHeaders: null,

  /**
   * Axios request interceptor
   */
  axiosRequestInterceptor: null,

  /**
   * Axios response interceptor
   */
  axiosResponseInterceptor: null,

  /**
   * Axios request error interceptor
   */
  axiosRequestErrorInterceptor: null,

  /**
   * Axios response error interceptor
   */
  axiosResponseErrorInterceptor: null,

  /**
   * Default component base path
   */
  componentPath: '/components',

  /**
   * Default component file extension
   */
  componentExtension: '.tpl',

  /**
   * Default fallback component name
   */
  componentFallback: 'component-notfound',

  /**
   * Auto-fetch components from server when not found
   * Enable automatic component resolution
   * Default: false - components must be explicitly loaded
   */
  autoFetchComponents: false,

  /**
   * Enable server-side bundling for async components
   */
  serverSide: false,

  /**
   * URL for the SSR bundler service
   */
  serverSideURL: '',

  /**
   * Socket/RTC configuration
   */
  socket: {
    enabled: false,
    broadcaster: 'pusher',
    key: '',
    host: '',
    port: 80,
    forceTLS: false,
    authEndpoint: '/broadcasting/auth'
  },

  /**
   * Enable Hot Module Replacement
   * When true, connects to HMR WebSocket server for hot reload
   */
  hmr: false,

  /**
   * File extensions to watch for HMR
   * Server will only watch files with these extensions
   */
  hmrFiles: ['css', 'vue', 'tpl', 'js'],

  /**
   * HMR WebSocket server port
   */
  hmrPort: 8003,

  /**
   * HMR WebSocket server host
   */
  hmrHost: 'localhost',

  /**
   * Use secure WebSocket (wss://) instead of ws://
   */
  hmrSecure: false,

  /**
   * Is enable async component
   */
  asyncComponent : false,

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  // $flow-disable-line
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Perform updates asynchronously. Intended to be used by Vue Test Utils
   * This will significantly reduce performance if set to false.
   */
  async: true,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
} as unknown as Config
