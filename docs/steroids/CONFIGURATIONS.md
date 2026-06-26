# 📋 Konfigurasi Lengkap Vue Steroids

> Dokumentasi ini dibuat berdasarkan pembacaan source code `src/core/config.ts`, `src/core/global-api/index.ts`, dan seluruh utility Steroids.

---

## 📑 Daftar Isi

1. [Konfigurasi Dasar Vue 2](#1-konfigurasi-dasar-vue-2)
2. [HTTP Client (Axios)](#2-http-client-axios)
3. [Dynamic Component Loader](#3-dynamic-component-loader)
4. [State Management (Store)](#4-state-management-store)
5. [RTC / WebSocket](#5-rtc--websocket)
6. [Built-in Router](#6-built-in-router)
7. [Storage Manager](#7-storage-manager)
8. [Standalone Reactive System](#8-standalone-reactive-system)
9. [Hooks / Composables](#9-hooks--composables)
10. [Require System](#10-require-system)
11. [Portal Components](#11-portal-components)
12. [Directives](#12-directives)
13. [Global API Methods](#13-global-api-methods)
14. [Ringkasan Semua Config](#14-ringkasan-semua-config)

---

## 1. Konfigurasi Dasar Vue 2

Konfigurasi ini adalah standar Vue 2 yang tetap tersedia dan berfungsi normal.

| Properti | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `optionMergeStrategies` | `Object` | `{}` | Strategi penggabungan opsi komponen |
| `silent` | `boolean` | `false` | Menonaktifkan semua log warning Vue |
| `productionTip` | `boolean` | `true` (dev) | Tip production mode saat bootstrap |
| `devtools` | `boolean` | `true` (dev) | Mengaktifkan Vue Devtools |
| `performance` | `boolean` | `false` | Track performa komponen |
| `errorHandler` | `Function` | `null` | Handler error untuk watcher |
| `warnHandler` | `Function` | `null` | Handler warning untuk watcher |
| `ignoredElements` | `Array` | `[]` | Elemen kustom yang diabaikan |
| `keyCodes` | `Object` | `{}` | Key codes kustom untuk `v-on` |

**Sumber:** `src/core/config.ts` — Properti standar Vue 2.

---

## 2. HTTP Client (Axios)

Steroids mengintegrasikan **Axios** langsung ke dalam Vue. Konfigurasi ini mengatur perilaku HTTP client global.

### 2.1. Konfigurasi Dasar

| Properti | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `axiosBaseURL` | `string` | `''` | Base URL untuk semua request HTTP |
| `axiosToken` | `string` | `''` | Bearer token default (otomatis ke header `Authorization`) |
| `axiosTimeout` | `number` | `0` | Timeout request dalam milidetik (`0` = tidak ada timeout) |
| `axiosHeaders` | `Record<string, string>` | `null` | Header kustom global untuk semua request |

### 2.2. Interceptors

| Properti | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `axiosRequestInterceptor` | `Function` | `null` | Interceptor sebelum request dikirim. Menerima `config` axios, harus me-*return* config. |
| `axiosResponseInterceptor` | `Function` | `null` | Interceptor setelah response diterima. Menerima `response` axios. |
| `axiosRequestErrorInterceptor` | `Function` | `null` | Handler error untuk request gagal. |
| `axiosResponseErrorInterceptor` | `Function` | `null` | Handler error untuk response error (contoh: 401, 500). |

### 2.3. Cara Kerja di Source Code

**Inisialisasi** (`src/core/util/http.ts`):
- HTTP Client di-*initialize* saat `initGlobalAPI()` dipanggil
- Ada **dua instance axios** terpisah:
  1. `httpInstance` — untuk user request (menggunakan `baseURL`)
  2. `componentInstance` — untuk component loading (TANPA `baseURL`)
- Interceptor request secara dinamis menerapkan `axiosToken`, `axiosHeaders`, dan `axiosBaseURL` dari config saat runtime
- Interceptor response memanggil `axiosResponseInterceptor` dan `axiosResponseErrorInterceptor` jika didefinisikan

**Prototype Methods** (`src/core/instance/http.ts`):
Semua method berikut tersedia di setiap Vue instance:

| Method | Deskripsi |
|--------|-----------|
| `this.get(url, config?)` | HTTP GET request |
| `this.post(url, data?, config?)` | HTTP POST request |
| `this.put(url, data?, config?)` | HTTP PUT request |
| `this.patch(url, data?, config?)` | HTTP PATCH request |
| `this.delete(url, config?)` | HTTP DELETE request |
| `this.head(url, config?)` | HTTP HEAD request |
| `this.options(url, config?)` | HTTP OPTIONS request |
| `this.postForm(url, data?, config?)` | POST dengan `multipart/form-data` (upload file) |
| `this.putForm(url, data?, config?)` | PUT dengan `multipart/form-data` |
| `this.patchForm(url, data?, config?)` | PATCH dengan `multipart/form-data` |

**Global Functions** (`src/core/util/http.ts`):

| Function | Deskripsi |
|----------|-----------|
| `getHttpClient()` | Mendapatkan instance axios untuk user request |
| `getComponentHttpClient()` | Mendapatkan instance axios untuk component loading (tanpa baseURL) |
| `resetHttpClient()` | Mereset instance axios dengan config baru |

### 2.4. Contoh Penggunaan

```javascript
// Global config
Vue.config.axiosBaseURL = 'https://api.example.com/v1'
Vue.config.axiosToken = 'your-jwt-token'
Vue.config.axiosTimeout = 10000
Vue.config.axiosHeaders = {
  'X-App-Version': '2.0'
}
Vue.config.axiosResponseInterceptor = (response) => {
  return response.data // Langsung return data saja
}
Vue.config.axiosResponseErrorInterceptor = (error) => {
  if (error.response?.status === 401) {
    // Redirect ke login
  }
  return Promise.reject(error)
}

// Di komponen
this.get('/users')           // → GET https://api.example.com/v1/users
this.post('/users', { name: 'John' })
this.postForm('/upload', { file: fileObject })
```

---

## 3. Dynamic Component Loader

Konfigurasi untuk memuat komponen secara dinamis dari server via AJAX.

### 3.1. Konfigurasi

| Properti | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `componentPath` | `string` | `'/components'` | Base path untuk file komponen di server |
| `componentExtension` | `string` | `'.tpl'` | Ekstensi file komponen |
| `componentFallback` | `string` | `'component-notfound'` | Nama komponen fallback jika load gagal |
| `autoFetchComponents` | `boolean` | `false` | Auto-fetch komponen dari server jika belum di-register |
| `serverSide` | `boolean` | `false` | Enable server-side bundling untuk async components |
| `serverSideURL` | `string` | `''` | URL endpoint untuk SSR bundler service |

### 3.2. Cara Kerja di Source Code

**`autoFetchComponents`** (`src/core/config.ts`):
- Jika `true`, saat komponen dipanggil di template tapi belum di-register, Vue otomatis fetch dari server
- Path otomatis: `<input-text>` → `/components/input/input-text.tpl`
- Default `false` — komponen harus di-load secara eksplisit

**`serverSide` & `serverSideURL`** (`src/core/util/dynamic-component-loader.ts`):
- Jika diaktifkan, async components dikumpulkan dalam batch dan dikirim sebagai satu request POST ke `serverSideURL`
- Server merespon dengan bundle JavaScript yang berisi `Vue.defineDynamicComponent()` untuk setiap komponen
- Client mengeksekusi bundle via **Fetch + Script Injection**

**`componentPath`** (`src/core/config.ts`):
- Digunakan sebagai base path untuk `fetchDynamicComponent()`
- Default: `'/components'`
- Jika path komponen dimulai dengan `/`, maka menjadi `{componentPath}{path}`

**`componentExtension`** (`src/core/config.ts`):
- Otomatis ditambahkan ke path komponen jika belum ada
- Default: `'.tpl'`
- Diperiksa sebelum menambahkan untuk mencegah double extension

### 3.3. Prototype & Global Methods

| Method | Deskripsi |
|--------|-----------|
| `this.fetchDynamicComponent(name, path?, options?)` | Load komponen `.tpl` dari server |
| `this.fetchDynamicComponents([...])` | Batch load multiple components |
| `this.loadAsyncComponent(name, path?, options?)` | Load dari custom path (tanpa basePath) |
| `Vue.loadAsyncComponent(name, path)` | Global version |
| `Vue.defineDynamicComponent(name, definition)` | Register komponen kapan saja (bahkan setelah `new Vue()`) |
| `Vue.dynamicComponent` | Alias untuk `defineDynamicComponent` |

**Component Options:**

| Opsi | Tipe | Deskripsi |
|------|------|-----------|
| `asyncComponents` | `Array` | Daftar komponen yang di-load otomatis saat component dibuat |
| `loadingTemplate` | `String` | Template loading yang tampil selama async components dimuat |

### 3.4. Contoh Penggunaan

```javascript
// Global config
Vue.config.componentPath = '/app/components'
Vue.config.componentExtension = '.tpl'
Vue.config.componentFallback = 'component-notfound'
Vue.config.autoFetchComponents = true

// Atau SSR bundling
Vue.config.serverSide = true
Vue.config.serverSideURL = 'http://localhost:8485/bundle'

// Load manual
this.fetchDynamicComponent('input-text', '/input/input-text')

// Async components di opsi komponen
{
  asyncComponents: [
    '/path/to/heavy-chart',
    '/path/to/data-table'
  ],
  loadingTemplate: '<div class="loading">Loading...</div>'
}
```

---

## 4. State Management (Store)

Steroids memiliki State Management bawaan yang mirip Vuex, tanpa perlu install library tambahan.

### 4.1. Konfigurasi

| Properti | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `store` | `Object` | `undefined` | Global store configuration |

### 4.2. Store Options

| Properti | Tipe | Deskripsi |
|----------|------|-----------|
| `state` | `Object` | State reaktif global |
| `getters` | `Object` | Computed state (fungsi yang menerima `state`) |
| `mutations` | `Object` | Fungsi sinkron untuk mengubah state |
| `actions` | `Object` | Fungsi asinkron yang bisa memanggil mutations |
| `modules` | `Object` | Modul-modul store (nested stores) |

### 4.3. Cara Kerja di Source Code

**Inisialisasi** (`src/core/global-api/index.ts`):
- Jika `config.store` diset, store dibuat otomatis saat `initGlobalAPI()` dipanggil
- Store dibuat sebelum instance Vue pertama kali dibuat

**Instance Init** (`src/core/instance/init.ts`):
- Jika komponen memiliki opsi `store`, komponen tersebut digunakan
- Jika tidak, global store (`config.store`) di-inject ke `vm.$store`
- Store diinisialisasi SEBELUM `beforeCreate` hook, jadi sudah tersedia dari awal

**Reactivity** (`src/core/util/store.ts`):
- State dibuat reaktif menggunakan `defineReactive()` dan `observe()` dari core Vue
- Setiap perubahan state via mutation akan otomatis memicu re-render komponen yang menggunakan state tersebut

**Module Support**:
- Module menggunakan format `'moduleName/mutationName'` untuk commit dan dispatch
- State module di-register di bawah properti `state[moduleName]`

### 4.4. Instance & Global API

| Akses | Deskripsi |
|-------|-----------|
| `this.$store` | Akses store dari komponen |
| `this.$store.state` | State reaktif |
| `this.$store.getters` | Getters (computed state) |
| `this.$store.commit(type, payload)` | Memicu mutation |
| `this.$store.dispatch(type, payload)` | Memicu action (async) |
| `this.$store.getState(path)` | Get state dengan dot notation |
| `this.$store.setState(path, value)` | Set state dengan dot notation |
| `this.$store.subscribe(fn)` | Subscribe perubahan mutation |
| `this.$store.reset()` | Reset store ke initial state |

**Global Helpers:**

| Helper | Deskripsi |
|--------|-----------|
| `Vue.mapState([...])` | Mapping state ke computed |
| `Vue.mapGetters([...])` | Mapping getters ke computed |
| `Vue.mapMutations([...])` | Mapping mutations ke methods |
| `Vue.mapActions([...])` | Mapping actions ke methods |
| `Vue.createStore(options)` | Membuat store baru |
| `Vue.Store` | Class Store |

### 4.5. Contoh Penggunaan

```javascript
// Setup global store
Vue.config.store = {
  state: {
    count: 0,
    user: null
  },
  getters: {
    isLoggedIn: (state) => !!state.user
  },
  mutations: {
    INCREMENT(state) { state.count++ },
    SET_USER(state, user) { state.user = user }
  },
  actions: {
    async fetchUser({ commit }, id) {
      const res = await this.get(`/users/${id}`)
      commit('SET_USER', res.data)
    }
  },
  modules: {
    cart: {
      state: { items: [] },
      mutations: {
        ADD_ITEM(state, item) { state.items.push(item) }
      }
    }
  }
}

// Di komponen
computed: {
  ...Vue.mapState(['count', 'user']),
  ...Vue.mapGetters(['isLoggedIn'])
},
methods: {
  ...Vue.mapMutations(['INCREMENT']),
  ...Vue.mapActions(['fetchUser']),
  addToCart(item) {
    this.$store.commit('cart/ADD_ITEM', item)
  }
}
```

---

## 5. RTC / WebSocket

Steroids memiliki RTC (Real-Time Communication) native berbasis WebSocket yang mendukung protocol Pusher/Reverb.

### 5.1. Konfigurasi

Semua konfigurasi RTC ada di dalam properti `socket`:

| Properti | Tipe | Default | Deskripsi |
|----------|------|---------|-----------|
| `socket.enabled` | `boolean` | `false` | Mengaktifkan koneksi WebSocket otomatis |
| `socket.broadcaster` | `string` | `'pusher'` | Driver broadcaster (saat ini hanya 'pusher') |
| `socket.key` | `string` | `''` | App Key untuk autentikasi ke server |
| `socket.host` | `string` | `''` | Host server WebSocket |
| `socket.port` | `number` | `80` | Port koneksi WebSocket |
| `socket.forceTLS` | `boolean` | `false` | Gunakan WSS (WebSocket Secure) |
| `socket.authEndpoint` | `string` | `'/broadcasting/auth'` | Endpoint untuk autentikasi private/presence channel |

### 5.2. Cara Kerja di Source Code

**Inisialisasi** (`src/core/util/rtc.ts`):
- `initRtcClient()` dipanggil saat `initGlobalAPI()`
- RTC Driver melakukan **auto-polling** selama 20 detik (40 attempts × 500ms) menunggu config `socket.enabled = true`
- Begitu `enabled: true` terdeteksi, koneksi WebSocket dibuat otomatis
- State koneksi (`status`, `socketId`) bersifat reaktif

**Prototype Methods** (`src/core/instance/rtc.ts`):

| Method | Deskripsi |
|--------|-----------|
| `this.$rtc` | Global RTC client instance |
| `this.$echo` | Alias Echo-compatible untuk `$rtc` |
| `this.$listen(channel, event, callback)` | Subscribe channel & listen event |
| `this.$channel(name)` | Akses channel publik |
| `this.$private(name)` | Akses private channel (auto-prefix `private-`) |
| `this.$presence(name)` | Akses presence channel |

**Event Listeners:**

| Method | Deskripsi |
|--------|-----------|
| `rtc.on('connected', fn)` | Saat koneksi terbuka |
| `rtc.on('disconnected', fn)` | Saat koneksi terputus |
| `rtc.on('error', fn)` | Saat terjadi error |
| `rtc.on('status', fn)` | Setiap perubahan status |

### 5.3. Contoh Penggunaan

```javascript
// Config
Vue.config.socket = {
  enabled: true,
  broadcaster: 'pusher',
  key: 'your-app-key',
  host: 'ws.example.com',
  port: 443,
  forceTLS: true,
  authEndpoint: '/broadcasting/auth'
}

// Di komponen
mounted() {
  this.$listen('chat', 'new-message', (data) => {
    console.log('Pesan baru:', data)
  })

  this.$private('user.1').listen('notification', (data) => {
    this.notifications.push(data)
  })
}
```

---

## 6. Built-in Router

Steroids memiliki sistem routing ringan bawaan yang terintegrasi dengan reaktivitas Vue.

### 6.1. Konfigurasi

Tidak ada konfigurasi global khusus untuk Router. Router langsung aktif setelah `initRouter()` dipanggil di `initGlobalAPI()`.

### 6.2. Cara Kerja di Source Code

**Inisialisasi** (`src/core/util/router.ts`):
- Router menggunakan `Vue.reactive('route', ...)` untuk membuat state route yang reaktif
- Mendengarkan event `popstate` dan `hashchange` untuk update otomatis
- Path dipecah menjadi segmen `path1` sampai `path5` untuk akses mudah

**Prototype Properties:**

| Properti | Deskripsi |
|----------|-----------|
| `this.$route` | Objek route reaktif |
| `this.$router` | Objek router dengan methods navigasi |

**`$route` Properties:**

| Properti | Deskripsi |
|----------|-----------|
| `path` | Path utama (pathname) |
| `fullPath` | Path lengkap + query + hash |
| `hash` | Fragment setelah `#` |
| `query` | Object parameter query string |
| `segments` | Array segmen path |
| `path1` - `path5` | Segmen path ke-1 sampai ke-5 |
| `params` | Parameter route (placeholder) |
| `meta` | Meta data route (placeholder) |

**`$router` Methods:**

| Method | Deskripsi |
|--------|-----------|
| `this.$router.push(location)` | Navigasi ke path baru (pushState) |
| `this.$router.replace(location)` | Navigasi tanpa留下 history |
| `this.$router.back()` | Kembali ke halaman sebelumnya |
| `this.$router.forward()` | Maju ke halaman berikutnya |
| `this.$router.go(n)` | Navigasi relatif n langkah |

### 6.3. Component Terdaftar

Router otomatis mendaftarkan komponen berikut:

| Komponen | Deskripsi |
|----------|-----------|
| `<router-view>` | Render komponen berdasarkan route saat ini |
| `<router-link>` | Link navigasi dengan active class |

### 6.4. Contoh Penggunaan

```javascript
// Di komponen
computed: {
  currentPage() {
    return this.$route.path1 // Segmen pertama path
  }
},
watch: {
  '$route.path'(newPath) {
    console.log('Navigasi ke:', newPath)
  }
},
methods: {
  goToSettings() {
    this.$router.push('/settings')
  }
}
```

```html
<router-link to="/dashboard" active-class="active">
  Dashboard
</router-link>

<router-view></router-view>
```

---

## 7. Storage Manager

Steroids memiliki Storage Manager built-in untuk localStorage/sessionStorage dengan fitur watch, expiry, dan namespace.

### 7.1. Konfigurasi

Tidak ada konfigurasi global. Storage langsung tersedia setelah `installStorage()` dipanggil.

### 7.2. Cara Kerja di Source Code

**Inisialisasi** (`src/core/util/storage.ts`):
- Dipanggil saat `installStorage(Vue)` di `initGlobalAPI()`
- Mendaftarkan `Vue.storage` dan `Vue.prototype.$storage`
- Jika localStorage tidak tersedia, fallback ke in-memory storage

**API Methods:**

| Method | Deskripsi |
|--------|-----------|
| `Vue.storage.set(key, value, options?)` | Menyimpan data (auto JSON) |
| `Vue.storage.get(key, defaultValue?)` | Mengambil data |
| `Vue.storage.remove(key)` | Menghapus data |
| `Vue.storage.clear()` | Menghapus semua data dalam namespace |
| `Vue.storage.keys()` | Mendapatkan semua keys |
| `Vue.storage.watch(key, callback)` | Memantau perubahan key tertentu |
| `Vue.storage.unwatch(key, callback?)` | Berhenti memantau |
| `Vue.storage.size()` | Mendapatkan ukuran storage yang digunakan |
| `Vue.storage.setOptions(options)` | Mengubah opsi storage |

**Storage Options:**

| Opsi | Tipe | Default | Deskripsi |
|------|------|---------|-----------|
| `type` | `'local' \| 'session'` | `'local'` | Jenis storage |
| `namespace` | `string` | `''` | Prefix untuk keys |
| `expires` | `number` | `0` | TTL dalam ms (`0` = tidak expired) |
| `serialize` | `Function` | `JSON.stringify` | Fungsi serialisasi |
| `deserialize` | `Function` | `JSON.parse` | Fungsi deserialisasi |

### 7.3. Contoh Penggunaan

```javascript
// Set data
this.$storage.set('user', { name: 'John', age: 30 })
this.$storage.set('token', 'abc123', { expires: 3600000 }) // 1 jam

// Get data
const user = this.$storage.get('user')
const token = this.$storage.get('token')

// Watch perubahan
this.$storage.watch('user', (newVal, oldVal) => {
  console.log('User berubah:', newVal)
})

// Dengan namespace
Vue.storage.setOptions({ namespace: 'app:' })
this.$storage.set('theme', 'dark') // → key: 'app:theme'
```

---

## 8. Standalone Reactive System

Steroids memiliki sistem reaktif standalone yang bisa digunakan di luar komponen Vue.

### 8.1. Cara Kerja di Source Code

**Inisialisasi** (`src/core/util/reactive.ts`):
- Dipanggil saat `initReactive(Vue)` di `initGlobalAPI()`
- Menggunakan hidden Vue instance untuk reactivity maksimal
- Mendaftarkan `Vue.reactive()` sebagai global function

**API:**

| Method | Deskripsi |
|--------|-----------|
| `Vue.reactive(name, initialValue)` | Membuat named reactive store global |
| `Vue.reactive(initialValue)` | Membuat anonymous reactive object |
| `store.watch(path, callback, options?)` | Watch perubahan pada path tertentu |

### 8.2. Contoh Penggunaan

```javascript
// Named store global
const state = Vue.reactive('appState', {
  count: 0,
  user: null
})

// Akses dari mana saja
state.count++ // Reaktif!
state.watch('user.name', (newVal, oldVal) => {
  console.log('Nama user berubah:', newVal)
})

// Anonymous reactive object
const localState = Vue.reactive({ theme: 'dark' })
```

---

## 9. Hooks / Composables

Steroids memiliki hooks built-in yang mirip VueUse, tanpa perlu install library tambahan.

### 9.1. Cara Kerja di Source Code

**Inisialisasi** (`src/core/util/hooks.ts`):
- Dipanggil saat `installHooks(Vue)` di `initGlobalAPI()`
- Mendaftarkan method ke `Vue.prototype`
- Juga mengeksekusi opsi `hooks` di komponen (jika didefinisikan)

**Component Options:**

| Opsi | Tipe | Deskripsi |
|------|------|-----------|
| `hooks` | `Function \| Array` | Fungsi yang dijalankan dengan `this` context komponen |

**Prototype Methods:**

| Method | Deskripsi |
|--------|-----------|
| `this.onClickOutside(refName, handler)` | Deteksi klik di luar elemen |
| `this.onWindowResize(handler, options?)` | Resize window listener |
| `this.onScroll(selector, handler)` | Scroll listener pada elemen |
| `this.onKeyPress(key, handler)` | Keyboard key listener |
| `this.onEscape(handler)` | Shorthand untuk Escape key |

### 9.2. Contoh Penggunaan

```javascript
mounted() {
  this.onClickOutside('modal', () => {
    this.showModal = false
  })

  this.onEscape(() => {
    this.showModal = false
  })

  this.onWindowResize(() => {
    this.windowWidth = window.innerWidth
  }, { immediate: true })
}
```

---

## 10. Require System

Steroids memiliki implementasi `require()` browser native untuk load modul JavaScript secara dinamis.

### 10.1. Cara Kerja di Source Code

**Inisialisasi** (`src/core/util/require.ts`):
- Dipanggil saat `initRequire()` di `initGlobalAPI()`
- Mendaftarkan fungsi ke `window.require` dan `window.requireAsync`
- Juga mendaftarkan ke `Vue.prototype.$require` dan `Vue.prototype.$requireAsync`
- Mendukung `module.exports` pattern (seperti Node.js)
- Module yang sudah di-load di-cache untuk mencegah request ulang

**Global Functions:**

| Method | Deskripsi |
|--------|-----------|
| `Vue.require(path)` / `this.$require(path)` | Load modul JS secara sinkron (Sync XHR) |
| `Vue.requireAsync(path)` / `this.$requireAsync(path)` | Load modul JS secara asinkron (Fetch) |

**Fitur:**
- ✅ Module caching
- ✅ `module.exports` pattern
- ✅ Ekstensi `.js` otomatis
- ✅ `sourceURL` untuk debugging di DevTools

### 10.2. Contoh Penggunaan

```javascript
// File module.js
module.exports = {
  formatDate(date) { return date.toLocaleDateString() },
  version: '1.0.0'
}

// Di komponen
mounted() {
  // Sync
  const helper = this.$require('/app/utils/helper')
  console.log(helper.formatDate(new Date()))

  // Async
  this.$requireAsync('/app/utils/chart').then(chart => {
    chart.render('#container')
  })
}
```

---

## 11. Portal Components

Steroids memiliki Portal system yang memungkinkan render komponen di lokasi lain di DOM (seperti Teleport di Vue 3).

### 11.1. Cara Kerja di Source Code

**Inisialisasi** (`src/core/global-api/index.ts`):
- Portal components di-register langsung di `initGlobalAPI()`
- Menggunakan `Vue.observable` untuk bus state portal
- Terinspirasi dari `portal-vue` oleh LinusBorg

**Components:**

| Komponen | Props | Deskripsi |
|----------|-------|-----------|
| `<Portal>` | `to: String`, `disabled: Boolean` | Mengirim konten ke target portal |
| `<PortalTarget>` | `name: String` | Menerima konten dari portal |

### 11.2. Contoh Penggunaan

```html
<!-- Di root app -->
<portal-target name="modal"></portal-target>

<!-- Di komponen manapun -->
<portal to="modal">
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Modal Title</h2>
      <p>Ini di-render di target portal!</p>
    </div>
  </div>
</portal>
```

---

## 12. Directives

### 12.1. `v-loading`

Steroids memiliki directive `v-loading` untuk menampilkan overlay loading dengan spinner.

| Penggunaan | Deskripsi |
|------------|-----------|
| `v-loading="isLoading"` | Menampilkan/menyembunyikan loading overlay |

**Fitur:**
- ✅ Spinner SVG dengan animasi
- ✅ Blur overlay
- ✅ Posisi relatif otomatis
- ✅ Style di-inject otomatis

**Contoh:**
```html
<div v-loading="isLoading">
  <p>Konten akan di-overlay saat loading</p>
</div>
```

---

## 13. Global API Methods

Semua method global yang ditambahkan oleh Steroids ke objek `Vue`:

| Method | Kategori | Deskripsi |
|--------|----------|-----------|
| `Vue.defineDynamicComponent(name, def)` | Dynamic Components | Register komponen kapan saja |
| `Vue.dynamicComponent` | Dynamic Components | Alias untuk `defineDynamicComponent` |
| `Vue.loadAsyncComponent(name, path)` | Dynamic Components | Load async component |
| `Vue.createStore(options)` | Store | Membuat store baru |
| `Vue.Store` | Store | Class Store |
| `Vue.mapState(...)` | Store | Helper map state |
| `Vue.mapGetters(...)` | Store | Helper map getters |
| `Vue.mapMutations(...)` | Store | Helper map mutations |
| `Vue.mapActions(...)` | Store | Helper map actions |
| `Vue.rtc` | RTC | RTC client instance |
| `Vue.reactive(name, value)` | Reactive | Standalone reactive store |
| `Vue.storage` | Storage | Storage manager |
| `Vue.portalBus` | Portal | Portal bus state |
| `Vue.require(path)` | Require | Load module sync |
| `Vue.requireAsync(path)` | Require | Load module async |
| `Vue.effect` | Composition API | Vue 3 effect (dari v3) |

**Prototype Methods (`this.`):**

| Method | Kategori | Deskripsi |
|--------|----------|-----------|
| `this.get / post / put / patch / delete / head / options` | HTTP | HTTP methods |
| `this.postForm / putForm / patchForm` | HTTP | Form data HTTP |
| `this.$store` | Store | Store instance |
| `this.$route` | Router | Route object reaktif |
| `this.$router` | Router | Router methods |
| `this.$rtc` | RTC | RTC client |
| `this.$echo` | RTC | Echo-compatible alias |
| `this.$listen(ch, ev, fn)` | RTC | Subscribe channel event |
| `this.$channel(name)` | RTC | Akses channel |
| `this.$private(name)` | RTC | Akses private channel |
| `this.$presence(name)` | RTC | Akses presence channel |
| `this.$storage` | Storage | Storage manager |
| `this.$require(path)` | Require | Load module sync |
| `this.$requireAsync(path)` | Require | Load module async |
| `this.onClickOutside(ref, fn)` | Hooks | Click outside detector |
| `this.onWindowResize(fn)` | Hooks | Window resize listener |
| `this.onScroll(sel, fn)` | Hooks | Scroll listener |
| `this.onKeyPress(key, fn)` | Hooks | Keyboard listener |
| `this.onEscape(fn)` | Hooks | Escape key listener |
| `this.api` | API Namespace | Namespace untuk method-method API |
| `this.$loading` | Loading | Reactive loading state |

**Component Options (baru):**

| Opsi | Deskripsi |
|------|-----------|
| `api` | Object berisi method-method API yang terpisah dari `methods` |
| `asyncComponents` | Array komponen yang di-load otomatis saat component dibuat |
| `loadingTemplate` | String template loading selama async components dimuat |
| `hooks` | Function atau array function yang dijalankan dengan context `this` |
| `rtc` | Function untuk inisialisasi RTC di komponen |
| `store` | Store instance spesifik untuk komponen (override global) |

---

## 14. Ringkasan Semua Config

Berikut adalah **semua properti `Vue.config`** yang tersedia (termasuk standar Vue 2 dan tambahan Steroids):

```javascript
Vue.config = {
  // ===== STANDARD VUE 2 =====
  optionMergeStrategies: {},
  silent: false,
  productionTip: true,       // false di production
  devtools: true,            // false di production
  performance: false,
  errorHandler: null,
  warnHandler: null,
  ignoredElements: [],
  keyCodes: {},

  // ===== STEROIDS: HTTP / AXIOS =====
  axiosBaseURL: '',           // Base URL semua request
  axiosToken: '',             // Bearer token default
  axiosTimeout: 0,            // Timeout dalam ms
  axiosHeaders: null,         // Header kustom global
  axiosRequestInterceptor: null,
  axiosResponseInterceptor: null,
  axiosRequestErrorInterceptor: null,
  axiosResponseErrorInterceptor: null,

  // ===== STEROIDS: DYNAMIC COMPONENTS =====
  componentPath: '/components',   // Base path file komponen
  componentExtension: '.tpl',     // Extension file (contoh: .tpl, .vue, .html)
  componentFallback: 'component-notfound',
  autoFetchComponents: false,     // Auto-fetch dari server
  serverSide: false,              // SSR bundling mode
  serverSideURL: '',              // URL bundler service

  // ===== STEROIDS: STATE MANAGEMENT =====
  store: undefined,               // Global store config

  // ===== STEROIDS: RTC / SOCKET =====
  socket: {
    enabled: false,
    broadcaster: 'pusher',
    key: '',
    host: '',
    port: 80,
    forceTLS: false,
    authEndpoint: '/broadcasting/auth'
  },

  // ===== STEROIDS: LAINNYA =====
  asyncComponent: false           // Enable async component
}
```

---

> **Catatan:** Dokumentasi ini dibuat berdasarkan pembacaan source code `src/core/config.ts`, `src/core/global-api/index.ts`, `src/core/util/*.ts`, `src/core/instance/*.ts`, dan `src/core/directives/*.ts`. Jika ada perbedaan antara dokumentasi dan perilaku aktual, source code adalah referensi utama.
