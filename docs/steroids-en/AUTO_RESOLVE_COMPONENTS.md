# Auto-Resolve Dynamic Components

## 🎯 New Feature: Auto-Resolve Components from the Server

When Vue encounters a component tag that is **not registered** in the template, Vue will **automatically fetch** that component from the server and register it as a dynamic component. If the file is not found, it will render a fallback component.

---

## ✨ How It Works

```html
<template>
  <input-text></input-text>
  <!-- input-text not registered? Vue automatically fetches from server! -->
</template>
```

**Flow:**
1. Vue renders the template and finds `<input-text>`
2. Vue checks: component `input-text` is not registered
3. **Auto-fetch**: Vue requests `/components/input/input-text.tpl`
4. **Parse**: Extract `<script>` and `<template>`
5. **Register**: `Vue.defineDynamicComponent('input-text', {...})`
6. **Force Update**: All Vue instances are re-rendered
7. Component appears automatically! ✅

---

## 📂 Component Name to Path Conversion

Vue automatically converts the component name to a file path:

### Conversion Rules:

**Component with '-':**
```
input-text  →  /components/input/input-text.tpl
              ↑ folder    ↑ component name

button-primary  →  /components/button/button-primary.tpl
                  ↑ folder    ↑ component name
```

**Component without '-':**
```
header  →  /components/header.tpl
footer  →  /components/footer.tpl
```

### Formula:

```javascript
// If component name contains '-'
'input-text' 
  → Split: ['input', 'text']
  → Folder: 'input' (first part)
  → Component: 'input-text' (full name)
  → Path: /components/input/input-text.tpl

// If component name does NOT contain '-'
'header'
  → Folder: none
  → Path: /components/header.tpl
```

---

## ⚙️ Configuration

```javascript
// Enable/disable auto-fetch (default: true)
Vue.config.autoFetchComponents = true

// Base path for components
Vue.config.componentPath = '/components'

// File extension
Vue.config.componentExtension = '.tpl'

// Fallback component if file is not found
Vue.config.componentFallback = 'component-notfound'
```

---

## 📝 Complete Examples

### Example 1: Auto-Resolve Basic

```html
<!DOCTYPE html>
<html>
<head>
  <script src="../dist/vue.js"></script>
</head>
<body>
  <div id="app">
    <h1>Auto-Resolve Demo</h1>
    
    <!-- This component is not yet registered, will auto-fetch -->
    <input-text></input-text>
    <button-primary></button-primary>
  </div>

  <script>
    // Setup config
    Vue.config.componentPath = '/components'
    Vue.config.componentExtension = '.tpl'
    Vue.config.autoFetchComponents = true // Enable auto-fetch

    new Vue({
      el: '#app'
    })

    // Vue will automatically fetch:
    // - /components/input/input-text.tpl
    // - /components/button/button-primary.tpl
  </script>
</body>
</html>
```

### Example 2: Disable Auto-Fetch

```javascript
// Disable auto-fetch if you want manual control
Vue.config.autoFetchComponents = false

new Vue({
  methods: {
    async loadComponent() {
      // Manual fetch
      await this.fetchDynamicComponent('input-text', '/input/input-text')
    }
  }
})
```

---

## 🔄 Detailed Process

### 1. Initial Render

```html
<template>
  <input-text></input-text>
</template>
```

**Console Log:**
```
[Vue.resolveAsset] ❌ Not found "input-text", dynamic registry has: []
[Vue.autoFetchComponent] Auto-fetching: input-text
[Vue.autoFetchComponent] Generated path: /components/input/input-text.tpl
```

### 2. Fetch Component

```
GET /components/input/input-text.tpl
```

**Response:**
```html
<script>
module.exports = {
  data: function() {
    return { value: '' }
  }
}
</script>

<template>
  <input v-model="value" placeholder="Type here..." />
</template>
```

### 3. Parse & Register

```
[Vue.autoFetchComponent] ✅ Auto-registered: input-text
```

### 4. Force Update

```javascript
// All Vue instances are force-updated
vueInstances.forEach(vm => vm.$forceUpdate())
```

### 5. Component Appears

```html
<input v-model="value" placeholder="Type here..." />
```

---

## 📊 Path Conversion Table

