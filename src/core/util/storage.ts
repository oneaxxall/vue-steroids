import { warn } from './debug'
import { debugLog } from './options'

/**
 * Vue 2 Built-in Storage Manager
 * Similar to store.js with additional features like watch and expiration
 * Inspired by: https://github.com/marcuswestin/store.js
 */

export type StorageType = 'local' | 'session'

export interface StorageOptions {
  /**
   * Storage type (default: 'local')
   */
  type?: StorageType

  /**
   * Namespace prefix for keys (e.g., 'app:' → 'app:user')
   */
  namespace?: string

  /**
   * Expiration time in milliseconds (0 = no expiration)
   */
  expires?: number

  /**
   * Serializer function (default: JSON.stringify)
   */
  serialize?: (value: any) => string

  /**
   * Deserializer function (default: JSON.parse)
   */
  deserialize?: (value: string) => any
}

export interface StoredItem {
  value: any
  expires: number | null
  created: number
}

export type StorageWatchCallback = (key: string, newVal: any, oldVal: any) => void

/**
 * Get storage engine
 */
function getEngine(type: StorageType = 'local'): Storage {
  try {
    const storage = type === 'local' ? window.localStorage : window.sessionStorage
    // Test if storage is available
    const testKey = '__vue_storage_test__'
    storage.setItem(testKey, 'test')
    storage.removeItem(testKey)
    return storage
  } catch (e) {
    warn(`[Storage] ${type}Storage is not available: ${e}`)
    // Fallback to in-memory storage
    const memory: Record<string, string> = {}
    return {
      getItem: (key: string) => memory[key] || null,
      setItem: (key: string, value: string) => { memory[key] = value },
      removeItem: (key: string) => { delete memory[key] },
      clear: () => { Object.keys(memory).forEach(k => delete memory[k]) },
      key: (index: number) => Object.keys(memory)[index],
      length: Object.keys(memory).length
    } as Storage
  }
}

/**
 * Watchers registry
 */
const watchers: Record<string, StorageWatchCallback[]> = {}
let watchInitialized = false

/**
 * Initialize storage event listener for cross-tab sync
 */
function initWatch() {
  if (watchInitialized) return
  
  watchInitialized = true
  
  // Listen to storage events from other tabs
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key) {
      notifyWatchers(e.key, e.newValue, e.oldValue)
    }
  })
}

/**
 * Notify all watchers for a key
 */
function notifyWatchers(key: string, newVal: string | null, oldVal: string | null) {
  const callbacks = watchers[key] || []
  callbacks.forEach(cb => {
    try {
      const parsedNew = newVal !== null ? JSON.parse(newVal) : null
      const parsedOld = oldVal !== null ? JSON.parse(oldVal) : null
      cb(key, parsedNew, parsedOld)
    } catch (e) {
      cb(key, newVal, oldVal)
    }
  })
  
  // Also notify global watchers (wildcard)
  const globalCallbacks = watchers['*'] || []
  globalCallbacks.forEach(cb => {
    try {
      const parsedNew = newVal !== null ? JSON.parse(newVal) : null
      const parsedOld = oldVal !== null ? JSON.parse(oldVal) : null
      cb(key, parsedNew, parsedOld)
    } catch (e) {
      cb(key, newVal, oldVal)
    }
  })
}

/**
 * Resolve key with namespace
 */
function resolveKey(key: string, namespace?: string): string {
  return namespace ? `${namespace}${key}` : key
}

/**
 * Get all keys with namespace
 */
function getAllKeys(storage: Storage, namespace?: string): string[] {
  const keys: string[] = []
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key) {
      if (namespace && key.startsWith(namespace)) {
        keys.push(key.slice(namespace.length))
      } else if (!namespace && !key.startsWith('__')) {
        keys.push(key)
      }
    }
  }
  return keys
}

/**
 * Check if item is expired
 */
function isExpired(item: StoredItem): boolean {
  if (!item.expires) return false
  return Date.now() > item.expires
}

/**
 * Storage Manager Class
 */
class StorageManager {
  private _storage: Storage
  private _namespace: string = ''
  private _serialize: (value: any) => string
  private _deserialize: (value: string) => any

  constructor(options: StorageOptions = {}) {
    this._storage = getEngine(options.type || 'local')
    this._namespace = options.namespace || ''
    this._serialize = options.serialize || JSON.stringify
    this._deserialize = options.deserialize || JSON.parse
  }

  /**
   * Get item from storage
   */
  get<T = any>(key: string, defaultValue?: T): T | null {
    const fullKey = resolveKey(key, this._namespace)
    const raw = this._storage.getItem(fullKey)
    
    if (raw === null) {
      return defaultValue !== undefined ? defaultValue : null
    }

    try {
      const item: StoredItem = this._deserialize(raw)
      
      // Check expiration
      if (isExpired(item)) {
        this.remove(key)
        return defaultValue !== undefined ? defaultValue : null
      }

      return item.value as T
    } catch (e) {
      warn(`[Storage] Failed to deserialize "${key}": ${e}`)
      return raw as any
    }
  }

