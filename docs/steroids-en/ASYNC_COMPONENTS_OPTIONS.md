# Vue 2 Async Components Options

## 🎯 Overview

Vue 2 now has an **`asyncComponents`** option that allows you to define components that need to be loaded asynchronously **directly within the component definition**. This is a very convenient way to lazy-load dependencies without needing to call `loadAsyncComponent()` manually.

---

## ✨ Key Features

- ✅ **Auto-load** - Components are automatically loaded when the component is created
- ✅ **Inline Definition** - Definition directly in component options
- ✅ **Flexible Format** - Supports string, object, or mixed array
- ✅ **Auto Naming** - Component name automatically derived from path
- ✅ **Callbacks** - Supports `onSuccess` and `onError`
- ✅ **Fallback** - Fallback component if loading fails
- ✅ **Extension Auto-Append** - Automatically appends extension from config

---

## 📖 Basic Usage

### Example 1: Simple String Array

```javascript
Vue.component('my-page', {
  data: function() {
    return {
      title: 'My Page'
    }
  },
  
  template: `
    <div>
      <h1>{{ title }}</h1>
      <input-text></input-text>
      <button-primary></button-primary>
    </div>
  `,
  
  // Async components will auto-load when component is created
  asyncComponents: [
    '/components/input/input-text',
    '/components/button/button-primary'
  ]
})
```

**How it Works:**
1. Component `my-page` is created
2. Vue automatically loads: `/components/input/input-text.tpl`
3. Vue automatically loads: `/components/button/button-primary.tpl`
4. Components `<input-text>` and `<button-primary>` are available for rendering

---

### Example 2: Object Array with Callbacks

```javascript
Vue.component('dashboard', {
  data: function() {
    return {
      userRole: 'admin'
    }
  },
  
  template: `
    <div>
      <admin-header></admin-header>
      <stats-widget></stats-widget>
      <user-table></user-table>
    </div>
  `,
  
  asyncComponents: [
    {
      name: 'admin-header',
      path: '/layout/admin-header',
      extension: '.vue',
      onSuccess: function(name, componentDef) {
        console.log(`✅ ${name} loaded successfully!`)
      },
      onError: function(name, error) {
        console.error(`❌ ${name} failed:`, error)
      }
    },
    {
      name: 'stats-widget',
      path: '/widgets/stats',
      fallbackComponent: 'widget-fallback'
    },
    {
      name: 'user-table',
      path: '/tables/user-table',
      autoAppendExtension: false // Path already complete
    }
  ]
})
```

---

### Example 3: Mixed Format

```javascript
Vue.component('mixed-example', {
  template: `
    <div>
      <simple-comp></simple-comp>
      <advanced-comp></advanced-comp>
    </div>
  `,
  
  asyncComponents: [
    // String format - simple
    '/components/simple-comp',
    
    // Object format - advanced
    {
      name: 'advanced-comp',
      path: '/advanced/component',
      extension: '.tpl',
      onError: function(name, error) {
        console.error('Failed:', name, error)
      }
    }
  ]
})
```

---

## 🔧 API Reference

### Option Signature

```typescript
asyncComponents: Array<string | AsyncComponentOptions>
```

### String Format

```javascript
asyncComponents: [
  '/path/to/component-name'
  // Name auto-derived: 'component-name' (last segment)
]
```

### Object Format

