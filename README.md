# Vue 2.7.16 - Reborn ✨

> *"Terima kasih, Evan You - Vue changed my life."*

> **🍴 Fork dari [vuejs/vue](https://github.com/vuejs/vue) — Project ini adalah fork dari Vue 2 (v2.7.16) dengan tambahan fitur-fitur modern built-in.**

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-2.7.16-42b883?style=for-the-badge&logo=vuedotjs&logoColor=white)
![Fork](https://img.shields.io/badge/Fork-vuejs%2Fvue-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Axios](https://img.shields.io/badge/HTTP%20Client-Axios%20Built--in-5a29e4?style=for-the-badge)
![State](https://img.shields.io/badge/State%20Management-Built--in-orange?style=for-the-badge)

**Vue 2 is not dead - It's just getting started!** 🚀

[Features](#-why-vue-2-reborn) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Changelog](CHANGELOG.md)

</div>

---

## 💚 A Love Letter to Vue 2

Pertama dan terutama, **terima kasih yang sebesar-besarnya kepada [Evan You](https://github.com/yyx990803)**.

Vue.js bukan hanya sebuah framework - ia adalah **revolusi** dalam cara kita membangun web applications. Dengan filosofi yang sederhana, dokumentasi yang luar biasa, dan developer experience yang tidak tertandingi, Vue 2 telah membantu **jutaan developers** di seluruh dunia membangun sesuatu yang menakjubkan.

> _"Vue gave me superpowers. Now I want to give those superpowers back to the community."_

Vue 2 mungkin sudah mencapai end-of-life, tapi **kemudahannya tidak boleh terlupakan**. Itulah mengapa project ini lahir - untuk **menghidupkan kembali Vue 2** dengan semua fitur modern yang Anda butuhkan, tanpa harus migrasi ke Vue 3.

---

## 🎯 Why Vue 2 Reborn?

### The Problem

Banyak project masih berjalan di Vue 2:
- ✅ Aplikasi enterprise yang stabil
- ✅ Legacy systems yang sulit di-migrate
- ✅ Teams yang belum siap untuk Composition API
- ✅ Budget constraints yang tidak allow untuk rewrite

Tapi mereka butuh fitur-fitur modern:
- ❌ Harus install Vuex terpisah
- ❌ Harus setup axios di setiap component
- ❌ Tidak bisa lazy load components dengan mudah
- ❌ Harus rewrite untuk dynamic imports

### The Solution

**Vue 2 Reborn** menjawab semua itu dengan menambahkan fitur-fitur modern **langsung ke dalam source code Vue 2**:

| Fitur | Vue 2 Original | Vue 2 Reborn |
|-------|----------------|--------------|
| HTTP Client | ❌ Install axios | ✅ **Built-in** |
| State Management | ❌ Install Vuex | ✅ **Built-in** |
| Dynamic Components | ❌ Manual setup | ✅ **Auto-resolve** |
| Lazy Loading | ❌ Complex config | ✅ **One line** |
| Component Registry | ❌ Must before init | ✅ **Anytime** |

---

## ✨ Why Vue 2 Reborn

### 🎁 All-in-One Package

**Tidak perlu install apapun lagi!** Semua yang Anda butuhkan sudah ada di dalam satu package:

```javascript
// Dulu: Harus install 5+ libraries
import Vue from 'vue'
import axios from 'axios'
import Vuex from 'vuex'
import VueLazyload from 'vue-lazyload'
import VueCompositionAPI from '@vue/composition-api'

// Sekarang: Cukup Vue saja!
import Vue from 'vue'
// Selesai! Semuanya sudah include! ✅
```

### 🚀 Modern Features, Classic Simplicity

Dapatkan semua fitur modern tanpa perlu belajar Composition API:

```javascript
// Tetap dengan Options API yang Anda cintai
new Vue({
  el: '#app',
  data: { count: 0 },
  methods: {
    // HTTP request tanpa import axios
    async loadData() {
      const response = await this.get('/api/data')
      this.items = response.data
    },
    
    // State management tanpa Vuex
    increment() {
      this.$store.commit('INCREMENT')
    }
  }
})
```

### 💪 Production Ready

- ✅ **100% Backward Compatible** - Tidak ada breaking changes
- ✅ **All Tests Passing** - 144/144 tests
- ✅ **TypeScript Support** - Full type definitions
- ✅ **DevTools Ready** - Bisa di-track dan di-debug
- ✅ **Zero Breaking Changes** - Upgrade tanpa fear

---

## 🎯 New Features

### 1. 🌐 Built-in HTTP Client (Axios)

Tidak perlu import axios lagi! HTTP methods sudah tersedia di setiap Vue instance:

```javascript
new Vue({
  methods: {
    // Langsung pakai!
    async getUsers() {
      return await this.get('/api/users')
    },
    
    async createUser(data) {
      return await this.post('/api/users', data)
    },
    
    async uploadFile(file) {
      return await this.postForm('/api/upload', { file })
    }
  }
})
```

**Features:**
- ✅ 11 HTTP methods (get, post, put, patch, delete, dll)
- ✅ Form data support (postForm, putForm, patchForm)
- ✅ Request/Response interceptors
- ✅ Auto token management
- ✅ Error handling callbacks

📖 [Baca dokumentasi lengkap →](docs/steroids/AXIOS_INTEGRATION.md)

---

### 2. 🏪 Built-in State Management

Tidak perlu Vuex! State management sekarang built-in dengan API yang lebih simple:

```javascript
// 1. Setup store
Vue.config.store = {
  state: {
    count: 0,
    user: null
  },
  getters: {
    isLoggedIn: (state) => !!state.user
  },
  mutations: {
    INCREMENT(state) { state.count++ }
  },
  actions: {
    async fetchUser({ commit }, id) {
      const user = await this.get(`/api/users/${id}`)
      commit('SET_USER', user.data)
    }
  }
}

// 2. Gunakan di component
new Vue({
  computed: {
    ...Vue.mapState(['count', 'user']),
    ...Vue.mapGetters(['isLoggedIn'])
  },
  methods: {
    ...Vue.mapMutations(['INCREMENT']),
    ...Vue.mapActions(['fetchUser'])
  }
})
```

**Features:**
- ✅ Reactive state (auto-update)
- ✅ Getters untuk computed state
- ✅ Mutations untuk synchronous changes
- ✅ Actions untuk asynchronous operations
- ✅ Modules support
- ✅ Helper functions (mapState, mapGetters, dll)

📖 [Baca dokumentasi lengkap →](docs/steroids/STATE_MANAGEMENT.md)

---

### 3. 🎨 Dynamic Component Registration

Daftarkan komponen **kapan saja**, bahkan setelah Vue instance diinisialisasi:

```javascript
// Dulu: Harus sebelum new Vue()
Vue.component('my-comp', { ... })
new Vue({ ... })

// Sekarang: Bisa kapan saja!
new Vue({ ... })

// Register component setelah init
Vue.defineDynamicComponent('my-comp', {
  template: '<div>Hello!</div>'
})
```

**Features:**
- ✅ Register components anytime
- ✅ Auto forceUpdate semua instances
- ✅ Support kebab-case, camelCase, PascalCase
- ✅ Global registry across all instances

📖 [Baca dokumentasi lengkap →](docs/steroids/DYNAMIC_COMPONENTS_PERFORMANCE.md)

---

### 4. 📦 Dynamic Component Loader via AJAX

Load komponen dari server secara dinamis:

```javascript
new Vue({
  methods: {
    async loadComponent() {
      await this.fetchDynamicComponent(
        'input-text',
        '/components/input/input-text',
        'component-notfound'
      )
    }
  }
})
```

**Component File Format:**
```html
<!-- /components/input/input-text.tpl -->
<script>
module.exports = {
  data: () => ({ value: '' }),
  methods: {
    onChange(e) { this.value = e.target.value }
  }
}
</script>

<template>
  <input :value="value" @input="onChange" />
</template>
```

**Features:**
- ✅ Load dari server via AJAX
- ✅ Auto-parse `<script>` dan `<template>`
- ✅ Auto-register component
- ✅ Fallback component support
- ✅ Success/error callbacks
- ✅ Batch loading

📖 [Baca dokumentasi lengkap →](docs/steroids/DYNAMIC_COMPONENT_LOADER.md)

---

### 5. 🔄 Auto-Resolve Components

Komponen tidak terdaftar? Vue akan **otomatis fetch** dari server!

```html
<template>
  <div>
    <!-- Component belum terdaftar -->
    <input-text></input-text>
    
    <!-- Vue otomatis fetch dari: -->
    <!-- /components/input/input-text.tpl -->
  </div>
</template>
```

**Auto Path Generation:**
```
input-text  →  /components/input/input-text.tpl
button-primary  →  /components/button/button-primary.tpl
header  →  /components/header.tpl
```

**Features:**
- ✅ Auto-fetch dari server
- ✅ Auto-parse & register
- ✅ Auto forceUpdate
- ✅ Fallback component
- ✅ Duplicate prevention

📖 [Baca dokumentasi lengkap →](docs/steroids/AUTO_RESOLVE_COMPONENTS.md)

---

### 6. ⚡ SSR Bundling (Server-Side Component Bundling)

Optimasi pemuatan komponen dengan menggabungkan banyak request file `.tpl` menjadi satu bundle JavaScript dari server:

```javascript
// Cukup aktifkan SSR mode
Vue.config.serverSide = true
Vue.config.serverSideURL = 'http://localhost:8485/bundle'

// Async components otomatis di-batch
{
  asyncComponents: [
    '/path/to/heavy-chart',
    '/path/to/data-table',
    '/path/to/map-view'
  ]
}
```

**Cara Kerja:**
1. Client mengumpulkan semua path komponen yang belum di-load
2. Dikirim sebagai satu request POST ke `serverSideURL`
3. Server merespon dengan bundle JavaScript berisi `Vue.defineDynamicComponent()` untuk setiap komponen
4. Client mengeksekusi bundle via **Fetch + Script Injection**
5. Semua komponen langsung terdaftar dan siap pakai

**Features:**
- ✅ Batch request (satu request untuk banyak komponen)
- ✅ Smart caching (hanya komponen yang belum dimuat yang di-request)
- ✅ Dynamic Script Injection dengan `sourceURL` untuk debugging
- ✅ Fallback jika bundle gagal di-load
- ✅ Compatible dengan `asyncComponents` option

📖 [Baca dokumentasi lengkap →](docs/steroids/CONFIGURATIONS.md#3-dynamic-component-loader)

---

## 🚀 Quick Start

### Installation

```bash
# Install via npm
npm install vue@2.7.16

# Or use CDN
<script src="https://unpkg.com/vue@2.7.16/dist/vue.js"></script>
```

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Axios sudah include! -->
  <script src="./vue.js"></script>
</head>
<body>
  <div id="app">
    <h1>Count: {{ count }}</h1>
    <button @click="increment">+1</button>
  </div>

  <script>
    // 1. Setup store (optional)
    Vue.config.store = {
      state: { count: 0 },
      mutations: {
        INCREMENT(state) { state.count++ }
      }
    }

    // 2. Create Vue instance
    new Vue({
      el: '#app',
      computed: {
        count() { return this.$store.state.count }
      },
      methods: {
        increment() {
          this.$store.commit('INCREMENT')
        },
        
        // HTTP request tanpa import
        async loadData() {
          const response = await this.get('/api/data')
          console.log(response.data)
        }
      }
    })
  </script>
</body>
</html>
```

---

## 📚 Documentation

| Topic | Description | Link |
|-------|-------------|------|
| **Full Configuration** | Semua konfigurasi lengkap (berdasarkan source code) | [Read →](docs/steroids/CONFIGURATIONS.md) |
| **State Management** | Built-in store seperti Vuex | [Read →](docs/steroids/STATE_MANAGEMENT.md) |
| **HTTP Client** | Axios integration | [Read →](docs/steroids/AXIOS_INTEGRATION.md) |
| **Dynamic Components** | Register components anytime | [Read →](docs/steroids/DYNAMIC_COMPONENTS_PERFORMANCE.md) |
| **Component Loader** | Load from server via AJAX | [Read →](docs/steroids/DYNAMIC_COMPONENT_LOADER.md) |
| **Auto-Resolve** | Automatic component fetching | [Read →](docs/steroids/AUTO_RESOLVE_COMPONENTS.md) |
| **SSR Bundling** | Server-Side component bundling | [Read →](docs/steroids/CONFIGURATIONS.md#3-dynamic-component-loader) |
| **Performance** | Optimization tips | [Read →](docs/steroids/DYNAMIC_COMPONENTS_PERFORMANCE.md) |
| **Changelog** | All changes | [Read →](CHANGELOG.md) |

---

## 📊 Perbandingan Detail: Vue 2.7 Default vs Vue Steroids

### Perbedaan dari Segi Source Code

| Aspek | Vue 2.7 (Default) | Vue Steroids (Fork) |
|-------|:-----------------:|:-------------------:|
| **Package** | `vue` by Evan You | `vue` (fork, modified) |
| **Repository** | [github.com/vuejs/vue](https://github.com/vuejs/vue) | [github.com/oneaxxall/vue-steroids](https://github.com/oneaxxall/vue-steroids) |
| **Runtime Dependencies** | ❌ **None** (zero dependency) | ✅ **Axios** (`axios@^1.14.0`) |
| **Bundle Size** | ~33kb (gzip) | ~90kb (gzip) — includes axios + additional features |

---

### ⚙️ Inisialisasi & Instance

| Fitur | Vue 2.7 (Default) | Vue Steroids | Keterangan |
|-------|:-----------------:|:------------:|------------|
| **Register component setelah `new Vue()`** | ❌ **Tidak bisa** — komponen harus di-register dengan `Vue.component()` SEBELUM `new Vue()`. Jika register setelah init, komponen tidak akan pernah di-resolve. | ✅ **Bisa** — `Vue.defineDynamicComponent('nama', { ... })` bekerja kapan saja. Semua instance Vue langsung di-`forceUpdate` otomatis. | **🔥 Problem utama yang diselesaikan.** |
| **Auto-Resolve unregistered component** | ❌ **Tidak ada** — jika `<input-text>` dipanggil di template `form-component` tapi belum di-register, Vue hanya menampilkan warning dan komponen tidak dirender. | ✅ **Ada** — jika `Vue.config.autoFetchComponents = true`, Vue otomatis fetch komponen dari server (`/components/input/input-text.tpl`), parse, register, dan re-render. | *Lihat `src/core/util/options.ts` — fungsi `defineDynamicComponent`* |
| **Force update instance saat komponen baru didaftarkan** | ❌ Tidak ada mekanisme otomatis | ✅ Semua instance register (`vueInstances[]`) otomatis di-`$forceUpdate()` saat `defineDynamicComponent()` dipanggil | *Lihat `src/core/instance/init.ts` — `registerVueInstance(vm)`* |
| **Store otomatis di inject ke instance** | ❌ Harus install & setup Vuex manual | ✅ `vm.$store` langsung tersedia jika `Vue.config.store` atau `vm.$options.store` diset | *Lihat `src/core/instance/init.ts`* |
| **Async components (`asyncComponents` option)** | ❌ Tidak ada | ✅ Bisa load komponen async via `asyncComponents: ['/path/to/comp']` di options | *Lihat `src/core/util/dynamic-component-loader.ts`* |
| **`$loading` reactive state** | ❌ Tidak ada | ✅ `vm.$loading` otomatis terdefinisi secara reactive untuk semua instance | *Lihat `src/core/instance/state.ts` — `defineReactive(vm, '$loading', false)`* |

---

### 🌐 HTTP Client (Axios)

| Fitur | Vue 2.7 (Default) | Vue Steroids | Keterangan |
|-------|:-----------------:|:------------:|------------|
| **Built-in HTTP methods** | ❌ Harus install `axios` & import di setiap file | ✅ `this.get()`, `this.post()`, `this.put()`, `this.patch()`, `this.delete()`, `this.head()`, `this.options()` — langsung tersedia di prototype | *Lihat `src/core/instance/http.ts`* |
| **Form data methods** | ❌ Tidak ada | ✅ `this.postForm()`, `this.putForm()`, `this.patchForm()` untuk upload file | *Lihat `src/core/instance/http.ts`* |
| **Global interceptors via config** | ❌ Harus setup axios instance manual | ✅ `Vue.config.axiosRequestInterceptor`, `Vue.config.axiosResponseInterceptor`, dll | *Lihat `src/core/config.ts`* |
| **Auto token management** | ❌ Manual | ✅ `Vue.config.axiosToken` — otomatis ditambahkan ke header Authorization | *Lihat `src/core/util/http.ts`* |
| **Global headers** | ❌ Manual | ✅ `Vue.config.axiosHeaders` — headers kustom global | *Lihat `src/core/util/http.ts`* |
| **Base URL global** | ❌ Manual | ✅ `Vue.config.axiosBaseURL` — base URL untuk semua request | *Lihat `src/core/util/http.ts`* |
| **Timeout global** | ❌ Manual | ✅ `Vue.config.axiosTimeout` — default timeout semua request | *Lihat `src/core/util/http.ts`* |
| **API Namespace (`api` option)** | ❌ Tidak ada | ✅ Component option `api: { ... }` — method-method HTTP dipisah di namespace `this.api` | *Lihat `src/core/instance/state.ts` — `initApi()`* |

---

### 🏪 State Management

| Fitur | Vue 2.7 (Default) | Vue Steroids | Keterangan |
|-------|:-----------------:|:------------:|------------|
| **Store built-in (tanpa Vuex)** | ❌ Harus install `vuex` | ✅ `Vue.config.store = { state, getters, mutations, actions }` | *Lihat `src/core/util/store.ts`* |
| **Helper functions** | ❌ Hanya dari Vuex | ✅ `Vue.mapState()`, `Vue.mapGetters()`, `Vue.mapMutations()`, `Vue.mapActions()` | *Lihat `src/core/global-api/index.ts`* |
| **Modules support** | ❌ Hanya dari Vuex | ✅ Store modules dengan sub-state/mutations sendiri | *Lihat `src/core/util/store.ts`* |
| **Subscribers (seperti Vuex plugins)** | ❌ Tidak ada | ✅ `store.subscribe()` — callback setiap kali mutation di-commit | *Lihat `src/core/util/store.ts`* |

---

### 🧭 Routing

| Fitur | Vue 2.7 (Default) | Vue Steroids | Keterangan |
|-------|:-----------------:|:------------:|------------|
| **Built-in router (tanpa vue-router)** | ❌ Harus install `vue-router` | ✅ Router ringan built-in, komponen `<router-view>` & `<router-link>` | *Lihat `src/core/util/router.ts`* |
| **Reactive route object** | ❌ Hanya dari vue-router | ✅ `this.$route` reactive dengan path, query, hash, segments | *Lihat `src/core/util/router.ts`* |
| **Layout support** | ❌ Hanya dari vue-router | ✅ Layout pages via `layout-{name}` components | *Lihat `src/core/util/router-components.ts`* |
| **Route watchers** | ❌ Hanya dari vue-router | ✅ `Vue.config.router.watch = { '/path': callback }` | *Lihat `docs/steroids/ROUTE_WATCHERS.md`* |

---

### ⚡ Real-Time Communication (RTC)

| Fitur | Vue 2.7 (Default) | Vue Steroids | Keterangan |
|-------|:-----------------:|:------------:|------------|
| **WebSocket/Pusher built-in** | ❌ Harus install `pusher-js` atau `laravel-echo` | ✅ RTC Driver native dengan dukungan Pusher/Reverb protocol | *Lihat `src/core/util/rtc.ts`* |
| **Socket config global** | ❌ Tidak ada | ✅ `Vue.config.socket = { enabled, broadcaster, key, host, port, authEndpoint }` | *Lihat `src/core/config.ts`* |
| **Channel methods di instance** | ❌ Tidak ada | ✅ `this.$rtc.channel()`, `this.$rtc.private()`, `this.$rtc.presence()` | *Lihat `src/core/instance/rtc.ts`* |

---

### 🧩 Dynamic Components & Loading

| Fitur | Vue 2.7 (Default) | Vue Steroids | Keterangan |
|-------|:-----------------:|:------------:|------------|
| **Register component kapan saja** | ❌ **Harus sebelum `new Vue()`** | ✅ `Vue.defineDynamicComponent()` — bisa setelah `new Vue()` | *Lihat `src/core/util/options.ts`* |
| **Auto-fetch dari server** | ❌ Tidak ada | ✅ Jika `autoFetchComponents = true`, unregistered component otomatis di-fetch | *Lihat `src/core/util/options.ts`* |
| **Dynamic Component Loader via AJAX** | ❌ Tidak ada | ✅ `this.fetchDynamicComponent(name, path, fallback)` — load `.tpl` dari server | *Lihat `src/core/util/dynamic-component-loader.ts`* |
| **Loading directive (`v-loading`)** | ❌ Tidak ada | ✅ `v-loading` dengan spinner SVG dan blur overlay | *Lihat `src/core/directives/loading.ts`* |
| **Loading template** | ❌ Tidak ada | ✅ `loadingTemplate` option untuk komponen async | *Lihat `docs/steroids/LOAD_ASYNC_COMPONENT.md`* |

---

### 🔧 Utility & Lainnya

| Fitur | Vue 2.7 (Default) | Vue Steroids | Keterangan |
|-------|:-----------------:|:------------:|------------|
| **Portal / Teleport** | ❌ Tidak ada | ✅ Komponen `<Portal to="target">` & `<PortalTarget name="target">` (seperti Vue 3 Teleport) | *Lihat `src/core/util/portal.ts`* |
| **Storage Manager** | ❌ Tidak ada | ✅ `Vue.$storage.set()`, `Vue.$storage.get()`, `Vue.$storage.remove()` — dengan namespace & expiry | *Lihat `src/core/util/storage.ts`* |
| **Hooks / Composables built-in** | ❌ Tidak ada | ✅ `this.onClickOutside(refName, handler)` — tanpa library tambahan | *Lihat `src/core/util/hooks.ts`* |
| **Standalone Reactive System** | ❌ Tidak ada | ✅ `Vue.reactive(name, initialValue)` — reactive store independen di luar komponen | *Lihat `src/core/util/reactive.ts`* |
| **Browser `require()`** | ❌ Tidak ada | ✅ `Vue.require()` / `Vue.requireAsync()` — load module JS secara dinamis | *Lihat `src/core/util/require.ts`* |
| **Composition API (Vue 3 backport)** | ⚠️ Terbatas (resmi dari Vue) | ✅ Sama seperti Vue 2.7 (ref, reactive, computed, watch) | *Lihat `src/v3/`* |
| **Mixins system** | ❌ Tidak ada | ✅ `Vue.mixin()` custom | *Lihat `docs/steroids/MIXINS.md`* |
| **XML Props parser** | ❌ Tidak ada | ✅ Parse XML attributes menjadi props komponen | *Lihat `docs/steroids/ODOO_XML_PARAMS.md`* |

---

### 💥 Ringkasan: Masalah yang Diselesaikan

| Masalah di Vue 2.7 Default | Solusi di Vue Steroids |
|----------------------------|------------------------|
| Komponen harus di-register SEBELUM `new Vue()`. Jika ada komponen yang di-load belakangan, tidak bisa di-resolve. | **`Vue.defineDynamicComponent()`** — register kapan saja, auto forceUpdate semua instance. |
| Jika `<input-text>` dipanggil di template `form-component` tapi belum di-load, Vue hanya kasih warning dan komponen tidak tampil. | **Auto-Resolve** — otomatis fetch dari server, parse, register, & render ulang. |
| HTTP client (axios) harus install & import terpisah di setiap file. | **Built-in HTTP** — 11 method langsung di `this`. |
| State management harus install Vuex, setup store, plugin, dll. | **Built-in Store** — cukup `Vue.config.store = {...}`. |
| Real-time communication harus install pusher-js / laravel-echo. | **Built-in RTC** — WebSocket/Pusher native. |
| Routing harus install vue-router. | **Built-in Router** — `<router-view>` & `<router-link>` siap pakai. |
| Teleport/Portal tidak ada di Vue 2. | **Portal** — `<Portal to="target">` seperti Vue 3 Teleport. |
| Loading state management manual. | **v-loading** directive + **$loading** reactive property. |
| LocalStorage management manual. | **$storage** plugin — get/set/remove + expiry. |

---

## 🎯 Use Cases

### Perfect For:

1. **Legacy Projects**
   - Sudah berjalan di Vue 2
   - Sulit migrate ke Vue 3
   - Butuh fitur modern tanpa rewrite

2. **Rapid Prototyping**
   - Setup minimal
   - All features built-in
   - Quick to production

3. **Learning & Teaching**
   - Options API yang mudah dipahami
   - Tidak perlu belajar Composition API dulu
   - Dokumentasi lengkap

4. **Enterprise Applications**
   - Stable & tested
   - No breaking changes
   - Long-term support

---

## 🍴 Fork Information

Project ini adalah **fork dari [vuejs/vue](https://github.com/vuejs/vue)** (Vue 2 v2.7.16).

### Apa artinya "Fork"?

- ✅ **Source code** diambil langsung dari repository resmi Vue 2 (commit terakhir Vue 2 sebelum end-of-life)
- ✅ **Fitur baru** ditambahkan **di atas** kode asli Vue 2 — tidak ada kode Vue 3 yang di-backport selain Composition API
- ✅ **100% backward compatible** — semua API Vue 2 original tetap berfungsi seperti biasa
- ❌ **Bukan re-write** — kami tidak menulis ulang Vue dari awal
- ❌ **Bukan Vue 3** — ini tetap Vue 2 dengan peningkatan

### Perubahan pada Source Code

Semua modifikasi dilakukan langsung di source code Vue 2:

| Area | Perubahan |
|------|-----------|
| `src/core/instance/` | Ditambahkan `http.ts`, `rtc.ts` — methods HTTP & RTC di prototype Vue |
| `src/core/global-api/` | Init HTTP client, store, router, dynamic components, dll |
| `src/core/util/` | Ditambahkan `http.ts`, `store.ts`, `router.ts`, `rtc.ts`, `storage.ts`, `hooks.ts`, dll |
| `src/v3/` | Backport Composition API (ref, reactive, computed, watch) dari Vue 3 |
| `package.json` | Ditambahkan dependency `axios`, `workspace:*` untuk monorepo |

### Source Code Asli

Untuk melihat source code Vue 2 yang original (tanpa modifikasi), kunjungi:
- **GitHub**: [https://github.com/vuejs/vue](https://github.com/vuejs/vue)
- **Website**: [https://vuejs.org](https://vuejs.org)

---

## 🙏 Acknowledgments

### Special Thanks

**[Evan You](https://github.com/yyx990803)** - Creator of Vue.js
> _"Terima kasih telah menciptakan sesuatu yang mengubah hidup begitu banyak developers. Vue adalah inspirasi, dan project ini adalah tribute kepada kerja keras Anda."_

**Vue Core Team** - Untuk maintenance dan improvements selama bertahun-tahun

**Vue Community** - Untuk contributions, plugins, dan ecosystem yang luar biasa

**You** - Untuk terus menggunakan dan mencintai Vue 2! 💚

---

## 🤝 Contributing

Kami menerima contributions! Jika Anda menemukan bug atau punya fitur request:

1. Fork repository
2. Create feature branch
3. Commit your changes
4. Push to the branch
5. Create Pull Request

Atau buat issue untuk diskusi terlebih dahulu.

---

## 📄 License

[MIT License](LICENSE) - Same as Vue 2

---

## 📬 Stay Connected

- **Star** repository ini jika Anda menyukai project ini ⭐
- **Share** ke teman-teman developer yang masih pakai Vue 2
- **Contribute** dengan cara apapun yang Anda bisa

---

<div align="center">

**Dibuat dengan 💚 oleh komunitas, untuk komunitas**

_"Vue 2 is not dead, it's immortal."_

[⬆ Back to Top](#vue-2716---reborn-)

</div>
