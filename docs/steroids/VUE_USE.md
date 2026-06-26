
# Vue Use 

- useBluetooth
- useBreakpoints
- useBroadcastChannel
- useBrowserLocation
- useClipboard
- useClipboardItems
- useColorMode
- useCssSupports
- useCssVar
- useDark
- useEventListener
- useEyeDropper
- useFavicon
- useFileDialog
- useFileSystemAccess
- useFullscreen
- useGamepad
- useImage
- useMediaControls
- useMediaQuery
- useMemory
- useObjectUrl
- usePerformanceObserver
- usePermission
- usePreferredColorScheme
- usePreferredContrast
- usePreferredDark
- usePreferredLanguages
- usePreferredReducedMotion
- usePreferredReducedTransparency
- useScreenOrientation
- useScreenSafeArea
- useScriptTag
- useShare
- useSSRWidth
- useStyleTag
- useTextareaAutosize
- useTextDirection
- useTitle
- useUrlSearchParams
- useVibrate
- useWakeLock
- useWebNotification
- useWebWorker
- useWebWorkerFn

# Vue 2 Built-in Hooks / Composables Helpers

## 🎯 Overview

Vue 2 sekarang memiliki **Built-in Hooks / Composables Helpers** yang terintegrasi langsung! Fitur ini mirip dengan konsep **VueUse** atau **Composables** di Vue 3, tapi disesuaikan khusus untuk Vue 2 agar bisa digunakan dengan mudah melalui opsi `hooks` atau methods bawaan.

Tidak perlu install library tambahan - semuanya sudah ada di dalam Vue!

---

## ✨ Key Features

- ✅ **Hooks Option** - Opsi baru pada component: `hooks: function() {}`
- ✅ **Built-in Helpers** - Method siap pakai (onClickOutside, onEscape, dll)
- ✅ **Auto Cleanup** - Event listener otomatis dibersihkan saat component di-destroy
- ✅ **Context Ready** - Bisa mengakses `this` (data, methods, computed) di dalam hooks
- ✅ **Zero Dependencies** - Murni Vue, tanpa library tambahan

---

## 📖 Basic Usage

Gunakan opsi `hooks` pada definisi component. Fungsi ini otomatis dijalankan saat component dibuat (tepat setelah lifecycle `created`).

### Example 1: Simple onClickOutside

```javascript
Vue.component('my-dropdown', {
  data() {
    return {
      show: false
    }
  },
  
  template: `
    <div ref="dropdown">
      <button @click="show = !show">Toggle Dropdown</button>
      <ul v-if="show">
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    </div>
  `,
  
  // Hooks dijalankan otomatis
  hooks() {
    // Tutup dropdown saat user klik di luar element
    this.onClickOutside('dropdown', () => {
      this.show = false
    })
  } , 
})
```

---

### Example 2: Modal with Escape Key

```javascript
Vue.component('my-modal', {
  data() {
    return { isOpen: true }
  },
  
  template: `
    <div v-if="isOpen" ref="modal" class="modal-backdrop">
      <div class="modal-content">
        <h2>Modal Title</h2>
        <button @click="isOpen = false">Close</button>
      </div>
    </div>
  `,
  
  hooks() {
    // 1. Tutup jika klik di luar modal
    this.onClickOutside('modal', () => {
      this.isOpen = false
    })
    
    // 2. Tutup jika tekan tombol ESC
    this.onEscape(() => {
      this.isOpen = false
    })
  }
})
```

---

## 🔧 API Reference

### 1. `this.onClickOutside(refName, callback)`

Mendeteksi klik di luar elemen yang ditunjuk oleh `$ref`. Sangat berguna untuk dropdown, modal, popover.

*   **refName**: String nama ref (misal: `'myDropdown'`).
*   **callback**: Fungsi yang dijalankan saat klik di luar.

```javascript
// Contoh penggunaan
this.onClickOutside('popover', () => {
  this.showPopover = false
})
```

---

### 2. `this.onWindowResize(callback, options?)`

Mendeteksi perubahan ukuran window browser.

*   **callback**: Fungsi yang dijalankan saat resize.
*   **options**: Object konfigurasi.
    *   `immediate` (Boolean): Jalankan callback segera saat mount (default: false).

```javascript
// Contoh penggunaan
this.onWindowResize(() => {
  this.windowWidth = window.innerWidth
  this.calculateLayout()
}, { immediate: true })
```

---

### 3. `this.onScroll(target, callback)`

Mendeteksi scroll pada elemen tertentu atau window.

*   **target**: String selector CSS (misal: `'.sidebar'`) atau Element object.
*   **callback**: Fungsi yang dijalankan saat scroll.

```javascript
// Contoh penggunaan dengan selector
this.onScroll('.main-content', (event) => {
  if (event.target.scrollTop > 100) {
    this.showBackToTop = true
  }
})

// Contoh penggunaan dengan Window object
this.onScroll(window, () => {
  // Handle window scroll
})
```

---

### 4. `this.onKeyPress(key, callback)`

Mendeteksi penekanan tombol keyboard tertentu.

*   **key**: String nama tombol (misal: `'Enter'`, `'Escape'`, `'a'`). Bisa menggunakan `e.key` atau `e.code`.
*   **callback**: Fungsi yang dijalankan.

```javascript
// Contoh penggunaan
this.onKeyPress('Enter', () => {
  this.submitForm()
})
```

---

### 5. `this.onEscape(callback)`

Shorthand (jalan pintas) untuk `this.onKeyPress('Escape', callback)`. Sangat umum digunakan untuk menutup modal.

*   **callback**: Fungsi yang dijalankan saat tombol ESC ditekan.

