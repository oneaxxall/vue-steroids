# Change Log

All notable changes to Vue 2.7.16 will be documented in this file.

---

## [2.7.17] - 2026-04-23

### 🎉 New Features

#### Standalone Reactive System
- Added global `reactive(name, value, options)` function for creating standalone reactive stores
- Integrated `.watch(path, callback, deep)` method on reactive objects for precise state tracking
- Powered by a **Hidden VM pattern** for synchronous change detection and robust reactivity
- Automatic registration to `this.$reactive[name]` for seamless cross-component access
- Proxy-based safety: returns an empty object `{}` when accessing undefined reactive stores

#### Built-in Routing System
- Integrated `$route` object available across all component instances
- Automatic segment parsing (`path1` to `path5`) from the current URL path
- Full reactivity for `path`, `hash`, `query`, and `fullPath`
- Navigation API methods: `push()`, `replace()`, `back()`, `forward()`

#### Advanced Hooks & Composables
- **Integrated Lifecycle Patching**: Added `patchLifecycleHook` utility to safely inject functionality into existing components
- **Enhanced `onClickOutside`**:
  - Immediate execution (removed previous delay)
  - Automatic deferral until `mounted` to ensure `$refs` are fully populated
  - Robust event handling with improved child element detection
- **New Prototype Hooks**:
  - `this.onWindowResize(handler, options?)`
  - `this.onScroll(selector, handler)`
  - `this.onKeyPress(key, handler)`
  - `this.onEscape(handler)`
  - `this.useDebounce(fn, delay)`
  - `this.useThrottle(fn, delay)`

#### Odoo-Style XML Props Improvements
- **Smart Type Casting**: Enhanced XML parser to automatically convert string values to native types:
  - `Boolean` ("true"/"false")
  - `Number` (integers and floats)
  - `Array/Object` (JSON-like expressions)
- **Tag Reservation**: Added `props` and `field` to internal HTML tag whitelist to bypass "Unknown custom element" warnings natively

### ⚙️ Configuration Changes
- Added `hooks` option to component definitions for declarative composable registration

### 🐛 Bug Fixes
- **Store Initialization**: Moved store injection earlier in the `_init` lifecycle to fix `$store not found` errors in computed properties and `mapState`
- **Method Binding**: Auto-bind `commit` and `dispatch` to Store instances to support destructuring in actions
- **Lifecycle Patching**: Fixed `patchLifecycleHook` to handle both single function and array-based lifecycle handlers

---

## [2.7.16] - 2024-04-08

### 🎉 New Features

#### Odoo-Style XML Props Support
- Added support for declaring component props via XML tags `<props>` and `<field>` inside templates
- **Recursive Tag Parsing**: Robust handling of browser-nested self-closing tags (e.g., `<field />`)
- **Smart Type Casting**: Automatic conversion of attribute values to native JavaScript types:
  - **Booleans**: `active="true"` → `true`
  - **Numbers**: `limit="10"` → `10`
  - **Arrays/Objects**: `domain="[user, '=', 1]"` → `["user", "=", 1]`
- **Odoo Expression Evaluator**: Flexible parsing for Odoo-style expressions, allowing unquoted strings as identifiers within arrays and objects

#### Enhanced Debugging & Diagnostics
- **Component-Scoped Warnings**: Vue warnings now include the component name for easier tracing
  - Format: `[Vue warn][ComponentName]: <message>`
- **Better Trace Visibility**: Improved component trace output in console errors

#### Integrated HTTP Client (Axios)
- Added built-in HTTP client based on Axios
- HTTP methods now available directly on Vue instances:
  - `this.get(url, config?)` - GET request
  - `this.post(url, data?, config?)` - POST request
  - `this.put(url, data?, config?)` - PUT request
  - `this.patch(url, data?, config?)` - PATCH request
  - `this.delete(url, config?)` - DELETE request
  - `this.head(url, config?)` - HEAD request
  - `this.options(url, config?)` - OPTIONS request
  - `this.postForm(url, data?, config?)` - POST with form data
  - `this.putForm(url, data?, config?)` - PUT with form data
  - `this.patchForm(url, data?, config?)` - PATCH with form data
  - `this.request(config)` - Custom HTTP request