```typescript
interface AsyncComponentOptions {
  name?: string                              // Component name (required if auto-detect fails)
  path: string                               // Path to component file
  extension?: string                         // Custom extension (default: from config)
  autoAppendExtension?: boolean              // Auto append extension (default: true)
  fallbackComponent?: string                 // Fallback component on failure
  onSuccess?: (name, def) => void            // Callback on success
  onError?: (name, error) => void            // Callback on failure
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | ⚠️ Optional | Component name. Auto-detect from path if not provided |
| `path` | `string` | ✅ Required | Path to component file |
| `extension` | `string` | ❌ Optional | Custom extension (default: from `config.componentExtension`) |
| `autoAppendExtension` | `boolean` | ❌ Optional | Enable/disable auto-append extension (default: `true`) |
| `fallbackComponent` | `string` | ❌ Optional | Fallback component if load fails |
| `onSuccess` | `function` | ❌ Optional | Callback when component is successfully loaded |
| `onError` | `function` | ❌ Optional | Callback when component fails to load |

---

## 💡 Complete Examples

### Example 1: E-Commerce Product Page

```javascript
Vue.component('product-page', {
  data: function() {
    return {
      product: null,
      loading: true
    }
  },
  
  template: `
    <div class="product-page">
      <div v-if="loading" class="spinner">Loading...</div>
      <div v-else>
        <product-header :product="product"></product-header>
        <product-gallery :images="product.images"></product-gallery>
        <product-details :product="product"></product-details>
        <add-to-cart :product="product"></add-to-cart>
        <customer-reviews :product-id="product.id"></customer-reviews>
      </div>
    </div>
  `,
  
  asyncComponents: [
    '/components/product/product-header',
    '/components/product/product-gallery',
    '/components/product/product-details',
    {
      name: 'add-to-cart',
      path: '/components/cart/add-to-cart',
      onSuccess: function(name) {
        console.log(`Cart component ready: ${name}`)
      }
    },
    {
      name: 'customer-reviews',
      path: '/components/reviews/customer-reviews',
      fallbackComponent: 'reviews-fallback'
    }
  ],
  
  async mounted() {
    // Load product data
    const response = await this.get(`/api/products/${this.$route.params.id}`)
    this.product = response.data
    this.loading = false
  }
})
```

---

### Example 2: Admin Dashboard with Role-Based Loading

```javascript
Vue.component('admin-dashboard', {
  data: function() {
    return {
      userRole: 'admin',
      permissions: []
    }
  },
  
  template: `
    <div class="admin-dashboard">
      <admin-nav></admin-nav>
      
      <div class="content">
        <stats-overview></stats-overview>
        
        <admin-only v-if="userRole === 'admin'">
          <user-management></user-management>
          <system-logs></system-logs>
        </admin-only>
        
        <editor-only v-if="permissions.includes('edit')">
          <content-editor></content-editor>
        </editor-only>
      </div>
    </div>
  `,
  
  computed: {
    // Build asyncComponents array dynamically
    dynamicAsyncComponents() {
      const components = [
        '/components/admin/admin-nav',
        '/components/dashboard/stats-overview'
      ]
      
      // Admin-only components
      if (this.userRole === 'admin') {
        components.push(
          '/components/admin/user-management',
          '/components/admin/system-logs'
        )
      }
      
      // Editor components
      if (this.permissions.includes('edit')) {
        components.push('/components/editor/content-editor')
      }
      
      return components
    }
  },
  
  // Can override asyncComponents in mounted()
  async mounted() {
    // Load components based on role
    for (const comp of this.dynamicAsyncComponents) {
      await this.loadAsyncComponent(comp)
    }
  }
})
```

---

### Example 3: Lazy Load Modal Components

```javascript
Vue.component('modal-container', {
  data: function() {
    return {
      currentModal: null,
      modalData: null
    }
  },
  
  template: `
    <div>
      <transition name="modal-fade">
        <component 
          :is="currentModal"
          v-if="currentModal"
          :data="modalData"
          @close="closeModal"
        ></component>
      </transition>
    </div>
  `,
  
  methods: {
    async openModal(modalName, data) {
      // Load modal component on-demand
      await this.loadAsyncComponent(
        modalName,
        `/modals/${modalName}`,
        {
          onSuccess: () => {
            this.currentModal = modalName
            this.modalData = data
          }
        }
      )
    },
    
    closeModal() {
      this.currentModal = null
      this.modalData = null
    }
  }
})
```

---

### Example 4: Form with Dynamic Fields

```javascript
Vue.component('dynamic-form', {
  data: function() {
    return {
      formFields: [],
      formData: {}
    }
  },
  
  template: `
    <form @submit.prevent="submitForm">
      <div v-for="field in formFields" :key="field.name">
        <component
          :is="field.type"
          :name="field.name"
          :label="field.label"
          v-model="formData[field.name]"
        ></component>
      </div>
      <button type="submit">Submit</button>
    </form>
  `,
  
  watch: {
    formFields: {
      handler(newFields) {
        // Load field components when formFields change
        newFields.forEach(field => {
          this.loadAsyncComponent(
            field.type,
            `/form-fields/${field.type}`,
            { onError: (name) => console.warn(`Field ${name} not available`) }
          )
        })
      },
      immediate: true
    }
  },
  
  methods: {
    async submitForm() {
      const response = await this.post('/api/form/submit', this.formData)
      console.log('Form submitted:', response.data)
    }
  }
})
```

---

### Example 5: Tab Panel with Lazy Load

```javascript
Vue.component('lazy-tabs', {
  data: function() {
    return {
      activeTab: 'overview',
      loadedTabs: ['overview']
    }
  },
  
  template: `
    <div>
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.name"
          @click="switchTab(tab)"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <div class="tab-content">
        <component :is="activeTab"></component>
      </div>
    </div>
  `,
  
  computed: {
    tabs() {
      return [
        { name: 'overview', label: 'Overview', component: '/tabs/overview' },
        { name: 'details', label: 'Details', component: '/tabs/details' },
        { name: 'settings', label: 'Settings', component: '/tabs/settings' },
        { name: 'analytics', label: 'Analytics', component: '/tabs/analytics' }
      ]
    }
  },
  
  methods: {
    async switchTab(tab) {
      // Load tab component if not already loaded
      if (!this.loadedTabs.includes(tab.name)) {
        await this.loadAsyncComponent(
          tab.name,
          tab.component,
          {
            onSuccess: () => {
              this.loadedTabs.push(tab.name)
            }
          }
        )
      }
      
      this.activeTab = tab.name
    }
  }
})
```

---

## 🔄 Lifecycle Flow

```
1. Component created
   ↓