  /**
   * Set item to storage
   */
  set(key: string, value: any, options?: { expires?: number }): void {
    const fullKey = resolveKey(key, this._namespace)
    const oldRaw = this._storage.getItem(fullKey)

    const item: StoredItem = {
      value,
      expires: options?.expires ? Date.now() + options.expires : null,
      created: Date.now()
    }

    try {
      const serialized = this._serialize(item)
      this._storage.setItem(fullKey, serialized)
      debugLog(`[Storage] Set: ${key}`)
      
      // Notify watchers
      notifyWatchers(key, serialized, oldRaw)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        warn(`[Storage] Quota exceeded for key "${key}"`)
      } else {
        warn(`[Storage] Failed to set "${key}": ${e}`)
      }
    }
  }

  /**
   * Remove item from storage
   */
  remove(key: string): void {
    const fullKey = resolveKey(key, this._namespace)
    const oldRaw = this._storage.getItem(fullKey)
    this._storage.removeItem(fullKey)
    debugLog(`[Storage] Removed: ${key}`)
    
    // Notify watchers
    notifyWatchers(key, null, oldRaw)
  }

  /**
   * Clear all items (with namespace support)
   */
  clear(): void {
    if (this._namespace) {
      // Only clear namespaced keys
      const keys = getAllKeys(this._storage)
      keys.forEach(key => this.remove(key))
    } else {
      this._storage.clear()
    }
    debugLog('[Storage] Cleared')
  }

  /**
   * Get all items
   */
  getAll<T = any>(): Record<string, T> {
    const result: Record<string, T> = {}
    const keys = getAllKeys(this._storage, this._namespace)
    
    keys.forEach(key => {
      const value = this.get<T>(key)
      if (value !== null) {
        result[key] = value
      }
    })
    
    return result
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const value = this.get(key)
    return value !== null
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return getAllKeys(this._storage, this._namespace)
  }

  /**
   * Get storage size in bytes
   */
  size(): number {
    let total = 0
    for (let i = 0; i < this._storage.length; i++) {
      const key = this._storage.key(i)
      if (key && (!this._namespace || key.startsWith(this._namespace))) {
        total += (this._storage.getItem(key) || '').length * 2 // UTF-16
      }
    }
    return total
  }

  /**
   * Set with expiration
   */
  setExpiring(key: string, value: any, milliseconds: number): void {
    this.set(key, value, { expires: milliseconds })
  }

  /**
   * Get remaining time until expiration
   */
  getExpiresIn(key: string): number | null {
    const fullKey = resolveKey(key, this._namespace)
    const raw = this._storage.getItem(fullKey)
    
    if (!raw) return null

    try {
      const item: StoredItem = this._deserialize(raw)
      if (!item.expires) return null
      
      const remaining = item.expires - Date.now()
      return remaining > 0 ? remaining : null
    } catch (e) {
      return null
    }
  }

  /**
   * Touch key (update created time)
   */
  touch(key: string): void {
    const value = this.get(key)
    if (value !== null) {
      const fullKey = resolveKey(key, this._namespace)
      const raw = this._storage.getItem(fullKey)
      
      if (!raw) return
      
      try {
        const item: StoredItem = this._deserialize(raw)
        item.created = Date.now()
        this._storage.setItem(fullKey, this._serialize(item))
      } catch (e) {
        warn(`[Storage] Failed to touch "${key}": ${e}`)
      }
    }
  }

  /**
   * Watch for changes
   */
  watch(keyOrKeys: string | string[], callback: StorageWatchCallback): () => void {
    initWatch()

    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]

    keys.forEach(key => {
      if (!watchers[key]) {
        watchers[key] = []
      }
      watchers[key].push(callback)
    })

    // Return unwatch function
    return () => {
      keys.forEach(key => {
        if (watchers[key]) {
          const index = watchers[key].indexOf(callback)
          if (index > -1) {
            watchers[key].splice(index, 1)
          }
        }
      })
    }
  }

  /**
   * Watch all changes
   */
  watchAll(callback: StorageWatchCallback): () => void {
    initWatch()

    if (!watchers['*']) {
      watchers['*'] = []
    }
    watchers['*'].push(callback)

    return () => {
      if (watchers['*']) {
        const index = watchers['*'].indexOf(callback)
        if (index > -1) {
          watchers['*'].splice(index, 1)
        }
      }
    }
  }

  /**
   * Get storage engine
   */
  getEngine(): Storage {
    return this._storage
  }

  /**
   * Check if storage is available
   */
  static isAvailable(type: StorageType = 'local'): boolean {
    try {
      const testKey = '__vue_storage_test__'
      const storage = type === 'local' ? window.localStorage : window.sessionStorage
      storage.setItem(testKey, 'test')
      storage.removeItem(testKey)
      return true
    } catch (e) {
      return false
    }
  }
}

/**
 * Create storage instance
 */
export function createStorage(options?: StorageOptions): StorageManager {
  return new StorageManager(options)
}

/**
 * Default instances
 */
export const LocalStorage = new StorageManager({ type: 'local' })
export const SessionStorage = new StorageManager({ type: 'session' })

/**
 * Install Storage plugin
 */
export function installStorage(Vue: any): void {
  // Expose to Vue global
  Vue.storage = LocalStorage
  Vue.sessionStorage = SessionStorage
  Vue.createStorage = createStorage

  // Add to Vue prototype
  Vue.prototype.$storage = LocalStorage
  Vue.prototype.$sessionStorage = SessionStorage

  // Expose StorageManager class
  Vue.StorageManager = StorageManager

  debugLog('[Storage] Plugin installed')
}
