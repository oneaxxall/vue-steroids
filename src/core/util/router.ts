import { debugLog } from './options'

/**
 * Built-in Lightweight Routing System
 * Provides reactive access to current route state and navigation methods
 */

export function initRouter(Vue: any) {
  // Use our new reactive system to create a global route store
  // We don't use 'reactive' global function here directly to avoid circularity
  // but we can use the same logic or just use Vue.observable
  
  const parseRoute = () => {
    const fullPath = window.location.pathname + window.location.search + window.location.hash
    const path = window.location.pathname
    const hash = window.location.hash
    const search = window.location.search
    
    // Parse query
    const query: Record<string, string> = {}
    const searchParams = new URLSearchParams(search)
    searchParams.forEach((value, key) => {
      query[key] = value
    })
    
    // Parse path segments (path1, path2, etc.)
    const segments = path.split('/').filter(Boolean)
    const segmentData: Record<string, string> = {}
    for (let i = 1; i <= 5; i++) {
      segmentData[`path${i}`] = segments[i - 1] || ''
    }
    
    return {
      path,
      hash,
      query,
      fullPath,
      segments,
      current: path,
      ...segmentData,
      // Placeholder for advanced router features
      params: {},
      meta: {},
      name: '',
      matched: [],
      redirectedFrom: null
    }
  }

  // Create the reactive route object
  // Since initReactive already set Vue.reactive, we can use it
  const routeState = Vue.reactive('route', parseRoute())

  /**
   * Navigation methods
   */
  const routerMethods = {
    push(location: string | object) {
      debugLog(`[Router] Push:`, location)
      if (typeof location === 'string') {
        window.history.pushState({}, '', location)
      } else {
        // Simple implementation for object-based navigation
        // In a real router this would handle { name, params, query }
        const loc = location as any
        let url = loc.path || window.location.pathname
        if (loc.query) {
          const params = new URLSearchParams(loc.query)
          url += '?' + params.toString()
        }
        if (loc.hash) url += loc.hash
        window.history.pushState({}, '', url)
      }
      updateRoute()
    },
    
    replace(location: string | object) {
      debugLog(`[Router] Replace:`, location)
      if (typeof location === 'string') {
        window.history.replaceState({}, '', location)
      } else {
        const loc = location as any
        let url = loc.path || window.location.pathname
        if (loc.query) {
          const params = new URLSearchParams(loc.query)
          url += '?' + params.toString()
        }
        if (loc.hash) url += loc.hash
        window.history.replaceState({}, '', url)
      }
      updateRoute()
    },
    
    back() {
      window.history.back()
    },
    
    forward() {
      window.history.forward()
    },
    
    go(n: number) {
      window.history.go(n)
    }
  }

  // Update function
  const updateRoute = () => {
    const newRoute = parseRoute()
    Object.keys(newRoute).forEach(key => {
      routeState[key] = (newRoute as any)[key]
    })
  }

  // Listen to browser events (Back/Forward)
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', updateRoute)
    window.addEventListener('hashchange', updateRoute)

    // IMPORTANT: Monkey-patch pushState and replaceState
    // Because browser doesn't trigger 'popstate' on manual history calls
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function(...args) {
      const result = originalPushState.apply(this, args)
      updateRoute()
      return result
    }

    window.history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args)
      updateRoute()
      return result
    }
  }

  // Expose as $route on prototype
  // We combine the state and the methods
  Object.defineProperty(Vue.prototype, '$route', {
    get() {
      // Use a Proxy to handle both reactive state and navigation methods
      return new Proxy(routeState, {
        get(target, prop) {
          if (prop in routerMethods) {
            return (routerMethods as any)[prop]
          }
          return target[prop]
        }
      })
    }
  })

  // Also expose Vue.router for global access
  Vue.router = routerMethods
}
