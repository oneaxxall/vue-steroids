# Dynamic Component Loader via AJAX

## 🎯 New Feature: Load Components from the Server

This feature allows you to **load Vue components dynamically from the server** via AJAX requests. Components can be added at any time, even **after the Vue instance is initialized**.

---

## 📋 How It Works

1. **Request file** from the server based on path
2. **Parse file** containing `<script>` and `<template>`
3. **Evaluate script** to get the component definition
4. **Auto register** via `Vue.defineDynamicComponent`
5. **Fallback** to default component if the file is not found

---

## ⚙️ Configuration

### Vue.config Options:

```javascript
// Base path for all components
Vue.config.componentPath = '/components'

// File extension (default: .tpl)
Vue.config.componentExtension = '.tpl'

// Fallback component if file is not found
Vue.config.componentFallback = 'component-notfound'
```

---

## 📝 Component File Format

Component files have a special format with `<script>` and `<template>` tags:

**Example file: `/components/input/input-text.tpl`**

```html
<script>
module.exports = {
  data: function() {
    return {
      name: 'Ahmad Wahyudin',
      address: 'Jl Swadaya 1 No 2'
    }
  },

  methods: {
    getName: function() {
      return this.name
    }
  },

  beforeCreate: function() {
    console.log('Component beforeCreate')
  },

  mounted: function() {
    console.log('Component mounted')
  }
}
</script>

<template>
  <div class='flex gap-2'>
    <p>Name: {{ name }}</p>
    <p>Address: {{ address }}</p>
    <button @click="getName">Get Name</button>
  </div>
</template>
```

---

## 🚀 Usage

### 1. Basic Usage

```javascript
// Inside Vue component methods
this.fetchDynamicComponent('input-text', '/input/input-text')
```

**Explanation:**
- Component name: `input-text`
- File loaded: `{componentPath}/input/input-text{componentExtension}`
- Example: `/components/input/input-text.tpl`

### 2. With Fallback Component

```javascript
// If file does not exist, use the 'component-notfound' component
this.fetchDynamicComponent(
  'input-text',
  '/input/input-text',
  'component-notfound'
)
```

### 3. With Options Object

```javascript
this.fetchDynamicComponent({
  name: 'input-text',
  path: '/input/input-text',
  fallbackComponent: 'component-notfound',
  onSuccess: function(name, componentDef) {
    console.log('Component loaded:', name)
  },
  onError: function(name, error) {
    console.error('Failed to load:', name, error)
  }
})
```

### 4. Load Multiple Components

```javascript
this.fetchDynamicComponents([
  { name: 'input-text', path: '/input/input-text' },
  { name: 'button-primary', path: '/button/button-primary' },
  { name: 'card-user', path: '/card/card-user' }
])
```

---

## 💡 Complete Examples

### Example 1: Simple Component Loading

```html
<!DOCTYPE html>
<html>
<head>
  <script src="../dist/vue.js"></script>
</head>
<body>
  <div id="app">
    <h1>Dynamic Component Demo</h1>
    <button @click="loadComponent">Load Component</button>
    
    <!-- Component will appear after loading -->
    <input-text></input-text>
  </div>

  <script>
    // Setup config
    Vue.config.componentPath = '/my-components'
    Vue.config.componentExtension = '.tpl'

    new Vue({
      el: '#app',
      methods: {
        async loadComponent() {
          const success = await this.fetchDynamicComponent(
            'input-text',
            '/input/input-text',
            'component-notfound'
          )

          if (success) {
            console.log('Component loaded successfully!')
          } else {
            console.log('Using fallback component')
          }
        }
      }
    })
  </script>
</body>
</html>
```

### Example 2: Load on Mount

```javascript
new Vue({
  el: '#app',
  data: {
    componentsLoaded: false
  },

  async mounted() {
    // Load components on page load
    await this.fetchDynamicComponents([
      { name: 'header-nav', path: '/layout/header-nav' },
      { name: 'sidebar', path: '/layout/sidebar' },
      { name: 'user-card', path: '/user/user-card' }
    ])

    this.componentsLoaded = true
    console.log('All components loaded!')
  }
})
```

### Example 3: Router-based Loading

```javascript
// With vue-router
router.beforeEach(async (to, from, next) => {
  if (to.meta.component) {
    await Vue.prototype.fetchDynamicComponent(
      to.meta.component,
      `/pages/${to.meta.component}`
    )
  }
  next()
})
```

### Example 4: Error Handling

```javascript
new Vue({
  el: '#app',
  methods: {
    async loadComponent() {
      try {
        const success = await this.fetchDynamicComponent({
          name: 'user-profile',
          path: '/user/user-profile',
          fallbackComponent: 'error-component',
          onSuccess: (name, def) => {
            console.log(`✅ ${name} loaded`)
          },
          onError: (name, error) => {
            console.error(`❌ ${name} failed:`, error.message)
          }
        })
      } catch (error) {
        console.error('Unexpected error:', error)
      }
    }
  }
})
```

---

## 📂 Folder Structure

```
public/
  └─ components/              # Vue.config.componentPath
      ├─ input/
      │   ├─ input-text.tpl
      │   └─ input-number.tpl
      ├─ button/
      │   ├─ button-primary.tpl
      │   └─ button-secondary.tpl
      ├─ card/
      │   └─ card-user.tpl
      ├─ layout/
      │   ├─ header-nav.tpl
      │   └─ sidebar.tpl
      └─ fallback/
          └─ component-notfound.tpl
```

---

## 🔧 Server Setup

### Node.js/Express Example:

