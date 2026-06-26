# 🖥️ SSR Bundler Server

> Complete documentation about the SSR (Server-Side Rendering) Bundler for Vue Steroids.

---

## 📑 Table of Contents

1. [What is SSR Bundler?](#1-what-is-ssr-bundler)
2. [Architecture](#2-architecture)
3. [Installation & Usage](#3-installation--usage)
4. [CLI Options](#4-cli-options)
5. [API Reference](#5-api-reference)
6. [Integration with Vue Core](#6-integration-with-vue-core)
7. [Cache System](#7-cache-system)
8. [Changes from v1](#8-changes-from-v1)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. What is SSR Bundler?

SSR Bundler is a **Node.js server** that bundles `.tpl` files into a single JavaScript file. Its functions:

- **Reduces HTTP requests** — instead of the client fetching 10 `.tpl` files one by one, just 1 bundle request
- **Server-side processing** — `.tpl` parsing is done on the server, the client just executes
- **Smart caching** — bundle is cached, subsequent requests are faster
- **Supports `export default` & `module.exports`** — both script formats are supported

### Use Case

```
Without SSR Bundler:
  Client → GET /components/input-text.tpl  → Parse → Register
  Client → GET /components/button.tpl      → Parse → Register
  Client → GET /components/modal.tpl       → Parse → Register
  Client → GET /components/table.tpl       → Parse → Register
  → 4 HTTP requests, 4x parse

With SSR Bundler:
  Client → POST /bundle { components: [...] }
  Server → Read & parse → Generate bundle
  Client → Execute bundle → All components registered!
  → 1 HTTP request, server-side parse
```

---

## 2. Architecture

```
┌──────────┐                    ┌──────────────────┐
│  Client   │                    │  SSR Bundler     │
│ (Browser) │                    │  (Node.js)       │
└─────┬─────┘                    └────────┬─────────┘
      │                                   │
      │  1. Config:                       │
      │     Vue.config.serverSide = true  │
      │     Vue.config.serverSideURL =    │
      │       'http://localhost:8485/bundle'
      │                                   │
      │  2. Async components ready to load│
      │     Collect component paths       │
      │     that haven't been registered  │
      │                                   │
      │  3. POST /bundle                  │
      │     { components: [               │
      │       "/path/comp1",              │
      │       "/path/comp2"               │
      │     ]}                            │
      │──────────────────────────────────>│
      │                                   │
      │                    4. Read files   │
      │                    5. Parse script │
      │                    6. Generate JS  │
      │                    7. Cache bundle │
      │                                   │
      │  8. Response:                      │
      │     Content-Type: application/js   │
      │     Vue.dynamicComponent('comp1',  │
      │       { data: ..., template: ... })│
      │     Vue.dynamicComponent('comp2',  │
      │       { data: ..., template: ... })│
      │     //# sourceURL=bundle.js        │
      │<───────────────────────────────────│
      │                                   │
      │  9. Inject <script> into DOM      │
      │  10. All components registered ✅  │
```

---

## 3. Installation & Usage

### 3.1. Running the SSR Server

```bash
# From project root
node ssr.js

# Or with custom port
node ssr.js 3000

# Or with custom components path + port
node ssr.js ./src/components 8080

# Disable cache
node ssr.js --no-cache
```

### 3.2. Console Output

```bash
🚀 PDS SSR Bundler Server v2
----------------------------------------
URL   : http://localhost:8485/bundle
PATH  : /Volumes/Work/.../vue-steroids
CACHE : Enabled (TTL: 60s, Max: 100)
HEALTH: http://localhost:8485/health
----------------------------------------
```

### 3.3. Testing the Server

```bash
# Check server status
curl http://localhost:8485/health

# Bundle components
curl -X POST http://localhost:8485/bundle \
  -H 'Content-Type: application/json' \
  -d '{"components":["components/input-text","components/button-primary"]}'
```

---

## 4. CLI Options

| Argument | Description | Default |
|---------|-----------|---------|
| `{port}` | Server port | `8485` |
| `{path}` | Base path for component files | `.` (current dir) |
| `--no-cache` | Disable cache | `false` |
| `-h, --help` | Show help | - |

**Smart argument detection:**
```bash
node ssr.js              # Port 8485, path .
node ssr.js 3000         # Port 3000, path .
node ssr.js ./src 8080   # Port 8080, path ./src
node ssr.js ./src        # Port 8485, path ./src
node ssr.js --no-cache   # Port 8485, path ., cache disabled
```

---

## 5. API Reference

### `POST /bundle`

Generate JavaScript bundle from a list of components.

**Request Body:**

```json
{
  "components": [
    "components/input-text",
    "components/button-primary.tpl",
    "/components/modal.tpl"
  ]
}
```

**Response Headers:**

| Header | Description |
|--------|-----------|
| `Content-Type` | `application/javascript` |
| `X-Cache` | `HIT` or `MISS` |
| `X-Bundle-Count` | Number of requested components |
| `X-Bundle-Loaded` | Number of successfully loaded components |
| `X-Bundle-Failed` | Number of failed components |
| `X-Bundle-Size` | Bundle size in KB |

**Response Body:**

```javascript
/* PDS Vue Steroids - SSR Bundle */
/* --- Component: input-text --- */
Vue.dynamicComponent('input-text', (function(){
  var module = { exports: {} };
  var exports = module.exports;
  module.exports = { data: function(){ return { value: '' } } }
  var def = module.exports || {};
  def.template = "<input :value=\"value\" @input=\"onChange\" />";
  return def;
})());

/* --- Component: button-primary --- */
Vue.dynamicComponent('button-primary', (function(){
  var module = { exports: {} };
  var exports = module.exports;
  module.exports = { props: ['label'] }
  var def = module.exports || {};
  def.template = "<button class=\"btn\">{{label}}</button>";
  (function(){
    var id = 'style-button-primary';
    if(!document.getElementById(id)){
      var s = document.createElement('style');
      s.id = id;
      s.textContent = ".btn { padding: 8px 16px; background: blue; color: white; }";
      document.head.appendChild(s);
    }
  })();
  return def;
})());
```

### `GET /health`

Check server status.

**Response:**

```json
{
  "status": "ok",
  "port": 8485,
  "basePath": "/path/to/components",
  "cache": {
    "enabled": true,
    "size": 5,
    "maxSize": 100
  }
}
```

---

## 6. Integration with Vue Core

### 6.1. Client-Side Config

In `src/core/config.ts`:

```typescript
Vue.config.serverSide = true   // Enable SSR mode
Vue.config.serverSideURL = 'http://localhost:8485/bundle'
```

### 6.2. How the Client Works

When `serverSide: true` and `serverSideURL` are set, the core will:

1. When components are loaded via `asyncComponents` or `fetchDynamicComponent()`
2. Collect all component paths that haven't been registered
3. Send one `POST {serverSideURL}` request with the list of paths
4. Server generates the bundle
5. Execute bundle → all components registered

*Client implementation is in `src/core/util/dynamic-component-loader.ts`*

### 6.3. Integration Example

```javascript
// main.js
import Vue from 'vue'

// Enable SSR bundling
Vue.config.serverSide = true
Vue.config.serverSideURL = 'http://localhost:8485/bundle'

// In components
new Vue({
  el: '#app',
  asyncComponents: [
    '/components/heavy-chart',
    '/components/data-table',
    '/components/map-view'
  ]
  // → All bundled in 1 request!
})
```

---

## 7. Cache System

### 7.1. How It Works

1. Bundle is cached based on **MD5 hash of the component path list**
2. Cache TTL: **60 seconds** (removed after that)
3. Max cache: **100 entries** (LRU - Least Recently Used)

### 7.2. Cache Headers

Response header `X-Cache` shows cache status:
- `HIT` — Bundle retrieved from cache
- `MISS` — Bundle was newly generated

### 7.3. Disable Cache

```bash
node ssr.js --no-cache
```

Or set environment variable:
```bash
SSR_NO_CACHE=1 node ssr.js
```

---

## 8. Changes from v1

| Feature | v1 (old) | v2 (new) |
|-------|:---------:|:---------:|
| `export default` support | ❌ No | ✅ Yes |
| Bundle Cache | ❌ No | ✅ MD5 hash + TTL 60s |
| Health Endpoint | ❌ No | ✅ GET /health |
| Cache Headers | ❌ No | ✅ X-Cache: HIT/MISS |
| Bundle Stats | ❌ No | ✅ X-Bundle-Loaded/Failed/Size |
| Error Handling | ⚠️ Basic | ✅ Improved |
| File Extension Detection | ✅ Yes | ✅ Same |
| Loading Template Support | ✅ Yes | ✅ Yes |
| Style Injection | ✅ Yes | ✅ Yes |

---

## 9. Troubleshooting

### 9.1. Server Won't Start

```bash
Error: listen EADDRINUSE :::8485
```

**Solution:** Port is already in use. Use a different port:
```bash
node ssr.js 8486
```

### 9.2. File Not Found

```bash
⚠️  File not found: /path/to/component.tpl
```

**Solution:** Make sure the base path is correct:
```bash
# Check base path when server starts
# If components are in ./src/components:
node ssr.js ./src/components

# Then request path must be relative to ./src/components
curl -X POST ... -d '{"components":["input-text.tpl"]}'
```

### 9.3. Cache Not Working

Cache is automatically active. To verify:
```bash
# First request → X-Cache: MISS
curl -s -D - -X POST ... -d '{"components":["comp1"]}' | grep X-Cache

# Second request (same) → X-Cache: HIT
curl -s -D - -X POST ... -d '{"components":["comp1"]}' | grep X-Cache
```

### 9.4. Export Default Not Read

`.tpl` files with `export default` are now supported:

```html
<script>
export default {
  data() { return { count: 0 } }
}
</script>
<template>
  <div>{{ count }}</div>
</template>
```

Will be automatically converted to `module.exports = { data() {...} }` by the server.

### 9.5. Bundle Size Too Large

If the bundle is too large, enable caching so subsequent requests are faster. Or use minification:

```bash
# Install terser for minification
npm install terser --save-dev
```

---

## 🔗 References

| File | Description |
|------|-----------|
| `ssr.js` | SSR Bundler Server (root) |
| `src/core/config.ts` | Config `serverSide` & `serverSideURL` |
| `src/core/util/dynamic-component-loader.ts` | Client-side SSR integration |
| `docs/steroids/BUILD_SYSTEM.md` | Build system documentation |
| `docs/steroids/CONFIGURATIONS.md` | Complete configuration reference |

---

> **Note:** This documentation is based on the source code of `ssr.js` (v2), `src/core/config.ts`, and `src/core/util/dynamic-component-loader.ts`. For information about the build system in general, see [BUILD_SYSTEM.md](BUILD_SYSTEM.md).
