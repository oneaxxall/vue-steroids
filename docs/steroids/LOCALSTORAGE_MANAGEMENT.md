# Vue 2 LocalStorage Management

## 🎯 Overview

Vue 2 sekarang memiliki **Built-in Storage Manager** yang terintegrasi langsung! Mirip dengan library `store.js`, tapi dengan fitur tambahan seperti **real-time watch**, **data expiration**, **namespace support**, dan **memory fallback** jika storage tidak tersedia.

Tidak perlu install library tambahan - semuanya sudah ada di dalam Vue!

---

## ✨ Key Features

- ✅ **Simple API** - Mirip store.js, mudah digunakan
- ✅ **Auto JSON** - Otomatis serialize/deserialize JSON
- ✅ **Watch Changes** - Bisa watch perubahan storage per-key atau semua
- ✅ **Expiration** - Set TTL (Time-To-Live) untuk data otomatis expired
- ✅ **Namespace** - Support prefix untuk isolasi data
- ✅ **Session Storage** - Support sessionStorage selain localStorage
- ✅ **Memory Fallback** - Tetap jalan jika localStorage disabled
- ✅ **Size Check** - Cek ukuran storage yang digunakan
- ✅ **Global Access** - Akses via `Vue.storage` atau `this.$storage`
- ✅ **TypeScript** - Full type support

---

## 📖 Basic Usage

### Example 1: Simple Set/Get

```javascript
// Via Vue Global
Vue.storage.set('user', { name: 'John', age: 30 })
const user = Vue.storage.get('user')
console.log(user.name) // → 'John'

// Via Vue Instance
this.$storage.set('token', 'abc123')
const token = this.$storage.get('token')
console.log(token) // → 'abc123'
```

### Example 2: With Default Value

```javascript
// Jika key tidak ada, return default value
const theme = this.$storage.get('theme', 'light')
console.log(theme) // → 'light' (jika belum diset)
```

### Example 3: Remove & Clear

```javascript
// Remove specific key
this.$storage.remove('user')

// Clear all keys
this.$storage.clear()

// Clear only namespaced keys
const appStorage = Vue.createStorage({ namespace: 'myapp:' })
appStorage.clear() // Only clears 'myapp:*' keys
```

---

## 🔧 API Reference

### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get(key, default?)` | `string, any` | `any` | Get item from storage |
| `set(key, value, opts?)` | `string, any, object` | `void` | Set item to storage |
| `remove(key)` | `string` | `void` | Remove item from storage |
| `clear()` | - | `void` | Clear all items |
| `has(key)` | `string` | `boolean` | Check if key exists |
| `keys()` | - | `string[]` | Get all keys |
| `getAll()` | - | `object` | Get all items |
| `size()` | - | `number` | Get size in bytes |
| `setExpiring(key, value, ms)` | `string, any, number` | `void` | Set with expiration |
| `getExpiresIn(key)` | `string` | `number \| null` | Get remaining time (ms) |
| `watch(keyOrKeys, cb)` | `string/string[], function` | `function` | Watch for changes |
| `watchAll(cb)` | `function` | `function` | Watch all changes |
| `touch(key)` | `string` | `void` | Update created time |

### Options

```typescript
interface StorageOptions {
  type?: 'local' | 'session'        // Storage type (default: 'local')
  namespace?: string                 // Key prefix (e.g., 'app:')
  expires?: number                   // Expiration in ms (0 = never)
  serialize?: (value: any) => string // Custom serializer
  deserialize?: (value: string) => any // Custom deserializer
}
```

---

## 💡 Complete Examples

### Example 1: User Session Management

```javascript
new Vue({
  el: '#app',
  data: {
    user: null,
    isLoggedIn: false
  },
  
  mounted() {
    // Load user from storage
    this.user = this.$storage.get('user')
    this.isLoggedIn = !!this.user
    
    // Watch for user changes
    this.$storage.watch('user', (key, newUser) => {
      this.user = newUser
      this.isLoggedIn = !!newUser
      console.log('User updated:', newUser)
    })
  },
  
  methods: {
    async login(credentials) {
      const response = await this.post('/api/login', credentials)
      
      // Save user with expiration (24 hours)
      this.$storage.setExpiring('user', response.data.user, 86400000)
      this.$storage.set('token', response.data.token)
      
      this.isLoggedIn = true
    },
    
    logout() {
      this.$storage.remove('user')
      this.$storage.remove('token')
      this.user = null
      this.isLoggedIn = false
    }
  }
})
```

---

### Example 2: Theme Settings with Watch