- Axios bundled in browser builds (`vue.js`, `vue.min.js`)
- HTTP interceptors support:
  - `this.$addRequestInterceptor()`
  - `this.$addResponseInterceptor()`
  - `this.$removeInterceptor()`
  - `this.$http` - Access underlying axios instance

#### Dynamic Component Registration
- Added `Vue.defineDynamicComponent(name, definition)` API
- Components can be registered AFTER Vue instance initialization
- Automatic forceUpdate when components are registered
- Support for kebab-case, camelCase, and PascalCase naming
- Global component registry accessible across all instances
- Configuration options:
  - `Vue.config.componentPath` - Base path for components
  - `Vue.config.componentExtension` - File extension for components
  - `Vue.config.componentFallback` - Fallback component name

#### Dynamic Component Loader via AJAX
- Added `this.fetchDynamicComponent(name, path, options?)` method
- Added `this.fetchDynamicComponents(components)` for batch loading
- Load component files from server via AJAX
- Auto-parse `<script>` and `<template>` tags
- Auto-register components via `defineDynamicComponent`
- Support for callbacks:
  - `onSuccess(name, componentDef)`
  - `onError(name, error)`
- Fallback component support when file not found

#### Auto-Resolve Components
- Components not found in registry will be auto-fetched from server
- Automatic path generation from component name:
  - `input-text` → `/components/input/input-text.tpl`
  - `button-primary` → `/components/button/button-primary.tpl`
  - `header` → `/components/header.tpl`
- Enable/disable via `Vue.config.autoFetchComponents` (default: `true`)
- Duplicate fetch prevention
- Automatic fallback to `component-notfound` if file doesn't exist
- Force update all instances after component loaded

#### Integrated State Management
- Built-in state management system (similar to Vuex)
- Available via `Vue.config.store` configuration
- Reactive state that auto-updates across all components
- Features:
  - **State** - Reactive state object
  - **Getters** - Computed properties for state
  - **Mutations** - Synchronous state changes
  - **Actions** - Asynchronous operations
  - **Modules** - Modular store structure
- Helper functions:
  - `Vue.mapState(paths)` - Map state to computed properties
  - `Vue.mapGetters(names)` - Map getters to computed properties
  - `Vue.mapMutations(names)` - Map mutations to methods
  - `Vue.mapActions(names)` - Map actions to methods
- Store methods:
  - `this.$store.state` - Access reactive state
  - `this.$store.getters` - Access computed getters
  - `this.$store.commit(type, payload?)` - Commit mutation
  - `this.$store.dispatch(type, payload?)` - Dispatch action
  - `this.$store.getState(path)` - Get state by dot-notation
  - `this.$store.setState(path, value)` - Set state by dot-notation
  - `this.$store.subscribe(fn)` - Subscribe to mutations
  - `this.$store.reset()` - Reset store to initial state
- Module support with namespaced access
- DevTools ready for state tracking

### ⚙️ Configuration Changes

#### New Vue.config Options
```javascript
// HTTP Client
Vue.config.axiosBaseURL = ''              // Default base URL
Vue.config.axiosToken = ''                // Default auth token
Vue.config.axiosTimeout = 0               // Default timeout (ms)
Vue.config.axiosHeaders = {}              // Default headers
Vue.config.axiosRequestInterceptor = fn   // Request interceptor
Vue.config.axiosResponseInterceptor = fn  // Response interceptor
Vue.config.axiosRequestErrorInterceptor = fn   // Request error handler
Vue.config.axiosResponseErrorInterceptor = fn  // Response error handler

// Dynamic Components
Vue.config.componentPath = '/components'         // Base path
Vue.config.componentExtension = '.tpl'           // File extension
Vue.config.componentFallback = 'component-notfound'  // Fallback component
Vue.config.autoFetchComponents = true            // Auto-fetch from server

// State Management
Vue.config.store = {                             // Global store
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {}
}
```

### 📦 Build Changes

#### Browser Builds (Auto-bundled)
- `vue.js` - Now includes axios (586.19kb, +113.37kb)
- `vue.min.js` - Now includes axios (190.16kb, +80.59kb gzipped)
- `vue.runtime.js` - Now includes axios (452.48kb, +125.4kb)
- `vue.runtime.min.js` - Now includes axios (146.89kb, +67.85kb gzipped)

