# 🔧 Build System Documentation

> Complete documentation of the Vue Steroids build system — from source code compilation, JavaScript packaging, to generating deployment-ready boilerplate.

---

## 📑 Table of Contents

1. [Build Architecture](#1-build-architecture)
2. [Script Reference](#2-script-reference)
3. [Build Boilerplate](#3-build-boilerplate)
4. [Pack JS](#4-pack-js)
5. [Build Output Structure](#5-build-output-structure)
6. [Customization](#6-customization)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Build Architecture

### 1.1. Overall Build Flow

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

### 1.2. Two Build Levels

There are **two levels** of the build system:

| Level | Script | Function | Output |
|-------|--------|----------|--------|
| **Level 1** (Root) | `scripts/build.js` | Compile Vue source → dist/ | `dist/vue.js`, `dist/vue.min.js`, etc. |
| **Level 2** (Orchestrator) | `scripts/build-boilerplate.js` | Generate boilerplate from Level 1 | `dist/boilerplate/` |

### 1.3. Build Tools

| Tool | Function | Configuration File |
|------|----------|-------------------|
| **Rollup** | Bundle Vue source modules | `scripts/config.js` |
| **Terser** | JavaScript minification | `scripts/build.js` (built-in) |
| **PostCSS** | Compile TailwindCSS | `packages/boilerplate/postcss.config.js` |
| **TailwindCSS** | Utility-first CSS | `packages/boilerplate/tailwind.config.js` |

---

## 2. Script Reference

### 2.1. Root `package.json` Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `rollup -w -c scripts/config.js --environment TARGET:full-dev` | Watch mode — Vue full build (with compiler) |
| `dev:cjs` | `rollup -w -c scripts/config.js --environment TARGET:runtime-cjs-dev` | Watch mode — Vue runtime CJS |
| `dev:esm` | `rollup -w -c scripts/config.js --environment TARGET:runtime-esm` | Watch mode — Vue runtime ESM |
| `build` | `node scripts/build.js` | Build all Vue targets |
| **`build:boilerplate`** | `node scripts/build-boilerplate.js` | **Build Vue + generate boilerplate** |
| `build:ssr` | `npm run build -- runtime-cjs,server-renderer` | SSR-specific build |
| `build:types` | `rimraf temp && tsc ... && api-extractor run` | Generate TypeScript definitions |
| `release` | `node scripts/release.js` | Release workflow |
| `changelog` | `conventional-changelog -p angular -i CHANGELOG.md -s` | Generate changelog |

### 2.2. Boilerplate `package.json` Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `concurrently "npm run tailwind:watch" "npm run hmr"` | Development mode |
| `start` | Same as `dev` | Development mode |
| `pack` | `node scripts/pack.js` | **Concat + minify JS files** |
| `build` | `npm run tailwind:build && npm run pack` | **Build boilerplate (Tailwind + pack)** |
| `tailwind:watch` | `chokidar "public/css/*.css" -c "postcss public/css/input.css -o public/css/tailwind.css" --initial` | Watch TailwindCSS changes |
| `tailwind:build` | `postcss public/css/input.css -o public/css/tailwind.css` | Build TailwindCSS once |
| `hmr` | `node scripts/hmr.js` | Start HMR WebSocket server |
| `production` | `concurrently "npm run build" "npm run hmr"` | Production mode |

---

## 3. Build Boilerplate

### 3.1. What is `build-boilerplate.js`?

`scripts/build-boilerplate.js` is an **orchestrator script** that automates the build process from Vue Steroids source code into a ready-to-use boilerplate.

### 3.2. Detailed Flow

```
Step 1: Build Vue Source
─────────────────────────────────────────────────────
  node scripts/build.js full-dev,full-prod
  │
  ├── Rollup reads entry points from scripts/config.js
  │     ├── src/platforms/web/entry-runtime-with-compiler.ts (full)
  │     └── src/platforms/web/entry-runtime.ts (runtime)
  │
  ├── Resolve imports (alias, TypeScript, CommonJS)
  ├── Apply feature flags (__DEV__, __VERSION__, etc.)
  ├── Generate bundle
  └── Minify with Terser (for production)
      │
      └── Output to dist/
            ├── dist/vue.js              (dev, full)
            ├── dist/vue.min.js          (prod, full)
            ├── dist/vue.runtime.common.dev.js
            └── dist/vue.runtime.common.prod.js

Step 2: Copy Vue Files
─────────────────────────────────────────────────────
  Copy from dist/ → dist/boilerplate/public/js/vue/
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
| ├── ✅ scripts/
| ├── ⏭️  node_modules/ (skipped)
| └── ⏭️  public/js/vue/ (skipped — already copied in step 2)

Step 4: Generate index.html
─────────────────────────────────────────────────────
  Generate index.html with:
  │
  ├── Script tag to vue.js / vue.min.js (depending on mode)
  ├── Style tag to tailwind.css
  ├── Vue.config.store setup (example)
  ├── Vue instance with count example
  ├── Button handlers for increment + fetch API
  └── watch count → update DOM
```

### 3.3. Usage

```bash
# From root project

# Build full (dev + prod, with compiler) — default
npm run build:boilerplate

# Build runtime only (lighter, without template compiler)
npm run build:boilerplate -- --runtime

# Build production only
npm run build:boilerplate -- --prod

# Manual via node
node scripts/build-boilerplate.js
node scripts/build-boilerplate.js --runtime
node scripts/build-boilerplate.js --full
node scripts/build-boilerplate.js --prod
```

### 3.4. Generated Output

After a successful build, the `dist/boilerplate/` structure:

```
dist/boilerplate/
├── index.html             ← Auto-generated, ready to open
├── .htaccess              ← Apache rewrite rules (SPA routing)
├── 404.html               ← Fallback 404
├── package.json           ← Same as source
├── postcss.config.js      ← PostCSS configuration
├── tailwind.config.js     ← TailwindCSS configuration
├── run.sh                 ← Script to run
├── public/
│   ├── css/
│   │   ├── input.css          ← TailwindCSS source
│   │   └── tailwind.css       ← Compiled TailwindCSS
│   └── js/
│       └── vue/
│           ├── vue.js                     ← Dev (682 KB)
│           ├── vue.min.js                 ← Prod minified (226 KB)
│           ├── vue.runtime.common.dev.js  ← Runtime dev (403 KB)
│           └── vue.runtime.common.prod.js ← Runtime prod (138 KB)
├── components/           ← .tpl component templates
│   └── (contents based on project)
└── apps/                 ← Example applications
    └── (contents based on project)
```

### 3.5. Build Modes

| Mode | Target Build | Vue File | index.html |
|------|-------------|----------|------------|
| `--full` (default) | `full-dev,full-prod` | `vue.js` (with compiler) | ✅ Full demo |
| `--runtime` | `runtime-cjs-dev,runtime-cjs-prod` | `vue.runtime.common.dev.js` | ✅ Full demo |
| `--prod` | (skip build, copy existing) | `vue.min.js` | ✅ Production ready |

**Note:** `--prod` mode does not run the Rollup build. It uses files already in `dist/`. Run `npm run build` first if they don't exist yet.

---

## 4. Pack JS

### 4.1. What is `pack.js`?

`packages/boilerplate/scripts/pack.js` is a **JavaScript packer** for production. Its function is to concatenate and minify `.js` files into a single bundle.

**❌ NOT for `.tpl` files** — `.tpl` files are handled by the SSR bundler (`ssr.js`)

**✅ Only for `.js` files** — concat + minify

### 4.2. Pack Flow

```
Source JS Files                    pack.js                          Output
─────────────────────────────────────────────────────────────────────────────
public/js/vue/vue.min.js    ─┐
public/js/app.js             ─┤  concat + minify          public/js/
public/js/router.js          ─┤  (terser)                 └── app.bundle.js
public/js/components.js      ─┘
```

### 4.3. Why Do You Need `pack.js`?

| Without pack.js | With pack.js |
|----------------|--------------|
| Browser loads 4+ JS files | Browser loads 1 file |
| 4 HTTP requests | 1 HTTP request |
| Total size: ~250KB (uncompressed) | Total size: ~220KB (minified) |
| Slow initial load | Fast initial load |

### 4.4. Usage

```bash
# From the packages/boilerplate/ folder

# Production: concat + minify
npm run pack

# Development: concat only (faster)
npm run pack -- --dev

# Production via build script
npm run build
```

### 4.5. Configuration

The list of files to be packed is configured inside `pack.js`:

```javascript
const SOURCE_FILES = [
  // Vue framework (compiled production version)
  path.join(ROOT, 'public', 'js', 'vue', 'vue.min.js'),

  // Add other JS files here
  path.join(ROOT, 'public', 'js', 'app.js'),
  path.join(ROOT, 'public', 'js', 'router.js'),
]
```

**Order matters:** Dependencies must be placed first (e.g., Vue before app.js).

### 4.6. Minification

The `terser` package will be used if available:

```bash
# Install terser for optimal minification
npm install terser --save-dev
```

If terser is not available, it falls back to basic minification:
- Remove block comments (`/* ... */`)
- Remove line comments (`// ...`)
- Remove empty lines
- Remove leading/trailing whitespace

---

## 5. Build Output Structure

### 5.1. `dist/` (Vue Source Build Results)

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
└── boilerplate/                    ← Generated boilerplate (see above)
```

### 5.2. Differences Between Vue Files

| File | Compiler? | Format | Use Case |
|------|:---------:|:------:|----------|
| `vue.js` / `vue.min.js` | ✅ Yes | UMD (browser) | Direct `<script>` tag |
| `vue.runtime.common.dev/prod.js` | ❌ No | CommonJS | Webpack/Browserify bundler |
| `vue.runtime.esm.js` | ❌ No | ES Module | Modern bundler (Vite, Rollup) |
| `vue.esm.js` | ✅ Yes | ES Module | Modern bundler with compiler |
| `vue.esm.browser.js` | ✅ Yes | ES Module | Direct `<script type="module">` |
| `vue.runtime.mjs` | ❌ No | ESM (Node) | Server-side rendering |

---

## 6. Customization

### 6.1. Adding JS Files to Pack

Edit `packages/boilerplate/scripts/pack.js`:

```javascript
const SOURCE_FILES = [
  path.join(ROOT, 'public', 'js', 'vue', 'vue.min.js'),
  path.join(ROOT, 'public', 'js', 'app.js'),          // ← Add
  path.join(ROOT, 'public', 'js', 'router.js'),        // ← Add
]
```

### 6.2. Changing Build Targets

Edit `scripts/build-boilerplate.js`:

```javascript
const targets = {
  full: 'full-dev,full-prod',
  runtime: 'runtime-cjs-dev,runtime-cjs-prod',
  all: 'full-dev,full-prod,runtime-cjs-dev,runtime-cjs-prod',
  custom: 'full-esm,full-esm-browser-dev'  // ← Add custom target
}
```

### 6.3. Customizing index.html

Edit the `generateIndexHtml()` function in `scripts/build-boilerplate.js` to change:
- Title & meta tags
- CSS frameworks (other than Tailwind)
- Example components/demo
- Script setup

### 6.4. Excluding Files from Copy

Edit the `exclude` array in `scripts/build-boilerplate.js`:

```javascript
const exclude = [
  'node_modules',
  path.join('public', 'js', 'vue'),
  'scripts',
  'sources',       // ← Add folders that don't need to be copied
  'README.md',      // ← Add files that don't need to be copied
]
```

---

## 7. Troubleshooting

### 7.1. Build Error: `'axios' is imported but could not be resolved`

```
'axios' is imported by src/core/util/http.ts, but could not be resolved
– treating it as an external dependency
```

**Cause:** Axios is an external dependency that is not bundled into Vue.

**Solution:** This is a safe warning to ignore. Axios will be loaded separately. Make sure `axios` is in `node_modules`:

```bash
pnpm install
```

### 7.2. Build Error: `Use of eval is strongly discouraged`

```
Use of eval is strongly discouraged, as it poses security risks...
```

**Cause:** Vue Steroids uses `eval()` in `dynamic-component-loader.ts` to evaluate component scripts.

**Solution:** Safe warning to ignore. `eval()` is necessary to execute scripts in the browser loaded from `.tpl` files.

### 7.3. Vue File Not Found in `dist/`

Run the Vue source build first:

```bash
npm run build
# or
node scripts/build.js
```

Then run the boilerplate build:

```bash
node scripts/build-boilerplate.js
```

### 7.4. TailwindCSS Not Compiled

```bash
cd packages/boilerplate
npm run tailwind:build
```

Make sure PostCSS CLI and TailwindCSS are installed:

```bash
cd packages/boilerplate && pnpm install
```

### 7.5. pack.js: Terser Not Available

```bash
npm install terser --save-dev
```

Or use dev mode (concatenation only):

```bash
npm run pack -- --dev
```

---

## 🏷️ References

| File | Description |
|------|-------------|
| `scripts/build.js` | Vue build script (Rollup + Terser) |
| `scripts/config.js` | Rollup configuration for all build targets |
| `scripts/build-boilerplate.js` | Build orchestrator |
| `scripts/alias.js` | Path aliases for TypeScript/Rollup |
| `scripts/feature-flags.js` | Feature flags for conditional compilation |
| `packages/boilerplate/scripts/pack.js` | JavaScript packer |
| `packages/boilerplate/postcss.config.js` | PostCSS + TailwindCSS config |
| `packages/boilerplate/tailwind.config.js` | TailwindCSS theme customization |
| `packages/boilerplate/package.json` | Boilerplate dependencies & scripts |

---

> **Note:** This documentation was created based on the source code of `scripts/build.js`, `scripts/config.js`, `scripts/build-boilerplate.js`, and `packages/boilerplate/scripts/pack.js`. For more information about Vue Steroids configuration in general, see [CONFIGURATIONS.md](CONFIGURATIONS.md).