```javascript
new Vue({
  el: '#app',
  data: {
    theme: 'light',
    fontSize: 14,
    sidebarCollapsed: false
  },
  
  mounted() {
    // Load settings
    const settings = this.$storage.get('settings', {})
    this.theme = settings.theme || 'light'
    this.fontSize = settings.fontSize || 14
    
    // Watch settings changes
    this.$storage.watch('settings', (key, newVal) => {
      if (newVal) {
        this.theme = newVal.theme
        this.fontSize = newVal.fontSize
        this.applySettings()
      }
    })
    
    this.applySettings()
  },
  
  methods: {
    saveSettings() {
      const settings = {
        theme: this.theme,
        fontSize: this.fontSize,
        sidebarCollapsed: this.sidebarCollapsed
      }
      
      this.$storage.set('settings', settings)
    },
    
    applySettings() {
      document.body.className = `theme-${this.theme}`
      document.body.style.fontSize = `${this.fontSize}px`
    }
  }
})
```

---

### Example 3: Shopping Cart with Expiration

```javascript
new Vue({
  el: '#app',
  data: {
    cart: [],
    total: 0
  },
  
  computed: {
    cartCount() {
      return this.cart.length
    }
  },
  
  mounted() {
    // Load cart (expires in 7 days)
    this.cart = this.$storage.get('cart') || []
    this.calculateTotal()
    
    // Watch cart changes
    this.$storage.watch('cart', (key, newCart) => {
      this.cart = newCart || []
      this.calculateTotal()
    })
  },
  
  methods: {
    addToCart(product) {
      this.cart.push({
        ...product,
        addedAt: Date.now()
      })
      
      // Save cart with 7-day expiration
      this.$storage.setExpiring('cart', this.cart, 604800000)
    },
    
    removeFromCart(index) {
      this.cart.splice(index, 1)
      this.$storage.setExpiring('cart', this.cart, 604800000)
    },
    
    clearCart() {
      this.cart = []
      this.$storage.remove('cart')
    },
    
    calculateTotal() {
      this.total = this.cart.reduce((sum, item) => sum + item.price, 0)
    }
  }
})
```

---

### Example 4: Multi-Tab Sync with Watch

```javascript
new Vue({
  el: '#app',
  data: {
    notifications: [],
    lastUpdate: null
  },
  
  mounted() {
    // Load notifications
    this.notifications = this.$storage.get('notifications') || []
    
    // Watch ALL storage changes (including from other tabs)
    this.$storage.watchAll((key, newVal, oldVal) => {
      console.log(`Storage changed: ${key}`)
      
      if (key === 'notifications') {
        this.notifications = newVal || []
        this.lastUpdate = new Date()
      }
    })
    
    // Check storage size periodically
    setInterval(() => {
      const size = this.$storage.size()
      if (size > 5 * 1024 * 1024) { // 5MB
        console.warn('Storage size is getting large:', size)
      }
    }, 60000)
  }
})
```

---

### Example 5: Namespace for Multi-App Support

```javascript
// App 1 Storage
const app1Storage = Vue.createStorage({
  namespace: 'app1:',
  type: 'local'
})

app1Storage.set('user', { name: 'John' })
// Stored as: 'app1:user'

// App 2 Storage
const app2Storage = Vue.createStorage({
  namespace: 'app2:',
  type: 'local'
})

app2Storage.set('user', { name: 'Jane' })
// Stored as: 'app2:user'

// Clear only app1 data
app1Storage.clear() // Only clears 'app1:*' keys
```

---

### Example 6: Custom Serializer

```javascript
// Use custom serialization (e.g., for Date objects)
const customStorage = Vue.createStorage({
  serialize: (value) => {
    return JSON.stringify(value, (key, val) => {
      if (val instanceof Date) {
        return { __type: 'Date', value: val.toISOString() }
      }
      return val
    })
  },
  deserialize: (str) => {
    return JSON.parse(str, (key, val) => {
      if (val && val.__type === 'Date') {
        return new Date(val.value)
      }
      return val
    })
  }
})

customStorage.set('event', {
  name: 'Meeting',
  date: new Date('2024-12-31')
})

const event = customStorage.get('event')
console.log(event.date instanceof Date) // → true
```

---

### Example 7: Check Storage Availability

```javascript
// Check if localStorage is available
const isAvailable = Vue.StorageManager.isAvailable('local')
console.log('localStorage available:', isAvailable)

// If not available, fallback to memory storage automatically
this.$storage.set('data', { foo: 'bar' })
// Works even if localStorage is disabled!
```

---

## 🔄 Watch System

### Watch Specific Key

```javascript
// Watch single key
const unwatch = Vue.storage.watch('user', (key, newVal, oldVal) => {
  console.log(`${key} changed:`, { old: oldVal, new: newVal })
})

// Watch multiple keys
Vue.storage.watch(['user', 'settings'], (key, newVal, oldVal) => {
  console.log(`${key} updated`)
})

// Stop watching
unwatch()
```

### Watch All Changes

