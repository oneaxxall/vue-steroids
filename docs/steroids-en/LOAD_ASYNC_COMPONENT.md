# loadAsyncComponent Documentation

## 🎯 Overview

`loadAsyncComponent` is a method for **loading dynamic components from custom paths** with full control. Unlike `fetchDynamicComponent` which uses `config.componentPath`, this method does **NOT** use a base path - you have full control over the path.

However, this method **still uses** `config.componentExtension` to auto-append the extension to the path (can be disabled if needed).

---

## ✨ Key Features

- ✅ **Custom Path Control** - No base path, the path is entirely up to you
- ✅ **Auto Extension** - Automatically appends extension from `config.componentExtension`
- ✅ **CDN/External Support** - Can load from any URL
- ✅ **Override Extension** - Can use a different extension from config for specific components
- ✅ **Callbacks** - Supports `onSuccess` and `onError` callbacks
- ✅ **Fallback Component** - Auto fallback if file not found
- ✅ **No Double Extension** - Checks before appending extension

---

## 📖 Basic Usage

### Example 1: Simple Load

```javascript
// Setup config (optional, for extension)
Vue.config.componentExtension = '.tpl'

// Load component from custom path
await this.loadAsyncComponent('my-comp', '/custom/path/component')

// Result: /custom/path/component.tpl
// Component now available: <my-comp></my-comp>
```

### Example 2: Load from CDN

```javascript
// Load from CDN/external server
await this.loadAsyncComponent(
  'google-map',
  'https://cdn.example.com/components/google-map'
)

// Result: https://cdn.example.com/components/google-map.tpl
```

### Example 3: With Options

```javascript
await this.loadAsyncComponent('my-comp', '/path/component', {
  extension: '.vue',              // Override default extension
  autoAppendExtension: true,      // Enable/disable auto-append
  fallbackComponent: 'notfound',  // Fallback if failed
  onSuccess: (name, def) => {     // Callback on success
    console.log(`✅ ${name} loaded!`)
  },
  onError: (name, error) => {     // Callback on failure
    console.error(`❌ ${name} failed:`, error)
  }
})
```

---

## 🔧 API Reference

### Method Signature

