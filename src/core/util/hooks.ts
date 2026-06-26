import type { Component } from 'types/component'
import { warn } from './debug'
import { debugLog } from './options'

/**
 * Vue 2 Built-in Hooks / Composables Helpers
 * Similar to VueUse but integrated into Vue 2 prototype
 */

/**
 * Initialize hooks option
 */
export function initHooks(vm: Component): void {
  const hooks = vm.$options.hooks
  
  if (typeof hooks === 'function') {
    // Execute hooks with component context
    hooks.call(vm)
  } else if (Array.isArray(hooks)) {
    hooks.forEach((hook: Function) => {
      hook.call(vm)
    })
  }
}

/**
 * Helper: Patch lifecycle hook safely
 */
function patchLifecycleHook(vm: any, hookName: string, callback: Function): void {
  const existing = vm.$options[hookName]
  
  if (!existing) {
    vm.$options[hookName] = [callback]
  } else if (Array.isArray(existing)) {
    existing.push(callback)
  } else {
    // If it's a single function, convert to array
    vm.$options[hookName] = [existing, callback]
  }
}

/**
 * Install Hooks Plugin
 */
export function installHooks(Vue: any): void {
  // 1. onClickOutside
  Vue.prototype.onClickOutside = function(refName: string, handler: Function) {
    debugLog(`[Hooks] Registering onClickOutside for ref: ${refName}`)
    
    // We must wait for mounted because $refs are only available then
    patchLifecycleHook(this, 'mounted', () => {
      debugLog(`[Hooks] mounted hook triggered for onClickOutside: ${refName}`)
      
      const ref = this.$refs[refName]
      if (!ref) {
        warn(`[Hooks] Ref "${refName}" not found for onClickOutside in component: ${this.$options.name || 'root'}`)
        return
      }

      const el = (ref as any).$el || ref
      debugLog(`[Hooks] Element found for ref "${refName}":`, el)
      
      const listener = (e: MouseEvent) => {
        // If element is removed or not in document, don't trigger
        if (!el || !document.contains(el)) return
        
        // Check if click was outside the element and its children
        if (el !== e.target && !el.contains(e.target as Node)) {
          debugLog(`[Hooks] Click detected outside "${refName}", triggering handler`)
          handler.call(this, e)
        }
      }

      document.addEventListener('click', listener)
      debugLog(`[Hooks] Click listener attached for "${refName}" (immediate)`)

      patchLifecycleHook(this, 'beforeDestroy', () => {
        document.removeEventListener('click', listener)
        debugLog(`[Hooks] Click listener removed for "${refName}"`)
      })
    })
  }

  // 2. onWindowResize
  Vue.prototype.onWindowResize = function(handler: Function, options?: { immediate?: boolean }) {
    const listener = () => handler.call(this)
    window.addEventListener('resize', listener)
    
    if (options?.immediate) {
      handler.call(this)
    }

    patchLifecycleHook(this, 'beforeDestroy', () => {
      window.removeEventListener('resize', listener)
    })
  }

  // 3. onScroll
  Vue.prototype.onScroll = function(selector: string | Element, handler: Function) {
    this.$nextTick(() => {
      let target: Element | null = null
      
      if (typeof selector === 'string') {
        target = document.querySelector(selector)
      } else {
        target = selector
      }

      if (!target) {
        warn(`[Hooks] Scroll target not found: ${selector}`)
        return
      }

      const listener = (e: Event) => handler.call(this, e)
      target.addEventListener('scroll', listener)

      patchLifecycleHook(this, 'beforeDestroy', () => {
        target!.removeEventListener('scroll', listener)
      })
    })
  }

  // 4. onKeyPress
  Vue.prototype.onKeyPress = function(key: string, handler: Function) {
    const listener = (e: KeyboardEvent) => {
      if (e.key === key || e.code === key) {
        handler.call(this, e)
      }
    }

    window.addEventListener('keydown', listener)
    
    patchLifecycleHook(this, 'beforeDestroy', () => {
      window.removeEventListener('keydown', listener)
    })
  }

  // 5. onEscape (Shorthand for onKeyPress)
  Vue.prototype.onEscape = function(handler: Function) {
    this.onKeyPress('Escape', handler)
  }

  // 6. useDebounce (Returns debounced function)
  Vue.prototype.useDebounce = function(fn: Function, delay: number = 300): Function {
    let timeout: any
    return function(this: any, ...args: any[]) {
      clearTimeout(timeout)
      timeout = setTimeout(() => fn.apply(this, args), delay)
    }
  }

  // 7. useThrottle (Returns throttled function)
  Vue.prototype.useThrottle = function(fn: Function, delay: number = 300): Function {
    let lastCall = 0
    return function(this: any, ...args: any[]) {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        return fn.apply(this, args)
      }
    }
  }
}