```javascript
const unwatchAll = Vue.storage.watchAll((key, newVal, oldVal) => {
  console.log(`[ALL] ${key}:`, { old: oldVal, new: newVal })
})

// Stop watching all
unwatchAll()
```

### Cross-Tab Sync

```javascript
// Storage events automatically sync across tabs
// Tab 1:
Vue.storage.set('counter', 10)

// Tab 2: (will receive update)
Vue.storage.watch('counter', (key, newVal) => {
  console.log('Counter updated from another tab:', newVal)
})
```

---

## ⏰ Expiration System

### Set with Expiration

```javascript
// Expire in 1 hour
Vue.storage.setExpiring('token', 'abc123', 3600000)

// Expire in 24 hours
Vue.storage.setExpiring('session', userData, 86400000)

// Expire in 7 days
Vue.storage.set('cart', items, { expires: 604800000 })
```

### Check Expiration

```javascript
// Get remaining time
const remaining = Vue.storage.getExpiresIn('token')
console.log(remaining) // → 3500000 (ms)

// If expired, returns null
const token = Vue.storage.get('token')
if (token === null) {
  console.log('Token expired or not found')
}
```

### Auto-Remove Expired Items

```javascript
// Expired items are automatically removed when accessed
Vue.storage.setExpiring('temp', 'data', 1000) // 1 second

setTimeout(() => {
  const value = Vue.storage.get('temp')
  console.log(value) // → null (auto-removed)
}, 2000)
```

---

## 📂 Storage Types

### LocalStorage (Default)

```javascript
// Persistent across browser sessions
Vue.storage.set('user', { name: 'John' })

// Access via:
Vue.storage          // Default (localStorage)
this.$storage        // Instance method
Vue.LocalStorage     // Explicit
```

### SessionStorage

```javascript
// Cleared when tab/window closes
Vue.sessionStorage.set('temp', 'data')
this.$sessionStorage.set('temp', 'data')

// Or create custom:
const session = Vue.createStorage({ type: 'session' })
```

---

## ⚙️ Configuration

### Global Config

```javascript
// No global config needed - storage works out of the box
// But you can create custom instances with options:

const appStorage = Vue.createStorage({
  namespace: 'myapp:',
  type: 'local',
  expires: 3600000  // Default expiration (optional)
})
```

---

## 🐛 Troubleshooting

### Problem: "Storage not available"

**Solution:**
- Storage automatically falls back to memory storage
- Check with: `Vue.StorageManager.isAvailable('local')`
- If false, storage still works but data won't persist

### Problem: "QuotaExceededError"

**Solution:**
- Check storage size: `Vue.storage.size()`
- Clear old data: `Vue.storage.clear()`
- Remove specific keys: `Vue.storage.remove('key')`

### Problem: "Watch not triggering"

**Solution:**
- Watch only triggers for changes from OTHER tabs or direct API calls
- Setting and watching in same tab works, but may not fire immediately
- Use `watchAll` to catch all changes

### Problem: "Expired data not clearing"

**Solution:**
- Expired data is only removed when you try to `get()` it
- To force cleanup, iterate keys and check expiration:
  ```javascript
  Vue.storage.keys().forEach(key => {
    Vue.storage.get(key) // Triggers expiration check
  })
  ```

---

## 📊 Comparison with store.js

| Feature | store.js | Vue Storage |
|---------|----------|-------------|
| Basic CRUD | ✅ | ✅ |
| JSON Support | ✅ | ✅ |
| Watch Changes | ❌ | ✅ |
| Expiration | ❌ | ✅ |
| Namespace | ❌ | ✅ |
| Session Storage | ✅ | ✅ |
| Memory Fallback | ✅ | ✅ |
| Size Check | ❌ | ✅ |
| TypeScript | ⚠️ Partial | ✅ Full |
| Integration | External Plugin | ✅ Built-in |

---

## ✅ Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Basic CRUD | ✅ | get, set, remove, clear |
| JSON Support | ✅ | Auto serialize/deserialize |
| Watch Changes | ✅ | Per-key, multi-key, or watchAll |
| Expiration | ✅ | setExpiring, getExpiresIn |
| Namespace | ✅ | Custom prefix for keys |
| Session Storage | ✅ | sessionStorage support |
| Size Check | ✅ | Get storage size in bytes |
| Default Values | ✅ | get(key, defaultValue) |
| Touch | ✅ | Update created time |
| Memory Fallback | ✅ | If localStorage unavailable |
| Global Access | ✅ | `Vue.storage` or `this.$storage` |
| TypeScript | ✅ | Full type support |
| Cross-Tab Sync | ✅ | Via storage event listener |
| Custom Serializer | ✅ | serialize/deserialize options |

---

**Version**: Vue 2.7.16 + Storage Manager  
**Last Updated**: 2024