```typescript
this.loadAsyncComponent(
  name: string,
  path: string,
  options?: AsyncComponentOptions
): Promise<boolean>
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | ✅ Yes | Component name to register |
| `path` | `string` | ✅ Yes | Custom path (can be relative, absolute, or full URL) |
| `options` | `Object` | ❌ No | Additional options |

### Options

```typescript
interface AsyncComponentOptions {
  extension?: string                    // Custom file extension (default: from config)
  autoAppendExtension?: boolean         // Auto append extension (default: true)
  fallbackComponent?: string            // Fallback component name
  onSuccess?: (name, def) => void       // Success callback
  onError?: (name, error) => void       // Error callback
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `extension` | `string` | `config.componentExtension` | Custom file extension |
| `autoAppendExtension` | `boolean` | `true` | Enable/disable auto-append extension |
| `fallbackComponent` | `string` | `config.componentFallback` | Fallback component on failure |
| `onSuccess` | `function` | `undefined` | Callback on successful load |
| `onError` | `function` | `undefined` | Callback on load failure |

---

## 💡 Complete Examples

### Example 1: Basic Load with Auto-Extension

```javascript
new Vue({
  el: '#app',
  methods: {
    async loadComponents() {
      // Config extension
      Vue.config.componentExtension = '.tpl'

      // Load without extension in path - automatically appended
      await this.loadAsyncComponent('user-card', '/components/user-card')
      
      // Path becomes: /components/user-card.tpl
    }
  }
})
```

### Example 2: Load Multiple Components

```javascript
new Vue({
  el: '#app',
  methods: {
    async loadAllComponents() {
      const components = [
        { name: 'header', path: '/layout/header' },
        { name: 'sidebar', path: '/layout/sidebar' },
        { name: 'footer', path: '/layout/footer' }
      ]

      // Load sequential
      for (const comp of components) {
        await this.loadAsyncComponent(comp.name, comp.path)
      }

      console.log('All components loaded!')
    }
  }
})
```

### Example 3: Load from CDN

```javascript
new Vue({
  el: '#app',
  methods: {
    async loadCDNComponent() {
      // Load from external CDN
      const success = await this.loadAsyncComponent(
        'stripe-checkout',
        'https://cdn.stripe.com/components/checkout'
      )

      if (success) {
        console.log('✅ Stripe component loaded from CDN!')
      } else {
        console.log('❌ Failed to load from CDN')
      }
    }
  }
})
```

### Example 4: Custom Extension Override

```javascript
new Vue({
  el: '#app',
  methods: {
    async loadVueComponent() {
      // Use .vue instead of .tpl
      await this.loadAsyncComponent(
        'date-picker',
        '/components/date-picker',
        { extension: '.vue' }
      )

      // Result: /components/date-picker.vue
    }
  }
})
```

### Example 5: Disable Auto-Extension

```javascript
new Vue({
  el: '#app',
  methods: {
    async loadExactPath() {
      // Path already complete, don't want extension appended
      await this.loadAsyncComponent(
        'complete-component',
        '/components/complete.tpl',
        { autoAppendExtension: false }
      )

      // Result: /components/complete.tpl (exactly as written)
    }
  }
})
```

### Example 6: With Callbacks

```javascript
new Vue({
  el: '#app',
  methods: {
    async loadWithCallbacks() {
      await this.loadAsyncComponent('user-profile', '/components/user-profile', {
        onSuccess: (name, componentDef) => {
          console.log(`✅ ${name} loaded successfully!`)
          console.log('Component definition:', componentDef)
          
          // Show success notification
          this.showNotification('success', `${name} loaded!`)
        },
        
        onError: (name, error) => {
          console.error(`❌ Failed to load ${name}:`, error)
          
          // Show error notification
          this.showNotification('error', `Failed to load ${name}`)
        }
      })
    }
  }
})
```

### Example 7: With Fallback

```javascript
new Vue({
  el: '#app',
  methods: {
    async loadWithFallback() {
      // If file doesn't exist, fallback component will be used
      await this.loadAsyncComponent(
        'premium-widget',
        '/premium/premium-widget',
        {
          fallbackComponent: 'free-widget',
          onSuccess: () => {
            console.log('Premium widget loaded!')
          },
          onError: (name, error) => {
            console.warn(`${name} not found, using fallback`)
          }
        }
      )
    }
  }
})
```

### Example 8: Conditional Loading

```javascript
new Vue({
  el: '#app',
  data: {
    userRole: 'admin',
    componentLoaded: false
  },
  
  async mounted() {
    // Load role-specific component
    if (this.userRole === 'admin') {
      await this.loadAsyncComponent('admin-dashboard', '/admin/dashboard')
    } else {
      await this.loadAsyncComponent('user-dashboard', '/user/dashboard')
    }
    
    this.componentLoaded = true
  }
})
```

### Example 9: Lazy Load on Demand

```javascript
new Vue({
  el: '#app',
  data: {
    showEditor: false,
    editorLoaded: false
  },
  
  methods: {
    async openEditor() {
      if (!this.editorLoaded) {
        // Load only when needed
        await this.loadAsyncComponent('code-editor', '/editors/code')
        this.editorLoaded = true
      }
      
      this.showEditor = true
    }
  }
})
```

### Example 10: Error Handling with Retry

```javascript
new Vue({
  el: '#app',
  methods: {
    async loadWithRetry() {
      const maxRetries = 3
      
      for (let i = 1; i <= maxRetries; i++) {
        const success = await this.loadAsyncComponent('payment-gateway', '/payment/gateway', {
          onError: (name, error) => {
            console.warn(`Attempt ${i} failed for ${name}:`, error.message)
          }
        })
        
        if (success) {
          console.log(`✅ Loaded after ${i} attempt(s)`)
          return
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * i))
      }
      
      console.error(`❌ Failed after ${maxRetries} attempts`)
    }
  }
})
```

---

## 🔄 Comparison with fetchDynamicComponent

| Feature | `fetchDynamicComponent` | `loadAsyncComponent` |
|---------|------------------------|---------------------|
| **Base Path** | ✅ Uses `config.componentPath` | ❌ None |
| **Extension** | ✅ Auto from config | ✅ Auto from config |
| **Path Control** | ⚠️ Relative to base | ✅ Full control |
| **CDN/External** | ⚠️ Limited | ✅ Full support |
| **Use Case** | Internal components | Custom/external paths |

### Example Comparison:

```javascript
// Config
Vue.config.componentPath = '/components'
Vue.config.componentExtension = '.tpl'

// fetchDynamicComponent - Uses base path
await this.fetchDynamicComponent('input', '/input/input-text')
// Result: /components/input/input-text.tpl

// loadAsyncComponent - Custom path
await this.loadAsyncComponent('input', '/custom/input-text')
// Result: /custom/input-text.tpl

// loadAsyncComponent - Full URL
await this.loadAsyncComponent('input', 'https://cdn.com/input-text')
// Result: https://cdn.com/input-text.tpl
```

---

## ⚙️ Configuration

### Global Config

```javascript
// Set default extension (used by loadAsyncComponent)
Vue.config.componentExtension = '.tpl'  // Default: .tpl

// Set fallback component
Vue.config.componentFallback = 'component-notfound'

// Enable dev logging
Vue.config.devtools = true
```

### Override Per-Component

```javascript
// Override extension
await this.loadAsyncComponent('comp', '/path/comp', {
  extension: '.vue'  // Use .vue instead of .tpl
})

// Disable auto-extension
await this.loadAsyncComponent('comp', '/path/comp.tpl', {
  autoAppendExtension: false
})
```

---

## 📂 Path Resolution Examples

| Config | Path Input | Result |
|--------|-----------|--------|
| `extension: '.tpl'` | `/components/button` | `/components/button.tpl` |
| `extension: '.tpl'` | `/components/button.tpl` | `/components/button.tpl` (no double) |
| `extension: '.vue'` | `/components/button` | `/components/button.vue` |
| `extension: '.tpl'` | `https://cdn.com/comp` | `https://cdn.com/comp.tpl` |
| `extension: '.tpl'`, `autoAppendExtension: false` | `/path/comp` | `/path/comp` (no change) |

---

## ⚠️ Best Practices

### 1. Use Meaningful Names

```javascript
// ✅ GOOD
await this.loadAsyncComponent('user-profile-card', '/components/user-profile')

// ❌ BAD
await this.loadAsyncComponent('comp1', '/path/file')
```

### 2. Handle Errors Properly

```javascript
// ✅ GOOD - With error handling
try {
  const success = await this.loadAsyncComponent('payment', '/payment/checkout', {
    onError: (name, error) => {
      this.showError(`Failed to load ${name}`)
    }
  })
  
  if (!success) {
    this.showFallback()
  }
} catch (error) {
  console.error('Unexpected error:', error)
}

// ❌ BAD - No error handling
await this.loadAsyncComponent('payment', '/payment/checkout')
```

### 3. Preload Critical Components

```javascript
// ✅ GOOD - Preload in mounted
async mounted() {
  // Load critical components upfront
  await Promise.all([
    this.loadAsyncComponent('header', '/layout/header'),
    this.loadAsyncComponent('nav', '/layout/nav')
  ])
}

// ❌ BAD - Load when needed (can delay UX)
async showHeader() {
  await this.loadAsyncComponent('header', '/layout/header')
}
```

### 4. Lazy Load Non-Critical Components

```javascript
// ✅ GOOD - Lazy load
async openSettings() {
  if (!this.settingsLoaded) {
    await this.loadAsyncComponent('settings', '/modals/settings')
    this.settingsLoaded = true
  }
  this.showSettings = true
}
```

### 5. Use CDN for Third-Party Components

```javascript
// ✅ GOOD - Load from CDN
await this.loadAsyncComponent(
  'google-maps',
  'https://cdn.example.com/maps/google-maps'
)
```

---

## 🐛 Troubleshooting

### Problem: "Component not found"

**Solution:**
- Check if the path is correct
- Check if file exists on server
- Check console for error messages
- Enable devtools: `Vue.config.devtools = true`

### Problem: "Double extension (.tpl.tpl)"

**Solution:**
- Path already has extension, disable auto-append:
```javascript
await this.loadAsyncComponent('comp', '/path/comp.tpl', {
  autoAppendExtension: false
})
```

### Problem: "Extension not appending"

**Solution:**
- Make sure `autoAppendExtension` is not set to `false`:
```javascript
// Default true - will auto-append
await this.loadAsyncComponent('comp', '/path/comp')

// Don't set this:
// { autoAppendExtension: false }
```

### Problem: "Load from CDN failed"

**Solution:**
- Check CORS policy
- Check if URL is correct
- Check network tab in DevTools
- Make sure CDN serves correct content type

---

## 📊 Return Value

Method returns `Promise<boolean>`:

```javascript
const success = await this.loadAsyncComponent('my-comp', '/path/comp')

if (success) {
  // ✅ Component loaded and registered
  // <my-comp></my-comp> will render
} else {
  // ❌ Failed to load
  // Fallback component will be used
}
```

---

## ✅ Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Custom path | ✅ | No base path restriction |
| Auto extension | ✅ | From `config.componentExtension` |
| Override extension | ✅ | Per-component basis |
| Disable extension | ✅ | `autoAppendExtension: false` |
| CDN/External | ✅ | Full URL support |
| Callbacks | ✅ | `onSuccess`, `onError` |
| Fallback | ✅ | Auto fallback on error |
| Multiple loads | ✅ | Sequential or parallel |
| Dev logging | ✅ | When `devtools: true` |

---

**Version**: Vue 2.7.16 + loadAsyncComponent  
**Last Updated**: 2024