```javascript
// Contoh penggunaan
this.onEscape(() => {
  this.closeDialog()
})
```

---

### 6. `this.useDebounce(callback, delay)`

Membuat fungsi "debounce". Fungsi baru hanya akan dipanggil setelah user berhenti memanggilnya selama `delay` milidetik. Berguna untuk search input.

*   **callback**: Fungsi asli.
*   **delay**: Waktu tunggu dalam ms (default: 300).
*   **Returns**: Fungsi baru yang sudah di-debounce.

```javascript
// Contoh penggunaan
hooks() {
  // Buat fungsi search yang delay 500ms
  const search = this.useDebounce((query) => {
    this.fetchResults(query)
  }, 500)
  
  // Simpan ke instance agar bisa dipakai di methods/template
  this.debouncedSearch = search
},

methods: {
  handleInput(e) {
    this.debouncedSearch(e.target.value)
  }
}
```

---

### 7. `this.useThrottle(callback, delay)`

Membuat fungsi "throttle". Fungsi baru akan dipanggil maksimal satu kali per `delay` milidetik. Berguna untuk event yang sangat sering terjadi seperti scroll atau mouse move.

*   **callback**: Fungsi asli.
*   **delay**: Interval minimal pemanggilan dalam ms (default: 300).
*   **Returns**: Fungsi baru yang sudah di-throttle.

```javascript
// Contoh penggunaan
hooks() {
  const handleScroll = this.useThrottle(() => {
    console.log('Scroll event handled max once per 100ms')
  }, 100)
  
  this.onScroll(window, handleScroll)
}
```

---

## 🔄 Lifecycle & Auto Cleanup

Salah satu keuntungan menggunakan built-in hooks adalah **Auto Cleanup**.

Ketika Anda menggunakan helper seperti `onClickOutside` atau `onWindowResize`, Vue secara otomatis menambahkan event listener. Lebih importantly, Vue juga otomatis **menghapus (remove)** listener tersebut pada lifecycle `beforeDestroy`.

**Tanpa Hooks (Manual):**
```javascript
mounted() {
  this._handler = () => { ... }
  window.addEventListener('resize', this._handler)
},
beforeDestroy() {
  window.removeEventListener('resize', this._handler) // Harus manual!
}
```

**Dengan Hooks (Otomatis):**
```javascript
hooks() {
  this.onWindowResize(() => { ... })
  // Otomatis di-cleanup saat component di-destroy! ✅
}
```

---

## 💡 Advanced Examples

### Example: Infinite Scroll

Menggabungkan `onScroll` dan `useThrottle` untuk performa maksimal.

```javascript
Vue.component('infinite-list', {
  data() {
    return { page: 1, loading: false }
  },
  template: `
    <div ref="list" class="scroll-container">
      <div v-for="item in items" :key="item.id">{{ item.name }}</div>
      <div v-if="loading">Loading...</div>
    </div>
  `,
  
  hooks() {
    // Gunakan throttle agar tidak terlalu sering dicek
    const checkBottom = this.useThrottle(() => {
      const el = this.$refs.list
      // Cek apakah user sudah scroll mendekati bawah
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        this.loadMore()
      }
    }, 200)

    this.onScroll(this.$refs.list, checkBottom)
  },
  
  methods: {
    async loadMore() {
      if (this.loading) return
      this.loading = true
      // Fetch data...
      this.page++
      this.loading = false
    }
  }
})
```

---

### Example: Search Input dengan Debounce

```javascript
Vue.component('smart-search', {
  data() {
    return { query: '', results: [] }
  },
  template: `<input v-model="query" @input="onInput" placeholder="Search..." />`,
  
  hooks() {
    // Debounce 300ms
    this.debouncedFetch = this.useDebounce(async (val) => {
      if (!val) {
        this.results = []
        return
      }
      const res = await fetch(`/api/search?q=${val}`)
      this.results = await res.json()
    }, 300)
  },
  
  methods: {
    onInput() {
      // Panggil fungsi yang sudah di-debounce
      this.debouncedFetch(this.query)
    }
  }
})
```

---

## 🐛 Troubleshooting

### Problem: "Ref not found"

**Solusi:** Pastikan atribut `ref="nama"` sudah ada di template. Ingat, `ref` baru bisa diakses setelah component di-mount, tapi karena hooks berjalan setelah created (dan biasanya helper menunggu `$nextTick`), pastikan elemen tersebut memang ada (tidak dibungkus `v-if` yang false saat awal).

```html
<!-- Salah: ref tidak ada jika v-if false -->
<div v-if="false" ref="myElement"></div>

<!-- Benar: Gunakan v-show atau pastikan true -->
<div v-show="true" ref="myElement"></div>
```

### Problem: "this is undefined in callback"

**Solusi:** Pastikan callback menggunakan **Arrow Function** `() => {}` agar context `this` tetap mengarah ke Vue instance.

```javascript
// ❌ Salah (this akan mengarah ke window/element)
this.onClickOutside('el', function() {
  console.log(this.show) // undefined
})

// ✅ Benar
this.onClickOutside('el', () => {
  console.log(this.show) // defined
})
```

---

## 📊 Comparison

| Feature | Manual AddEventListener | Vue Hooks / Composables |
|---------|-------------------------|-------------------------|
| Setup Code | Verbose (banyak baris) | Simple (1 baris) |
| Cleanup | Manual (`beforeDestroy`) | ✅ **Automatic** |
| Context (`this`) | Harus bind/arrow func | ✅ Arrow func ready |
| Reusability | Sulit | ✅ Bisa buat helper custom |
| Debounce/Throttle | Manual / library lain | ✅ Built-in |

---

**Version**: Vue 2.7.16 + Built-in Hooks  
**Last Updated**: 2024
