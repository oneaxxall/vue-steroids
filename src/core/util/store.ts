import { observe, defineReactive } from '../observer/index'
import { warn } from './debug'
import config from '../config'

/**
 * Vue 2 Integrated State Management
 * Simple, lightweight store similar to Vuex but built directly into Vue
 */

export interface StoreOptions {
  state: Record<string, any>
  getters?: Record<string, (state: any, getters?: any) => any>
  mutations?: Record<string, (state: any, payload?: any) => void>
  actions?: Record<string, (context: Store, payload?: any) => any>
  modules?: Record<string, StoreOptions>
}

export class Store {
  private _state: any
  private _getters: Record<string, Function> = {}
  private _mutations: Record<string, Function> = {}
  private _actions: Record<string, Function> = {}
  private _modules: Record<string, Store> = {}
  private _subscribers: Array<(mutation: { type: string; payload: any }, state: any) => void> = []

  constructor(options: StoreOptions) {
    // Create reactive state
    this._state = {}
    this._initState(options.state || {})
    
    // Register getters
    if (options.getters) {
      this._initGetters(options.getters)
    }
    
    // Register mutations
    if (options.mutations) {
      this._initMutations(options.mutations)
    }
    
    // Register actions
    if (options.actions) {
      this._initActions(options.actions)
    }
    
    // Register modules
    if (options.modules) {
      this._initModules(options.modules)
    }

    // Bind commit and dispatch to instance for destructuring
    this.commit = this.commit.bind(this)
    this.dispatch = this.dispatch.bind(this)
  }

  /**
   * Get reactive state
   */
  get state(): any {
    return this._state
  }

  /**
   * Get state (shallow copy for devtools)
   */
  get stateSnapshot(): any {
    return { ...this._state }
  }

  /**
   * Getters proxy
   */
  get getters(): any {
    const gettersProxy: any = {}
    Object.keys(this._getters).forEach(key => {
      Object.defineProperty(gettersProxy, key, {
        get: () => this._getters[key](this._state, gettersProxy)
      })
    })
    return gettersProxy
  }

  /**
   * Initialize reactive state
   */
  private _initState(state: Record<string, any>): void {
    Object.keys(state).forEach(key => {
      defineReactive(this._state, key, state[key])
    })
    
    // Make entire state object reactive
    observe(this._state)
  }

  /**
   * Initialize getters
   */
  private _initGetters(getters: Record<string, Function>): void {
    Object.keys(getters).forEach(key => {
      this._getters[key] = getters[key]
    })
  }

  /**
   * Initialize mutations
   */
  private _initMutations(mutations: Record<string, Function>): void {
    Object.keys(mutations).forEach(key => {
      this._mutations[key] = mutations[key]
    })
  }

  /**
   * Initialize actions
   */
  private _initActions(actions: Record<string, Function>): void {
    Object.keys(actions).forEach(key => {
      this._actions[key] = actions[key]
    })
  }

  /**
   * Initialize modules
   */
  private _initModules(modules: Record<string, StoreOptions>): void {
    Object.keys(modules).forEach(moduleName => {
      const moduleOptions = modules[moduleName]
      this._modules[moduleName] = new Store(moduleOptions)
      
      // Register module state under module name
      if (!this._state[moduleName]) {
        defineReactive(this._state, moduleName, this._modules[moduleName].state)
      }
    })
  }

  /**
   * Commit a mutation
   * @param type - Mutation type (can be 'module/mutation' for modules)
   * @param payload - Payload for mutation
   */
  commit(type: string, payload?: any): void {
    // Check if it's a module mutation
    if (type.includes('/')) {
      const [moduleName, mutationName] = type.split('/')
      if (this._modules[moduleName]) {
        this._modules[moduleName].commit(mutationName, payload)
        return
      }
    }

    const mutation = this._mutations[type]
    if (!mutation) {
      warn(`[Store] Unknown mutation: ${type}`)
      return
    }

    mutation(this._state, payload)
    this._notifySubscribers({ type, payload }, this._state)
  }

  /**
   * Dispatch an action
   * @param type - Action type (can be 'module/action' for modules)
   * @param payload - Payload for action
   */
  dispatch(type: string, payload?: any): Promise<any> {
    // Check if it's a module action
    if (type.includes('/')) {
      const [moduleName, actionName] = type.split('/')
      if (this._modules[moduleName]) {
        return this._modules[moduleName].dispatch(actionName, payload)
      }
    }

    const action = this._actions[type]
    if (!action) {
      warn(`[Store] Unknown action: ${type}`)
      return Promise.reject(new Error(`Unknown action: ${type}`))
    }

    return Promise.resolve(action(this, payload))
  }

