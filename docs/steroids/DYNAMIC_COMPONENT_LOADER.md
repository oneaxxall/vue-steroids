# Dynamic Component Loader via AJAX

## 🎯 Fitur Baru: Load Component dari Server

Fitur ini memungkinkan Anda untuk **memuat komponen Vue secara dinamis dari server** melalui AJAX request. Komponen bisa ditambahkan kapan saja bahkan **setelah Vue instance diinisialisasi**.

---

## 📋 Cara Kerja

1. **Request file** dari server berdasarkan path
2. **Parse file** yang berisi `<script>` dan `<template>`
3. **Evaluate script** untuk mendapatkan component definition
4. **Auto register** via `Vue.defineDynamicComponent`
5. **Fallback** ke component default jika file tidak ditemukan

---

## ⚙️ Konfigurasi

### Vue.config Options:

```javascript
// Base path untuk semua component
Vue.config.componentPath = '/components'

// File extension (default: .tpl)
Vue.config.componentExtension = '.tpl'

// Fallback component jika file tidak ditemukan
Vue.config.componentFallback = 'component-notfound'
```

---

## 📝 Format File Component

Component file memiliki format khusus dengan tag `<script>` dan `<template>`:

**Contoh file: `/components/input/input-text.tpl`**

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
    <p>Nama: {{ name }}</p>
    <p>Alamat: {{ address }}</p>
    <button @click="getName">Get Name</button>
  </div>
</template>
```

---

## 🚀 Cara Penggunaan

### 1. Basic Usage

```javascript
// Di dalam Vue component methods
this.fetchDynamicComponent('input-text', '/input/input-text')
```

**Penjelasan:**
- Component name: `input-text`
- File yang di-load: `{componentPath}/input/input-text{componentExtension}`
- Contoh: `/components/input/input-text.tpl`

### 2. Dengan Fallback Component

```javascript
// Jika file tidak ada, gunakan component 'component-notfound'
this.fetchDynamicComponent(
  'input-text',
  '/input/input-text',
  'component-notfound'
)
```

### 3. Dengan Options Object

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

## 💡 Contoh Lengkap

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
    
    <!-- Component akan muncul setelah di-load -->
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
    // Load components saat page load
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
// Dengan vue-router
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

## 📂 Struktur Folder

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

Karena menggunakan `eval()`, pastikan **hanya load component dari trusted source**:

```javascript
// ✅ GOOD: Load dari server sendiri
this.fetchDynamicComponent('input-text', '/components/input-text')

// ❌ BAD: Load dari user input tanpa validasi
const userInput = req.query.name
this.fetchDynamicComponent(userInput, `/components/${userInput}`)
```

### 2. Component Caching

Browser akan cache component file. Untuk force refresh:

```javascript
// Tambahkan query string untuk cache busting
const version = Date.now()
this.fetchDynamicComponent(
  'input-text',
  `/input/input-text?v=${version}`
)
```

### 3. Lifecycle Hooks

Component yang di-load memiliki lifecycle hooks lengkap:

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

### 1. Component dengan Props

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

### 2. Component dengan Computed

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

### 3. Component dengan Watchers

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
7. <input-text></input-text> sekarang bisa digunakan!
```

---

## ✅ API Reference

### `this.fetchDynamicComponent(name, path, fallback?)`

**Parameters:**
- `name` (string): Component name
- `path` (string): Path to component file (relative to componentPath)
- `fallback` (string, optional): Fallback component name

**Returns:** `Promise<boolean>` - True jika berhasil, false jika pakai fallback

### `this.fetchDynamicComponent({ name, path, fallbackComponent, onSuccess, onError })`

**Parameters:**
- `name` (string): Component name
- `path` (string): Path to component file
- `fallbackComponent` (string, optional): Fallback component name
- `onSuccess` (function, optional): Callback saat berhasil
- `onError` (function, optional): Callback saat gagal

**Returns:** `Promise<boolean>`

### `this.fetchDynamicComponents([{ name, path }])`

**Parameters:**
- Array of objects dengan `name` dan `path`

**Returns:** `Promise<number>` - Jumlah component yang berhasil di-load

---

## 🐛 Troubleshooting

### Problem: "Component not found"

**Solution:** 
- Cek apakah file exists di path yang benar
- Pastikan `Vue.config.componentPath` sudah benar
- Cek network tab untuk 404 errors

### Problem: "Failed to evaluate component script"

**Solution:**
- Pastikan format script benar: `module.exports = { ... }`
- Cek console untuk syntax errors
- Pastikan tidak ada error di `<script>` tag

### Problem: Template tidak render

**Solution:**
- Pastikan ada `<template>` tag di file
- Cek Vue build apakah include compiler (untuk template string)
- Gunakan `vue.js` bukan `vue.runtime.js` jika pakai template string

---

## 📚 Summary

| Feature | Available | Notes |
|---------|-----------|-------|
| Load from server | ✅ | Via AJAX |
| Auto register | ✅ | Via defineDynamicComponent |
| Fallback component | ✅ | Jika file tidak ada |
| Multiple load | ✅ | fetchDynamicComponents |
| Lifecycle hooks | ✅ | Lengkap |
| Props support | ✅ | Full support |
| Computed support | ✅ | Full support |
| Watchers support | ✅ | Full support |
| Methods support | ✅ | Full support |
| Callbacks | ✅ | onSuccess, onError |

---

**Version**: Vue 2.7.16 + Dynamic Component Loader  
**Last Updated**: 2024