```javascript
const express = require('express')
const app = express()

// Serve component files
app.use('/components', express.static('public/components'))

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
```

### PHP Example:

```php
<?php
// components.php
$component = $_GET['name'] ?? '';
$path = __DIR__ . '/components/' . $component . '.tpl';

if (file_exists($path)) {
  header('Content-Type: text/html');
  readfile($path);
} else {
  http_response_code(404);
  echo 'Component not found';
}
?>
```

---

## ⚠️ Important Notes

### 1. Security Considerations

Because it uses `eval()`, make sure to **only load components from trusted sources**:

```javascript
// ✅ GOOD: Load from your own server
this.fetchDynamicComponent('input-text', '/components/input-text')

// ❌ BAD: Load from user input without validation
const userInput = req.query.name
this.fetchDynamicComponent(userInput, `/components/${userInput}`)
```

### 2. Component Caching

The browser will cache component files. To force refresh:

```javascript
// Add query string for cache busting
const version = Date.now()
this.fetchDynamicComponent(
  'input-text',
  `/input/input-text?v=${version}`
)
```

### 3. Lifecycle Hooks

Loaded components have full lifecycle hooks:

```javascript
module.exports = {
  beforeCreate: function() {
    console.log('beforeCreate')
  },

  created: function() {
    console.log('created')
  },

  beforeMount: function() {
    console.log('beforeMount')
  },

  mounted: function() {
    console.log('mounted')
  },

  beforeUpdate: function() {
    console.log('beforeUpdate')
  },

  updated: function() {
    console.log('updated')
  },

  beforeDestroy: function() {
    console.log('beforeDestroy')
  },

  destroyed: function() {
    console.log('destroyed')
  }
}
```

---

## 🎨 Advanced Usage

### 1. Component with Props

```javascript
// Parent component
this.fetchDynamicComponent('user-card', '/user/user-card')

// Template
<user-card :user="currentUser" @click="handleClick"></user-card>

// user-card.tpl
<script>
module.exports = {
  props: ['user'],
  template: `
    <div class="card">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
    </div>
  `
}
</script>
```

### 2. Component with Computed

```javascript
module.exports = {
  data: function() {
    return {
      firstName: 'John',
      lastName: 'Doe'
    }
  },

  computed: {
    fullName: function() {
      return this.firstName + ' ' + this.lastName
    }
  },

  template: `
    <div>
      <p>Full Name: {{ fullName }}</p>
    </div>
  `
}
```

### 3. Component with Watchers

```javascript
module.exports = {
  data: function() {
    return {
      searchQuery: ''
    }
  },

  watch: {
    searchQuery: function(newVal) {
      console.log('Search query changed:', newVal)
      this.performSearch(newVal)
    }
  },

  methods: {
    performSearch: function(query) {
      // Search logic
    }
  },

  template: `
    <div>
      <input v-model="searchQuery" placeholder="Search..." />
    </div>
  `
}
```

---

## 📊 Response Flow

```
1. this.fetchDynamicComponent('input-text', '/input/input-text')
   ↓
2. GET /components/input/input-text.tpl
   ↓
3. Parse file content:
   - Extract <script> → module.exports = { ... }
   - Extract <template> → HTML content
   ↓
4. Evaluate script → component definition object
   ↓
5. Vue.defineDynamicComponent('input-text', definition)
   ↓
6. Component registered & auto forceUpdate
   ↓
7. <input-text></input-text> is now usable!
```

---

## ✅ API Reference

### `this.fetchDynamicComponent(name, path, fallback?)`

**Parameters:**
- `name` (string): Component name
- `path` (string): Path to component file (relative to componentPath)
- `fallback` (string, optional): Fallback component name

**Returns:** `Promise<boolean>` - True if successful, false if using fallback

### `this.fetchDynamicComponent({ name, path, fallbackComponent, onSuccess, onError })`

**Parameters:**
- `name` (string): Component name
- `path` (string): Path to component file
- `fallbackComponent` (string, optional): Fallback component name
- `onSuccess` (function, optional): Callback on success
- `onError` (function, optional): Callback on error

**Returns:** `Promise<boolean>`

### `this.fetchDynamicComponents([{ name, path }])`

**Parameters:**
- Array of objects with `name` and `path`

**Returns:** `Promise<number>` - Number of components successfully loaded

---

## 🐛 Troubleshooting

### Problem: "Component not found"

**Solution:** 
- Check if the file exists at the correct path
- Make sure `Vue.config.componentPath` is correct
- Check the network tab for 404 errors

### Problem: "Failed to evaluate component script"

**Solution:**
- Make sure the script format is correct: `module.exports = { ... }`
- Check the console for syntax errors
- Make sure there are no errors in the `<script>` tag

### Problem: Template does not render

**Solution:**
- Make sure there is a `<template>` tag in the file
- Check if the Vue build includes the compiler (for template strings)
- Use `vue.js` instead of `vue.runtime.js` if using template strings

---

## 📚 Summary

| Feature | Available | Notes |
|---------|-----------|-------|
| Load from server | ✅ | Via AJAX |
| Auto register | ✅ | Via defineDynamicComponent |
| Fallback component | ✅ | If file does not exist |
| Multiple load | ✅ | fetchDynamicComponents |
| Lifecycle hooks | ✅ | Full |
| Props support | ✅ | Full support |
| Computed support | ✅ | Full support |
| Watchers support | ✅ | Full support |
| Methods support | ✅ | Full support |
| Callbacks | ✅ | onSuccess, onError |

---

**Version**: Vue 2.7.16 + Dynamic Component Loader  
**Last Updated**: 2024