2. Vue init process starts
   ↓
3. callHook(vm, 'created')
   ↓
4. initAsyncComponents(vm) is called
   ↓
5. Loop through asyncComponents array
   ↓
6. Parse each item:
   - String: extract name from path
   - Object: use name and path from object
   ↓
7. Load component file via HTTP
   ↓
8. Parse <script> and <template>
   ↓
9. Register via defineDynamicComponent()
   ↓
10. Component available for rendering
```

---

## 📂 Path Resolution

| Config | Input | Auto Name | Full Path |
|--------|-------|-----------|-----------|
| `extension: '.tpl'` | `/components/input/input-text` | `input-text` | `/components/input/input-text.tpl` |
| `extension: '.tpl'` | `/components/button-primary` | `button-primary` | `/components/button-primary.tpl` |
| `extension: '.vue'` | `/components/date-picker` | `date-picker` | `/components/date-picker.vue` |
| `extension: '.tpl'` | `{ name: 'my-comp', path: '/custom/comp' }` | `my-comp` | `/custom/comp.tpl` |

---

## ⚙️ Configuration

### Global Config

```javascript
// Set default extension (used for auto-append)
Vue.config.componentExtension = '.tpl'  // Default: .tpl

// Set fallback component
Vue.config.componentFallback = 'component-notfound'

// Enable dev logging
Vue.config.devtools = true
```

### Per-Component Override

```javascript
Vue.component('my-component', {
  template: '<div><custom-comp></custom-comp></div>',
  
  asyncComponents: [
    {
      name: 'custom-comp',
      path: '/custom/component',
      extension: '.vue',              // Override default extension
      autoAppendExtension: true,      // Enable/disable auto-append
      fallbackComponent: 'fallback',  // Fallback on failure
      onSuccess: (name, def) => {     // Success callback
        console.log('✅ Loaded:', name)
      },
      onError: (name, error) => {     // Error callback
        console.error('❌ Failed:', name, error)
      }
    }
  ]
})
```

---

## ⚠️ Best Practices

### 1. Use String Format for Simple Cases

```javascript
// ✅ GOOD - Simple and readable
asyncComponents: [
  '/components/input/input-text',
  '/components/button/button-primary'
]

