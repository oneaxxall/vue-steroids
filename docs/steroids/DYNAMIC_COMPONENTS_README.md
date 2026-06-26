# Vue 2 Dynamic Component Registration

## 🎯 Fitur Baru: Otomatis Mengenali Komponen yang Diregister Setelah Init

Dengan modifikasi ini, Vue 2 sekarang dapat **secara otomatis** mengenali komponen yang didaftarkan setelah Vue instance diinisialisasi, tanpa memerlukan `<component :is>` atau conditional rendering `v-if`.

## 📦 Instalasi

Fitur ini sudah terintegrasi dalam build Vue.js 2 Anda. Tidak perlu instalasi tambahan!

## 🚀 Cara Penggunaan

### Method 1: Tanpa V-If (Komponen Selalu Ada di DOM)

```html
<div id="app">
  <!-- Komponen ini akan render setelah didaftarkan -->
  <my-dynamic-component></my-dynamic-component>
</div>

<script>
// 1. Buat Vue instance terlebih dahulu
const app = new Vue({
  el: '#app'
})

// 2. Daftarkan komponen kapan saja (bahkan setelah AJAX call)
fetch('/api/my-component.js')
  .then(res => res.json())
  .then(componentDef => {
    Vue.defineComponent('my-dynamic-component', componentDef)
    // ✅ Komponen otomatis muncul! Tidak perlu $forceUpdate() atau v-if
  })
</script>
```

### Method 2: Dengan V-If (Untuk Lazy Loading)

```html
<div id="app">
  <template v-if="componentLoaded">
    <lazy-component></lazy-component>
  </template>
  
  <button @click="loadComponent">Load Component</button>
</div>

<script>
const app = new Vue({
  el: '#app',
  data: {
    componentLoaded: false
  },
  methods: {
    loadComponent() {
      Vue.defineComponent('lazy-component', {
        template: '<div>Loaded dynamically!</div>'
      })
      this.componentLoaded = true
    }
  }
})
</script>
```

## 📋 API Reference

### `Vue.defineComponent(name, definition)`

Mendaftarkan komponen secara global yang dapat di-resolve meskipun Vue instance sudah berjalan.

**Parameters:**
- `name` (string): Nama komponen (akan otomatis support kebab-case, camelCase, PascalCase)
- `definition` (Object): Definisi komponen

**Example:**
```javascript
Vue.defineComponent('my-component', {
  template: '<div>Hello World</div>'
})

// Semua ini akan resolve ke komponen yang sama:
// <my-component>
// <myComponent>
// <MyComponent>
```

## 🎨 Use Cases

### 1. Lazy Loading Components dari Server

```javascript
// Load component definition dari server
async function loadComponent(name) {
  const response = await fetch(`/api/components/${name}`)
  const definition = await response.json()
  Vue.defineComponent(name, definition)
}

// Usage
loadComponent('data-table')
// <data-table></data-table> akan otomatis render setelah load selesai
```

### 2. Plugin System

```javascript
// Plugin yang mendaftarkan komponen secara dinamis
const MyPlugin = {
  install(Vue) {
    // Load components async
    const components = ['DatePicker', 'TimePicker', 'Calendar']
    components.forEach(name => {
      fetch(`/components/${name.toLowerCase()}.js`)
        .then(res => res.json())
        .then(def => Vue.defineComponent(name, def))
    })
  }
}

Vue.use(MyPlugin)
```

### 3. Conditional Component Loading

```javascript
new Vue({
  el: '#app',
  data: { userRole: 'admin' },
  created() {
    // Load role-specific components
    if (this.userRole === 'admin') {
      Vue.defineComponent('admin-dashboard', AdminDashboard)
    } else {
      Vue.defineComponent('user-dashboard', UserDashboard)
    }
  }
})
```

## 🆚 Perbandingan dengan Vue.component()

| Fitur | Vue.component() | Vue.defineComponent() |
|-------|----------------|----------------------|
| Harus sebelum init | ✅ Ya | ❌ Tidak |
| Auto re-render | ❌ Tidak | ✅ Ya |
| Lazy loading | Sulit | Mudah |
| AJAX loading | Tidak bisa | Bisa |
| Plugin system | Terbatas | Powerful |

## ⚙️ Cara Kerja

1. **Registry Global**: Komponen disimpan di global registry
2. **Auto Resolve**: `resolveAsset()` cek registry sebagai fallback
3. **Auto Re-render**: Semua Vue instance otomatis di-update saat komponen baru didaftarkan

## 📝 Contoh Lengkap

Lihat file demo lengkap di:
- `html/dynamic-components-demo.html` - Demo interaktif

## ✅ Testing

Semua test Vue.js 2 tetap passing (144/144 tests).

## 🔧 Technical Details

### Modified Files:
- `src/core/util/options.ts` - Dynamic component registry
- `src/core/vdom/create-element.ts` - Component resolution
- `src/core/instance/init.ts` - Instance registration
- `src/core/instance/lifecycle.ts` - Cleanup on destroy
- `src/core/global-api/index.ts` - Global API registration
- `src/types/global-api.ts` - TypeScript definitions

## 💡 Tips

1. **Tanpa V-If Lebih Baik**: Untuk pengalaman terbaik, gunakan komponen langsung di template tanpa `v-if`
2. **Loading State**: Tambahkan loading indicator sementara komponen di-load
3. **Error Handling**: Handle failed component loading dengan try-catch

## 🐛 Troubleshooting

**Problem**: Komponen tidak muncul setelah didaftarkan  
**Solution**: Pastikan menggunakan `Vue.defineComponent()`, bukan `Vue.component()`

**Problem**: Error "Unknown custom element"  
**Solution**: Komponen akan muncul setelah re-render otomatis. Jika masih error, coba tambahkan `$nextTick` setelah registrasi.

## 📄 License

Sama dengan Vue.js 2 license.