| Component Name | Generated Path | Full URL |
|----------------|----------------|----------|
| `input-text` | `/input/input-text.tpl` | `/components/input/input-text.tpl` |
| `button-primary` | `/button/button-primary.tpl` | `/components/button/button-primary.tpl` |
| `card-user-profile` | `/card/card-user-profile.tpl` | `/components/card/card-user-profile.tpl` |
| `header` | `/header.tpl` | `/components/header.tpl` |
| `footer` | `/footer.tpl` | `/components/footer.tpl` |
| `sidebar-menu` | `/sidebar/sidebar-menu.tpl` | `/components/sidebar/sidebar-menu.tpl` |

---

## ⚠️ Important Notes

### 1. First Render

When a component is first fetched, there will be a **delay** for:
- Network request
- File parsing
- Component registration
- Force update

**Solution**: Preload frequently used components:

```javascript
// Preload in mounted
mounted() {
  this.fetchDynamicComponents([
    { name: 'input-text', path: '/input/input-text' },
    { name: 'button-primary', path: '/button/button-primary' }
  ])
}
```

### 2. Duplicate Prevention

Vue prevents duplicate fetching for the same component:

```javascript
// First request: Fetch component
<input-text></input-text>  // ← Fetching...

// Second request: Skip (already fetching)
<input-text></input-text>  // ← Skipped

// After fetch completes, render
<input-text></input-text>  // ✅ Rendered
```

### 3. Error Handling

If the file is not found:

```javascript
// Auto-create fallback component
defineDynamicComponent('component-notfound', {
  template: `<div class="vue-component-notfound">
    <p>Component "input-text" not found</p>
  </div>`
})
```

---

## 🎨 Advanced Usage

### Custom Fallback Component

```javascript
// Register custom fallback
Vue.defineDynamicComponent('my-custom-fallback', {
  template: `
    <div class="custom-not-found">
      <h3>Component Not Available</h3>
      <p>Please check if component file exists</p>
    </div>
  `
})

Vue.config.componentFallback = 'my-custom-fallback'
```

### Nested Auto-Resolve

Auto-resolved components can also auto-resolve child components:

```html
<!-- parent.tpl -->
<script>
module.exports = {
  template: `
    <div>
      <h3>Parent Component</h3>
      <input-text></input-text>  <!-- Auto-resolve child -->
      <button-primary></button-primary>  <!-- Auto-resolve child -->
    </div>
  `
}
</script>

<template>
  <div>
    <h3>Parent Component</h3>
    <input-text></input-text>
    <button-primary></button-primary>
  </div>
</template>
```

---

## 🔧 Server Setup

### Express.js Example:

```javascript
const express = require('express')
const app = express()

// Serve component files
app.use('/components', express.static('public/components'))

app.listen(3000)
```

### Folder Structure:

```
public/
  └─ components/
      ├─ input/
      │   └─ input-text.tpl
      ├─ button/
      │   └─ button-primary.tpl
      ├─ card/
      │   └─ card-user.tpl
      └─ header.tpl
```

---

## 📋 Config Options

| Option | Default | Description |
|--------|---------|-------------|
| `autoFetchComponents` | `true` | Enable/disable auto-fetch |
| `componentPath` | `/components` | Base path for components |
| `componentExtension` | `.tpl` | File extension |
| `componentFallback` | `component-notfound` | Fallback component name |

---

## 🐛 Troubleshooting

### Problem: Component does not auto-fetch

**Solution:**
- Check `Vue.config.autoFetchComponents` must be `true`
- Check the network tab for 404 errors
- Make sure the file exists at the correct path

### Problem: Infinite loop fetch

**Solution:**
- Vue already prevents duplicate fetches using the `fetchingComponents` Set
- Update to the latest version

### Problem: Component does not appear after fetch

**Solution:**
- Check the console for errors during parsing/evaluation
- Make sure the file format is correct (`<script>` and `<template>`)
- Manual force update: `this.$forceUpdate()`

---

## ✅ Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Auto-fetch on not found | ✅ | Automatic |
| Parse `<script>` & `<template>` | ✅ | Full support |
| Auto-register | ✅ | Via defineDynamicComponent |
| Force update | ✅ | All instances |
| Duplicate prevention | ✅ | Set-based tracking |
| Fallback component | ✅ | Auto-created if not exists |
| Configurable | ✅ | Via Vue.config |
| Nested components | ✅ | Child auto-resolve also |

---

**Version**: Vue 2.7.16 + Auto-Resolve Components  
**Last Updated**: 2024
