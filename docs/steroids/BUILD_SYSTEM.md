# 🔧 Build System Documentation

> Dokumentasi lengkap tentang sistem build Vue Steroids — mulai dari kompilasi source code, packaging JavaScript, hingga generate boilerplate siap deploy.

---

## 📑 Daftar Isi

1. [Arsitektur Build](#1-arsitektur-build)
2. [Script Reference](#2-script-reference)
3. [Build Boilerplate](#3-build-boilerplate)
4. [Pack JS](#4-pack-js)
5. [Build Output Structure](#5-build-output-structure)
6. [Customization](#6-customization)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Arsitektur Build

### 1.1. Alur Build Keseluruhan

```
Source Code                          Build Process                          Output
─────────────────────────────────────────────────────────────────────────────────────
src/                         ─┐
  core/                       │
  compiler/                   │  node scripts/build.js
  platforms/                  │  (Rollup + Terser)          dist/
  v3/                        ─┤                              ├── vue.js
  shared/                     │    +                          ├── vue.min.js
                              │    +                          ├── vue.runtime.common.dev.js
packages/                    ─┤    +                          └── vue.runtime.common.prod.js
  boilerplate/                │  node scripts/             
    components/               │  build-boilerplate.js      dist/boilerplate/
    public/                   │                              ├── index.html
    scripts/                 ─┤                              ├── public/js/vue/vue.js
      pack.js                 │                              ├── public/js/vue/vue.min.js
                              │                              ├── .htaccess
                                                              └── ...
```

### 1.2. Dua Level Build

Ada **dua level** build system:

| Level | Script | Fungsi | Output |
|-------|--------|--------|--------|
| **Level 1** (Root) | `scripts/build.js` | Kompilasi Vue source → dist/ | `dist/vue.js`, `dist/vue.min.js`, dll |
| **Level 2** (Orchestrator) | `scripts/build-boilerplate.js` | Generate boilerplate dari Level 1 | `dist/boilerplate/` |

### 1.3. Build Tools

| Tool | Fungsi | File Konfigurasi |
|------|--------|------------------|
| **Rollup** | Bundle Vue source modules | `scripts/config.js` |
| **Terser** | Minifikasi JavaScript | `scripts/build.js` (built-in) |
| **PostCSS** | Kompilasi TailwindCSS | `packages/boilerplate/postcss.config.js` |
| **TailwindCSS** | Utility-first CSS | `packages/boilerplate/tailwind.config.js` |

---

## 2. Script Reference

### 2.1. Root `package.json` Scripts

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| `dev` | `rollup -w -c scripts/config.js --environment TARGET:full-dev` | Watch mode — Vue full build (with compiler) |
| `dev:cjs` | `rollup -w -c scripts/config.js --environment TARGET:runtime-cjs-dev` | Watch mode — Vue runtime CJS |
| `dev:esm` | `rollup -w -c scripts/config.js --environment TARGET:runtime-esm` | Watch mode — Vue runtime ESM |
| `build` | `node scripts/build.js` | Build semua target Vue |
| **`build:boilerplate`** | `node scripts/build-boilerplate.js` | **Build Vue + generate boilerplate** |
| `build:ssr` | `npm run build -- runtime-cjs,server-renderer` | Build khusus SSR |
| `build:types` | `rimraf temp && tsc ... && api-extractor run` | Generate TypeScript definitions |
| `release` | `node scripts/release.js` | Release workflow |
| `changelog` | `conventional-changelog -p angular -i CHANGELOG.md -s` | Generate changelog |

### 2.2. Boilerplate `package.json` Scripts

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| `dev` | `concurrently "npm run tailwind:watch" "npm run hmr"` | Development mode |
| `start` | Sama dengan `dev` | Development mode |
| `pack` | `node scripts/pack.js` | **Concat + minify JS files** |
| `build` | `npm run tailwind:build && npm run pack` | **Build boilerplate (Tailwind + pack)** |
| `tailwind:watch` | `chokidar "public/css/*.css" -c "postcss public/css/input.css -o public/css/tailwind.css" --initial` | Watch TailwindCSS changes |
| `tailwind:build` | `postcss public/css/input.css -o public/css/tailwind.css` | Build TailwindCSS sekali |
| `hmr` | `node scripts/hmr.js` | Start HMR WebSocket server |
| `production` | `concurrently "npm run build" "npm run hmr"` | Production mode |

---

## 3. Build Boilerplate

### 3.1. Apa itu `build-boilerplate.js`?

`scripts/build-boilerplate.js` adalah **orchestrator script** yang mengotomatiskan proses build dari source code Vue Steroids menjadi boilerplate siap pakai.

### 3.2. Alur Detail

```
Step 1: Build Vue Source
─────────────────────────────────────────────────────
  node scripts/build.js full-dev,full-prod
  │
  ├── Rollup membaca entry point dari scripts/config.js
  │     ├── src/platforms/web/entry-runtime-with-compiler.ts (full)
  │     └── src/platforms/web/entry-runtime.ts (runtime)
  │
  ├── Resolve imports (alias, TypeScript, CommonJS)
  ├── Terapkan feature flags (__DEV__, __VERSION__, dll)
  ├── Generate bundle
  └── Minify dengan Terser (untuk production)
      │
      └── Output ke dist/
            ├── dist/vue.js              (dev, full)
            ├── dist/vue.min.js          (prod, full)
            ├── dist/vue.runtime.common.dev.js
            └── dist/vue.runtime.common.prod.js

Step 2: Copy Vue Files
─────────────────────────────────────────────────────
  Copy dari dist/ → dist/boilerplate/public/js/vue/
  │
  ├── dist/vue.js            → public/js/vue/vue.js
  ├── dist/vue.min.js        → public/js/vue/vue.min.js
  ├── dist/vue.runtime.common.dev.js → public/js/vue/
  └── dist/vue.runtime.common.prod.js → public/js/vue/

Step 3: Copy Boilerplate Template
─────────────────────────────────────────────────────
  Copy packages/boilerplate/ → dist/boilerplate/
  │
  ├── ✅ .htaccess
  ├── ✅ 404.html
  ├── ✅ package.json
  ├── ✅ postcss.config.js
  ├── ✅ tailwind.config.js
  ├── ✅ public/css/
  ├── ✅ components/
  ├── ⏭️  node_modules/ (skipped)
  ├── ⏭️  public/js/vue/ (skipped — sudah di-copy step 2)
  └── ⏭️  scripts/ (skipped — hmr.js & pack.js hanya untuk dev)

Step 4: Generate index.html
─────────────────────────────────────────────────────
  Generate index.html dengan:
  │
  ├── Script tag ke vue.js / vue.min.js (sesuai mode)
  ├── Style tag ke tailwind.css
  ├── Vue.config.store setup (contoh)
  ├── Vue instance dengan count example
  ├── Button handlers untuk increment + fetch API
  └── watch count → update DOM
```

### 3.3. Usage

```bash
# Dari root project

# Build full (dev + prod, with compiler) — default
npm run build:boilerplate

# Build runtime only (lebih ringan, tanpa template compiler)
npm run build:boilerplate -- --runtime

# Build production only
npm run build:boilerplate -- --prod

# Manual via node
node scripts/build-boilerplate.js
node scripts/build-boilerplate.js --runtime
node scripts/build-boilerplate.js --full
node scripts/build-boilerplate.js --prod
```

### 3.4. Output yang Dihasilkan

Setelah build berhasil, struktur `dist/boilerplate/`:

```
dist/boilerplate/
├── index.html             ← Auto-generated, siap buka
├── .htaccess              ← Apache rewrite rules (SPA routing)
├── 404.html               ← Fallback 404
├── package.json           ← Sama seperti source
├── postcss.config.js      ← Konfigurasi PostCSS
├── tailwind.config.js     ← Konfigurasi TailwindCSS
├── run.sh                 ← Script untuk run
├── public/
│   ├── css/
│   │   ├── input.css          ← Source TailwindCSS
│   │   └── tailwind.css       ← Compiled TailwindCSS
│   └── js/
│       └── vue/
│           ├── vue.js                     ← Dev (682 KB)
│           ├── vue.min.js                 ← Prod minified (226 KB)
│           ├── vue.runtime.common.dev.js  ← Runtime dev (403 KB)
│           └── vue.runtime.common.prod.js ← Runtime prod (138 KB)
├── components/           ← Template komponen .tpl
│   └── (isi sesuai project)
└── apps/                 ← Contoh aplikasi
    └── (isi sesuai project)
```

### 3.5. Build Modes

| Mode | Target Build | Vue File | index.html |
|------|-------------|----------|------------|
| `--full` (default) | `full-dev,full-prod` | `vue.js` (with compiler) | ✅ Demo lengkap |
| `--runtime` | `runtime-cjs-dev,runtime-cjs-prod` | `vue.runtime.common.dev.js` | ✅ Demo lengkap |
| `--prod` | (skip build, copy existing) | `vue.min.js` | ✅ Production ready |

**Catatan:** Mode `--prod` tidak menjalankan build Rollup. Dia menggunakan file yang sudah ada di `dist/`. Jalankan `npm run build` dulu jika belum ada.

---

## 4. Pack JS

### 4.1. Apa itu `pack.js`?

`packages/boilerplate/scripts/pack.js` adalah **JavaScript packer** untuk production. Fungsinya menggabungkan (concat) dan meminifikasi file `.js` menjadi satu bundle.

**❌ BUKAN untuk `.tpl` files** — urusan `.tpl` ditangani oleh SSR bundler (`ssr.js`)

**✅ Hanya untuk `.js` files** — concat + minify

### 4.2. Alur Pack

```
Source JS Files                    pack.js                          Output
─────────────────────────────────────────────────────────────────────────────
public/js/vue/vue.min.js    ─┐
public/js/app.js             ─┤  concat + minify          public/js/
public/js/router.js          ─┤  (terser)                 └── app.bundle.js
public/js/components.js      ─┘
```

### 4.3. Kenapa Perlu `pack.js`?

| Tanpa pack.js | Dengan pack.js |
|---------------|----------------|
| Browser load 4+ file JS | Browser load 1 file |
| 4 HTTP requests | 1 HTTP request |
| Total size: ~250KB (uncompressed) | Total size: ~220KB (minified) |
| Slow initial load | Fast initial load |

### 4.4. Usage

```bash
# Dari folder packages/boilerplate/

# Production: concat + minify
npm run pack

# Development: concat only (faster)
npm run pack -- --dev

# Production via build script
npm run build
```

### 4.5. Configuration

Konfigurasi daftar file yang akan di-pack ada di dalam `pack.js`:

```javascript
const SOURCE_FILES = [
  // Vue framework (compiled production version)
  path.join(ROOT, 'public', 'js', 'vue', 'vue.min.js'),

  // Tambahkan file JS lain di sini
  path.join(ROOT, 'public', 'js', 'app.js'),
  path.join(ROOT, 'public', 'js', 'router.js'),
]
```

**Urutan penting:** Dependency harus diletakkan lebih dulu (contoh: Vue sebelum app.js).

### 4.6. Minification

Package `terser` akan digunakan jika tersedia:

```bash
# Install terser untuk minification optimal
npm install terser --save-dev
```

Jika terser tidak tersedia, fallback ke basic minification:
- Hapus block comments (`/* ... */`)
- Hapus line comments (`// ...`)
- Hapus empty lines
- Hapus leading/trailing whitespace

---

## 5. Build Output Structure

### 5.1. `dist/` (Hasil Build Vue Source)

```
dist/
├── vue.js                          ← Full build (with compiler), development
├── vue.min.js                      ← Full build (with compiler), production
├── vue.runtime.common.dev.js       ← Runtime only, development
├── vue.runtime.common.prod.js      ← Runtime only, production
├── vue.runtime.esm.js              ← Runtime only, ES module
├── vue.esm.js                      ← Full build, ES module
├── vue.esm.browser.js              ← Full build, ES module for browser
├── vue.common.dev.js               ← Full build, CommonJS
├── vue.common.prod.js              ← Full build, CommonJS (minified)
├── vue.runtime.mjs                 ← Runtime, Node.js ESM
└── boilerplate/                    ← Generated boilerplate (lihat di atas)
```

### 5.2. Perbedaan File Vue

| File | Compiler? | Format | Use Case |
|------|:---------:|:------:|----------|
| `vue.js` / `vue.min.js` | ✅ Ya | UMD (browser) | Langsung di `<script>` tag |
| `vue.runtime.common.dev/prod.js` | ❌ Tidak | CommonJS | Webpack/Browserify bundler |
| `vue.runtime.esm.js` | ❌ Tidak | ES Module | Modern bundler (Vite, Rollup) |
| `vue.esm.js` | ✅ Ya | ES Module | Modern bundler with compiler |
| `vue.esm.browser.js` | ✅ Ya | ES Module | Direct `<script type="module">` |
| `vue.runtime.mjs` | ❌ Tidak | ESM (Node) | Server-side rendering |

---

## 6. Customization

### 6.1. Menambahkan File JS ke Pack

Edit `packages/boilerplate/scripts/pack.js`:

```javascript
const SOURCE_FILES = [
  path.join(ROOT, 'public', 'js', 'vue', 'vue.min.js'),
  path.join(ROOT, 'public', 'js', 'app.js'),          // ← Tambahkan
  path.join(ROOT, 'public', 'js', 'router.js'),        // ← Tambahkan
]
```

### 6.2. Mengubah Build Target

Edit `scripts/build-boilerplate.js`:

```javascript
const targets = {
  full: 'full-dev,full-prod',
  runtime: 'runtime-cjs-dev,runtime-cjs-prod',
  all: 'full-dev,full-prod,runtime-cjs-dev,runtime-cjs-prod',
  custom: 'full-esm,full-esm-browser-dev'  // ← Tambahkan target kustom
}
```

### 6.3. Kustomisasi index.html

Edit fungsi `generateIndexHtml()` di `scripts/build-boilerplate.js` untuk mengubah:
- Title & meta tags
- CSS frameworks (selain Tailwind)
- Contoh komponen/demo
- Script setup

### 6.4. Exclude Files dari Copy

Edit array `exclude` di `scripts/build-boilerplate.js`:

```javascript
const exclude = [
  'node_modules',
  path.join('public', 'js', 'vue'),
  'scripts',
  'sources',       // ← Tambahkan folder yang tidak perlu di-copy
  'README.md',      // ← Tambahkan file yang tidak perlu di-copy
]
```

---

## 7. Troubleshooting

### 7.1. Build Error: `'axios' is imported but could not be resolved`

```
'axios' is imported by src/core/util/http.ts, but could not be resolved
– treating it as an external dependency
```

**Penyebab:** Axios adalah dependency eksternal yang tidak di-bundle ke dalam Vue.

**Solusi:** Ini adalah warning yang aman diabaikan. Axios akan di-load terpisah. Pastikan `axios` ada di `node_modules`:

```bash
pnpm install
```

### 7.2. Build Error: `Use of eval is strongly discouraged`

```
Use of eval is strongly discouraged, as it poses security risks...
```

**Penyebab:** Vue Steroids menggunakan `eval()` di `dynamic-component-loader.ts` untuk mengevaluasi script komponen.

**Solusi:** Warning aman diabaikan. `eval()` diperlukan untuk mengeksekusi script di browser yang di-load dari file `.tpl`.

### 7.3. File Vue Tidak Ada di `dist/`

Jalankan build Vue source dulu:

```bash
npm run build
# atau
node scripts/build.js
```

Kemudian jalankan build boilerplate:

```bash
node scripts/build-boilerplate.js
```

### 7.4. TailwindCSS Tidak Tercompile

```bash
cd packages/boilerplate
npm run tailwind:build
```

Pastikan PostCSS CLI dan TailwindCSS terinstall:

```bash
cd packages/boilerplate && pnpm install
```

### 7.5. pack.js: Terser Not Available

```bash
npm install terser --save-dev
```

Atau gunakan mode dev (concatenation only):

```bash
npm run pack -- --dev
```

---

## 🏷️ Referensi

| File | Deskripsi |
|------|-----------|
| `scripts/build.js` | Vue build script (Rollup + Terser) |
| `scripts/config.js` | Rollup configuration for all build targets |
| `scripts/build-boilerplate.js` | Build orchestrator |
| `scripts/alias.js` | Path aliases for TypeScript/Rollup |
| `scripts/feature-flags.js` | Feature flags untuk conditional compilation |
| `packages/boilerplate/scripts/pack.js` | JavaScript packer |
| `packages/boilerplate/postcss.config.js` | PostCSS + TailwindCSS config |
| `packages/boilerplate/tailwind.config.js` | TailwindCSS theme customization |
| `packages/boilerplate/package.json` | Boilerplate dependencies & scripts |

---

> **Catatan:** Dokumentasi ini dibuat berdasarkan source code `scripts/build.js`, `scripts/config.js`, `scripts/build-boilerplate.js`, dan `packages/boilerplate/scripts/pack.js`. Untuk informasi lebih lanjut tentang konfigurasi Vue Steroids secara umum, lihat [CONFIGURATIONS.md](CONFIGURATIONS.md).