  /**
   * Get state value
   * @param path - Dot notation path (e.g., 'user.profile.name')
   */
  getState(path: string): any {
    const parts = path.split('.')
    let value = this._state
    
    for (const part of parts) {
      if (value === undefined || value === null) {
        return undefined
      }
      value = value[part]
    }
    
    return value
  }

  /**
   * Set state value
   * @param path - Dot notation path
   * @param value - New value
   */
  setState(path: string, value: any): void {
    const parts = path.split('.')
    const lastPart = parts.pop()!
    let target = this._state
    
    for (const part of parts) {
      if (!target[part]) {
        target[part] = {}
      }
      target = target[part]
    }
    
    target[lastPart] = value
  }

  /**
   * Subscribe to mutations
   */
  subscribe(fn: (mutation: { type: string; payload: any }, state: any) => void): Function {
    this._subscribers.push(fn)
    return () => {
      const index = this._subscribers.indexOf(fn)
      if (index > -1) {
        this._subscribers.splice(index, 1)
      }
    }
  }

  /**
   * Notify subscribers
   */
  private _notifySubscribers(mutation: { type: string; payload: any }, state: any): void {
    this._subscribers.forEach(fn => fn(mutation, state))
  }

  /**
   * Reset store to initial state
   */
  reset(): void {
    if (config.store) {
      const options = config.store
      this._initState(options.state || {})
      if (options.getters) this._initGetters(options.getters)
      if (options.mutations) this._initMutations(options.mutations)
      if (options.actions) this._initActions(options.actions)
    }
  }
}

/**
 * Create a store instance
 */
export function createStore(options: StoreOptions): Store {
  return new Store(options)
}

/**
 * Helper: map state to computed properties
 * Usage: computed: { ...mapState(['count', 'user']) }
 */
export function mapState(paths: string[] | Record<string, string>): Record<string, Function> {
  const computed: Record<string, Function> = {}
  
  if (Array.isArray(paths)) {
    paths.forEach(path => {
      computed[path] = function() {
        const store = (this as any).$store
        if (!store) {
          warn('[mapState] $store not found')
          return undefined
        }
        return store.getState(path)
      }
    })
  } else {
    Object.keys(paths).forEach(key => {
      computed[key] = function() {
        const store = (this as any).$store
        if (!store) {
          warn('[mapState] $store not found')
          return undefined
        }
        return store.getState(paths[key])
      }
    })
  }
  
  return computed
}

/**
 * Helper: map getters to computed properties
 * Usage: computed: { ...mapGetters(['isLoggedIn', 'currentUser']) }
 */
export function mapGetters(getterNames: string[]): Record<string, Function> {
  const computed: Record<string, Function> = {}
  
  getterNames.forEach(name => {
    computed[name] = function() {
      const store = (this as any).$store
      if (!store) {
        warn('[mapGetters] $store not found')
        return undefined
      }
      return store.getters[name]
    }
  })
  
  return computed
}

/**
 * Helper: map mutations to methods
 * Usage: methods: { ...mapMutations(['increment', 'decrement']) }
 */
export function mapMutations(mutations: string[] | Record<string, string>): Record<string, Function> {
  const methods: Record<string, Function> = {}
  
  if (Array.isArray(mutations)) {
    mutations.forEach(name => {
      methods[name] = function(payload?: any) {
        const store = (this as any).$store
        if (store) {
          store.commit(name, payload)
        }
      }
    })
  } else {
    Object.keys(mutations).forEach(key => {
      methods[key] = function(payload?: any) {
        const store = (this as any).$store
        if (store) {
          store.commit(mutations[key], payload)
        }
      }
    })
  }
  
  return methods
}

/**
 * Helper: map actions to methods
 * Usage: methods: { ...mapActions(['fetchUser', 'updateProfile']) }
 */
export function mapActions(actions: string[] | Record<string, string>): Record<string, Function> {
  const methods: Record<string, Function> = {}
  
  if (Array.isArray(actions)) {
    actions.forEach(name => {
      methods[name] = function(payload?: any) {
        const store = (this as any).$store
        if (store) {
          return store.dispatch(name, payload)
        }
        return Promise.reject(new Error('$store not found'))
      }
    })
  } else {
    Object.keys(actions).forEach(key => {
      methods[key] = function(payload?: any) {
        const store = (this as any).$store
        if (store) {
          return store.dispatch(actions[key], payload)
        }
        return Promise.reject(new Error('$store not found'))
      }
    })
  }
  
  return methods
}