// ❌ BAD - Overkill for simple cases
asyncComponents: [
  { name: 'input-text', path: '/components/input/input-text' },
  { name: 'button-primary', path: '/components/button/button-primary' }
]
```

### 2. Use Object Format for Advanced Control

```javascript
// ✅ GOOD - Need callbacks and fallback
asyncComponents: [
  {
    name: 'payment-gateway',
    path: '/payment/gateway',
    fallbackComponent: 'payment-fallback',
    onError: (name, error) => {
      this.showPaymentError(error)
    }
  }
]
```

### 3. Handle Loading States

```javascript
// ✅ GOOD - Show loading indicator
data: function() {
  return {
    componentsLoaded: false
  }
},

template: `
  <div>
    <div v-if="!componentsLoaded">Loading components...</div>
    <div v-else>
      <async-comp-1></async-comp-1>
      <async-comp-2></async-comp-2>
    </div>
  </div>
`,

mounted() {
  // Components load automatically via asyncComponents
  // Set flag after all loaded
  setTimeout(() => {
    this.componentsLoaded = true
  }, 100)
}
```

### 4. Group Related Components

```javascript
// ✅ GOOD - Group by feature
Vue.component('checkout-page', {
  asyncComponents: [
    // Payment components
    '/payment/credit-card',
    '/payment/paypal',
    
    // Shipping components
    '/shipping/address-form',
    '/shipping/method-selector'
  ]
})
```

### 5. Lazy Load Non-Critical Components

```javascript
// ✅ GOOD - Load reviews only when needed
Vue.component('product-page', {
  data: function() {
    return {
      showReviews: false
    }
  },
  
  methods: {
    async loadReviews() {
      if (!this.showReviews) {
        await this.loadAsyncComponent('reviews', '/product/reviews')
        this.showReviews = true
      }
    }
  }
})
```

---

## 🐛 Troubleshooting

### Problem: "Component not found"

**Solution:**
- Check if the path is correct
- Check if file exists on server
- Enable devtools: `Vue.config.devtools = true`
- Check console for error messages

### Problem: "Extension not appending"

**Solution:**
- Make sure `autoAppendExtension` is not set to `false`
- Check that `Vue.config.componentExtension` is correct

### Problem: "Components load too slow"

**Solution:**
- Preload critical components in `mounted()`
- Use CDN for external components
- Enable HTTP/2 for parallel loading

### Problem: "Fallback component not appearing"

**Solution:**
- Register fallback component first:
  ```javascript
  Vue.defineDynamicComponent('fallback', { template: '<div>Fallback</div>' })
  ```
- Or set `Vue.config.componentFallback`

---

## 📊 Comparison

| Method | Where Defined | Auto-load | Flexibility |
|--------|--------------|-----------|-------------|
| `asyncComponents` | ✅ In component options | ✅ Yes | ⚠️ Medium |
| `loadAsyncComponent()` | ❌ Manual call | ❌ No | ✅ High |
| `fetchDynamicComponent()` | ❌ Manual call | ❌ No | ✅ High |

---

## ✅ Summary

| Feature | Status | Notes |
|---------|--------|-------|
| String array | ✅ | Auto name from path |
| Object array | ✅ | Full control |
| Mixed format | ✅ | String + object |
| Auto extension | ✅ | From config |
| Callbacks | ✅ | onSuccess, onError |
| Fallback | ✅ | fallbackComponent |
| Custom extension | ✅ | Per-component |
| TypeScript | ✅ | Full type support |
| Dev logging | ✅ | When `devtools: true` |

---

**Version**: Vue 2.7.16 + Async Components Options  
**Last Updated**: 2024
