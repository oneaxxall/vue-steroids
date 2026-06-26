# 📋 Vue Steroids Complete Configuration

> This documentation is based on reading the source code of `src/core/config.ts`, `src/core/global-api/index.ts`, and all Steroids utilities.

---

## 📑 Table of Contents

1. [Vue 2 Basic Configuration](#1-vue-2-basic-configuration)
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
14. [Complete Config Summary](#14-complete-config-summary)

---

## 1. Vue 2 Basic Configuration

These are standard Vue 2 configurations that remain available and function normally.

| Property | Type | Default | Description |
|----------|------|---------|-----------|
| `optionMergeStrategies` | `Object` | `{}` | Component option merge strategies |
| `silent` | `boolean` | `false` | Suppress all Vue warning logs |
| `productionTip` | `boolean` | `true` (dev) | Production mode tip on bootstrap |
| `devtools` | `boolean` | `true` (dev) | Enable Vue Devtools |
| `performance` | `boolean` | `false` | Track component performance |
| `errorHandler` | `Function` | `null` | Error handler for watchers |
| `warnHandler` | `Function` | `null` | Warning handler for watchers |
| `ignoredElements` | `Array` | `[]` | Custom elements to ignore |
| `keyCodes` | `Object` | `{}` | Custom key codes for `v-on` |

**Source:** `src/core/config.ts` — Standard Vue 2 properties.

---

## 2. HTTP Client (Axios)

Steroids integrates **Axios** directly into Vue. This configuration controls the global HTTP client behavior.

### 2.1. Basic Configuration

| Property | Type | Default | Description |
|----------|------|---------|-----------|
| `axiosBaseURL` | `string` | `''` | Base URL for all HTTP requests |
| `axiosToken` | `string` | `''` | Default Bearer token (automatically added to `Authorization` header) |
| `axiosTimeout` | `number` | `0` | Request timeout in milliseconds (`0` = no timeout) |
| `axiosHeaders` | `Record<string, string>` | `null` | Custom global headers for all requests |

### 2.2. Interceptors

| Property | Type | Default | Description |
|----------|------|---------|-----------|
| `axiosRequestInterceptor` | `Function` | `null` | Interceptor before request is sent. Receives axios `config`, must return config. |
| `axiosResponseInterceptor` | `Function` | `null` | Interceptor after response is received. Receives axios `response`. |
| `axiosRequestErrorInterceptor` | `Function` | `null` | Error handler for failed requests. |
| `axiosResponseErrorInterceptor` | `Function` | `null` | Error handler for error responses (e.g., 401, 500). |

### 2.3. How It Works in the Source Code

**Initialization** (`src/core/util/http.ts`):
- HTTP Client is initialized when `initGlobalAPI()` is called
- There are **two separate axios instances**:
  1. `httpInstance` — for user requests (uses `baseURL`)
  2. `componentInstance` — for component loading (WITHOUT `baseURL`)
- Request interceptor dynamically applies `axiosToken`, `axiosHeaders`, and `axiosBaseURL` from config at runtime
- Response interceptor calls `axiosResponseInterceptor` and `axiosResponseErrorInterceptor` if defined

**Prototype Methods** (`src/core/instance/http.ts`):
All the following methods are available on every Vue instance:

| Method | Description |
|--------|-----------|
| `this.get(url, config?)` | HTTP GET request |
| `this.post(url, data?, config?)` | HTTP POST request |
| `this.put(url, data?, config?)` | HTTP PUT request |
| `this.patch(url, data?, config?)` | HTTP PATCH request |
| `this.delete(url, config?)` | HTTP DELETE request |
| `this.head(url, config?)` | HTTP HEAD request |
| `this.options(url, config?)` | HTTP OPTIONS request |
| `this.postForm(url, data?, config?)` | POST with `multipart/form-data` (file upload) |
| `this.putForm(url, data?, config?)` | PUT with `multipart/form-data` |
| `this.patchForm(url, data?, config?)` | PATCH with `multipart/form-data` |

**Global Functions** (`src/core/util/http.ts`):

| Function | Description |
|----------|-----------|
| `getHttpClient()` | Get axios instance for user requests |
| `getComponentHttpClient()` | Get axios instance for component loading (without baseURL) |
| `resetHttpClient()` | Reset axios instance with new config |

### 2.4. Usage Example

```javascript
// Global config
Vue.config.axiosBaseURL = 'https://api.example.com/v1'
Vue.config.axiosToken = 'your-jwt-token'
Vue.config.axiosTimeout = 10000
Vue.config.axiosHeaders = {
  'X-App-Version': '2.0'
}
Vue.config.axiosResponseInterceptor = (response) => {
  return response.data // Return data directly
}
Vue.config.axiosResponseErrorInterceptor = (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
  }
  return Promise.reject(error)
}

// In component
this.get('/users')           // → GET https://api.example.com/v1/users
this.post('/users', { name: 'John' })
this.postForm('/upload', { file: fileObject })
```

---

## 3. Dynamic Component Loader

Configuration for loading components dynamically from the server via AJAX.

### 3.1. Configuration

| Property | Type | Default | Description |
|----------|------|---------|-----------|
| `componentPath` | `string` | `'/components'` | Base path for component files on the server |
| `componentExtension` | `string` | `'.tpl'` | Component file extension |
| `componentFallback` | `string` | `'component-notfound'` | Fallback component name if load fails |
| `autoFetchComponents` | `boolean` | `false` | Auto-fetch components from server if not registered |
| `serverSide` | `boolean` | `false` | Enable server-side bundling for async components |
| `serverSideURL` | `string` | `''` | URL endpoint for SSR bundler service |

### 3.2. How It Works in the Source Code

**`autoFetchComponents`** (`src/core/config.ts`):
- If `true`, when a component is called in a template but hasn't been registered, Vue automatically fetches from server
- Auto path: `<input-text>` → `/components/input/input-text.tpl`
- Default `false` — components must be loaded explicitly

**`serverSide` & `serverSideURL`** (`src/core/util/dynamic-component-loader.ts`):
- If enabled, async components are collected in a batch and sent as a single POST request to `serverSideURL`
- Server responds with a JavaScript bundle containing `Vue.defineDynamicComponent()` for each component
- Client executes the bundle via **Fetch + Script Injection**

**`componentPath`** (`src/core/config.ts`):
- Used as base path for `fetchDynamicComponent()`
- Default: `'/components'`
- If component path starts with `/`, it becomes `{componentPath}{path}`

**`componentExtension`** (`src/core/config.ts`):
- Automatically appended to component path if not already present
- Default: `'.tpl'`
- Checked before appending to prevent double extension

### 3.3. Prototype & Global Methods

| Method | Description |
|--------|-----------|
| `this.fetchDynamicComponent(name, path?, options?)` | Load `.tpl` component from server |
| `this.fetchDynamicComponents([...])` | Batch load multiple components |
| `this.loadAsyncComponent(name, path?, options?)` | Load from custom path (without basePath) |
| `Vue.loadAsyncComponent(name, path)` | Global version |
| `Vue.defineDynamicComponent(name, definition)` | Register component anytime (even after `new Vue()`) |
| `Vue.dynamicComponent` | Alias for `defineDynamicComponent` |

**Component Options:**

| Option | Type | Description |
|------|------|-----------|
| `asyncComponents` | `Array` | List of components that are automatically loaded when the component is created |
| `loadingTemplate` | `String` | Loading template displayed while async components are loading |

### 3.4. Usage Example

```javascript
// Global config
Vue.config.componentPath = '/app/components'
Vue.config.componentExtension = '.tpl'
Vue.config.componentFallback = 'component-notfound'
Vue.config.autoFetchComponents = true

// Or SSR bundling
Vue.config.serverSide = true
Vue.config.serverSideURL = 'http://localhost:8485/bundle'

// Manual load
this.fetchDynamicComponent('input-text', '/input/input-text')

// Async components in component options
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

Steroids has a built-in State Management similar to Vuex, without needing to install additional libraries.

### 4.1. Configuration

| Property | Type | Default | Description |
|----------|------|---------|-----------|
| `store` | `Object` | `undefined` | Global store configuration |

### 4.2. Store Options

| Property | Type | Description |
|----------|------|-----------|
| `state` | `Object` | Global reactive state |
| `getters` | `Object` | Computed state (functions that receive `state`) |
| `mutations` | `Object` | Synchronous functions to mutate state |
| `actions` | `Object` | Asynchronous functions that can call mutations |
| `modules` | `Object` | Store modules (nested stores) |

### 4.3. How It Works in the Source Code

**Initialization** (`src/core/global-api/index.ts`):
- If `config.store` is set, the store is automatically created when `initGlobalAPI()` is called
- Store is created before the first Vue instance is created

**Instance Init** (`src/core/instance/init.ts`):
- If a component has a `store` option, that component's store is used
- Otherwise, the global store (`config.store`) is injected into `vm.$store`
- Store is initialized BEFORE the `beforeCreate` hook, so it's available from the start

**Reactivity** (`src/core/util/store.ts`):
- State is made reactive using `defineReactive()` and `observe()` from Vue core
- Every state change via mutation will automatically trigger re-render of components that use that state

**Module Support**:
- Modules use `'moduleName/mutationName'` format for commit and dispatch
- Module state is registered under the `state[moduleName]` property

### 4.4. Instance & Global API

| Access | Description |
|-------|-----------|
| `this.$store` | Access store from component |
| `this.$store.state` | Reactive state |
| `this.$store.getters` | Getters (computed state) |
| `this.$store.commit(type, payload)` | Trigger a mutation |
| `this.$store.dispatch(type, payload)` | Trigger an action (async) |
| `this.$store.getState(path)` | Get state using dot notation |
| `this.$store.setState(path, value)` | Set state using dot notation |
| `this.$store.subscribe(fn)` | Subscribe to mutation changes |
| `this.$store.reset()` | Reset store to initial state |

**Global Helpers:**

| Helper | Description |
|--------|-----------|
| `Vue.mapState([...])` | Map state to computed properties |
| `Vue.mapGetters([...])` | Map getters to computed properties |
| `Vue.mapMutations([...])` | Map mutations to methods |
| `Vue.mapActions([...])` | Map actions to methods |
| `Vue.createStore(options)` | Create a new store |
| `Vue.Store` | Store class |

### 4.5. Usage Example

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

// In component
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

Steroids has a native RTC (Real-Time Communication) based on WebSocket that supports Pusher/Reverb protocol.

### 5.1. Configuration

All RTC configuration is inside the `socket` property:

| Property | Type | Default | Description |
|----------|------|---------|-----------|
| `socket.enabled` | `boolean` | `false` | Enable automatic WebSocket connection |
| `socket.broadcaster` | `string` | `'pusher'` | Broadcaster driver (currently only 'pusher') |
| `socket.key` | `string` | `''` | App Key for server authentication |
| `socket.host` | `string` | `''` | WebSocket server host |
| `socket.port` | `number` | `80` | WebSocket connection port |
| `socket.forceTLS` | `boolean` | `false` | Use WSS (WebSocket Secure) |
| `socket.authEndpoint` | `string` | `'/broadcasting/auth'` | Endpoint for private/presence channel authentication |

### 5.2. How It Works in the Source Code

**Initialization** (`src/core/util/rtc.ts`):
- `initRtcClient()` is called when `initGlobalAPI()` is called
- RTC Driver performs **auto-polling** for 20 seconds (40 attempts × 500ms) waiting for `socket.enabled = true` config
- Once `enabled: true` is detected, WebSocket connection is created automatically
- Connection state (`status`, `socketId`) is reactive

**Prototype Methods** (`src/core/instance/rtc.ts`):

| Method | Description |
|--------|-----------|
| `this.$rtc` | Global RTC client instance |
| `this.$echo` | Echo-compatible alias for `$rtc` |
| `this.$listen(channel, event, callback)` | Subscribe to channel & listen for event |
| `this.$channel(name)` | Access public channel |
| `this.$private(name)` | Access private channel (auto-prefixes `private-`) |
| `this.$presence(name)` | Access presence channel |

**Event Listeners:**

| Method | Description |
|--------|-----------|
| `rtc.on('connected', fn)` | When connection opens |
| `rtc.on('disconnected', fn)` | When connection drops |
| `rtc.on('error', fn)` | When an error occurs |
| `rtc.on('status', fn)` | On every status change |

### 5.3. Usage Example

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

// In component
mounted() {
  this.$listen('chat', 'new-message', (data) => {
    console.log('New message:', data)
  })

  this.$private('user.1').listen('notification', (data) => {
    this.notifications.push(data)
  })
}
```

---

## 6. Built-in Router

Steroids has a lightweight built-in routing system integrated with Vue reactivity.

### 6.1. Configuration

No special global configuration for the Router. The Router is active immediately after `initRouter()` is called in `initGlobalAPI()`.

### 6.2. How It Works in the Source Code

**Initialization** (`src/core/util/router.ts`):
- Router uses `Vue.reactive('route', ...)` to create a reactive route state
- Listens to `popstate` and `hashchange` events for automatic updates
- Path is split into segments `path1` through `path5` for easy access

**Prototype Properties:**

| Property | Description |
|----------|-----------|
| `this.$route` | Reactive route object |
| `this.$router` | Router object with navigation methods |

**`$route` Properties:**

| Property | Description |
|----------|-----------|
| `path` | Main path (pathname) |
| `fullPath` | Full path + query + hash |
| `hash` | Fragment after `#` |
| `query` | Query string parameters object |
| `segments` | Array of path segments |
| `path1` - `path5` | Path segments 1 through 5 |
| `params` | Route parameters (placeholder) |
| `meta` | Route meta data (placeholder) |

**`$router` Methods:**

| Method | Description |
|--------|-----------|
| `this.$router.push(location)` | Navigate to new path (pushState) |
| `this.$router.replace(location)` | Navigate without leaving history |
| `this.$router.back()` | Go back to previous page |
| `this.$router.forward()` | Go forward to next page |
| `this.$router.go(n)` | Navigate relatively by n steps |

### 6.3. Registered Components

The Router automatically registers the following components:

| Component | Description |
|----------|-----------|
| `<router-view>` | Render component based on current route |
| `<router-link>` | Navigation link with active class |

### 6.4. Usage Example

```javascript
// In component
computed: {
  currentPage() {
    return this.$route.path1 // First path segment
  }
},
watch: {
  '$route.path'(newPath) {
    console.log('Navigated to:', newPath)
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

Steroids has a built-in Storage Manager for localStorage/sessionStorage with watch, expiry, and namespace features.

### 7.1. Configuration

No global configuration. Storage is available immediately after `installStorage()` is called.

### 7.2. How It Works in the Source Code

**Initialization** (`src/core/util/storage.ts`):
- Called when `installStorage(Vue)` is invoked in `initGlobalAPI()`
- Registers `Vue.storage` and `Vue.prototype.$storage`
- If localStorage is unavailable, falls back to in-memory storage

**API Methods:**

| Method | Description |
|--------|-----------|
| `Vue.storage.set(key, value, options?)` | Store data (auto JSON) |
| `Vue.storage.get(key, defaultValue?)` | Retrieve data |
| `Vue.storage.remove(key)` | Remove data |
| `Vue.storage.clear()` | Clear all data within namespace |
| `Vue.storage.keys()` | Get all keys |
| `Vue.storage.watch(key, callback)` | Watch for changes on a specific key |
| `Vue.storage.unwatch(key, callback?)` | Stop watching |
| `Vue.storage.size()` | Get the storage size used |
| `Vue.storage.setOptions(options)` | Change storage options |

**Storage Options:**

| Option | Type | Default | Description |
|------|------|---------|-----------|
| `type` | `'local' \| 'session'` | `'local'` | Storage type |
| `namespace` | `string` | `''` | Prefix for keys |
| `expires` | `number` | `0` | TTL in ms (`0` = never expires) |
| `serialize` | `Function` | `JSON.stringify` | Serialization function |
| `deserialize` | `Function` | `JSON.parse` | Deserialization function |

### 7.3. Usage Example

```javascript
// Set data
this.$storage.set('user', { name: 'John', age: 30 })
this.$storage.set('token', 'abc123', { expires: 3600000 }) // 1 hour

// Get data
const user = this.$storage.get('user')
const token = this.$storage.get('token')

// Watch for changes
this.$storage.watch('user', (newVal, oldVal) => {
  console.log('User changed:', newVal)
})

// With namespace
Vue.storage.setOptions({ namespace: 'app:' })
this.$storage.set('theme', 'dark') // → key: 'app:theme'
```

---

## 8. Standalone Reactive System

Steroids has a standalone reactive system that can be used outside Vue components.

### 8.1. How It Works in the Source Code

**Initialization** (`src/core/util/reactive.ts`):
- Called when `initReactive(Vue)` is invoked in `initGlobalAPI()`
- Uses a hidden Vue instance for maximum reactivity
- Registers `Vue.reactive()` as a global function

**API:**

| Method | Description |
|--------|-----------|
| `Vue.reactive(name, initialValue)` | Create a named reactive global store |
| `Vue.reactive(initialValue)` | Create an anonymous reactive object |
| `store.watch(path, callback, options?)` | Watch for changes on a specific path |

### 8.2. Usage Example

```javascript
// Named global store
const state = Vue.reactive('appState', {
  count: 0,
  user: null
})

// Access from anywhere
state.count++ // Reactive!
state.watch('user.name', (newVal, oldVal) => {
  console.log('User name changed:', newVal)
})

// Anonymous reactive object
const localState = Vue.reactive({ theme: 'dark' })
```

---

## 9. Hooks / Composables

Steroids has built-in hooks similar to VueUse, without needing to install additional libraries.

### 9.1. How It Works in the Source Code

**Initialization** (`src/core/util/hooks.ts`):
- Called when `installHooks(Vue)` is invoked in `initGlobalAPI()`
- Registers methods on `Vue.prototype`
- Also executes `hooks` option in components (if defined)

**Component Options:**

| Option | Type | Description |
|------|------|-----------|
| `hooks` | `Function \| Array` | Function executed with the component's `this` context |

**Prototype Methods:**

| Method | Description |
|--------|-----------|
| `this.onClickOutside(refName, handler)` | Detect click outside an element |
| `this.onWindowResize(handler, options?)` | Window resize listener |
| `this.onScroll(selector, handler)` | Scroll listener on an element |
| `this.onKeyPress(key, handler)` | Keyboard key listener |
| `this.onEscape(handler)` | Shorthand for Escape key |

### 9.2. Usage Example

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

Steroids has a browser-native `require()` implementation for dynamically loading JavaScript modules.

### 10.1. How It Works in the Source Code

**Initialization** (`src/core/util/require.ts`):
- Called when `initRequire()` is invoked in `initGlobalAPI()`
- Registers functions on `window.require` and `window.requireAsync`
- Also registers on `Vue.prototype.$require` and `Vue.prototype.$requireAsync`
- Supports `module.exports` pattern (like Node.js)
- Already-loaded modules are cached to prevent re-requests

**Global Functions:**

| Method | Description |
|--------|-----------|
| `Vue.require(path)` / `this.$require(path)` | Load JS module synchronously (Sync XHR) |
| `Vue.requireAsync(path)` / `this.$requireAsync(path)` | Load JS module asynchronously (Fetch) |

**Features:**
- ✅ Module caching
- ✅ `module.exports` pattern
- ✅ Automatic `.js` extension
- ✅ `sourceURL` for debugging in DevTools

### 10.2. Usage Example

```javascript
// File module.js
module.exports = {
  formatDate(date) { return date.toLocaleDateString() },
  version: '1.0.0'
}

// In component
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

Steroids has a Portal system that allows rendering components at a different location in the DOM (like Teleport in Vue 3).

### 11.1. How It Works in the Source Code

**Initialization** (`src/core/global-api/index.ts`):
- Portal components are registered directly in `initGlobalAPI()`
- Uses `Vue.observable` for the portal state bus
- Inspired by `portal-vue` by LinusBorg

**Components:**

| Component | Props | Description |
|----------|-------|-----------|
| `<Portal>` | `to: String`, `disabled: Boolean` | Send content to portal target |
| `<PortalTarget>` | `name: String` | Receive content from portal |

### 11.2. Usage Example

```html
<!-- In root app -->
<portal-target name="modal"></portal-target>

<!-- In any component -->
<portal to="modal">
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Modal Title</h2>
      <p>This is rendered at the portal target!</p>
    </div>
  </div>
</portal>
```

---

## 12. Directives

### 12.1. `v-loading`

Steroids has a `v-loading` directive to display a loading overlay with a spinner.

| Usage | Description |
|------------|-----------|
| `v-loading="isLoading"` | Show/hide loading overlay |

**Features:**
- ✅ Animated SVG spinner
- ✅ Blur overlay
- ✅ Automatic relative positioning
- ✅ Style auto-injection

**Example:**
```html
<div v-loading="isLoading">
  <p>Content will be overlaid while loading</p>
</div>
```

---

## 13. Global API Methods

All global methods added by Steroids to the `Vue` object:

| Method | Category | Description |
|--------|----------|-----------|
| `Vue.defineDynamicComponent(name, def)` | Dynamic Components | Register component anytime |
| `Vue.dynamicComponent` | Dynamic Components | Alias for `defineDynamicComponent` |
| `Vue.loadAsyncComponent(name, path)` | Dynamic Components | Load async component |
| `Vue.createStore(options)` | Store | Create a new store |
| `Vue.Store` | Store | Store class |
| `Vue.mapState(...)` | Store | Map state helper |
| `Vue.mapGetters(...)` | Store | Map getters helper |
| `Vue.mapMutations(...)` | Store | Map mutations helper |
| `Vue.mapActions(...)` | Store | Map actions helper |
| `Vue.rtc` | RTC | RTC client instance |
| `Vue.reactive(name, value)` | Reactive | Standalone reactive store |
| `Vue.storage` | Storage | Storage manager |
| `Vue.portalBus` | Portal | Portal bus state |
| `Vue.require(path)` | Require | Load module sync |
| `Vue.requireAsync(path)` | Require | Load module async |
| `Vue.effect` | Composition API | Vue 3 effect (from v3) |

**Prototype Methods (`this.`):**

| Method | Category | Description |
|--------|----------|-----------|
| `this.get / post / put / patch / delete / head / options` | HTTP | HTTP methods |
| `this.postForm / putForm / patchForm` | HTTP | Form data HTTP |
| `this.$store` | Store | Store instance |
| `this.$route` | Router | Reactive route object |
| `this.$router` | Router | Router methods |
| `this.$rtc` | RTC | RTC client |
| `this.$echo` | RTC | Echo-compatible alias |
| `this.$listen(ch, ev, fn)` | RTC | Subscribe to channel event |
| `this.$channel(name)` | RTC | Access channel |
| `this.$private(name)` | RTC | Access private channel |
| `this.$presence(name)` | RTC | Access presence channel |
| `this.$storage` | Storage | Storage manager |
| `this.$require(path)` | Require | Load module sync |
| `this.$requireAsync(path)` | Require | Load module async |
| `this.onClickOutside(ref, fn)` | Hooks | Click outside detector |
| `this.onWindowResize(fn)` | Hooks | Window resize listener |
| `this.onScroll(sel, fn)` | Hooks | Scroll listener |
| `this.onKeyPress(key, fn)` | Hooks | Keyboard listener |
| `this.onEscape(fn)` | Hooks | Escape key listener |
| `this.api` | API Namespace | Namespace for API methods |
| `this.$loading` | Loading | Reactive loading state |

**Component Options (new):**

| Option | Description |
|------|-----------|
| `api` | Object containing API methods separated from `methods` |
| `asyncComponents` | Array of components automatically loaded when component is created |
| `loadingTemplate` | Template string during async components loading |
| `hooks` | Function or array of functions executed with `this` context |
| `rtc` | Function for RTC initialization in component |
| `store` | Component-specific store instance (overrides global) |

---

## 14. Complete Config Summary

Below are **all `Vue.config` properties** available (including standard Vue 2 and Steroids additions):

```javascript
Vue.config = {
  // ===== STANDARD VUE 2 =====
  optionMergeStrategies: {},
  silent: false,
  productionTip: true,       // false in production
  devtools: true,            // false in production
  performance: false,
  errorHandler: null,
  warnHandler: null,
  ignoredElements: [],
  keyCodes: {},

  // ===== STEROIDS: HTTP / AXIOS =====
  axiosBaseURL: '',           // Base URL for all requests
  axiosToken: '',             // Default Bearer token
  axiosTimeout: 0,            // Timeout in ms
  axiosHeaders: null,         // Custom global headers
  axiosRequestInterceptor: null,
  axiosResponseInterceptor: null,
  axiosRequestErrorInterceptor: null,
  axiosResponseErrorInterceptor: null,

  // ===== STEROIDS: DYNAMIC COMPONENTS =====
  componentPath: '/components',   // Base path for component files
  componentExtension: '.tpl',     // File extension (e.g., .tpl, .vue, .html)
  componentFallback: 'component-notfound',
  autoFetchComponents: false,     // Auto-fetch from server
  serverSide: false,              // SSR bundling mode
  serverSideURL: '',              // Bundler service URL

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

  // ===== STEROIDS: OTHER =====
  asyncComponent: false           // Enable async component
}
```

---

> **Note:** This documentation is based on reading the source code of `src/core/config.ts`, `src/core/global-api/index.ts`, `src/core/util/*.ts`, `src/core/instance/*.ts`, and `src/core/directives/*.ts`. If there are differences between the documentation and actual behavior, the source code is the primary reference.