#### ES Module & CommonJS Builds
- `vue.esm.js`, `vue.runtime.esm.js` - Axios as external dependency
- `vue.common.dev.js`, `vue.runtime.common.dev.js` - Axios as external dependency
- Users must `npm install axios` for bundler builds

### 📝 New APIs

#### Global APIs
```javascript
// Component Management
Vue.defineDynamicComponent(name, definition)

// State Management
Vue.createStore(options)
Vue.mapState(paths)
Vue.mapGetters(names)
Vue.mapMutations(names)
Vue.mapActions(names)
```

#### Instance APIs
```javascript
// HTTP Methods
this.get(url, config?)
this.post(url, data?, config?)
this.put(url, data?, config?)
this.patch(url, data?, config?)
this.delete(url, config?)
this.head(url, config?)
this.options(url, config?)
this.postForm(url, data?, config?)
this.putForm(url, data?, config?)
this.patchForm(url, data?, config?)
this.request(config)

// Component Loading
this.fetchDynamicComponent(name, path?, options?)
this.fetchDynamicComponents(components)

// Store Access
this.$store.state
this.$store.getters
this.$store.commit(type, payload?)
this.$store.dispatch(type, payload?)
this.$store.getState(path)
this.$store.setState(path, value)
this.$store.subscribe(fn)
this.$store.reset()

// HTTP Access
this.$http
this.$addRequestInterceptor(fn)
this.$addResponseInterceptor(fn)
this.$removeInterceptor(type, id)
```

### 🐛 Bug Fixes
- Fixed `require is not defined` error in browser builds
- Fixed extension not being auto-added to component paths
- Fixed object parameter handling in fetchDynamicComponent
- Fixed TypeScript type errors for $store property

### 📚 Documentation
- Added `STATE_MANAGEMENT.md` - Complete state management guide
- Added `DYNAMIC_COMPONENT_LOADER.md` - Dynamic component loading guide
- Added `AUTO_RESOLVE_COMPONENTS.md` - Auto-resolve components guide
- Added `AXIOS_INTEGRATION.md` - HTTP client integration guide
- Added `DYNAMIC_COMPONENTS_PERFORMANCE.md` - Performance optimization guide
- Added `DYNAMIC_COMPONENTS_LOGGING.md` - Debug logging guide

### ⚠️ Breaking Changes
- **None** - All changes are additive and backward compatible

### 🔧 Internal Changes
- Added `src/core/util/http.ts` - HTTP client wrapper
- Added `src/core/util/store.ts` - State management system
- Added `src/core/util/dynamic-component-loader.ts` - Component loader
- Added `src/core/instance/http.ts` - HTTP methods for Vue prototype
- Modified `src/core/util/options.ts` - Dynamic component registry & auto-resolve
- Modified `src/core/config.ts` - New configuration options
- Modified `src/core/global-api/index.ts` - Global API registration
- Modified `src/core/instance/init.ts` - Store initialization
- Modified `scripts/config.js` - Build configuration for axios bundling

### 📊 Size Impact
- Core Vue library: +~114kb (unminified), +~81kb (minified gzipped)
- State management: +~8kb
- HTTP client: +~50kb (axios + dependencies)
- Dynamic component loader: +~6kb
- Auto-resolve: +~4kb

### ✅ Testing
- All existing tests passing (144/144)
- Build successful for all targets
- No breaking changes to existing APIs

---

### Migration Guide

#### Using HTTP Client
```javascript
// Before: Import axios in every file
import axios from 'axios'
axios.get('/api/users')

// After: Use built-in methods
this.get('/api/users')
```

#### Using State Management
```javascript
// Before: Install and setup Vuex
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({ ... })

// After: Configure via Vue.config
Vue.config.store = {
  state: { ... },
  mutations: { ... },
  actions: { ... }
}
```

#### Using Dynamic Components
```javascript
// Before: Must register before Vue instance
Vue.component('my-comp', { ... })
new Vue({ ... })

// After: Register anytime
new Vue({ ... })
Vue.defineDynamicComponent('my-comp', { ... })
```

---

For detailed documentation, see:
- `STATE_MANAGEMENT.md`
- `DYNAMIC_COMPONENT_LOADER.md`
- `AUTO_RESOLVE_COMPONENTS.md`
- `AXIOS_INTEGRATION.md`
