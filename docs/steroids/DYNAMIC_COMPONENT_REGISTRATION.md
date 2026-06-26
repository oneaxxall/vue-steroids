# Dynamic Component Registration in Vue 2

## Overview
Fitur ini memungkinkan komponen untuk didaftarkan dan dikenali secara otomatis meskipun komponen tersebut diregister **setelah** Vue instance diinisialisasi. Ini sangat berguna untuk kasus:
- Lazy loading komponen via AJAX
- Dynamic component loading dari server
- Plugin yang menambahkan komponen di runtime

## API

### `Vue.defineComponent(name, component)`

Mendaftarkan komponen secara global yang dapat diresolve meskipun Vue instance sudah diinisialisasi.

## Contoh Penggunaan

### 1. Basic Usage

```javascript
// Inisialisasi Vue instance TANPA mendaftarkan komponen dulu
const app = new Vue({
  el: '#app',
  data: { message: 'Hello Vue 2!' }
})

// Komponen masih bisa didaftarkan nanti!
Vue.defineComponent('my-dynamic-component', {
  template: '<div>Ini komponen dinamis!</div>'
})

// Sekarang komponen bisa langsung digunakan di template
// <my-dynamic-component></my-dynamic-component>
```

### 2. Lazy Loading via AJAX

```javascript
// Vue instance sudah berjalan
const app = new Vue({
  el: '#app',
  data: { componentLoaded: false }
})

// Load komponen secara dinamis via AJAX
fetch('/api/components/my-component.js')
  .then(response => response.json())
  .then(componentDefinition => {
    // Daftarkan komponen setelah Vue instance berjalan
    Vue.defineComponent('my-ajax-component', componentDefinition)
    
    // Update state jika diperlukan
    app.componentLoaded = true
    
    // Komponen sekarang bisa digunakan!
    console.log('Komponen berhasil didaftarkan!')
  })
  .catch(error => {
    console.error('Gagal memuat komponen:', error)
  })
```

### 3. Dynamic Import dengan Webpack

```javascript
// Komponen bisa di-load on-demand
function loadComponent() {
  return import('./MyComponent.vue').then(module => {
    Vue.defineComponent('my-lazy-component', module.default)
    return module.default
  })
}

// Panggil saat dibutuhkan
loadComponent()

// Di template, komponen otomatis tersedia setelah di-load
// <my-lazy-component></my-lazy-component>
```

### 4. Plugin Component Registration

```javascript
// plugin.js
export default {
  install(Vue) {
    // Load dan daftarkan komponen secara dinamis
    const asyncComponents = [
      'DatePicker',
      'TimePicker',
      'ColorPicker'
    ]
    
    asyncComponents.forEach(name => {
      fetch(`/api/components/${name.toLowerCase()}.js`)
        .then(res => res.json())
        .then(def => Vue.defineComponent(name, def))
    })
  }
}

// main.js
import MyPlugin from './plugin'
Vue.use(MyPlugin)

// Komponen akan tersedia otomatis setelah di-load
```

## Perbedaan dengan Vue.component()

### Vue.component()
- Harus dipanggil **sebelum** Vue instance dibuat
- Jika dipanggil setelah instance dibuat, komponen tidak akan terdeteksi di template yang sudah ada
- Membutuhkan re-render atau instance baru

### Vue.defineComponent() (BARU)
- Bisa dipanggil **kapan saja**, bahkan setelah Vue instance berjalan
- Komponen otomatis terdeteksi di template tanpa perlu re-render
- Tidak memerlukan `<component :is>` atau conditional rendering `v-if`

## Cara Kerja

1. `Vue.defineComponent()` mendaftarkan komponen ke **global registry**
2. Saat Vue render template dan menemukan tag komponen, fungsi `resolveAsset()` akan:
   - Cek di `$options.components` terlebih dahulu (cara tradisional)
   - Jika tidak ditemukan, cek di **global dynamic registry**
   - Return komponen jika ditemukan
3. Komponen di-resolve secara otomatis pada render berikutnya

## Catatan Penting

### Nama Komponen
Komponen didaftarkan dengan beberapa variasi nama secara otomatis:
```javascript
Vue.defineComponent('my-component', {...})

// Semua ini akan resolve ke komponen yang sama:
// <my-component>
// <myComponent>  
// <MyComponent>
```

### Reaktivitas
- Komponen yang didaftarkan secara dinamis akan otomatis muncul di template
- Tidak perlu manipulasi state atau force re-render
- Vue akan otomatis resolve komponen saat render cycle berikutnya

### Kompatibilitas
- 100% kompatibel dengan Vue 2 existing code
- Tidak mengubah behavior Vue.component()
- Bisa digunakan bersamaan dengan cara tradisional

## Testing

```javascript
describe('Dynamic Component Registration', () => {
  it('should resolve component registered after Vue instance init', () => {
    const Vue = require('vue')
    
    // Create instance first
    const vm = new Vue({
      template: '<dynamic-comp></dynamic-comp>'
    }).$mount()
    
    // Register component later
    Vue.defineComponent('dynamic-comp', {
      render: h => h('div', 'Dynamic!')
    })
    
    // Force re-render
    vm.$forceUpdate()
    
    expect(vm.$el.textContent).toBe('Dynamic!')
  })
})
```

## Migrasi dari Vue.component()

Jika Anda sudah menggunakan `Vue.component()`, tidak perlu mengubah apapun. 
`Vue.defineComponent()` adalah **additional API**, bukan pengganti.

Namun jika Anda ingin komponen bisa di-load dinamis setelah instance init, 
gunakan `Vue.defineComponent()` alih-alih `Vue.component()`.

```javascript
// Sebelum (tidak bisa resolve setelah init)
Vue.component('my-comp', {...})

// Sesudah (bisa resolve kapan saja)
Vue.defineComponent('my-comp', {...})
```
