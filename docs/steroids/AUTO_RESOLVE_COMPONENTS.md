# Auto-Resolve Dynamic Components

## 🎯 Fitur Baru: Auto-Resolve Component dari Server

Ketika Vue menemukan component tag yang **tidak terdaftar** di template, Vue akan **otomatis fetch** component tersebut dari server dan register sebagai dynamic component. Jika file tidak ditemukan, akan render fallback component.

---

## ✨ Cara Kerja

```html
<template>
  <input-text></input-text>
  <!-- input-text tidak terdaftar? Vue otomatis fetch dari server! -->
</template>
```

**Flow:**
1. Vue render template dan menemukan `<input-text>`
2. Vue cek: component `input-text` tidak terdaftar
3. **Auto-fetch**: Vue request `/components/input/input-text.tpl`
4. **Parse**: Extract `<script>` dan `<template>`
5. **Register**: `Vue.defineDynamicComponent('input-text', {...})`
6. **Force Update**: Semua Vue instances di-re-render
7. Component muncul otomatis! ✅

---

## 📂 Konversi Nama Component ke Path

Vue otomatis mengkonversi component name ke file path:

### Aturan Konversi:

**Component dengan '-':**
```
input-text  →  /components/input/input-text.tpl
              ↑ folder    ↑ component name

button-primary  →  /components/button/button-primary.tpl
                  ↑ folder    ↑ component name
```

**Component tanpa '-':**
```
header  →  /components/header.tpl
footer  →  /components/footer.tpl
```

### Rumus:

```javascript
// Jika component name mengandung '-'
'input-text' 
  → Split: ['input', 'text']
  → Folder: 'input' (bagian pertama)
  → Component: 'input-text' (full name)
  → Path: /components/input/input-text.tpl

// Jika component name TIDAK mengandung '-'
'header'
  → Folder: tidak ada
  → Path: /components/header.tpl
```

---

## ⚙️ Konfigurasi

```javascript
// Enable/disable auto-fetch (default: true)
Vue.config.autoFetchComponents = true

// Base path untuk components
Vue.config.componentPath = '/components'

// File extension
Vue.config.componentExtension = '.tpl'

// Fallback component jika file tidak ditemukan
Vue.config.componentFallback = 'component-notfound'
```

---

## 📝 Contoh Lengkap

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
    
    <!-- Component ini belum terdaftar, akan auto-fetch -->
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

    // Vue otomatis akan fetch:
    // - /components/input/input-text.tpl
    // - /components/button/button-primary.tpl
  </script>
</body>
</html>
```

### Example 2: Disable Auto-Fetch

```javascript
// Disable auto-fetch jika ingin manual control
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

## 🔄 Proses Detail

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
// Semua Vue instances di-forceUpdate
vueInstances.forEach(vm => vm.$forceUpdate())
```

### 5. Component Muncul

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

Ketika component pertama kali di-fetch, akan ada **delay** untuk:
- Network request
- Parse file
- Register component
- Force update

**Solution**: Preload components yang sering digunakan:

```javascript
// Preload di mounted
mounted() {
  this.fetchDynamicComponents([
    { name: 'input-text', path: '/input/input-text' },
    { name: 'button-primary', path: '/button/button-primary' }
  ])
}
```

### 2. Duplicate Prevention

Vue mencegah duplicate fetch untuk component yang sama:

```javascript
// Request pertama: Fetch component
<input-text></input-text>  // ← Fetching...

// Request kedua: Skip (already fetching)
<input-text></input-text>  // ← Skipped

// Setelah selesai fetch, baru render
<input-text></input-text>  // ✅ Rendered
```

### 3. Error Handling

Jika file tidak ditemukan:

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
// Daftarkan custom fallback
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

Component yang auto-resolved juga bisa auto-resolve child components:

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
| `componentPath` | `/components` | Base path untuk components |
| `componentExtension` | `.tpl` | File extension |
| `componentFallback` | `component-notfound` | Fallback component name |

---

## 🐛 Troubleshooting

### Problem: Component tidak auto-fetch

**Solution:**
- Check `Vue.config.autoFetchComponents` harus `true`
- Check network tab untuk 404 errors
- Pastikan file exists di path yang benar

### Problem: Infinite loop fetch

**Solution:**
- Vue sudah prevent duplicate fetch dengan `fetchingComponents` Set
- Update ke versi terbaru

### Problem: Component tidak muncul setelah fetch

**Solution:**
- Check console untuk error saat parse/eval
- Pastikan format file benar (`<script>` dan `<template>`)
- Force update manual: `this.$forceUpdate()`

---

## ✅ Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Auto-fetch on not found | ✅ | Otomatis |
| Parse `<script>` & `<template>` | ✅ | Full support |
| Auto-register | ✅ | Via defineDynamicComponent |
| Force update | ✅ | All instances |
| Duplicate prevention | ✅ | Set-based tracking |
| Fallback component | ✅ | Auto-created if not exists |
| Configurable | ✅ | Via Vue.config |
| Nested components | ✅ | Child auto-resolve juga |

---

**Version**: Vue 2.7.16 + Auto-Resolve Components  
**Last Updated**: 2024
