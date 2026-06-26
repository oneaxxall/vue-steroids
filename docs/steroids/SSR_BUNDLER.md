# 🖥️ SSR Bundler Server

> Dokumentasi lengkap tentang SSR (Server-Side Rendering) Bundler untuk Vue Steroids.

---

## 📑 Daftar Isi

1. [Apa itu SSR Bundler?](#1-apa-itu-ssr-bundler)
2. [Arsitektur](#2-arsitektur)
3. [Installation & Usage](#3-installation--usage)
4. [CLI Options](#4-cli-options)
5. [API Reference](#5-api-reference)
6. [Integrasi dengan Vue Core](#6-integrasi-dengan-vue-core)
7. [Cache System](#7-cache-system)
8. [Perubahan dari v1](#8-perubahan-dari-v1)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Apa itu SSR Bundler?

SSR Bundler adalah **server Node.js** yang menggabungkan (bundle) file `.tpl` menjadi satu file JavaScript. Fungsinya:

- **Mengurangi HTTP requests** — daripada client fetch 10 file `.tpl` satu per satu, cukup 1 request bundle
- **Server-side processing** — parsing `.tpl` dilakukan di server, client tinggal execute
- **Smart caching** — bundle di-cache, request berikutnya lebih cepat
- **Support `export default` & `module.exports`** — dua format script didukung

### Use Case

```
Tanpa SSR Bundler:
  Client → GET /components/input-text.tpl  → Parse → Register
  Client → GET /components/button.tpl      → Parse → Register
  Client → GET /components/modal.tpl       → Parse → Register
  Client → GET /components/table.tpl       → Parse → Register
  → 4 HTTP requests, 4x parse

Dengan SSR Bundler:
  Client → POST /bundle { components: [...] }
  Server → Read & parse → Generate bundle
  Client → Execute bundle → All components registered!
  → 1 HTTP request, server-side parse
```

---

## 2. Arsitektur

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
      │  2. Async components siap load    │
      │     Kumpulkan path komponen       │
      │     yang belum di-register        │
      │                                   │
      │  3. POST /bundle                  │
      │     { components: [               │
      │       "/path/comp1",              │
      │       "/path/comp2"               │
      │     ]}                            │
      │──────────────────────────────────>│
      │                                   │
      │                    4. Baca file    │
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
      │  9. Inject <script> ke DOM        │
      │  10. Semua komponen terdaftar ✅   │
```

---

## 3. Installation & Usage

### 3.1. Menjalankan SSR Server

```bash
# Dari root project
node ssr.js

# Atau dengan port kustom
node ssr.js 3000

# Atau dengan path components kustom + port
node ssr.js ./src/components 8080

# Matikan cache
node ssr.js --no-cache
```

### 3.2. Output Console

```bash
🚀 PDS SSR Bundler Server v2
----------------------------------------
URL   : http://localhost:8485/bundle
PATH  : /Volumes/Work/.../vue-steroids
CACHE : Enabled (TTL: 60s, Max: 100)
HEALTH: http://localhost:8485/health
----------------------------------------
```

### 3.3. Mengetes Server

```bash
# Cek status server
curl http://localhost:8485/health

# Bundle components
curl -X POST http://localhost:8485/bundle \
  -H 'Content-Type: application/json' \
  -d '{"components":["components/input-text","components/button-primary"]}'
```

---

## 4. CLI Options

| Argumen | Deskripsi | Default |
|---------|-----------|---------|
| `{port}` | Port server | `8485` |
| `{path}` | Base path untuk file components | `.` (current dir) |
| `--no-cache` | Matikan cache | `false` |
| `-h, --help` | Tampilkan help | - |

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

Generate JavaScript bundle dari daftar komponen.

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

| Header | Deskripsi |
|--------|-----------|
| `Content-Type` | `application/javascript` |
| `X-Cache` | `HIT` atau `MISS` |
| `X-Bundle-Count` | Jumlah komponen yang di-request |
| `X-Bundle-Loaded` | Jumlah komponen yang berhasil di-load |
| `X-Bundle-Failed` | Jumlah komponen yang gagal |
| `X-Bundle-Size` | Ukuran bundle dalam KB |

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

Cek status server.

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

## 6. Integrasi dengan Vue Core

### 6.1. Client-Side Config

Di `src/core/config.ts`:

```typescript
Vue.config.serverSide = true   // Aktifkan SSR mode
Vue.config.serverSideURL = 'http://localhost:8485/bundle'
```

### 6.2. Cara Kerja Client

Saat `serverSide: true` dan `serverSideURL` diset, core akan:

1. Saat komponen di-load via `asyncComponents` atau `fetchDynamicComponent()`
2. Kumpulkan semua path komponen yang belum di-register
3. Kirim satu request `POST {serverSideURL}` dengan daftar path
4. Server generate bundle
5. Execute bundle → semua komponen terdaftar

*Implementasi client ada di `src/core/util/dynamic-component-loader.ts`*

### 6.3. Contoh Integrasi

```javascript
// main.js
import Vue from 'vue'

// Aktifkan SSR bundling
Vue.config.serverSide = true
Vue.config.serverSideURL = 'http://localhost:8485/bundle'

// Di komponen
new Vue({
  el: '#app',
  asyncComponents: [
    '/components/heavy-chart',
    '/components/data-table',
    '/components/map-view'
  ]
  // → Semua di-bundle dalam 1 request!
})
```

---

## 7. Cache System

### 7.1. Cara Kerja

1. Bundle di-cache berdasarkan **hash MD5 dari daftar path komponen**
2. Cache TTL: **60 detik** (setelah itu dihapus)
3. Cache max: **100 entries** (LRU - Least Recently Used)

### 7.2. Cache Headers

Response header `X-Cache` menunjukkan status cache:
- `HIT` — Bundle diambil dari cache
- `MISS` — Bundle baru digenerate

### 7.3. Matikan Cache

```bash
node ssr.js --no-cache
```

Atau set environment variable:
```bash
SSR_NO_CACHE=1 node ssr.js
```

---

## 8. Perubahan dari v1

| Fitur | v1 (lama) | v2 (baru) |
|-------|:---------:|:---------:|
| `export default` support | ❌ Tidak | ✅ Ya |
| Bundle Cache | ❌ Tidak | ✅ MD5 hash + TTL 60s |
| Health Endpoint | ❌ Tidak | ✅ GET /health |
| Cache Headers | ❌ Tidak | ✅ X-Cache: HIT/MISS |
| Bundle Stats | ❌ Tidak | ✅ X-Bundle-Loaded/Failed/Size |
| Error Handling | ⚠️ Basic | ✅ Improved |
| File Extension Detection | ✅ Ada | ✅ Sama |
| Loading Template Support | ✅ Ada | ✅ Ada |
| Style Injection | ✅ Ada | ✅ Ada |

---

## 9. Troubleshooting

### 9.1. Server Tidak Bisa Start

```bash
Error: listen EADDRINUSE :::8485
```

**Solusi:** Port sudah dipakai. Gunakan port lain:
```bash
node ssr.js 8486
```

### 9.2. File Tidak Ditemukan

```bash
⚠️  File not found: /path/to/component.tpl
```

**Solusi:** Pastikan base path sesuai:
```bash
# Cek base path saat server start
# Jika komponen di ./src/components:
node ssr.js ./src/components

# Maka request path harus relatif ke ./src/components
curl -X POST ... -d '{"components":["input-text.tpl"]}'
```

### 9.3. Cache Tidak Bekerja

Cache otomatis aktif. Untuk verifikasi:
```bash
# Request pertama → X-Cache: MISS
curl -s -D - -X POST ... -d '{"components":["comp1"]}' | grep X-Cache

# Request kedua (sama) → X-Cache: HIT
curl -s -D - -X POST ... -d '{"components":["comp1"]}' | grep X-Cache
```

### 9.4. Export Default Tidak Terbaca

File `.tpl` dengan `export default` sekarang sudah didukung:

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

Akan otomatis dikonversi menjadi `module.exports = { data() {...} }` oleh server.

### 9.5. Bundle Size Terlalu Besar

Jika bundle terlalu besar, aktifkan cache agar request berikutnya lebih cepat. Atau gunakan minification:

```bash
# Install terser untuk minify
npm install terser --save-dev
```

---

## 🔗 Referensi

| File | Deskripsi |
|------|-----------|
| `ssr.js` | SSR Bundler Server (root) |
| `src/core/config.ts` | Config `serverSide` & `serverSideURL` |
| `src/core/util/dynamic-component-loader.ts` | Client-side SSR integration |
| `docs/steroids/BUILD_SYSTEM.md` | Build system documentation |
| `docs/steroids/CONFIGURATIONS.md` | Complete configuration reference |

---

> **Catatan:** Dokumentasi ini berdasarkan source code `ssr.js` (v2), `src/core/config.ts`, dan `src/core/util/dynamic-component-loader.ts`. Untuk informasi tentang build system secara umum, lihat [BUILD_SYSTEM.md](BUILD_SYSTEM.md).
