import { debugLog } from './options'

/**
 * Global Reactive Store System
 * Uses a hidden Vue instance for robust reactivity and watching
 */

const reactiveRegistry: Record<string, any> = {}
let VueInstance: any = null

export function initReactive(Vue: any) {
  VueInstance = Vue

  /**
   * Helper to create a robust reactive store using a hidden VM
   */
  const createStore = (initialValue: any) => {
    // Execute factory function if provided
    const data = typeof initialValue === 'function' ? initialValue() : initialValue
    
    // Use a hidden Vue instance to host the state
    // This is the most reliable way to get perfect reactivity in Vue 2
    const vm = new VueInstance({
      data: {
        state: data
      }
    })

    // The reactive object is now vm.state
    const store = vm.state
    
    // Add watch method that leverages native vm.$watch
    Object.defineProperty(store, 'watch', {
      value: function(path: string, cb: Function, options: any = {}) {
        // Support passing 'deep' as a boolean for backward compatibility
        const watchOptions: any = typeof options === 'boolean' ? { deep: options } : { ...options }
        
        // Force synchronous execution for snappy standalone behavior
        watchOptions.sync = true
        
        // Watch the property inside our hidden VM
        // We prefix with 'state.' because the data is wrapped in the 'state' property
        return vm.$watch('state.' + path, cb, watchOptions)
      },
      enumerable: false,
      configurable: true
    })

    return store
  }

  /**
   * Global reactive function (Polymorphic)
   * @param nameOrValue - Unique name (String) or Object for standard reactivity
   * @param initialValue - Initial data object (only for Named Store)
   * @param options - Configuration options
   */
  const reactiveFn = function(nameOrValue: any, initialValue?: any, options: any = {}) {
    // Case 1: Named Store (Global & Integrated)
    if (typeof nameOrValue === 'string' && initialValue !== undefined) {
      debugLog(`[Reactive] Creating named reactive store: ${nameOrValue}`)
      const store = createStore(initialValue)
      reactiveRegistry[nameOrValue] = store
      return store
    } 
    
    // Case 2: Anonymous Reactive Object (Local only, but with .watch support)
    debugLog(`[Reactive] Creating anonymous reactive object`)
    return createStore(nameOrValue)
  }

  // Expose on window if available
  if (typeof window !== 'undefined') {
    ;(window as any).reactive = reactiveFn
  }

  // Expose on Vue globally
  Vue.reactive = reactiveFn

  // Setup this.$reactive proxy on prototype
  Object.defineProperty(Vue.prototype, '$reactive', {
    get() {
      return new Proxy(reactiveRegistry, {
        get(target, prop) {
          if (typeof prop === 'string') {
            return target[prop] || {}
          }
          return undefined
        }
      })
    }
  })
}
